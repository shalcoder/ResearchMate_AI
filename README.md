# ResearchMate AI

> **Persistent Academic Research Workspace & Literature-Review Platform**

ResearchMate AI is a specialized academic research workspace designed for persistent paper management, source-grounded question answering (RAG), side-by-side paper comparison, research-gap identification, automated citation formatting, notes, projects, professor collaboration, and admin governance.

---

## 👥 Core Team Roles
- **Frontend & UI / UX**: Yashwanth (`yashwanth`)
- **AI, RAG & Vector Engine**: Steve (`Steve-Isaiah`)
- **Backend, Database & DevOps**: Vishal (`Vishal`)

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 14/15, React, Tailwind CSS, TypeScript
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, PostgreSQL
- **Vector Store**: ChromaDB
- **LLM / AI Engine**: Google Gemini API (Grounded RAG)
- **Object Storage**: Cloudinary
- **Authentication**: JWT & Role-Based Access Control (RBAC)

---

## 🚀 Sprint 1 Completed Features (21 Aug - 24 Aug 2026)

### S1.1 — User Registration
- Next.js Registration interface with client-side field validation and error banners.
- FastAPI `/api/v1/auth/register` endpoint with bcrypt password hashing and duplicate prevention.
- PyTest validation suite for registration edge cases.

### S1.2 — User Login & Logout
- Next.js Login interface with loading state and dashboard transitions.
- FastAPI `/api/v1/auth/login` and `/api/v1/auth/me` endpoints with JWT tokens.
- PyTest suite for token verification, invalid credentials, and session management.

### S1.3 — Role-Based Access Control (RBAC)
- Role-specific dashboard shells for **Student**, **Researcher**, **Professor**, and **Admin**.
- Role-aware navigation with dynamic sidebar visibility and 403 Access Denied guards.
- FastAPI RBAC dependency injection (`require_role`, `require_admin`, `require_professor`).
- PyTest suite for permission matrix and privilege escalation prevention.

---

## 💻 Local Quickstart

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/api/v1/docs`

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
- Web Application: `http://localhost:3000`

### Running Test Suite
```bash
cd backend
pytest tests/ -v
```
