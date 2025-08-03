import chromadb
from chromadb.config import Settings
import dotenv
import os

# Configure Chroma DB client (local or server-based)
dotenv.load_dotenv()


chromakey = os.getenv("CHROMA_API_KEY")

client = chromadb.CloudClient(
  api_key=chromakey,
  tenant='',
  database='cicadadb'
)

# Create or get collection for storing vectors
collection = client.get_or_create_collection(name="document_vectors")

def store_vectors(vectors: list[list[float]], metadatas: list[dict], ids: list[str]):
    """
    Store vector embeddings to Chroma DB.

    Args:
        vectors: List of vector embeddings.
        metadatas: List of metadata dicts for vectors.
        ids: List of unique IDs for each vector.
    """
    collection.add(
        embeddings=vectors,
        metadatas=metadatas,
        ids=ids
    )
