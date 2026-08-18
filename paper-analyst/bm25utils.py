from rank_bm25 import BM25Okapi

def build_bm25_index(all_chunks: list[str]):
    tokenized = [chunk.lower().split() for chunk in all_chunks]
    return BM25Okapi(tokenized)

def get_top_bm25_ids(query: str, index: BM25Okapi, all_ids: list[str], n: int = 10):
    tokenized_query = query.lower().split()
    scores = index.get_scores(tokenized_query)

    ranked_positions = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:n]
    return [all_ids[i] for i in ranked_positions]