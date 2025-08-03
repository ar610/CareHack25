
from Firebase.fb import db

def check_user_exists(user_id: str) -> bool:
    """Check if a user exists in the Firestore database."""
    user_ref = db.collection("user_data").document(user_id)
    user_ref.set({"Dummy":"Dummy"}, merge=True)  # Ensure the document exists
    return user_ref.get().exists
