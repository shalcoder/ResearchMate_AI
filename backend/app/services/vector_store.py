import os
import math
from typing import List, Dict, Any, Optional
from app.core.config import settings

try:
    import chromadb
    HAS_CHROMADB = True
except ImportError:
    HAS_CHROMADB = False


class SimpleInMemoryVectorStore:
    """In-memory fallback vector store when ChromaDB is not directly running."""
    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}

    def add(self, ids: List[str], documents: List[str], metadatas: List[Dict[str, Any]]):
        for doc_id, doc, meta in zip(ids, documents, metadatas):
            self.documents[doc_id] = {
                "id": doc_id,
                "document": doc,
                "metadata": meta,
                "tokens": set(doc.lower().split()),
            }

    def query(self, query_text: str, n_results: int = 5, where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        q_tokens = set(query_text.lower().split())
        scored: List[tuple] = []

        for doc_id, item in self.documents.items():
            if where:
                match = all(item["metadata"].get(k) == v for k, v in where.items())
                if not match:
                    continue
            # Jaccard / token overlap scoring
            d_tokens = item["tokens"]
            intersection = len(q_tokens & d_tokens)
            union = len(q_tokens | d_tokens) or 1
            score = intersection / union
            scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_k = scored[:n_results]

        return {
            "ids": [[x[1]["id"] for x in top_k]],
            "documents": [[x[1]["document"] for x in top_k]],
            "metadatas": [[x[1]["metadata"] for x in top_k]],
            "distances": [[1.0 - x[0] for x in top_k]],
        }

    def delete(self, ids: List[str]):
        for doc_id in ids:
            self.documents.pop(doc_id, None)


class VectorStoreService:
    def __init__(self):
        self.fallback = SimpleInMemoryVectorStore()
        self.client = None
        self.collection = None

        if HAS_CHROMADB:
            try:
                persist_path = os.path.abspath(settings.CHROMA_PERSIST_DIR)
                os.makedirs(persist_path, exist_ok=True)
                self.client = chromadb.PersistentClient(path=persist_path)
                self.collection = self.client.get_or_create_collection(
                    name="researchmate_papers",
                    metadata={"hnsw:space": "cosine"},
                )
            except Exception:
                self.collection = None

    def index_paper_chunks(self, paper_id: str, chunks: List[Dict[str, Any]]) -> List[str]:
        """Indexes paper chunks into vector collection."""
        if not chunks:
            return []

        ids = [f"{paper_id}_chk_{c['chunk_index']}" for c in chunks]
        documents = [c["content"] for c in chunks]
        metadatas = [
            {
                "paper_id": paper_id,
                "chunk_index": c["chunk_index"],
                "section_name": c.get("section_name", "Body"),
                "page_number": c.get("page_number", 1),
            }
            for c in chunks
        ]

        if self.collection is not None:
            try:
                self.collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                )
                return ids
            except Exception:
                pass

        # Fallback to in-memory store
        self.fallback.add(ids=ids, documents=documents, metadatas=metadatas)
        return ids

    def query_similar_chunks(
        self,
        query: str,
        n_results: int = 5,
        paper_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        where_clause = {"paper_id": paper_id} if paper_id else None

        if self.collection is not None:
            try:
                kwargs = {"query_texts": [query], "n_results": n_results}
                if where_clause:
                    kwargs["where"] = where_clause
                results = self.collection.query(**kwargs)
                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
                    ids = results["ids"][0] if "ids" in results else [""] * len(docs)
                    dists = results.get("distances", [[0.0] * len(docs)])[0]
                    for doc, meta, doc_id, dist in zip(docs, metas, ids, dists):
                        formatted.append({
                            "id": doc_id,
                            "content": doc,
                            "metadata": meta,
                            "score": round(1.0 - float(dist), 4),
                        })
                return formatted
            except Exception:
                pass

        # Use fallback
        res = self.fallback.query(query_text=query, n_results=n_results, where=where_clause)
        formatted = []
        if res and res["documents"] and res["documents"][0]:
            docs = res["documents"][0]
            metas = res["metadatas"][0]
            ids = res["ids"][0]
            dists = res["distances"][0]
            for doc, meta, doc_id, dist in zip(docs, metas, ids, dists):
                formatted.append({
                    "id": doc_id,
                    "content": doc,
                    "metadata": meta,
                    "score": round(1.0 - float(dist), 4),
                })
        return formatted

    def delete_paper_chunks(self, paper_id: str):
        if self.collection is not None:
            try:
                self.collection.delete(where={"paper_id": paper_id})
            except Exception:
                pass
        to_delete = [
            k for k, v in self.fallback.documents.items()
            if v["metadata"].get("paper_id") == paper_id
        ]
        self.fallback.delete(to_delete)


vector_store_service = VectorStoreService()
