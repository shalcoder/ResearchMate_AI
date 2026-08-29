# Sprint 2 Retrospective Report

**Date:** 29 August 2026  
**Project:** ResearchMate AI  
**Sprint Focus:** Document Parsing, Sliding-Window Chunking, ChromaDB Vector Indexing & AI Summarization  
**Participants:**
- **Vishal M** (Backend Engineer & DevOps)
- **Steve Isaiah Alexander** (AI, Vector Embeddings & Frontend)
- **Yashwanth Marimuthu** (QA Lead & Scrum Master)

---

## 1. What Went Well During the Sprint
1. **Seamless PDF Ingestion Pipeline:** PyMuPDF integration coupled with a fallback stream parser guaranteed that even corrupt or unformatted text uploads could be safely extracted without crashing the API workers.
2. **Deterministic Chunking & Section Awareness:** Academic headers (e.g. Abstract, Methodology, Results) are reliably detected during parsing and attached to chunks, which dramatically enhances downstream RAG retrieval relevance.
3. **High-Velocity UI Delivery:** The Next.js Paper Library grid and detailed chunk inspector were delivered ahead of schedule, providing a clear visual representation of vectorized document blocks.
4. **Zero-Defect Test Automation:** 7 new comprehensive unit and API tests were written and passed cleanly on the first consolidated run.

---

## 2. Challenges Encountered
1. **Passlib & Modern Bcrypt Incompatibility:** Passlib's unmaintained bcrypt inspection raised attribute errors on modern Python. Vishal quickly eliminated the dependency by switching to direct bcrypt native hashing.
2. **ChromaDB Docker/Local Fallback:** In environments without an external ChromaDB service running, vector upserts could fail. Vishal implemented a robust in-memory cosine fallback so development and tests never halt.
3. **Large PDF Upload Limits:** Handling 50MB+ research dissertations required careful stream handling and async I/O to avoid blocking the FastAPI event loop.

---

## 3. Areas for Improvement
1. **Pre-warm Gemini Models:** Summary generation should support asynchronous background tasks (`BackgroundTasks`) for very large documents exceeding 50 pages.
2. **Chunk Visualizer:** Provide a visual highlight of the exact page position bounding boxes in the frontend document viewer.
3. **Multi-paper Collections:** Organize papers into hierarchical research projects (scheduled for Sprint 4).

---

## 4. Scrum Practice Impact on Execution
- **Daily Standups:** A daily 15-minute sync between Steve, Vishal, and Yashwanth kept frontend and backend schemas perfectly synchronized, preventing payload mismatches.
- **Definition of Done (DoD):** Every pull request required corresponding Pytest unit tests, type annotations, and documentation before being merged into `main`.
- **Sprint Burn-down:** All 26 committed story points were completed within the 5-day sprint window.
