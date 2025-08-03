from Firebase.fb import db
from typing import Dict, Any, List, Union
from datetime import datetime




def upload_to_firestore(user_id: str, record: Dict[str, Any]) -> bool:
    try:
        user_ref = db.collection("user_data").document(user_id)
        user_ref.set(record, merge=True)  # Merge=True updates only given fields
        return True
    except Exception as e:
        print("Upload failed:", e)
        return False

def is_expired_medication(med: Dict[str, Union[str, None]]) -> bool:
    end_date = str(med.get("end_date", "")).strip().lower()

    # Handle "as needed", "SOS", etc.
    if end_date in ["as needed", "sos", ""]:
        return True

    # Try to parse date and compare
    try:
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        return end_date_obj < datetime.now().date()
    except Exception:
        # If parsing fails, consider it invalid and keep it (or remove based on strict mode)
        return False

def remove_expired_medications(user_id: str) -> bool:
    try:
        doc_ref = db.collection("users_data").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"User {user_id} not found.")
            return False

        data = doc.to_dict()
        medications: List[Dict[str, Union[str, None]]] = data.get("medications", [])

        filtered_medications = [med for med in medications if not is_expired_medication(med)]

        # Update only if change is detected
        if len(filtered_medications) != len(medications):
            doc_ref.update({"medications": filtered_medications})
            print(f"Expired medications removed for user {user_id}")
        else:
            print("No expired medications found.")

        return True

    except Exception as e:
        print("Error while removing expired meds:", e)
        return False
