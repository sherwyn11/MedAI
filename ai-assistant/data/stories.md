## greet + find + order product = successful

* greet
  - utter_greet
* find_product_by_name{"product":"Crocin"}
  - slot{"product":"Crocin"}
  - utter_searching
  - action_find_product
  - utter_did_that_help
* affirm OR thanks
  - utter_specify_id
* get_product_by_id{"product_id":"prod_id_I44IQI"}
  - slot{"product_id":"prod_id_I44IQI"}
  - utter_specify_quantity
* qty_entry{"quantity":"10"}
  - slot{"quantity":"10"}
  - utter_ask_place_order
* affirm OR thanks
  - order_product_form
  - form{"name": "order_product_form"}
  - form{"name": null}
  - slot{"product": null}
  - slot{"product_id": null}
  - slot{"quantity": null}
  - utter_ask_need_assistance

## greet + find + order product = fail

* greet
  - utter_greet
* find_product_by_name{"product":"Crocin"}
  - slot{"product":"Crocin"}
  - utter_searching
  - action_find_product
  - utter_did_that_help
* affirm OR thanks
  - utter_specify_id
* get_product_by_id{"product_id":"prod_id_I44IQI"}
  - slot{"product_id":"prod_id_I44IQI"}
  - utter_specify_quantity
* qty_entry{"quantity":"10"}
  - slot{"quantity":"10"}
  - utter_ask_place_order
* deny
  - slot{"product": null}
  - slot{"product_id": null}
  - slot{"quantity": null}
  - utter_cancel

## greet + find product = fail

* greet
  - utter_greet
* find_product_by_name{"product":"Crocin"}
  - slot{"product":"Crocin"}
  - utter_searching
  - action_find_product
  - utter_did_that_help
* deny
  - slot{"product": null}
  - utter_goodbye

## handle location = successful
* nearby_location
  - utter_getting_location
  - action_find_location
  - slot{"location_name":"Mumbai"}
  - slot{"latitude":18.940170288085938}
  - slot{"longitude":72.8348617553711}
  - utter_affirm_location
* affirm OR thanks
  - utter_save_location

## handle location = fail
* nearby_location
  - utter_getting_location
  - action_find_location
  - slot{"location_name":"Mumbai"}
  - slot{"latitude":18.940170288085938}
  - slot{"longitude":72.8348617553711}
  - utter_affirm_location
* deny
  - utter_ask_location
* deny
  - utter_cancel

## get order history
* get_order_history
  - utter_getting_order_history
  - action_get_order_history

## say goodbye
* goodbye
  - utter_goodbye

## bot challenge
* bot_challenge
  - utter_iamabot

## help
* help
  - utter_try_these

## set reminder = successful
* set_reminder{"time":"8 PM on 5th June", "product":"Aspirin"}
  - slot{"time":"8 PM on 5th June"}
  - slot{"product":"Aspirin"}
  - utter_setting_reminder
  - action_set_reminder

## get reminders
* get_reminders
  - utter_getting_reminders
  - action_get_reminders

## set reminder with general time reference
* set_reminder{"time": "morning"}
  - slot{"time": "morning"}
  - utter_ask_specific_time
* time_entry{"time": "5 AM"}
  - slot{"time": "5 AM"}
  - utter_setting_reminder
  - action_set_reminder

## set recurring reminder
* set_reminder{"recurrence": "daily", "time": "10 AM", "product":"Aspirin"}
  - slot{"recurrence": "daily"}
  - slot{"time": "10 AM"}
  - utter_setting_reminder
  - action_set_recurring_reminder

## set recurring reminder general time reference
* set_reminder{"recurrence": "daily", "product":"Aspirin"}
  - slot{"recurrence": "daily"}
  - utter_ask_specific_time
* time_entry{"time": "5 AM"}
  - slot{"time": "5 AM"}
  - utter_setting_reminder
  - action_set_recurring_reminder
