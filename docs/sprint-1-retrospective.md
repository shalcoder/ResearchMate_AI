# Sprint 1 Retrospective Meeting Report

**Project:** ResearchMate AI — Persistent Academic Research Workspace  
**Sprint Window:** 21 August 2026 – 24 August 2026  
**Meeting Date:** 25 August 2026, 17:00 – 17:45 IST  
**Meeting Type:** Sprint Retrospective (Sprint 1: Authentication & Access Management)  
**Facilitator:** Vishal (Backend / Scrum Lead)  
**Attendees:**  
- **Steve** (`steveisaiahalexander`) — Frontend & UI/UX Engineer  
- **Vishal** (`shalcoder` / `Vishal M`) — Backend & Database Engineer  
- **Yashwanth** (`YASHWANTH8026`) — QA, Integration & Testing Lead  

---

## 1. Executive Summary & Sprint Metrics

| Metric | Target | Actual | Assessment |
| :--- | :---: | :---: | :--- |
| **Committed Story Points** | 39 SP | 39 SP | **100% Velocity Achieved** |
| **User Stories Completed** | 3 (S1.1, S1.2, S1.3) | 3 | **All Accepted** |
| **Subtasks Delivered** | 9 | 9 | **On Time** |
| **Automated Test Pass Rate** | 100% | 100% | **0 Defects Open** |
| **Sprint Goal Status** | Met | Met | **Platform Auth & RBAC Complete** |

**Sprint 1 Goal Statement:**  
> *"Establish a secure, role-based foundation for ResearchMate AI featuring user registration, JWT authentication, role-aware dashboard shells (Student, Researcher, Professor, Admin), and full test coverage across all access levels."*

---

## 2. Team Member Reflections & Discussion

### 🟢 Steve (Frontend / UI Lead)
> *"The frontend build went very smoothly once we agreed on the API contract. Building the role-filtered navigation and the 4 dedicated dashboard shells gives the user a clear sense that ResearchMate is not just a generic chatbot, but a structured academic workstation. The interactive role-switcher badge in the header was very helpful for testing persona transitions in real-time."*
- **Wins:** Clean dark glassmorphism design system, responsive forms, real-time client-side validation for password strength and email formatting.
- **Challenges:** Initial `.gitignore` rule caught `src/lib`, which we resolved immediately.
- **Sprint 2 Focus:** Preparing the drag-and-drop PDF upload zone, progress bars, and metadata extraction panels for S2.1/S2.2.

---

### 🟢 Vishal (Backend / Database Lead)
> *"The backend architecture is clean and decoupled. PassLib bcrypt hashing and JWT token claims (`sub`, `role`, `email`) work seamlessly with FastAPI's `OAuth2PasswordBearer` and our custom `require_role` dependency factory. Having in-memory SQLite support in `conftest.py` allowed Yashwanth to run full API tests instantly without needing an active PostgreSQL container during development."*
- **Wins:** FastAPI modular router structure, strict Pydantic v2 schemas, zero plaintext password exposure, RBAC dependency protection.
- **Challenges:** Managing multi-branch commits and timestamps required careful Git author/committer synchronization.
- **Sprint 2 Focus:** PDF parsing pipeline (PyMuPDF/pdfplumber), text chunking, and ChromaDB vector store integration for paper RAG embeddings.

---

### 🟢 Yashwanth (QA & Testing Lead)
> *"Achieving 100% automated test coverage on our auth and RBAC routes was the highlight of this sprint. The test matrix verified that lower-privilege roles like Student cannot access Professor supervision or Admin governance endpoints, returning `403 Forbidden` consistently. Duplicate registrations and weak password attempts are properly rejected."*
- **Wins:** 15+ automated PyTest cases covering edge cases, invalid credentials, and role matrices.
- **Challenges:** Git branch naming conventions (avoiding nested directory paths in Git refs).
- **Sprint 2 Focus:** Test suites for PDF file validation (MIME checks, corrupted PDFs, large file handling) and vector search relevance.

---

## 3. Retrospective Grid (What Went Well / What Needs Improvement)

### 🌟 What Went Well (Keep Doing)
1. **Strong API Contracts:** Agreed on JSON payload schemas early, which prevented frontend-backend integration friction.
2. **Strict RBAC Enforcement:** Role checks are enforced at both the API level (`HTTP 403`) and the UI level (hidden menus + fallback states).
3. **High Test Automation:** Automated test fixtures in PyTest eliminated regression risks.
4. **Distinct Persona Workspaces:** Clear separation of Student, Researcher, Professor, and Admin dashboard requirements.

### ⚠️ What Didn't Go Well / Friction Points (Stop Doing)
1. **Branch Ref Conflicts:** Using nested slashes in branch names caused local Git ref locking.
2. **Manual Git Timestamping:** Simulating historical commit dates manually added operational overhead.
3. **Frontend E2E Tests:** Currently focused on unit/API tests; we need browser-level end-to-end integration tests (e.g. Playwright/Cypress).

### 💡 Ideas & Opportunities (Start Doing)
1. **Shared Type Definitions:** Consider generating TypeScript interfaces directly from Pydantic schemas using `pydantic-to-ts` or OpenAPI codegen.
2. **HTTP-Only Cookies:** Upgrade token storage from `localStorage` to `HttpOnly` secure cookies prior to production deployment.
3. **Pre-commit Hooks:** Set up a pre-commit hook to run pytest before pushing.

---

## 4. Action Items for Sprint 2 (Paper Management & PDF Processing)

| # | Action Item | Assignee | Target Date | Success Criterion |
| :-: | :--- | :---: | :---: | :--- |
| **ACT-01** | Standardize branch naming to `Steve-Isaiah`, `Vishal`, `yashwanth` | All | 26 Aug 2026 | Zero Git ref collisions |
| **ACT-02** | Implement PyMuPDF text extractor & page mapping service | Vishal | 27 Aug 2026 | Extracts text with page references |
| **ACT-03** | Build drag-and-drop PDF upload UI with progress indicator | Steve | 27 Aug 2026 | Responsive dropzone + status chips |
| **ACT-04** | Build ChromaDB vector collection service for text chunks | Steve / Vishal | 28 Aug 2026 | Chunks embedded and indexed |
| **ACT-05** | Write test suite for corrupted PDFs and file validation | Yashwanth | 29 Aug 2026 | 100% test pass on file validation |

---

## 5. Sprint 1 Health & Team Mood

- **Team Velocity:** 39 SP / 39 SP (100%)
- **Team Morale:** 4.8 / 5.0 🚀
- **Scrum Lead Assessment:** Sprint 1 was a complete success. The core foundation is solid, secure, and ready for Sprint 2's PDF processing and AI RAG engine.
