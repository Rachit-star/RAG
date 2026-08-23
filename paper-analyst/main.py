import os

from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os

from models import AskRequest, AskResponse
from db import collection
from embed_utils import embed
from llm import generate_answer
from bm25utils import rebuild_bm25_index, get_top_bm25_ids
from rrf_utils import reciprocal_rank_fusion
from reranker import rerank
from hyde_utils import generate_hypothetical_answer
from ingest_utils import ingest_pdf


@asynccontextmanager
async def lifespan(app: FastAPI):
    rebuild_bm25_index()
    yield

app = FastAPI(lifespan=lifespan)


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    hypothetical = generate_hypothetical_answer(request.question)

    vector_results = collection.query(
        query_embeddings=[embed(hypothetical).tolist()],
        n_results=15,
    )
    vector_ranked_ids = vector_results["ids"][0]

    bm25_ranked_ids = get_top_bm25_ids(request.question, n=15)

    merged_ids = reciprocal_rank_fusion(vector_ranked_ids, bm25_ranked_ids)[:15]

    candidate_data = collection.get(ids=merged_ids, include=["documents"])
    reranked_ids = rerank(request.question, candidate_data["ids"], candidate_data["documents"], top_n=5)

    final_data = collection.get(ids=reranked_ids, include=["documents", "metadatas"])
    chunks = final_data["documents"]
    sources = [meta["source"] for meta in final_data["metadatas"]]

    context = "\n\n".join(chunks)
    answer = generate_answer(request.question, context)

    return AskResponse(answer=answer, sources=list(set(sources)))


@app.post("/papers/upload")
async def upload_paper(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    save_path = os.path.join("papers", file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunk_count = ingest_pdf(save_path, file.filename)
    rebuild_bm25_index()

    return {"filename": file.filename, "chunks_ingested": chunk_count}