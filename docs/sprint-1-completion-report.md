# Sprint 1 Completion Report — Authentication & Access Management

**Project:** ResearchMate AI  
**Sprint Window:** 21 August 2026 – 24 August 2026  
**Total Committed Story Points:** 39 SP  
**Status:** 100% Completed & Verified  

---

## 1. Task Delivery Breakdown

| Task ID | Task Description | Owner | Branch | Story Points | Status |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **S1.1-T1** | Build Registration UI in Next.js | **Steve** | `Steve-Isaiah` | 5 SP | ✅ Complete |
| **S1.1-T2** | Build User Registration API (FastAPI) | **Vishal** | `Vishal` | 5 SP | ✅ Complete |
| **S1.1-T3** | Test User Registration Suite | **Yash** | `yashwanth` | 3 SP | ✅ Complete |
| **S1.2-T1** | Build Login UI in Next.js | **Steve** | `Steve-Isaiah` | 5 SP | ✅ Complete |
| **S1.2-T2** | Build JWT Auth & Login/Logout API | **Vishal** | `Vishal` | 5 SP | ✅ Complete |
| **S1.2-T3** | Test Login and Logout Suite | **Yash** | `yashwanth` | 3 SP | ✅ Complete |
| **S1.3-T1** | Build Role-Based Dashboard UI | **Steve** | `Steve-Isaiah` | 5 SP | ✅ Complete |
| **S1.3-T2** | Build RBAC Middleware & Auth APIs | **Vishal** | `Vishal` | 5 SP | ✅ Complete |
| **S1.3-T3** | Test RBAC and Protected Routes | **Yash** | `yashwanth` | 3 SP | ✅ Complete |

---

## 2. Team Contributions

- **Steve (`Steve-Isaiah`)**:
  - Full Next.js frontend authentication pages (`/register`, `/login`, `/`).
  - Form validation with error states and password strength checkers.
  - Role-specific dashboard shells for Student, Researcher, Professor, and Admin.
  - Reusable layout components (`Header`, `Sidebar`, `DashboardLayout`, `LoadingState`, `UnauthorizedState`).

- **Vishal (`Vishal`)**:
  - Modular FastAPI application architecture with Pydantic settings.
  - PostgreSQL User ORM models with `UserRole` enum.
  - Password hashing with PassLib / Bcrypt and JWT token generation.
  - Role-Based Access Control (RBAC) dependency injection (`require_role`, `require_admin`, `require_professor`).
  - Protected User, Admin Governance, and Professor Advisory endpoints.

- **Yash (`yashwanth`)**:
  - Comprehensive PyTest test suite with in-memory SQLite database fixtures.
  - Test coverage for registration, duplicate emails, password validation.
  - Test coverage for authentication, token expiration, and profile retrieval.
  - RBAC permission matrix testing ensuring 403 Forbidden enforcement on restricted endpoints.
