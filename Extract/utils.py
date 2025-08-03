from typing import List
from sentence_transformers import SentenceTransformer
from Extract.vector_db import client  # Replace 'chroma_collection' with your actual collection object
from Extract.extractor import extract_text_from_pdf




def process_pdf_to_chroma(pdf_path: str, collection_name: str = "default", chunk_size: int = 500):
    """
    Extracts text from a PDF, splits into chunks, vectorizes, and stores in Chroma DB.

    Args:
        pdf_path: Path to the PDF file.
        collection_name: Name of the Chroma DB collection.
        chunk_size: Maximum chunk length for splitting text.
    """
    # Extract text from PDF

    text = extract_text_from_pdf(pdf_path)
    # Chunk text
    text_chunks = split_text(text, max_length=chunk_size)
    
    # Vectorize and store in Chroma DB
    store_chunks_in_chroma(text_chunks, collection_name)


def split_text(text: str, max_length: int = 500) -> List[str]:
    """
    Split text into chunks of max_length to suit embedding model limits.

    Args:
        text: The input large text string.
        max_length: Maximum chunk length.

    Returns:
        List of text chunks.
    """
    return [text[i : i + max_length] for i in range(0, len(text), max_length)]

def store_chunks_in_chroma(text_chunks: List[str], collection_name: str = "default"):
    collection = client.get_or_create_collection(name=collection_name)
    """
    Vectorizes text chunks using SentenceTransformer and stores them in Chroma DB.

    Args:
        text_chunks: List of text chunks to vectorize and store.
        collection_name: Name of the Chroma DB collection to store vectors in.
    """
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(text_chunks, show_progress_bar=True)
    # Store each chunk with its embedding
    for idx, (chunk, embedding) in enumerate(zip(text_chunks, embeddings)):
        collection.add(
            ids=[f"chunk_{idx}"],
            embeddings=[embedding.tolist()],
            documents=[chunk]
        )
       

    print(f"Stored {len(text_chunks)} chunks in Chroma DB collection: {collection_name}")


