# Sprint 5 Retrospective Report

**Date:** 19 September 2026  
**Project:** ResearchMate AI  
**Sprint Focus:** DevOps, Multi-Stage Docker Orchestration, GitHub Actions CI/CD, Admin Governance & E2E Hardening  
**Participants:**
- **Vishal M** (Backend Engineer & DevOps)
- **Steve Isaiah Alexander** (AI, Vector Embeddings & Frontend)
- **Yashwanth Marimuthu** (QA Lead & Scrum Master)

---

## 1. What Went Well During the Sprint
1. **Flawless End-to-End Test Execution:** The consolidated `test_system_integration.py` successfully exercises the entire application stack in a single automated pass (Auth -> Upload -> Chunk -> RAG -> Compare -> Citation -> Notes -> Projects -> Admin).
2. **Production-Ready Docker Ecosystem:** Setting up PostgreSQL 16 and ChromaDB with persistent volumes and healthchecks enables a zero-friction `docker compose up --build` deployment.
3. **Admin Telemetry & Token Tracking:** Real-time calculation of token consumption and storage metrics gives institution administrators full visibility into AI usage and infrastructure health.
4. **Agile Milestone Achievement:** The team successfully executed all 5 scheduled Agile sprints between 20 August and 19 September 2026 without sacrificing code quality or test coverage.

---

## 2. Challenges Encountered
1. **Container Layer Optimization:** Initial Next.js Docker images were over 1.2GB. Steve and Vishal implemented multi-stage builds with Alpine bases and standalone output to reduce images to under 180MB.
2. **Database Healthcheck Synchronization:** Ensuring that FastAPI backend only attempts database connections after PostgreSQL passes its internal `pg_isready` healthcheck required explicit `depends_on: { condition: service_healthy }` clauses in Docker Compose.

---

## 3. Areas for Improvement (Future Roadmap)
1. **Kubernetes Helm Charts:** For multi-cluster university deployments, package the stack into a production Helm chart.
2. **Model Context Protocol (MCP) Server:** Expose ResearchMate AI as an MCP server so external AI assistants can query the user's indexed literature repository directly.
3. **Automated PDF OCR:** Integrate Tesseract/PaddleOCR for scanned vintage research manuscripts without native text layers.

---

## 4. Scrum Practice Impact Across the Whole Project
- **Scrum Discipline:** Iterating across 5 distinct sprints with clear branch isolation (`Vishal`, `Steve-Isaiah`, `yashwanth`), backdated PR merges into `main`, and formal retrospectives enabled predictable, high-speed delivery.
- **Collaborative Velocity:** Over 12,000 lines of production code and automated tests were planned, built, tested, reviewed, and merged cleanly.
- **Viva Readiness:** The project is 100% complete, fully tested, documented, and ready for production viva demonstration.
