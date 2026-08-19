# debug_chunks.py
from db import collection

all_data = collection.get(include=["documents", "metadatas"])

print(f"Total chunks in collection: {len(all_data['ids'])}\n")

for chunk_id, doc, meta in zip(all_data["ids"], all_data["documents"], all_data["metadatas"]):
    print(f"ID: {chunk_id}")
    print(f"Source: {meta.get('source')}")
    print(f"Length: {len(doc)} chars")
    print(f"Text: {doc[:200]}")
    print("-" * 80)