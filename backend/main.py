from flask import Flask, request, jsonify
from pymongo import MongoClient
import requests
from flask_cors import CORS
import json
import datetime
from PIL import Image
import urllib.request as urllib
import io
import pytesseract
import requests

app = Flask(__name__)
CORS(app)


# Rasa endpoint for sending messages
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"

IPFS_API_URL = "http://127.0.0.1:5001/api/v0"  # IPFS HTTP API endpoint


def query_raw(text, url='https://bern.korea.ac.kr/plain'):
    return requests.post(url, data={'sample_text': text}, verify=False).json()

# MongoDB connection
import os

# MongoDB connection
mongo_pwd = os.getenv("MONGO_PWD")
mongo_uri = (
    "mongodb+srv://darlene:"
    + "PWD"
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

@app.route('/upload', methods=['POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        files = {'file': file.read()}
        response = requests.post(f"{IPFS_API_URL}/add", files=files)
        if response.status_code == 200:
            res = response.json()
            return jsonify({'Hash': res['Hash']})
        return jsonify({'error': 'Failed to upload to IPFS'}), 500


@app.route('/analyze', methods=['POST'])
def analyze():
    print("here")
    if request.method == 'POST':
        data = request.get_json()
        recv_hash = data['hash']
        fd = urllib.urlopen(f'http://127.0.0.1:8080/ipfs/{recv_hash}')
        image_file = io.BytesIO(fd.read())
        im = Image.open(image_file)
        text = pytesseract.image_to_string(im)
        a = query_raw(text)
        dict_obj = {'Diseases': [], 'Drugs': []}
        length = len(a['denotations'])
        
        for span in range(length):
            label = a['denotations'][span]['obj']
            begin_end = a['denotations'][span]['span']
            word = text[begin_end['begin']: begin_end['end'] + 1]
            if label[1] == 'i':
                mesh_id = a['denotations'][span]['id'][0][5:]
                if mesh_id[0] == 'D':
                    dict_obj['Diseases'].append([word.rstrip(), mesh_id])
            else:
                mesh_id = a['denotations'][span]['id'][0][6:]
                dict_obj['Drugs'].append([word.rstrip(), mesh_id])
        
        return jsonify(dict_obj)
    
@app.route('/query', methods=['POST'])
def query():
    responses = []
    
    prompt = request.form.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        url = "http://localhost:11434/api/generate"

        payload = json.dumps({
            "model": "medllama2",
            "prompt": prompt
        })
        
        headers = {
        'Content-Type': 'application/json'
        }
        
        response = requests.request("POST", url, headers=headers, data=payload)
        
        response_lines = response.text.strip().splitlines()

        parsed_responses = ''

        for line in response_lines:
            try:
                parsed_responses += json.loads(line)['response']
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {str(e)}")
                print("Skipping invalid JSON line:")

        parsed_responses = parsed_responses.strip()
        responses.append({"prompt": prompt, "response": parsed_responses})
    except subprocess.CalledProcessError as e:
        parsed_responses = f"Error: {e.stderr}"

    return jsonify({'responses': responses})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5002)