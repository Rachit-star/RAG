import chromadb

client = chromadb.PersistentClient(path="./chroma_data")

collection = client.get_or_create_collection(
    name="papers",
    metadata={"hnsw:space": "cosine"},
)