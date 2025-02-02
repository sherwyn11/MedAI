import logging, requests
from typing import Any, Text, Dict, List
from controller.api_services import LocationExtractor, HealthOsMedicines
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from rasa_sdk.forms import FormAction
import json
from word2number import w2n
from datetime import date, datetime, timedelta
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from dateutil import parser
import os
import pickle


logger = logging.getLogger("my-logger")

logger = logging.getLogger("my-logger")

# Define your credentials file and the necessary scope
CREDENTIALS_FILE = "C:\\Users\\Darlene\\Desktop\\GitHub\\MedAI\\ai-assistant\\controller\\secrets.json"  # Replace with your actual credentials JSON file
SCOPES = ["https://www.googleapis.com/auth/calendar"]


# Define the function to get the calendar service using OAuth 2.0
def get_calendar_service():
    creds = None
    # Check if token.pickle exists, and load the credentials
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    # If credentials are not available or expired, perform OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=58693)

        # Save the credentials for the next run
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    service = build("calendar", "v3", credentials=creds)
    return service


class ActionSetReminder(Action):
    def name(self):
        return "action_set_reminder"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain):
        event_time = tracker.get_slot("time")
        product_name = tracker.get_slot("product")
        print(event_time, product_name)

        if not event_time or not product_name:
            dispatcher.utter_message(
                "I need both time and medicine name to set the reminder."
            )
            return []

        try:
            event_datetime = parser.parse(event_time)
        except ValueError:
            dispatcher.utter_message(
                "I couldn't understand the time format. Please try again."
            )
            return []

        # Get the calendar service
        service = get_calendar_service()

        # Create the event details
        event = {
            "summary": f"Take {product_name}",
            "description": f"Reminder to take {product_name}",
            "start": {
                "dateTime": event_datetime.isoformat(),
                "timeZone": "America/Montreal",
            },
            "end": {
                "dateTime": (event_datetime + timedelta(minutes=30)).isoformat(),
                "timeZone": "America/Montreal",
            },
        }

        # Insert event in Google Calendar
        service.events().insert(calendarId="primary", body=event).execute()
        formatted_datetime = event_datetime.strftime("%A, %B %d, %Y at %I:%M %p %Z")

        dispatcher.utter_message(
            f"Reminder set for {product_name} at {formatted_datetime}. ✅"
        )

        # Reset slots after setting reminder
        return [SlotSet("time", None), SlotSet("product", None)]


