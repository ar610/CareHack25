import os
import fitz  # PyMuPDF
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv



load_dotenv()

VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")
VISION_KEY = os.getenv("AZURE_VISION_KEY")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using Azure AI Vision."""
    credential = AzureKeyCredential(VISION_KEY)
    client = ImageAnalysisClient(
    endpoint=VISION_ENDPOINT,
    credential=AzureKeyCredential(VISION_KEY)
    )

    # Open the image file in binary read mode
    with open(image_path, "rb") as image_stream:
        # Pass the image stream directly to the image_data parameter
        result = client.analyze(
            image_data=image_stream.read(), # Read the entire file content
            visual_features=[VisualFeatures.READ]
        )

    # Process the result to get the extracted text
    if result.read:
        extracted_text = []
        for line in result.read.blocks[0].lines:
            extracted_text.append(line.text)
        return "\n".join(extracted_text)
    else:
        raise Exception("Text extraction failed: No text found in the image.")

def extract_text(filepath: str) -> str:
    """Route to correct handler based on file type (PDF or image)."""
    ext = filepath.lower().split('.')[-1]
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    elif ext in ["jpg", "jpeg", "png", "bmp", "tiff"]:
        return extract_text_from_image(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
