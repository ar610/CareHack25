from google.cloud import firestore
from google.oauth2 import service_account
# Ensure 'upload.py' is in the same directory as this file or update the import path accordingly.

cred = service_account.Credentials.from_service_account_file("D:/CareStack/service.json")
db = firestore.Client(credentials=cred, project=cred.project_id)

def check_user_exists(user_id: str) -> bool:
    """Check if a user exists in the Firestore database."""
    user_ref = db.collection("user_data").document(user_id)
    user_ref.set({"Dummy":"Dummy"}, merge=True)  # Ensure the document exists
    return user_ref.get().exists

if __name__ == "__main__":
    # Example usage
    user_id = "hello"
    exists = check_user_exists(user_id)
    print(f"User {user_id} exists: {exists}")


