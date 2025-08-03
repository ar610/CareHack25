from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from datetime import datetime
from uuid import uuid4
from Extract.extractor import extract_text  # Adjust the import based on your project structure
from Extract.utils import split_text, store_chunks_in_chroma  # Adjust the import based on your project structure
from Firebase.firebasehelper import add_medications_to_firestore    
from Firebase.jsonextract import get_medications_with_end_dates
from AI.function import extract_medical_info  # Adjust the import based on your project structure
from pydantic import BaseModel 
from Extract.rag import rag_query  # Adjust the import based on your project structure
from fastapi.middleware.cors import CORSMiddleware
from Extract.vector_db import client
from Firebase.fb import db  # Adjust the import based on your project structure
from  ParserGen.parse import parse_medical_record  # Adjust the import based on your project structure
from ParserGen.upload import upload_to_firestore, remove_expired_medications  # Adjust the import based on your project structure



app = FastAPI()
# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # <-- Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # <-- Allow all headers
)

class QueryRequest(BaseModel):
    query: str
    user_id: str = "default_user"  # Default user ID if not provided

class SignupRequest(BaseModel):
    user_id: str

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...),user_id: str = "default_user"):
    if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    
    # Generate a unique file path
    extension = file.filename.split('.')[-1]
    dir = os.path.join(UPLOAD_DIR, user_id)
    temp_file_path = os.path.join(UPLOAD_DIR, f"{uuid4()}.{extension}")

    # Save the file temporarily
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run your extraction logic
        remove_expired_medications(user_id=user_id)  # Clean up expired medications
         # Extract text from the file
        extracted_text =  extract_text(temp_file_path)
        medical_info =  extract_medical_info(extracted_text)
        parsed_info = parse_medical_record(medical_info)
        upload_to_firestore(user_id, parsed_info)
    

        if not extracted_text:
            raise HTTPException(status_code=500, detail="No text extracted from the file")
        text_chunks = split_text(extracted_text, max_length=500)
        store_chunks_in_chroma(text_chunks, collection_name="medical_docs")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
    finally:
        # Clean up the file after processing
        os.remove(temp_file_path)

    return JSONResponse(content={"extracted_text": extracted_text})




@app.post("/query/")
async def handle_query(req: QueryRequest):
    user_query = req.query
    user_id = req.user_id 

    # --- Your logic here ---
    # For example: answer = run_llm(user_query)
    answer = rag_query(user_query,  collection_name=user_id, top_k=3)

    return JSONResponse(content={"response": answer})


@app.get("/update_medications/")
async def update_medications(user_id: str = "default_user"):
    try:
        remove_expired_medications(user_id)
        return JSONResponse(content={"message": "Medications updated successfully."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error updating medications: {str(e)}"})

@app.post("/signup")
async def signup_user(data: SignupRequest):
    user_id = data.user_id
    chroma_client = client
    try:
        # Create ChromaDB collection with user's ID
        chroma_client.create_collection(name=user_id)

        # Create Firestore record
        db.collection("user_data").document(user_id).set({
            "created": str(datetime.now().isoformat()) ,
        })

        return {"message": "User created successful"}
    except Exception as e:
        print(f"Signup error: {e}")
        return {"message": "Unsuccessful"}
    

