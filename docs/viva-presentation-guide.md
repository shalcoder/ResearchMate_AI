# ResearchMate AI: Viva Defense & Technical Presentation Guide

**Target Examination:** Final Engineering Project Viva / Technical Review Board  
**System Name:** ResearchMate AI  
**Release Version:** `v1.0.0-release` (20 September 2026)  
**Project Leads:**
- **Vishal M** (Backend Architecture, Database Engineering & DevOps)
- **Steve Isaiah Alexander** (AI Pipeline, Vector Embeddings & Frontend Architecture)
- **Yashwanth Marimuthu** (Frontend Engineering, QA Testing & Scrum Master)

---

## 1. Executive Summary & Problem Motivation
Traditional academic research workflows suffer from fragmented tooling:
- Reading multi-page PDFs in standard PDF viewers provides no semantic intelligence.
- Generic LLM chatbots (e.g. ChatGPT) hallucinate facts, fabricate non-existent citations, and lack direct document grounding.
- Literature reviews require manual cross-comparison of methodologies, datasets, and benchmark metrics across dozens of papers.
- Academic citation generation requires clumsy external bibliography managers.

**ResearchMate AI** solves this by delivering an integrated, persistent research workspace where scientific literature is ingested, section-segmented, vectorized into ChromaDB, and reasoned over via strictly grounded RAG with verifiable page citations, automated multi-paper comparison matrices, and collaborative project dossiers.

---

## 2. Technical Architecture & Component Interaction

```
+-----------------------------------------------------------------------------------+
|                            Next.js 14/15 Frontend                                 |
|   (App Router, Tailwind CSS, TypeScript, RBAC Dashboards, Chat & Compare UI)      |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JWT Auth)
                                           v
+-----------------------------------------------------------------------------------+
|                             FastAPI Backend Service                               |
|       (Authentication, RBAC Middleware, Paper Ingestion, RAG, Citations)          |
+-------------------+----------------------+-------------------+--------------------+
                    |                      |                   |
                    v                      v                   v
+-----------------------+  +-----------------------+  +-----------------------------+
|    PostgreSQL 16      |  |  ChromaDB Vector DB   |  |   Google Gemini 2.0 Flash   |
| (Users, Papers, Chunks|  | (HNSW Cosine Vector   |  |  (Grounded Question Answering|
|  Chats, Notes, Projs) |  |  Embeddings Store)    |  |   & 5-Point Summarization)  |
+-----------------------+  +-----------------------+  +-----------------------------+
```

---

## 3. Core Algorithmic Decisions & Innovations

### A. Section-Aware Sliding-Window Chunking
- Standard naive chunkers split blindly across token counts, severing related paragraphs.
- ResearchMate AI detects academic section headers (`Abstract`, `Introduction`, `Methodology`, `Results`, `Discussion`, `Conclusion`).
- Text is partitioned into 1200-character windows with a 150-character overlap, tagging each chunk with `section_name` and `page_number`.

### B. Grounded Retrieval-Augmented Generation (RAG)
- Incoming user queries are embedded and compared against chunk vectors using cosine similarity:
$$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
- Top-$K$ relevant chunks are formatted with source citation tags `[1]`, `[2]`.
- System instructions strictly prohibit hallucination: claims must cite specific source blocks with page tracking.

### C. Multi-Paper Comparative Matrix Engine
- Accepts 2 to 5 papers.
- Extracts comparative axes: Architecture, Datasets, Complexity, and Adaptability.
- Synthesizes unexplored research gaps by contrasting the empirical constraints of both approaches.

### D. Standards-Compliant Academic Citations
- Author parsing tokenizer decomposes complex names into primary and secondary authors.
- Automatically generates APA 7th, MLA 9th, IEEE, Harvard, Chicago, and BibTeX citations with DOI embedding.

---

## 4. Agile Scrum Development Chronology

The project was executed over 5 two-week and weekly sprints from **20 August to 20 September 2026**:
- **Sprint 1 (20–24 Aug):** User Authentication & Role-Based Access Control (Student, Researcher, Professor, Admin).
- **Sprint 2 (25–29 Aug):** PDF Ingestion, Text Chunking, ChromaDB Vector Store & 5-Point Gemini Summary.
- **Sprint 3 (30 Aug – 05 Sep):** Grounded RAG Chat with Citation Pills & Side-by-Side Paper Comparison Matrix.
- **Sprint 4 (06–12 Sep):** Semantic Search Filters, Multi-Format Citation Generator & Project Workspaces.
- **Sprint 5 (13–19 Sep):** Multi-Stage Docker Containerization, CI/CD Pipeline, Admin Governance & E2E Integration Hardening.
- **Release (20 Sep 2026):** Production Tag `v1.0.0-release` and defense readiness.

---

## 5. Live Demonstration Script (Step-by-Step for Viva)

1. **Role-Based Authentication:**
   - Log in as **Researcher** (`scientist.lead@researchmate.ai`).
   - Highlight role-specific dashboard metrics and navigation permissions.
2. **Paper Ingestion & Vectorization:**
   - Upload `Attention Is All You Need` PDF.
   - Inspect the automatically extracted 5-point summary (Key Findings, Methodology, Limitations, Future Scope).
   - Switch to the "Vector Chunks" tab to demonstrate the sliding-window chunk partitions and token counts.
3. **Grounded RAG Conversational Chat:**
   - Open `/chat` and ask: *"What BLEU score does the transformer achieve on English to German translation?"*
   - Show the assistant's answer with clickable citation pill `[1] p.2 Introduction`.
   - Click the citation pill to open the **Verified Source Evidence Drawer**, proving zero hallucination.
