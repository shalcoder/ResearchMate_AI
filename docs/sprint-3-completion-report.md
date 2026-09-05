# Sprint 3 Completion Report: Grounded RAG Chat & Multi-Paper Comparison

**Sprint Duration:** 30 August 2026 – 05 September 2026  
**Status:** Completed & Verified  
**Scrum Master / QA Lead:** Yashwanth Marimuthu (`YASHWANTH8026`)  
**Backend Engineer:** Vishal M (`Vishal`)  
**AI & UI Engineer:** Steve Isaiah Alexander (`Steve-Isaiah`)  

---

## 1. Executive Summary
Sprint 3 delivered two pivotal cognitive capabilities for **ResearchMate AI**:
1. **Grounded Conversational RAG Engine:** Natural language conversational interface that queries the vector store, injects strict context boundaries, and returns answers decorated with explicit source citation pills (`[1]`, `[2]`) linked to page numbers, sections, and source excerpts.
2. **Multi-Paper Side-by-Side Comparison Matrix:** Algorithmic and LLM-synthesized comparative framework contrasting 2+ papers across Methodology, Empirical Benchmarks, Computational Complexity, and Generalizability, culminating in the automated synthesis of novel Research Gaps.

---

## 2. Sprint Backlog Deliverables & Status

| Task ID | Component | Description | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| **S3.1-T1** | RAG Query Pipeline | Grounded RAG service (`rag_service.py`) with ChromaDB chunk retrieval and citation tags | Steve Isaiah | Done |
| **S3.1-T2** | Comparison Engine | Multi-paper contrast service (`comparison_service.py`) with matrix & research gap synthesis | Steve Isaiah | Done |
| **S3.1-T3** | Interactive Chat & Compare UI | Next.js Chat interface with citation drawer & side-by-side comparative matrix table | Steve Isaiah | Done |
| **S3.2-T1** | Chat Data Models & Storage | Database models (`ChatSession`, `ChatMessage`, `PaperComparison`) with CASCADE relationships | Vishal M | Done |
| **S3.2-T2** | Chat & Comparison REST APIs | Endpoints (`/api/v1/chat/*`, `/api/v1/compare/*`) for session persistence and analysis | Vishal M | Done |
| **S3.3-T1** | Automated Test Suite | Pytest suite (`test_rag_compare.py`) testing citation grounding, message history, and matrices | Yashwanth | Done |
| **S3.3-T2** | Sprint Retrospective | Sprint 3 retrospective report and Scrum delivery metrics | Yashwanth | Done |

---

## 3. Engineering Metrics & Testing Verification
- **Total Automated Tests:** 27 tests (23 regression from Sprints 1–2 + 4 new Sprint 3 tests)
- **Test Pass Rate:** 100% (27 passed in 30.8s)
- **Grounding Integrity:** Zero uncited claims in assistant responses; all statements backed by retrieved chunks with page number tracking.
- **Multi-Paper Validation:** Strict validation requiring minimum of 2 papers for comparative synthesis with HTTP 400 rejection on singleton requests.
