import io
import pytest
from app.services.citation_service import citation_service


SAMPLE_PAPER_TEXT = b"""
Attention Is All You Need
Ashish Vaswani, Noam Shazeer

Abstract
The dominant sequence transduction models are based on complex recurrent neural networks.
We propose the Transformer, an architecture relying entirely on an attention mechanism.

1. Introduction
The Transformer computes representations using self-attention.
"""


@pytest.fixture
def sample_uploaded_paper(client, user_tokens):
    headers = user_tokens["researcher"]["headers"]
    res = client.post(
        "/api/v1/papers/upload",
        files={"file": ("attention.pdf", io.BytesIO(SAMPLE_PAPER_TEXT), "application/pdf")},
        data={"title": "Attention Is All You Need", "venue": "NeurIPS", "publication_year": 2017},
        headers=headers,
    )
    return res.json()["paper"]


def test_citation_service_formatting_all_styles():
    formatted = citation_service.format_all(
        title="Attention Is All You Need",
        authors=["Ashish Vaswani", "Noam Shazeer"],
        year=2017,
        venue="NeurIPS",
        doi="10.48550/arXiv.1706.03762",
    )
    assert "apa" in formatted
    assert "Vaswani" in formatted["apa"]
    assert "2017" in formatted["apa"]

    assert "mla" in formatted
    assert "Vaswani" in formatted["mla"]

    assert "ieee" in formatted
    assert "A. Vaswani" in formatted["ieee"]

    assert "harvard" in formatted
    assert "chicago" in formatted

    assert "bibtex" in formatted
    assert "@article{" in formatted["bibtex"]
    assert "vaswani2017attention" in formatted["bibtex"].lower()


def test_citation_endpoint_and_export_flow(client, user_tokens, sample_uploaded_paper):
    headers = user_tokens["researcher"]["headers"]
    paper_id = sample_uploaded_paper["id"]

    # 1. Fetch citations in all formats
    get_res = client.get(f"/api/v1/citations/{paper_id}", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    assert "apa" in data
    assert "ieee" in data
    assert "bibtex" in data

    # 2. Export citation
    export_res = client.post(
        "/api/v1/citations/export",
        json={"paper_id": paper_id, "format": "ieee"},
        headers=headers,
    )
    assert export_res.status_code == 201
    assert export_res.json()["format"] == "ieee"

    # 3. List exported citations
    my_exports = client.get("/api/v1/citations/exports/my", headers=headers)
    assert my_exports.status_code == 200
    assert len(my_exports.json()) >= 1


def test_semantic_and_keyword_search(client, user_tokens, sample_uploaded_paper):
    headers = user_tokens["student"]["headers"]

    # Search with keyword matching
    res = client.get("/api/v1/search?q=Transformer+attention", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_results"] > 0
    assert any(sample_uploaded_paper["id"] == r["paper_id"] for r in data["results"])

    # Search with venue filter
    res_filtered = client.get("/api/v1/search?q=attention&venue=NeurIPS", headers=headers)
    assert res_filtered.status_code == 200
    assert len(res_filtered.json()["results"]) > 0

    # Search with non-matching year
    res_empty = client.get("/api/v1/search?q=attention&year=1995", headers=headers)
    assert res_empty.status_code == 200
    assert len(res_empty.json()["results"]) == 0


def test_paper_notes_and_highlights_lifecycle(client, user_tokens, sample_uploaded_paper):
    headers = user_tokens["student"]["headers"]
    paper_id = sample_uploaded_paper["id"]

    # 1. Create note
    note_payload = {
        "paper_id": paper_id,
        "page_number": 1,
        "selected_text": "The Transformer computes representations using self-attention.",
        "note_text": "Crucial architecture concept for seminar presentation.",
        "color": "#38bdf8",
    }
    create_res = client.post("/api/v1/notes", json=note_payload, headers=headers)
    assert create_res.status_code == 201
    note_id = create_res.json()["id"]

    # 2. List notes for paper
    list_res = client.get(f"/api/v1/notes/paper/{paper_id}", headers=headers)
    assert list_res.status_code == 200
    assert any(n["id"] == note_id for n in list_res.json())

    # 3. Delete note
    del_res = client.delete(f"/api/v1/notes/{note_id}", headers=headers)
    assert del_res.status_code == 204


def test_project_workspace_lifecycle(client, user_tokens, sample_uploaded_paper):
    headers = user_tokens["researcher"]["headers"]
    paper_id = sample_uploaded_paper["id"]

    # 1. Create project
    proj_payload = {
        "title": "NLP Attention Mechanisms Review",
        "description": "Comprehensive comparative survey of transformer vs CNN models.",
    }
    proj_res = client.post("/api/v1/projects", json=proj_payload, headers=headers)
    assert proj_res.status_code == 201
    project_id = proj_res.json()["id"]

    # 2. Pin paper to project
    pin_res = client.post(f"/api/v1/projects/{project_id}/papers", json={"paper_id": paper_id}, headers=headers)
    assert pin_res.status_code == 201

    # 3. Retrieve project and verify pinned paper
    get_res = client.get(f"/api/v1/projects/{project_id}", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()["papers"]) == 1
    assert get_res.json()["papers"][0]["id"] == paper_id

    # 4. Unpin paper
    unpin_res = client.delete(f"/api/v1/projects/{project_id}/papers/{paper_id}", headers=headers)
    assert unpin_res.status_code == 204
