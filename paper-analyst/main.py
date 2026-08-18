from contextlib import asynccontextmanager
from fastapi import FastAPI

from models import AskRequest, AskResponse
from db import collection
from embed_utils import embed
from llm import generate_answer
from bm25utils import build_bm25_index, get_top_bm25_ids
from rrf_utils import reciprocal_rank_fusion


bm25_state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    all_data = collection.get(include=["documents"])
    bm25_state["chunks"] = all_data["documents"]
    bm25_state["ids"] = all_data["ids"]
    bm25_state["index"] = build_bm25_index(all_data["documents"])
    yield

app = FastAPI(lifespan=lifespan)


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    vector_results = collection.query(
        query_embeddings=[embed(request.question).tolist()],
        n_results=10,
    )
    vector_ranked_ids = vector_results["ids"][0]

    bm25_ranked_ids = get_top_bm25_ids(
        request.question, bm25_state["index"], bm25_state["ids"], n=10
    )

    merged_ids = reciprocal_rank_fusion(vector_ranked_ids, bm25_ranked_ids)[:5]

    final_data = collection.get(ids=merged_ids, include=["documents", "metadatas"])
    chunks = final_data["documents"]
    sources = [meta["source"] for meta in final_data["metadatas"]]

    context = "\n\n".join(chunks)
    answer = generate_answer(request.question, context)

    return AskResponse(answer=answer, sources=list(set(sources)))