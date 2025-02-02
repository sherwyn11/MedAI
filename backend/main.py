from flask import Flask, request, jsonify
from pymongo import MongoClient
import requests
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)


# Rasa endpoint for sending messages
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"

# MongoDB connection
import os

# MongoDB connection
mongo_pwd = os.getenv("MONGO_PWD")
mongo_uri = (
    "mongodb+srv://darlene:"
    + mongo_pwd
    + "@medai.0rgfi.mongodb.net/?retryWrites=true&w=majority&appName=MedAI"
)
client = MongoClient(mongo_uri)
db = client["atlis"]


@app.route("/data", methods=["GET"])
def get_data():
    collection = db["your_collection_name"]
    data = list(collection.find())
    for item in data:
        item["_id"] = str(item["_id"])
    return jsonify(data)


@app.route("/data", methods=["POST"])
def add_data():
    collection = db["your_collection_name"]
    data = request.json
    result = collection.insert_one(data)
    return jsonify({"inserted_id": str(result.inserted_id)})


@app.route("/data/<id>", methods=["PUT"])
def update_data(id):
    collection = db["your_collection_name"]
    data = request.json
    result = collection.update_one({"_id": id}, {"$set": data})
    return jsonify(
        {"matched_count": result.matched_count, "modified_count": result.modified_count}
    )


@app.route("/data/<id>", methods=["DELETE"])
def delete_data(id):
    collection = db["your_collection_name"]
    result = collection.delete_one({"_id": id})
    return jsonify({"deleted_count": result.deleted_count})


@app.route("/ask", methods=["POST"])
def ask_rasa():
    user_message = request.json.get("userInput")
    print(user_message)

    if not user_message:
        return jsonify({"error": "No message provided!"}), 400

    payload = json.dumps({"sender": "Rasa", "message": user_message})
    headers = {"Content-type": "application/json", "Accept": "text/plain"}
    response = requests.request(
        "POST",
        url="http://localhost:5005/webhooks/rest/webhook",
        headers=headers,
        data=payload,
    )

    # response = requests.post(RASA_URL, json={"sender": "user", "message": user_message})
    print(response.json())

    # Return the Rasa response to the frontend
    return jsonify(response.json())


if __name__ == "__main__":
    app.run(debug=True)
