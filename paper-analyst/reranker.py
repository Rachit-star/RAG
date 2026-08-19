from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(question: str, chunk_ids: list[str], chunk_texts: list[str], top_n: int = 5):
    pairs = [[question, text] for text in chunk_texts]
    scores = reranker.predict(pairs)

    ranked = sorted(zip(chunk_ids, scores), key=lambda x: x[1], reverse=True)
    return [chunk_id for chunk_id, score in ranked[:top_n]]