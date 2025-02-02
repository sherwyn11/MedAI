from api_config.env_var import BING_API_KEY, HEALTHOS_API_KEY
import requests


class LocationExtractor:
    def __init__(self):

        self.bing_baseurl = "http://dev.virtualearth.net/REST/v1/Locations"
        self.bing_api_key = BING_API_KEY

    def getLocationInfo(self, query, tracker, dispatcher):

        queryString = {"query": query, "key": self.bing_api_key}
        r = requests.get(self.bing_baseurl, params=queryString)
        data = r.json()

        # Temporary message
        dispatcher.utter_message(
            text="This is what I understood from your location...\n", json_message=data
        )

        if r.status_code != 200:
            dispatcher.utter_template("utter_ask_location", tracker)
            return []
        else:
            coordinates = data["resourceSets"][0]["resources"][0]["point"][
                "coordinates"
            ]
            location_name = data["resourceSets"][0]["resources"][0]["name"].split(",")[
                0
            ]

            return coordinates, location_name


class HealthOsMedicines:
    def __init__(self):
        self.healthos_baseurl = "http://www.healthos.co/api/v1"
        self.healthos_bearer_token = HEALTHOS_API_KEY

    def searchMedicineByName(self, product):
        try:
            headers = {
                "Authorization": "Bearer " + self.healthos_bearer_token,
            }
            r = requests.get(
                self.healthos_baseurl + "/search/medicines/brands/" + product,
                headers=headers,
            )
            if r.status_code != 200:
                return {
                    "exception": "Error code: " + str(r.status_code),
                    "data": None,
                }
            print(r.json()[0])
            return {
                "exception": None,
                "data": r.json(),
            }
        except:
            return {
                "exception": "Oops... Some exception occurred while fetching data",
                "data": None,
            }

    def getMedicineByID(self, product_id):
        try:
            product_id = product_id.split("prod_id_")[1]
            headers = {
                "Authorization": "Bearer " + self.healthos_bearer_token,
            }
            r = requests.get(
                self.healthos_baseurl + "/medicines/brands/" + product_id,
                headers=headers,
            )
            if r.status_code != 200:
                return {
                    "exception": "Error code: " + str(r.status_code),
                    "data": None,
                }
            print(r.json())
            return {
                "exception": None,
                "data": r.json(),
            }
        except:
            return {
                "exception": "Oops... Some exception occurred while fetching data",
                "data": None,
            }
