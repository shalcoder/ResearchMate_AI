# ResearchMate AI - Backend API

FastAPI backend for **ResearchMate AI** (Persistent Academic Research Workspace).

## Features
- **User Authentication & Role Management**: Secure registration with password hashing (`bcrypt`), email & password strength validation, and role assignment (`student`, `researcher`, `professor`, `admin`).
- **SQLAlchemy ORM**: Flexible database persistence supporting SQLite (local dev) and PostgreSQL (production).
- **Pydantic v2**: High-performance request/response data validation and serialization.
- **RESTful Endpoints**:
  - `POST /auth/register` (or `POST /api/v1/auth/register`): User account registration.
  - `GET /health`: Service health check.
  - `GET /docs`: Swagger UI interactive documentation.

## Getting Started

### 1. Setup Environment
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Run Automated Tests
```bash
pytest
```
