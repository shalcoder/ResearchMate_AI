import io
import pytest
from app.services.pdf_extractor import extract_pdf_data
from app.services.text_chunker import chunk_extracted_pages
from app.services.vector_store import vector_store_service
from app.models.paper import ResearchPaper, PaperChunk, PaperSummary


SAMPLE_PAPER_TEXT = b"""
Attention Is All You Need
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit

Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.
We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism.
Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable.

1. Introduction
Recurrent neural networks, long short-term memory and gated recurrent neural networks have been firmly established as state of the art.
The Transformer is the first transduction model relying entirely on self-attention to compute representations.

2. Background
The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S.

3. Results
On the WMT 2014 English-to-German translation task, the big transformer model achieves a BLEU score of 28.4.

4. Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention.
"""


def test_pdf_extractor_parses_sections():
    extracted = extract_pdf_data(SAMPLE_PAPER_TEXT, filename="attention_is_all_you_need.pdf")
    assert "Transformer" in extracted.title or "Attention" in extracted.title
    assert len(extracted.pages) >= 1
    assert "sequence transduction" in extracted.abstract.lower()


def test_text_chunker_sliding_window():
    extracted = extract_pdf_data(SAMPLE_PAPER_TEXT, filename="attention.pdf")
    chunks = chunk_extracted_pages(extracted.pages, target_chunk_chars=250, overlap_chars=40)
    assert len(chunks) >= 2
    for c in chunks:
        assert c.token_count > 0
        assert c.page_number >= 1
        assert len(c.content) > 0


def test_vector_store_indexing_and_query():
    extracted = extract_pdf_data(SAMPLE_PAPER_TEXT, filename="test_doc.pdf")
    chunks = chunk_extracted_pages(extracted.pages)
    chunk_dicts = [c.to_dict() for c in chunks]

    indexed_ids = vector_store_service.index_paper_chunks("paper_uuid_123", chunk_dicts)
    assert len(indexed_ids) == len(chunk_dicts)

    # Query
    results = vector_store_service.query_similar_chunks(
        query="BLEU score translation task",
        n_results=3,
        paper_id="paper_uuid_123",
    )
    assert len(results) > 0
    assert any("translation" in r["content"].lower() or "score" in r["content"].lower() for r in results)


def test_paper_upload_and_listing_flow(client, user_tokens):
    headers = user_tokens["researcher"]["headers"]
    file_payload = {
        "file": ("attention.pdf", io.BytesIO(SAMPLE_PAPER_TEXT), "application/pdf"),
    }
    data_payload = {
        "title": "Attention Is All You Need",
        "venue": "NeurIPS",
        "publication_year": 2017,
    }

    res = client.post("/api/v1/papers/upload", files=file_payload, data=data_payload, headers=headers)
    assert res.status_code == 201
    res_data = res.json()
    paper_id = res_data["paper"]["id"]
    assert res_data["paper"]["title"] == "Attention Is All You Need"
    assert res_data["extracted_chunks"] > 0

    # List papers
    list_res = client.get("/api/v1/papers", headers=headers)
    assert list_res.status_code == 200
    papers_list = list_res.json()
    assert any(p["id"] == paper_id for p in papers_list)

    # Get paper detail
    detail_res = client.get(f"/api/v1/papers/{paper_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["venue"] == "NeurIPS"

    # Get chunks
    chunks_res = client.get(f"/api/v1/papers/{paper_id}/chunks", headers=headers)
    assert chunks_res.status_code == 200
    assert len(chunks_res.json()) > 0


def test_paper_summary_generation_flow(client, user_tokens):
    headers = user_tokens["student"]["headers"]
    file_payload = {
        "file": ("sample.txt", io.BytesIO(SAMPLE_PAPER_TEXT), "text/plain"),
    }
    upload_res = client.post("/api/v1/papers/upload", files=file_payload, headers=headers)
    paper_id = upload_res.json()["paper"]["id"]

    # Generate summary
    sum_post_res = client.post(f"/api/v1/papers/{paper_id}/summary", headers=headers)
    assert sum_post_res.status_code == 200
    summary = sum_post_res.json()
    assert "executive_summary" in summary
    assert len(summary["key_findings"]) >= 1
    assert len(summary["limitations"]) >= 1
    assert len(summary["future_scope"]) >= 1

    # Retrieve stored summary
    sum_get_res = client.get(f"/api/v1/papers/{paper_id}/summary", headers=headers)
    assert sum_get_res.status_code == 200
    assert sum_get_res.json()["id"] == summary["id"]


def test_invalid_paper_upload_rejected(client, user_tokens):
    headers = user_tokens["student"]["headers"]

    # Unsupported format
    file_payload = {
        "file": ("script.py", io.BytesIO(b"print('hello')"), "text/x-python"),
    }
    res = client.post("/api/v1/papers/upload", files=file_payload, headers=headers)
    assert res.status_code == 400
    assert "Only PDF and text" in res.json()["detail"]

    # Empty file
    empty_payload = {
        "file": ("empty.pdf", io.BytesIO(b""), "application/pdf"),
    }
    res2 = client.post("/api/v1/papers/upload", files=empty_payload, headers=headers)
    assert res2.status_code == 400
    assert "empty" in res2.json()["detail"]


def test_unauthenticated_paper_access_rejected(client):
    res = client.get("/api/v1/papers")
    assert res.status_code == 401
