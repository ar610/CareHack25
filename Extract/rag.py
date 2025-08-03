from openai import AzureOpenAI
from os import environ
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from chromadb.errors import NotFoundError

# Load environment variables
load_dotenv()

# Azure OpenAI credentials
endpoint = environ.get("AZURE_OPENAI_ENDPOINT")
key = environ.get("AZURE_OPENAI_API_KEY")

# Chroma credentials
chromakey = environ.get("CHROMA_API_KEY")

# Initialize ChromaDB Cloud client
client = chromadb.CloudClient(
    api_key=chromakey,
    tenant='',  # Replace with your actual tenant
    database=''  # Replace with your actual DB name
)

# Create or get the document collection

# Load embedding model
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Azure OpenAI client
llmclient = AzureOpenAI(
    api_key=key,
    api_version=" ",  # Adjust if your version differs
    azure_endpoint=endpoint
)

# RAG function
def rag_query(user_query, collection_name, top_k=3):
    def get_or_create_collection(name):
        try:
            return client.get_collection(name=name)
        except NotFoundError:
            return client.create_collection(name=name)
    collection = client.get_collection(name = "medical_docs")

    # Embed the query
    query_embedding = embedder.encode([user_query]).tolist()[0]

    # Retrieve top-k similar documents from Chroma
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    retrieved_docs = results['documents'][0]

    # Prepare system prompt with context
    context = "\n".join(retrieved_docs)
    
    system_prompt = (
        "You are a helpful medical assistant. Use only the context below to answer the query.\n"
        f"Context:\n{context}"
    )

    # Call Azure OpenAI
    response = llmclient.chat.completions.create(
        model="gpt-4o",  # Your Azure deployment name
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ],
        temperature=0.3,
        max_tokens=500,
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    # Example usage
    query = "What medications is the patient currently taking?"
    response = rag_query(query)
    print("RAG Response:", response)