class ActionSetRecurringReminder(Action):
    def name(self):
        return "action_set_recurring_reminder"

    def run(self, dispatcher, tracker, domain):
        event_time = tracker.get_slot("time")
        recurrence = tracker.get_slot("recurrence")
        product_name = tracker.get_slot("product")

        if not event_time or not recurrence or not product_name:
            dispatcher.utter_message(
                "Please provide the exact time, medicine name, and how often you'd like the reminder to repeat."
            )
            return []

        try:
            event_datetime = parser.parse(event_time)
        except ValueError:
            dispatcher.utter_message(
                "I couldn't understand the time format. Please try again."
            )
            return []

        # Create recurrence rule
        recurrence_rule, recurrence_val = self.get_recurrence_rule(recurrence)
        if not recurrence_rule:
            dispatcher.utter_message(
                "I couldn't understand the recurrence pattern. Please specify a valid recurrence (e.g., 'every Monday', 'daily')."
            )
            return []

        # Get the calendar service
        service = get_calendar_service()

        event = {
            "summary": f"Take {product_name}",
            "description": f"Recurring reminder for {product_name}",
            "start": {
                "dateTime": event_datetime.isoformat(),
                "timeZone": "America/Montreal",
            },
            "end": {
                "dateTime": (event_datetime + timedelta(minutes=30)).isoformat(),
                "timeZone": "America/Montreal",
            },
            "recurrence": [recurrence_rule],
        }

        # Insert recurring event in Google Calendar
        service.events().insert(calendarId="primary", body=event).execute()
        formatted_time = event_datetime.strftime("%I:%M %p")
        dispatcher.utter_message(
            f"Recurring reminder set for {product_name} at {formatted_time} every {recurrence_val}. ✅"
        )

        return [
            SlotSet("time", None),
            SlotSet("product", None),
            SlotSet("recurrence", None),
        ]

    def get_recurrence_rule(self, recurrence):

        recurrence = recurrence.lower()

        # Define a dictionary for conversion
        days_map = {
            "mon": "Monday",
            "tue": "Tuesday",
            "wed": "Wednesday",
            "thur": "Thursday",
            "fri": "Friday",
            "sat": "Saturday",
            "sun": "Sunday",
        }

        # Handle the recurrence rule and set the friendly name
        if "mon" in recurrence:
            recurrence_value = days_map["mon"]
            return "RRULE:FREQ=WEEKLY;BYDAY=MO;INTERVAL=1", recurrence_value
        elif "tue" in recurrence:
            recurrence_value = days_map["tue"]
            return "RRULE:FREQ=WEEKLY;BYDAY=TU;INTERVAL=1", recurrence_value
        elif "wed" in recurrence:
            recurrence_value = days_map["wed"]
            return "RRULE:FREQ=WEEKLY;BYDAY=WE;INTERVAL=1", recurrence_value
        elif "thur" in recurrence:
            recurrence_value = days_map["thur"]
            return "RRULE:FREQ=WEEKLY;BYDAY=TH;INTERVAL=1", recurrence_value
        elif "fri" in recurrence:
            recurrence_value = days_map["fri"]
            return "RRULE:FREQ=WEEKLY;BYDAY=FR;INTERVAL=1", recurrence_value
        elif "sat" in recurrence:
            recurrence_value = days_map["sat"]
            return "RRULE:FREQ=WEEKLY;BYDAY=SA;INTERVAL=1", recurrence_value
        elif "sun" in recurrence:
            recurrence_value = days_map["sun"]
            return "RRULE:FREQ=WEEKLY;BYDAY=SU;INTERVAL=1", recurrence_value
        elif "weekday" in recurrence or "monday to friday" in recurrence:
            recurrence_value = "Monday to Friday"
            return "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1", recurrence_value
        elif "weekend" in recurrence:
            recurrence_value = "Saturday and Sunday"
            return "RRULE:FREQ=WEEKLY;BYDAY=SA,SU;INTERVAL=1", recurrence_value
        elif "daily" in recurrence:
            recurrence_value = "day"
            return "RRULE:FREQ=DAILY;INTERVAL=1", recurrence_value
        elif "weekly" in recurrence:
            recurrence_value = "week"
            return "RRULE:FREQ=WEEKLY;INTERVAL=1", recurrence_value
        elif "monthly" in recurrence:
            recurrence_value = "month"
            return "RRULE:FREQ=MONTHLY;INTERVAL=1", recurrence_value
        elif "yearly" in recurrence:
            recurrence_value = "year"
            return "RRULE:FREQ=YEARLY;INTERVAL=1", recurrence_value
        else:
            return None, None


class ActionGetReminders(Action):
    def name(self):
        return "action_get_reminders"

    def run(self, dispatcher, tracker, domain):
        now = datetime.datetime.utcnow().isoformat() + "Z"  # Get current time in UTC

        # Get the calendar service
        service = get_calendar_service()

        # Fetch events from Google Calendar
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=5,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        events = events_result.get("items", [])

        if not events:
            dispatcher.utter_message("You have no upcoming reminders.")
            return []

        reminder_list = "Here are your upcoming reminders:\n"
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            reminder_list += f"- {event['summary']} at {start}\n"

        dispatcher.utter_message(reminder_list)
        return []


