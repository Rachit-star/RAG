import os
from unstructured.partition.pdf import partition_pdf
from langchain_text_splitters import RecursiveCharacterTextSplitter

from db import collection
from embed_utils import embed

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)

papers_folder = "papers"
pdf_files = [f for f in os.listdir(papers_folder) if f.endswith(".pdf")]

for filename in pdf_files:
    filepath = os.path.join(papers_folder, filename)
    elements = partition_pdf(filepath)
    full_text = "\n\n".join([str(el) for el in elements])

    chunks = splitter.split_text(full_text)

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embed(chunk).tolist()],
            metadatas=[{"source": filename, "chunk_index": i}],
            ids=[f"{filename}_{i}"],
        )

    print(f"Ingested {filename}: {len(chunks)} chunks")