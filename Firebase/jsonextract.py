from AI.function import extract_medical_info
from Extract.extractor import extract_text
from Extract.utils import store_chunks_in_chroma
from datetime import datetime, timedelta
import re
import json
from Firebase.firebasehelper import add_medications_to_firestore, remove_expired_medications
from google.cloud import firestore
from google.oauth2 import service_account

def parse_duration_to_days(duration):
    """Convert strings like '3 days', '2 weeks', '1 month' into number of days."""
    duration = duration.lower()
    if 'day' in duration:
        num = re.search(r'\d+', duration)
        return int(num.group()) if num else 0
    elif 'week' in duration:
        num = re.search(r'\d+', duration)
        return int(num.group()) * 7 if num else 7
    elif 'month' in duration:
        num = re.search(r'\d+', duration)
        return int(num.group()) * 30 if num else 30
    else:
        num = re.search(r'\d+', duration)
        return int(num.group()) if num else 0

def get_medications_with_end_dates(record, today_str="2025-08-03"):
    today = datetime.strptime(today_str, "%Y-%m-%d")
    end_dates = {}

    for med in record.get("medications", []):
        name = med.get("name")
        frequency = med.get("frequency", "").upper()
        duration_str = med.get("duration", "").lower()
        end_date_str = med.get("end_date")

        # Case 1: end_date is explicitly provided
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
                end_dates[name] = end_date.strftime("%Y-%m-%d")
                continue
            except:
                pass

        # Case 2: compute from duration
        if duration_str and not ("as needed" in duration_str or "sos" in frequency):
            duration_days = parse_duration_to_days(duration_str)
            computed_end = today + timedelta(days=duration_days)
            end_dates[name] = computed_end.strftime("%Y-%m-%d")
            continue

        # Case 3: SOS or as-needed
        if frequency == "SOS" or "as needed" in duration_str:
            end_dates[name] = "as needed"
    return end_dates



# Load credentials
cred = service_account.Credentials.from_service_account_file("D:/CareStack/service.json")
db = firestore.Client(credentials=cred, project=cred.project_id)

def add_medical_info_to_firestore(extracted_data: dict, patient_id: str = "329823"): 
    patient_ref = db.collection("patients").document(patient_id)

    # --- Add medications to main patient document ---
    if "medications" in extracted_data and extracted_data["medications"]:
        print(f"Adding medications for patient {patient_id}")
        patient_ref.update({
            "current_medication": firestore.ArrayUnion(extracted_data["medications"])
        })

    # --- Add vaccinations as documents in subcollection ---
    if "vaccinations" in extracted_data and extracted_data["vaccinations"]:
        print(f"Adding vaccinations for patient {patient_id}")
        vaccine_collection = patient_ref.collection("vaccine_details")
        for vaccine in extracted_data["vaccinations"]:
            vaccine_collection.add({
                "vaccine": vaccine
            })

    # --- Add medical conditions as documents in subcollection ---
    if "medical_conditions" in extracted_data and extracted_data["medical_conditions"]:
        print(f"Adding medical conditions for patient {patient_id}")
        condition_collection = patient_ref.collection("medical_conditions")
        for condition in extracted_data["medical_conditions"]:
            condition_collection.add({
                "condition": condition
            })

import json

def extract_medical_info_from_text(json_text: str) -> dict:
    try:
        data = json.loads(json_text)

        extracted = {}

        if "medications" in data and isinstance(data["medications"], list):
            extracted["medications"] = data["medications"]

        if "vaccinations" in data and isinstance(data["vaccinations"], list):
            extracted["vaccinations"] = data["vaccinations"]

        if "medical_conditions" in data and isinstance(data["medical_conditions"], list):
            extracted["medical_conditions"] = data["medical_conditions"]

        return extracted

    except json.JSONDecodeError as e:
        print("Invalid JSON:", e)
        return {}

def process_text_post_to_firestore(text: str, patient_id: str = "329823"):
    extracted_data = extract_medical_info_from_text(text)
    if not extracted_data:
        print("No valid medical information found in the text.")
        return

    add_medical_info_to_firestore(extracted_data, patient_id)
    print(f"Medical information added for patient {patient_id}")

