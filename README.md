# ResearchMate AI

> **Production-Grade Persistent Academic Research Workspace & Literature-Review Platform**

ResearchMate AI is a specialized academic research workspace designed for persistent scientific paper management, source-grounded question answering (RAG), side-by-side paper comparison, automated research-gap identification, multi-style academic citations (APA, MLA, IEEE, Harvard, Chicago, BibTeX), notes & highlights, collaborative project dossiers, professor supervision, and administrative governance.

---

## 👥 Core Engineering Team
- **Frontend & QA Lead**: Yashwanth Marimuthu (`YASHWANTH8026`) — Branch: `yashwanth`
- **AI, Embeddings & RAG Lead**: Steve Isaiah Alexander (`steveisaiahalexander`) — Branch: `Steve-Isaiah`
- **Backend, Database & DevOps Lead**: Vishal M (`Vishal M`) — Branch: `Vishal`

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 14/15 App Router, React 18, Tailwind CSS, TypeScript
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Bcrypt Native Security
- **Vector Engine**: ChromaDB with HNSW Cosine Similarity Indexing
- **LLM / RAG Pipeline**: Google Gemini 2.0 Flash API with strict evidence-grounding prompts
- **Document Processing**: PyMuPDF / fitz with academic section segmentation and sliding-window chunking
- **Database**: PostgreSQL 16 / SQLite (in-memory test isolation)
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD Pipeline

---

## 📅 Sprint Chronology & Engineering Roadmap (20 Aug – 20 Sep 2026)

| Sprint | Dates | Focus Area | Key Deliverables | Tests |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | 20 Aug – 24 Aug | Auth & Role Governance (RBAC) | JWT login/registration, role-based dashboard shells (Student, Researcher, Professor, Admin), route guards | 16 passed |
| **Sprint 2** | 25 Aug – 29 Aug | PDF Ingestion & Vector Indexing | PyMuPDF parsing, sliding-window chunker, ChromaDB collection upsert, 5-point Gemini summary engine, paper library UI | 23 passed |
| **Sprint 3** | 30 Aug – 05 Sep | Grounded RAG & Comparison Engine | Grounded conversational RAG with citation pills `[1]`, side-by-side comparison matrix, automated research gap synthesis | 27 passed |
| **Sprint 4** | 06 Sep – 12 Sep | Semantic Search & Academic Citations | Multi-format citation generator (APA 7, MLA 9, IEEE, Harvard, Chicago, BibTeX), semantic search filters, project workspaces | 32 passed |
| **Sprint 5** | 13 Sep – 19 Sep | DevOps, CI/CD & Admin Governance | Multi-stage production Dockerfiles, `docker-compose.yml`, GitHub Actions workflow, live admin metrics & token tracker, E2E test | 33 passed |
| **Release** | 20 Sep 2026 | Production Release `v1.0.0-release` | Release tag, merged branches, documentation, and viva defense guide | 100% pass |

---

## 🚀 Key System Features

### 1. Document Ingestion & Section-Aware Chunking
- Upload scientific PDFs via drag-and-drop or multipart REST API.
- Automatically segment papers into canonical sections: Abstract, Introduction, Background, Methodology, Results, Discussion, Conclusion.
- Slice content using sliding windows (default 1200 characters with 150-character semantic overlap).
- Index vectors directly into ChromaDB with cosine similarity search.

### 2. 5-Point Structured AI Summarization
- One-click synthesis into 5 distinct research dimensions:
  1. **Executive Summary**
  2. **Key Empirical Findings**
  3. **Experimental Methodology**
  4. **Documented Limitations**
  5. **Future Scope & Research Opportunities**

### 3. Zero-Hallucination Grounded RAG Chat
- Multi-turn conversation grounded strictly in retrieved vector excerpts.
- Automatic insertion of verifiable citation pills (e.g. `[1] p.2 Introduction`).
- Interactive source inspector drawer displays the exact document excerpt, section name, and page number.

