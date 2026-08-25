# Sprint 1 Retrospective Report
## ResearchMate AI — Persistent Academic Research Workspace

**Sprint Period:** 21 August 2026 – 24 August 2026  
**Document Version:** 1.0 (Final)  
**Sprint Focus:** Foundation, User Authentication & Role-Based Access Control (RBAC)  
**Team Members & Roles:**
- **Steve** (`steveisaiahalexander`) — Frontend & UI/UX Engineer
- **Vishal** (`shalcoder` / `Vishal M`) — Backend, Database & Security Engineer (Scrum Lead)
- **Yashwanth** (`YASHWANTH8026`) — QA, Integration & Testing Lead

---

## 1. Executive Summary & Sprint Metrics

During Sprint 1, the ResearchMate AI team focused on creating the foundational architecture, robust authentication pipelines, role-based authorization rules, and role-specific workspace dashboards for our four core user personas: **Student**, **Researcher**, **Professor**, and **Admin**. 

The sprint was executed across a 4-day timeline with a committed workload of **39 Story Points (SP)** distributed across 3 user stories (S1.1, S1.2, S1.3) comprising 9 specific subtasks. The team achieved a **100% completion rate** with zero open blocking defects.

### Key Sprint Performance Metrics

| Metric | Planned Target | Actual Achieved | Status |
| :--- | :---: | :---: | :---: |
| **Committed Story Points** | 39 SP | 39 SP | **100% Velocity** |
| **User Stories Accepted** | 3 / 3 | 3 / 3 | **100% Success** |
| **Subtasks Completed** | 9 / 9 | 9 / 9 | **On Schedule** |
| **Automated Test Pass Rate** | 100% | 100% (15/15 PyTest Cases) | **Zero Regressions** |
| **Git Branches Maintained** | 3 Feature Branches | `Steve-Isaiah`, `Vishal`, `yashwanth` | **Synchronized** |

---

## 2. What Went Well During the Sprint

1. **Clear Frontend-Backend API Contracts Established Early:**  
   Prior to implementing endpoints, the team aligned on JSON schema definitions for registration, login requests, and JWT payload claims. This prevented interface mismatches between Steve's Next.js components and Vishal's FastAPI endpoints.

2. **Decoupled and Reusable RBAC Architecture:**  
   Role authorization was implemented using FastAPI dependency factories (`require_role`, `require_admin`, `require_professor`), keeping the business logic clean and DRY. On the frontend, a unified `DashboardLayout` handles role-based rendering, unauthorized fallback states (`403 Forbidden`), and dynamic navigation filtering without duplicating page layouts.

3. **High Test-Driven Quality & Automation:**  
   Yashwanth developed a comprehensive test suite utilizing an isolated, in-memory SQLite database fixture. This allowed immediate validation of edge cases (e.g., duplicate user registrations, weak password attempts, expired JWT tokens, and lower-privilege access attempts) with fast execution cycles.

4. **Modern, Persona-Specific UI Delivery:**  
   Instead of building a generic chat view, Steve delivered distinct workspace shells for Students (coursework & paper QA), Researchers (methodology matrices & research gaps), Professors (student supervision & shared collections), and Admins (system governance & analytics).

---

## 3. Challenges & Roadblocks Encountered

1. **Git Configuration & Repository Structure:**  
   - Early in the setup phase, broad `.gitignore` rules (such as matching `lib/`) inadvertently caught frontend source directories (`frontend/src/lib/`). This was quickly identified and refined to preserve application source paths.
   - Initial branch naming conventions involving nested slashes (`yashwanth/registration-ui`) caused Git ref locking when creating the root `yashwanth` branch. The team resolved this by standardizing branch naming across the team.

2. **Local Development vs. Containerized Database Setup:**  
   Running a full PostgreSQL instance locally for every micro-test introduced setup overhead. The backend was adapted to run in-memory SQLite fixtures during automated testing while keeping production PostgreSQL configurations in `app/core/database.py`.

3. **Client-Side Session State vs. Security Best Practices:**  
   The initial Next.js authentication wrapper stored JWT tokens in client-side state/localStorage for rapid prototyping. For upcoming sprints, transitioning to secure HTTP-only cookies was identified as necessary for production deployment.

---

## 4. Areas for Improvement (Continuous Improvement Plan)

1. **Automated End-to-End (E2E) Browser Testing:**  
   While backend integration tests achieved 100% coverage, frontend UI interactions currently rely on manual verification. The team will introduce Cypress or Playwright in Sprint 2 to automate end-to-end user workflows.

2. **Automated Type Generation:**  
   To prevent manual synchronization between Pydantic models (Python) and TypeScript interfaces, an automated schema-generation script (`openapi-typescript`) will be configured.

3. **Pre-Commit Quality Hooks:**  
   Implement pre-commit hooks (using `pre-commit` or husky) to format code (Black, ESLint) and execute pytest suites locally before code is pushed to remote branches.

---

## 5. How Scrum Practices Helped in Planning, Collaboration, and Execution

The adoption of Scrum methodology provided critical structure to this sprint:

1. **Sprint Planning & Task Breakdown:**  
   Deconstructing high-level Epic 1 goals into granular user stories (S1.1, S1.2, S1.3) with assigned owners (Steve for UI, Vishal for Backend, Yashwanth for Testing) gave each team member clear accountability and eliminated ambiguity.

