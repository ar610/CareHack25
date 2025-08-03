import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using OpenAI.

    Args:
        texts: List of text chunks.

    Returns:
        List of embedding vectors (float lists).
    """
    response = openai.embeddings.create(
        input=texts,
        model="text-embedding-3-large"
    )
    return [embedding["embedding"] for embedding in response['data']]
