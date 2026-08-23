from rank_bm25 import BM25Okapi
from db import collection

bm25_state = {}

def build_bm25_index(all_chunks: list[str]):
    tokenized = [chunk.lower().split() for chunk in all_chunks]
    return BM25Okapi(tokenized)

def rebuild_bm25_index():
    all_data = collection.get(include=["documents"])
    bm25_state["chunks"] = all_data["documents"]
    bm25_state["ids"] = all_data["ids"]
    bm25_state["index"] = build_bm25_index(all_data["documents"])

def get_top_bm25_ids(query: str, n: int = 10):
    tokenized_query = query.lower().split()
    scores = bm25_state["index"].get_scores(tokenized_query)
    ranked_positions = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:n]
    return [bm25_state["ids"][i] for i in ranked_positions]