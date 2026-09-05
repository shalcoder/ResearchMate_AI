import io
import pytest
from app.models.paper import ResearchPaper
from app.models.chat import ChatSession, ChatMessage
from app.models.comparison import PaperComparison


SAMPLE_PAPER_1 = b"""
Attention Is All You Need
Ashish Vaswani, Noam Shazeer

Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.
We propose the Transformer, an architecture relying entirely on an attention mechanism.

1. Introduction
The Transformer is the first sequence transduction model based entirely on self-attention.
On the WMT 2014 English-to-German task, it achieves 28.4 BLEU.
"""

SAMPLE_PAPER_2 = b"""
Convolutional Sequence to Sequence Learning
Jonas Gehring, Michael Auli

Abstract
Recurrent networks are commonly used for sequence to sequence learning.
We present an architecture based entirely on convolutional neural networks.

1. Introduction
Computations over all elements can be fully parallelized during training in convolutional models.
On WMT 2014 English-to-German, our model achieves 25.2 BLEU.
"""


@pytest.fixture
def uploaded_two_papers(client, user_tokens):
    headers = user_tokens["researcher"]["headers"]

    # Upload Paper 1
    p1 = client.post(
        "/api/v1/papers/upload",
        files={"file": ("paper1.pdf", io.BytesIO(SAMPLE_PAPER_1), "application/pdf")},
        data={"title": "Attention Is All You Need", "publication_year": 2017, "venue": "NeurIPS"},
        headers=headers,
    ).json()["paper"]

    # Upload Paper 2
    p2 = client.post(
        "/api/v1/papers/upload",
        files={"file": ("paper2.pdf", io.BytesIO(SAMPLE_PAPER_2), "application/pdf")},
        data={"title": "Convolutional Sequence to Sequence Learning", "publication_year": 2017, "venue": "ICML"},
        headers=headers,
    ).json()["paper"]

    return [p1, p2]


def test_direct_rag_query_with_grounded_citations(client, user_tokens, uploaded_two_papers):
    headers = user_tokens["researcher"]["headers"]
    paper1_id = uploaded_two_papers[0]["id"]

    query_payload = {
        "query": "What BLEU score does the transformer achieve?",
        "paper_id": paper1_id,
    }

    res = client.post("/api/v1/chat/query", json=query_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 20
    assert "citations" in data
    assert len(data["citations"]) > 0
    # Check citation structure
    cit = data["citations"][0]
    assert "page_number" in cit
    assert "section_name" in cit
    assert "citation_id" in cit


def test_chat_session_and_message_history(client, user_tokens, uploaded_two_papers):
    headers = user_tokens["student"]["headers"]
    paper1_id = uploaded_two_papers[0]["id"]

    # 1. Create chat session
    session_payload = {
        "title": "Discussion on Transformer Architecture",
        "paper_id": paper1_id,
    }
    session_res = client.post("/api/v1/chat/sessions", json=session_payload, headers=headers)
    assert session_res.status_code == 201
    session_id = session_res.json()["id"]

    # 2. Send message
    msg_payload = {"content": "Can you explain the self-attention mechanism?"}
    msg_res = client.post(f"/api/v1/chat/sessions/{session_id}/messages", json=msg_payload, headers=headers)
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert msg_data["role"] == "assistant"
    assert "answer" not in msg_data  # MessageOut has content
    assert len(msg_data["content"]) > 10

    # 3. List sessions
    list_res = client.get("/api/v1/chat/sessions", headers=headers)
    assert list_res.status_code == 200
    assert any(s["id"] == session_id for s in list_res.json())

    # 4. Get session detail with messages
    get_res = client.get(f"/api/v1/chat/sessions/{session_id}", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()["messages"]) >= 2  # user + assistant


def test_multi_paper_side_by_side_comparison(client, user_tokens, uploaded_two_papers):
    headers = user_tokens["researcher"]["headers"]
    p1_id = uploaded_two_papers[0]["id"]
    p2_id = uploaded_two_papers[1]["id"]

    compare_payload = {
        "paper_ids": [p1_id, p2_id],
    }

    res = client.post("/api/v1/compare", json=compare_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "synthesis" in data
    assert len(data["synthesis"]) > 30
    assert "matrix" in data
    assert len(data["matrix"]) >= 2
    assert "research_gaps" in data
    assert len(data["research_gaps"]) >= 2

    # Check that comparison was persisted
    comp_id = data["id"]
    get_comp = client.get(f"/api/v1/compare/{comp_id}", headers=headers)
    assert get_comp.status_code == 200
    assert get_comp.json()["id"] == comp_id


def test_comparison_with_less_than_two_papers_fails(client, user_tokens, uploaded_two_papers):
    headers = user_tokens["student"]["headers"]
    p1_id = uploaded_two_papers[0]["id"]

    res = client.post("/api/v1/compare", json={"paper_ids": [p1_id]}, headers=headers)
    assert res.status_code == 422 or res.status_code == 400
