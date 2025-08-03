from google.cloud import firestore
from datetime import datetime
import pytz

FIRESTORE_DOC = "medications/current_medication"

def remove_expired_medications():
    db = firestore.Client()
    doc_ref = db.document(FIRESTORE_DOC)

    # Ensure document exists
    doc_snapshot = doc_ref.get()
    if not doc_snapshot.exists:
        doc_ref.set({})
        print("Created new 'current_medication' document.")
        return

    # Fetch data
    data = doc_snapshot.to_dict()
    today = datetime.now(pytz.UTC).date()
    updated_data = {}

    for med_name, end_date in data.items():
        if end_date.lower() == "as needed":
            updated_data[med_name] = end_date
            continue
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            if today <= end:
                updated_data[med_name] = end_date
        except Exception as e:
            print(f"Skipping {med_name} due to invalid date: {e}")

    # Update Firestore
    doc_ref.set(updated_data)
    print("Updated current medications:", updated_data)


def add_medications_to_firestore(meds_with_end_dates):
    db = firestore.Client()
    doc_ref = db.document(FIRESTORE_DOC)

    # Ensure doc exists
    doc_ref.set({}, merge=True)

    current = doc_ref.get().to_dict() or {}
    current.update(meds_with_end_dates)

    doc_ref.set(current)
    print("Medications added:", meds_with_end_dates)