class ActionFindProduct(Action):
    def name(self) -> Text:
        return "action_find_product"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        product = tracker.get_slot("product")
        print(product)
        # healthOS = HealthOsMedicines()
        # res_prods = healthOS.searchMedicineByName(product)
        res_prods = {
            "data": [
                {
                    "name": "CROCIN 100MG DROP",
                    "form": "ML of drop",
                    "standardUnits": 1,
                    "packageForm": "packet",
                    "price": 32.27,
                    "size": "15 ML drop",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [{"name": "Paracetamol", "strength": "100mg/1ml"}],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586ab30c91c126fe056dc97d",
                    "medicine_id": "461z6V",
                    "search_score": 7.3046875,
                },
                {
                    "name": "CROCIN 125 MG SUSPENSION",
                    "form": "ML of suspension",
                    "standardUnits": 1,
                    "packageForm": "bottle",
                    "price": 37.77,
                    "size": "60 ML suspension",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [{"name": "Paracetamol", "strength": "125 mg"}],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586ab09f91c126fe056b693f",
                    "medicine_id": "63GIV",
                    "search_score": 7.0074286,
                },
                {
                    "name": "CROCIN 650 MG TABLET",
                    "form": "tablet",
                    "standardUnits": 15,
                    "packageForm": "strip",
                    "price": 26.93,
                    "size": "15 tablets",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [{"name": "Paracetamol", "strength": "650 mg"}],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586ab3ca91c126fe056e835d",
                    "medicine_id": "wGz46",
                    "search_score": 7.0074286,
                },
                {
                    "name": "CROCIN PAIN RELIEF TABLET",
                    "form": "tablet",
                    "standardUnits": 15,
                    "packageForm": "strip",
                    "price": 49.39,
                    "size": "15 tablets",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [
                        {"name": "Caffeine", "strength": "50 mg"},
                        {"name": "Paracetamol", "strength": "650 mg"},
                    ],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586ab2e791c126fe056da4f3",
                    "medicine_id": "46431w",
                    "search_score": 6.6484766,
                },
                {
                    "name": "CROCIN DS SUSPENSION",
                    "form": "ML of suspension",
                    "standardUnits": 1,
                    "packageForm": "bottle",
                    "price": 45,
                    "size": "60 ML suspension",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [{"name": "Paracetamol", "strength": "240mg/5ml"}],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586ab2db91c126fe056d9947",
                    "medicine_id": "4661Q1",
                    "search_score": 6.6484766,
                },
                {
                    "name": "CROCIN ADVANCE 500 MG TABLET",
                    "form": "tablet",
                    "standardUnits": 15,
                    "packageForm": "strip",
                    "price": 13.07,
                    "size": "15 tablets",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [{"name": "Paracetamol", "strength": "500 mg"}],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586aad9791c126fe056870f1",
                    "medicine_id": "II364w",
                    "search_score": 5.817417,
                },
                {
                    "name": "CROCIN COLD TABLET",
                    "form": "tablet",
                    "standardUnits": 15,
                    "packageForm": "strip",
                    "price": 45.32,
                    "size": "15 tablets",
                    "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                    "constituents": [
                        {"name": "Paracetamol", "strength": "500 mg"},
                        {"name": "Caffeine", "strength": "32 mg"},
                        {"name": "Phenylephrine", "strength": "10 mg"},
                    ],
                    "schedule": {
                        "category": "OTC",
                        "label": "It can be sold without a prescription",
                    },
                    "id": "586aad9791c126fe056870eb",
                    "medicine_id": "II364Q",
                    "search_score": 5.4018874,
                },
            ],
        }
        if res_prods["data"] == None:
            msg = res_prods["exception"]
        else:
            dispatcher.utter_message(
                text="This is what I found for drug name {}...\n".format(product)
            )
            dispatcher.utter_message(
                text=json.dumps({"type": "medicines", "data": res_prods["data"]})
            )
            return []
        dispatcher.utter_message(text=msg)
        return []


class ActionGetOrderHistory(Action):
    def name(self) -> Text:
        return "action_get_order_history"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        print("inside ActionGetOrderHistory")
        dispatcher.utter_message(text=json.dumps({"type": "history"}))
        return []