4. **Side-by-Side Comparison:**
   - Select `Attention Is All You Need` and `Convolutional Sequence to Sequence Learning` in `/compare`.
   - Click "Compare Selected Papers".
   - Review the aspect-by-aspect matrix table and the synthesized **Research Gaps**.
5. **Citations & Project Dossiers:**
   - Show 1-click citation export in APA, MLA, IEEE, and BibTeX.
   - Show how the paper is pinned inside the "Master's Thesis" workspace.
6. **Admin Governance & System Health:**
   - Switch to Admin account.
   - View live token consumption meters, ChromaDB collection status, and security audit feed.

---

## 6. Top 15 Frequently Asked Viva Questions & Model Answers

### Q1: Why use ChromaDB instead of standard PostgreSQL for storing papers?
**Answer:** PostgreSQL is an ACID-compliant relational database optimized for structured queries. ChromaDB is a specialized vector database optimized for Approximate Nearest Neighbor (ANN) search over high-dimensional vector spaces using HNSW (Hierarchical Navigable Small World) graphs. Combining both gives us relational integrity in PostgreSQL alongside sub-millisecond semantic vector retrieval in ChromaDB.

### Q2: How does your system guarantee zero hallucination in RAG answers?
**Answer:** We enforce grounding through three layers:
1. Retrieval filtering: Only chunks exceeding a cosine similarity relevance threshold are passed to the context window.
2. System prompting: The model is strictly instructed to derive claims solely from the numbered excerpts `[1]`, `[2]` and declare ignorance if information is missing.
3. Post-generation attribution: Assistant citations are cross-referenced with chunk IDs, page numbers, and section headers in our database.

### Q3: How do you handle PDFs with irregular formatting or scanned pages?
**Answer:** We implemented a dual-engine parser in `pdf_extractor.py`. If native PyMuPDF font streams are present, it extracts text layout blocks and header fonts. If the PDF stream is unstructured or degraded, it uses a fallback text stream segmenter. For future work, we have planned OCR integration with Tesseract.

### Q4: What is the significance of chunk overlap in the text chunker?
**Answer:** Naive chunk boundaries can slice a sentence or concept in half. By configuring a 150-character sliding overlap, the context preceding and succeeding each boundary is duplicated across adjacent chunks, preserving semantic coherence for embedding models.

### Q5: What role does Docker play in your production architecture?
**Answer:** Docker encapsulates our 4 application tiers (PostgreSQL, ChromaDB, FastAPI, Next.js) with isolated dependencies and environment configurations. Multi-stage builds reduce image footprints, and `docker-compose.yml` provides automated healthchecks, volume persistence, and networking.

### Q6: How does your RBAC middleware prevent privilege escalation?
**Answer:** We use FastAPI dependency injection (`require_role`, `require_admin`). The JWT payload contains the cryptographically signed role claim (`role: "student"`). When a protected route is requested, the token is decoded with our server secret; if the user's role is not in the allowed list, an HTTP 403 Forbidden exception is raised before the route handler executes.

### Q7: Why use bcrypt directly instead of passlib?
**Answer:** Passlib is currently unmaintained and contains a bug when interacting with `bcrypt>=4.1.0` where internal 72-byte test passwords cause attribute errors. Directly invoking native `bcrypt.hashpw` and `bcrypt.checkpw` provides higher performance and zero dependency overhead.

### Q8: How are citations generated across different academic standards?
**Answer:** In `citation_service.py`, we implement deterministic formatters following APA 7th, MLA 9th, IEEE, Harvard, Chicago, and BibTeX rules. The service parses author lists into last names and initials, formats venue and year descriptors, and attaches permanent DOI URLs.

### Q9: What happens if Gemini API quota is exceeded or offline?
**Answer:** The system features graceful heuristic degradation: if the Gemini client encounters rate limits or offline network conditions, structured heuristic extraction parses the introduction, benchmark metrics, and conclusion paragraphs directly from the text chunks, ensuring the UI never crashes.

### Q10: How do you measure test coverage?
**Answer:** We have 33 automated tests across unit, integration, and E2E suites executed via Pytest. The test suite covers 100% of our REST endpoints and database models using an in-memory SQLite database for high-speed deterministic test execution.

### Q11: How do collaborative project workspaces work?
**Answer:** Workspaces use a many-to-many relationship (`ProjectPaper`) between `Project` and `ResearchPaper` tables with foreign key CASCADE deletion. Users can group related literature, attach page-level notes, and share collections.

### Q12: Why Next.js App Router for the frontend?
**Answer:** The Next.js App Router provides modern React Server Components, nested layouts (`DashboardLayout`), route groups (`(auth)`), fast client-side navigation, and streamlined production standalone build containers.

### Q13: How is token usage estimated in the admin panel?
**Answer:** In `admin.py`, token consumption is computed by aggregating stored chunk token counts (`PaperChunk.token_count`) and multiplying user/assistant message counts by standard token multipliers, giving administrators real-time cost visibility.

### Q14: How does your CI/CD pipeline ensure code quality?
**Answer:** Our `.github/workflows/ci.yml` triggers on every push and pull request. It executes three parallel jobs: backend linting (`flake8`) and Pytest execution on Python 3.11, frontend dependency installation and TypeScript compilation, and Docker Compose configuration validation.

### Q15: What are the primary future enhancements for ResearchMate AI?
**Answer:** Key future enhancements include WebSocket streaming responses for real-time token delivery, multi-modal chart and figure extraction from PDFs, and exposing an MCP (Model Context Protocol) server to allow IDEs and AI coding agents to search the research library directly.
