from db import collection

all_data = collection.get(include=["documents", "metadatas"])

for chunk_id, doc in zip(all_data["ids"], all_data["documents"]):
    if chunk_id.startswith("paper (2).pdf_0") or chunk_id.startswith("paper (2).pdf_1") and not chunk_id.startswith("paper (2).pdf_1_"):
        print(f"ID: {chunk_id}")
        print(doc)
        print("-" * 80)