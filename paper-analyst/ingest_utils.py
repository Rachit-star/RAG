import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

from db import collection
from embed_utils import embed

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)

def ingest_pdf(filepath: str, filename: str) -> int:
    doc = fitz.open(filepath)
    full_text = "\n\n".join([page.get_text() for page in doc])
    doc.close()

    chunks = splitter.split_text(full_text)

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embed(chunk).tolist()],
            metadatas=[{"source": filename, "chunk_index": i}],
            ids=[f"{filename}_{i}"],
        )

    return len(chunks)