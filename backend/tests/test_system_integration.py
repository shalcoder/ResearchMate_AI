import io
import pytest


E2E_PAPER_1 = b"""
Attention Is All You Need
Ashish Vaswani, Noam Shazeer

Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.
We propose the Transformer, an architecture relying entirely on an attention mechanism.

1. Introduction
The Transformer is the first sequence transduction model based entirely on self-attention.
On the WMT 2014 English-to-German task, it achieves 28.4 BLEU score.
"""

E2E_PAPER_2 = b"""
Convolutional Sequence to Sequence Learning
Jonas Gehring, Michael Auli

Abstract
We present an architecture based entirely on convolutional neural networks for sequence modeling.
Computations over all elements can be fully parallelized during training.

1. Introduction
On WMT 2014 English-to-German, our model achieves 25.2 BLEU score.
"""


def test_complete_researchmate_ai_end_to_end_journey(client):
    """
    Comprehensive End-to-End lifecycle test verifying all 5 sprints:
    1. Auth & Registration (Sprint 1)
    2. Role-Based Login & JWT (Sprint 1)
    3. Scientific PDF Upload & Chunking (Sprint 2)
    4. ChromaDB Vector Store Indexing (Sprint 2)
    5. 5-Point Gemini Summary Generation (Sprint 2)
    6. Grounded RAG Chat with Citation Pills (Sprint 3)
    7. Multi-Paper Comparative Matrix & Research Gaps (Sprint 3)
    8. Academic Citation Formats: APA, MLA, IEEE, BibTeX (Sprint 4)
    9. Paper Annotations & Highlight Notes (Sprint 4)
    10. Collaborative Project Workspace & Paper Pinning (Sprint 4)
    11. Admin System Governance, Metrics & Audit Logs (Sprint 5)
    """
    # -------------------------------------------------------------
    # STEP 1: Registration (Sprint 1)
    # -------------------------------------------------------------
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Dr. Research Scientist",
            "email": "scientist.lead@researchmate.ai",
            "password": "SecurePassword123!",
            "role": "researcher",
            "department": "Artificial Intelligence",
            "institution": "National Lab",
        },
    )
    assert reg_res.status_code == 201, reg_res.text
    user_id = reg_res.json()["id"]

    # -------------------------------------------------------------
    # STEP 2: Login & JWT Token Retrieval (Sprint 1)
    # -------------------------------------------------------------
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "scientist.lead@researchmate.ai",
            "password": "SecurePassword123!",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify authenticated user info
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "scientist.lead@researchmate.ai"
    assert me_res.json()["role"] == "researcher"

    # -------------------------------------------------------------
    # STEP 3 & 4: Upload Scientific Papers & Vectorize (Sprint 2)
    # -------------------------------------------------------------
    upload_1 = client.post(
        "/api/v1/papers/upload",
        files={"file": ("attention.pdf", io.BytesIO(E2E_PAPER_1), "application/pdf")},
        data={"title": "Attention Is All You Need", "venue": "NeurIPS", "publication_year": 2017},
        headers=headers,
    )
    assert upload_1.status_code == 201
    paper1 = upload_1.json()["paper"]
    assert upload_1.json()["extracted_chunks"] > 0

    upload_2 = client.post(
        "/api/v1/papers/upload",
        files={"file": ("convs2s.pdf", io.BytesIO(E2E_PAPER_2), "application/pdf")},
        data={"title": "Convolutional Sequence to Sequence Learning", "venue": "ICML", "publication_year": 2017},
        headers=headers,
    )
    assert upload_2.status_code == 201
    paper2 = upload_2.json()["paper"]

    # -------------------------------------------------------------
    # STEP 5: 5-Point Structured Summary (Sprint 2)
    # -------------------------------------------------------------
    sum_res = client.post(f"/api/v1/papers/{paper1['id']}/summary", headers=headers)
    assert sum_res.status_code == 200
    summary_data = sum_res.json()
    assert len(summary_data["key_findings"]) >= 1
    assert len(summary_data["limitations"]) >= 1
    assert len(summary_data["future_scope"]) >= 1

    # -------------------------------------------------------------
    # STEP 6: Grounded RAG Chat with Citation Verification (Sprint 3)
    # -------------------------------------------------------------
    chat_query = {
        "query": "What BLEU score does the transformer achieve on English to German?",
        "paper_id": paper1["id"],
    }
    chat_res = client.post("/api/v1/chat/query", json=chat_query, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert len(chat_data["citations"]) > 0
    assert "page_number" in chat_data["citations"][0]
    assert "section_name" in chat_data["citations"][0]

    # -------------------------------------------------------------
    # STEP 7: Multi-Paper Side-by-Side Comparison (Sprint 3)
    # -------------------------------------------------------------
    comp_res = client.post(
        "/api/v1/compare",
        json={"paper_ids": [paper1["id"], paper2["id"]]},
        headers=headers,
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["matrix"]) >= 2
    assert len(comp_data["research_gaps"]) >= 2
    assert "synthesis" in comp_data

    # -------------------------------------------------------------
    # STEP 8: Academic Citation Generation in 6 Formats (Sprint 4)
    # -------------------------------------------------------------
    cite_res = client.get(f"/api/v1/citations/{paper1['id']}", headers=headers)
    assert cite_res.status_code == 200
    cites = cite_res.json()
    assert "apa" in cites and "Attention Is All You Need" in cites["apa"]
    assert "ieee" in cites and "NeurIPS" in cites["ieee"]
    assert "bibtex" in cites and "@article{" in cites["bibtex"]

    # -------------------------------------------------------------
    # STEP 9: Notes & Text Highlights (Sprint 4)
    # -------------------------------------------------------------
    note_res = client.post(
        "/api/v1/notes",
        json={
            "paper_id": paper1["id"],
            "page_number": 1,
            "selected_text": "The Transformer is the first sequence transduction model based entirely on self-attention.",
            "note_text": "Key thesis citation for architecture comparison chapter.",
            "color": "#e11d48",
        },
        headers=headers,
    )
    assert note_res.status_code == 201
    assert note_res.json()["page_number"] == 1

    # -------------------------------------------------------------
    # STEP 10: Collaborative Project Workspace (Sprint 4)
    # -------------------------------------------------------------
    proj_res = client.post(
        "/api/v1/projects",
        json={
            "title": "Master's Thesis: Sequence Transduction",
            "description": "Comparative literature collection of attention vs convolutional models.",
        },
        headers=headers,
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    pin_res = client.post(f"/api/v1/projects/{proj_id}/papers", json={"paper_id": paper1["id"]}, headers=headers)
    assert pin_res.status_code == 201

    # -------------------------------------------------------------
    # STEP 11: Admin Governance & System Health Check (Sprint 5)
    # -------------------------------------------------------------
    # Create an admin account
    admin_reg = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Platform Administrator",
            "email": "lead.admin@researchmate.ai",
            "password": "AdminSuperSecretPassword123!",
            "role": "admin",
            "department": "Infrastructure",
            "institution": "Central Admin",
        },
    )
    admin_token = client.post(
        "/api/v1/auth/login",
        json={
            "email": "lead.admin@researchmate.ai",
            "password": "AdminSuperSecretPassword123!",
        },
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Verify admin analytics endpoint reflects our created records
    admin_analytics = client.get("/api/v1/admin/analytics", headers=admin_headers)
    assert admin_analytics.status_code == 200
    stats = admin_analytics.json()
    assert stats["status"] == "healthy"
    assert stats["total_users"] >= 2
    assert stats["total_papers"] >= 2
    assert stats["total_chunks"] >= 2
    assert stats["total_projects"] >= 1

    # Verify admin audit log
    audit_res = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    assert audit_res.json()["total_events"] > 0