2. **Definition of Done (DoD) Discipline:**  
   The team strictly adhered to the agreed DoD: a task was only considered "Done" when the frontend UI was functional, backend APIs were documented, database migrations were verified, and unit/integration tests passed.

3. **Asynchronous Standups & Blocker Resolution:**  
   Daily communication allowed immediate resolution of blockers, such as fixing the `.gitignore` conflict and adjusting the token claim formats within minutes rather than delaying delivery.

4. **Velocity Tracking & Estimation:**  
   Assigning Story Points (5 SP for core feature tasks, 3 SP for test suites) allowed accurate workload balancing, ensuring equal contribution across the frontend, backend, and QA streams.

---

## 6. Comprehensive Deliverables Breakdown (Sprint 1 Outputs)

### A. Frontend Application (Next.js 14/15 + Tailwind CSS)
- **User Registration Page:** [`app/(auth)/register/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/%28auth%29/register/page.tsx) with client validation (regex email, 8+ character password strength check, password matching) and role selector.
- **User Login Page:** [`app/(auth)/login/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/%28auth%29/login/page.tsx) with session initiation and dashboard redirection.
- **Global Auth & RBAC State:** [`lib/auth-context.tsx`](file:///e:/ResearhMate_AI/frontend/src/lib/auth-context.tsx) providing `useAuth()`, role switching, and `hasRole()` security checks.
- **Role Dashboard Shells:**
  - *Student Dashboard:* [`app/dashboard/student/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/dashboard/student/page.tsx)
  - *Researcher Dashboard:* [`app/dashboard/researcher/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/dashboard/researcher/page.tsx)
  - *Professor Advisory Hub:* [`app/dashboard/professor/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/dashboard/professor/page.tsx)
  - *Admin Governance Portal:* [`app/dashboard/admin/page.tsx`](file:///e:/ResearhMate_AI/frontend/src/app/dashboard/admin/page.tsx)
- **Reusable Layout & Security Components:** Header with live role badge switcher, role-filtered Sidebar, `DashboardLayout`, `LoadingState`, and `UnauthorizedState` (403 fallback).

### B. Backend REST API Service (FastAPI + SQLAlchemy + JWT)
- **Authentication Endpoints:** [`app/api/v1/endpoints/auth.py`](file:///e:/ResearhMate_AI/backend/app/api/v1/endpoints/auth.py) implementing `/register`, `/login`, `/logout`, and `/me`.
- **Security & Cryptography:** [`app/core/security.py`](file:///e:/ResearhMate_AI/backend/app/core/security.py) with bcrypt password hashing and HS256 JWT encoding/decoding.
- **Database Architecture:** [`app/models/user.py`](file:///e:/ResearhMate_AI/backend/app/models/user.py) with PostgreSQL ORM model and `UserRole` enum (`student`, `researcher`, `professor`, `admin`).
- **RBAC Middleware:** [`app/core/dependencies.py`](file:///e:/ResearhMate_AI/backend/app/core/dependencies.py) enforcing role permission checks.
- **Governance & Advisory Endpoints:** [`app/api/v1/endpoints/admin.py`](file:///e:/ResearhMate_AI/backend/app/api/v1/endpoints/admin.py), [`app/api/v1/endpoints/professor.py`](file:///e:/ResearhMate_AI/backend/app/api/v1/endpoints/professor.py), and [`app/api/v1/endpoints/users.py`](file:///e:/ResearhMate_AI/backend/app/api/v1/endpoints/users.py).

### C. Automated QA Test Suite (PyTest)
- **Registration Test Suite:** [`tests/test_registration.py`](file:///e:/ResearhMate_AI/backend/tests/test_registration.py) verifying validation errors, password hashing, and duplicate account rejection.
- **Authentication Test Suite:** [`tests/test_login_logout.py`](file:///e:/ResearhMate_AI/backend/tests/test_login_logout.py) validating token issuance, invalid credentials, and session termination.
- **RBAC Test Suite:** [`tests/test_rbac.py`](file:///e:/ResearhMate_AI/backend/tests/test_rbac.py) verifying permission matrices and 403 Forbidden enforcement on restricted endpoints.

---

## 7. Action Plan & Transition to Sprint 2

| Action Item | Description | Assignee | Target Date |
| :--- | :--- | :---: | :---: |
| **ACT-01** | Standardize feature branching to `Steve-Isaiah`, `Vishal`, and `yashwanth` | All | 26 Aug 2026 |
| **ACT-02** | Implement PyMuPDF text extractor and page mapping pipeline (S2.1) | Vishal | 27 Aug 2026 |
| **ACT-03** | Build drag-and-drop PDF upload UI with upload progress tracking (S2.1) | Steve | 27 Aug 2026 |
| **ACT-04** | Integrate ChromaDB vector collection service for chunk embeddings (S3.2) | Steve / Vishal | 28 Aug 2026 |
| **ACT-05** | Develop automated test suite for PDF validation and corrupted file handling | Yashwanth | 29 Aug 2026 |

---

### Sprint Sign-off & Approvals

- **Frontend Lead:** Steve (`steveisaiahalexander`) — *Approved*
- **Backend & Scrum Lead:** Vishal (`shalcoder` / `Vishal M`) — *Approved*
- **QA & Testing Lead:** Yashwanth (`YASHWANTH8026`) — *Approved*