class OrderProductForm(FormAction):
    def name(self) -> Text:
        return "order_product_form"

    @staticmethod
    def required_slots(tracker: Tracker) -> List[Text]:
        return ["product", "product_id", "quantity"]

    @staticmethod
    def is_int(string):
        try:
            int(string)
            return True
        except ValueError:
            return False

    @staticmethod
    def is_str(string):
        try:
            str(string)
            return True
        except ValueError:
            return False

    def slot_mappings(self):
        return {
            "product": [
                self.from_entity(entity="product", intent=["find_product_by_name"])
            ],
            "prodict_id": [
                self.from_entity(entity="product_id", intent=["get_product_by_id"])
            ],
            "quantity": [
                self.from_entity(
                    entity="quantity", intent=["qty_entry", "find_product_by_name"]
                ),
                self.from_entity(
                    entity="CARDINAL", intent=["qty_entry", "find_product_by_name"]
                ),
            ],
        }

    def validate_product_id(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:

        if isinstance(value, str) and value.startswith("prod_id_"):
            return {"product_id": value}
        else:
            # This will be changed to => select one of the products
            dispatcher.utter_message(
                text="It looks like your products id wasn't specified in the correct format. Let's fix that. Tap on the selected medicine."
            )
            return {"product_id": None}

    def validate_quantity(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        print(value)
        if self.is_int(value):
            return {"quantity": value}
        elif self.is_str(value):
            value = w2n.word_to_num(value)
            return {"quantity": value}
        else:
            dispatcher.utter_message(
                text="Sorry, I wasn't able to understand your order quantity. Perhaps it wasn't a whole number. Could you repeat that"
            )
            return {"quantity": None}

    def __print_order_message(self, product_name, product_id, quantity):
        # healthOS = HealthOsMedicines()
        # output = healthOS.getMedicineByID(product_id)
        output = {
            "data": {
                "name": "CROCIN COLD TABLET",
                "form": "tablet",
                "standardUnits": 15,
                "packageForm": "strip",
                "price": 45.32,
                "size": "15 tablets",
                "manufacturer": "Glaxo SmithKline Pharmaceuticals Ltd",
                "constituents": [
                    {"name": "Paracetamol", "strength": "500 mg"},
                    {"name": "Caffeine", "strength": "32 mg"},
                    {"name": "Phenylephrine", "strength": "10 mg"},
                ],
                "schedule": {
                    "category": "OTC",
                    "label": "It can be sold without a prescription",
                },
                "id": "586aad9791c126fe056870eb",
                "medicine_id": "II364Q",
                "search_score": 5.4018874,
            },
        }
        if output["data"] == None:
            msg = output["exception"]
        else:
            msg = f"Date: {date.today().strftime('%d %b %Y')}\nTime: {datetime.now().strftime('%H:%M:%S')}\nOrder Description:\n{output['data']['name']}\t{quantity} {output['data']['packageForm']}\t{output['data']['price']} per {output['data']['packageForm']}\nTotal: Rs {float(output['data']['price'])*float(quantity)} /-"
            data = {
                "date": date.today().strftime("%d %b %Y")
                + " "
                + datetime.now().strftime("%H:%M:%S"),
                "amount": str(float(output["data"]["price"]) * float(quantity)),
                "name": output["data"]["name"],
                "price": str(output["data"]["price"]),
                "quantity": str(quantity),
            }
            print(data)
        return msg, data

    def submit(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(template="utter_placing_order")
        product_name = tracker.get_slot("product")
        product_id = tracker.get_slot("product_id")
        quantity = tracker.get_slot("quantity")
        print(product_id, product_name, quantity)
        msg, data = self.__print_order_message(
            product_name=product_name, product_id=product_id, quantity=quantity
        )
        dispatcher.utter_message(text=msg)
        dispatcher.utter_message(text=json.dumps({"type": "bill", "data": data}))
        return [
            SlotSet("product", None),
            SlotSet("product_id", None),
            SlotSet("quantity", None),
        ]


class ActionFindLocation(Action):
    def name(self):
        return "action_find_location"

    def run(self, dispatcher, tracker, domain):

        user_input = tracker.latest_message["text"]

        le = LocationExtractor()
        location_cordinates, location_name = le.getLocationInfo(
            str(user_input), tracker, dispatcher
        )

        return [
            SlotSet("location_name", location_name),
            SlotSet("latitude", location_cordinates[0]),
            SlotSet("longitude", location_cordinates[1]),
        ]