### 4. Side-by-Side Multi-Paper Comparison Matrix
- Select 2 to 5 research papers for instantaneous cross-evaluation.
- Structured matrix contrasting Core Architecture, Empirical Benchmarks, Computational Complexity, and Generalizability.
- AI-synthesized research gap detection highlighting open research opportunities.

### 5. Academic Citation Engine
- Real-time generation of formatted references:
  - **APA 7th Edition**
  - **MLA 9th Edition**
  - **IEEE Style**
  - **Harvard Reference Format**
  - **Chicago Notes & Bibliography**
  - **BibTeX Export**

### 6. Collaborative Project Workspaces & Notes
- Group papers into project workspaces (e.g. "Master's Thesis Literature Review").
- Add highlighted annotations with custom color tags directly to document pages.
- Share research dossiers with supervising professors.

### 7. Turnkey DevOps & Docker Stack
- Complete 4-tier stack orchestrated via `docker-compose.yml`:
  - `postgres` (PostgreSQL 16 with persistent volume and healthcheck)
  - `chromadb` (ChromaDB vector database on port 8001:8000)
  - `backend` (FastAPI production image with non-root security)
  - `frontend` (Next.js standalone production image on port 3000)

---

## 💻 Quickstart Guide

### Option A: Turnkey Docker Deployment (Recommended)
```bash
# Clone the repository
git clone https://github.com/shalcoder/ResearchMate_AI.git
cd ResearchMate_AI

# Build and launch all 4 services
docker compose up --build -d

# Check service health
docker compose ps
```
- **Web Application**: `http://localhost:3000`
- **FastAPI Documentation**: `http://localhost:8000/docs`
- **ChromaDB Vector Store**: `http://localhost:8001`
- **PostgreSQL Database**: `localhost:5432`

---

### Option B: Local Development Setup

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Testing

Execute the comprehensive 33-test suite covering all sprint deliverables:
```bash
# From workspace root
cmd.exe /c "set PYTHONPATH=backend && python -m pytest backend/tests -v"
```

Test breakdown:
- `test_registration.py`: Registration validation, role checks, duplicate email prevention (5 tests)
- `test_login_logout.py`: JWT generation, password verification, token decoding, session expiry (6 tests)
- `test_rbac.py`: Role-based access matrices for Student, Researcher, Professor, Admin (5 tests)
- `test_papers.py`: PDF extraction, sliding-window chunker, ChromaDB collection index, summaries (7 tests)
- `test_rag_compare.py`: Grounded RAG citations, multi-paper comparison matrix, research gaps (4 tests)
- `test_search_projects.py`: Semantic search, APA/MLA/IEEE/BibTeX citation generator, notes, workspaces (5 tests)
- `test_system_integration.py`: End-to-end full lifecycle integration journey across all 5 sprints (1 test)

---

## 📚 Documentation Deliverables
- [Sprint 1 Completion Report](docs/sprint-1-completion-report.md)
- [Sprint 1 Retrospective Report](docs/sprint-1-retrospective-report.md)
- [Sprint 2 Completion Report](docs/sprint-2-completion-report.md)
- [Sprint 2 Retrospective Report](docs/sprint-2-retrospective-report.md)
- [Sprint 3 Completion Report](docs/sprint-3-completion-report.md)
- [Sprint 3 Retrospective Report](docs/sprint-3-retrospective-report.md)
- [Sprint 4 Completion Report](docs/sprint-4-completion-report.md)
- [Sprint 4 Retrospective Report](docs/sprint-4-retrospective-report.md)
- [Sprint 5 Completion Report](docs/sprint-5-completion-report.md)
- [Sprint 5 Retrospective Report](docs/sprint-5-retrospective-report.md)
- [Viva Presentation & Defense Guide](docs/viva-presentation-guide.md)

---

## 📄 License
MIT License — Copyright (c) 2026 ResearchMate AI Team.
