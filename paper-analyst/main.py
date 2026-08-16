from fastapi import FastAPI
from models import AskRequest, AskResponse
from db import collection
from embed_utils import embed
from llm import generate_answer

app = FastAPI()

@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    results = collection.query(
        query_embeddings=[embed(request.question).tolist()],
        n_results=5,
    )

    chunks = results["documents"][0]
    sources = [meta["source"] for meta in results["metadatas"][0]]

    context = "\n\n".join(chunks)
    answer = generate_answer(request.question, context)

    return AskResponse(answer=answer, sources=list(set(sources)))