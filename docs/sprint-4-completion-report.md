# Sprint 4 Completion Report: Semantic Search, Citation Engine & Collaborative Workspaces

**Sprint Duration:** 06 September 2026 – 12 September 2026  
**Status:** Completed & Verified  
**Scrum Master / QA Lead:** Yashwanth Marimuthu (`YASHWANTH8026`)  
**Backend Engineer:** Vishal M (`Vishal`)  
**AI & UI Engineer:** Steve Isaiah Alexander (`Steve-Isaiah`)  

---

## 1. Executive Summary
Sprint 4 expanded **ResearchMate AI** from an individual paper inspection tool into a collaborative scholarly research suite. Deliverables include:
1. **Academic Citations Engine:** Automated generation of rigorous scholarly references adhering strictly to APA 7th, MLA 9th, IEEE, Harvard, Chicago, and BibTeX standards.
2. **Global Semantic & Keyword Search:** Natural language semantic querying across the complete paper chunk repository, with dynamic filtering by publication year, venue, and relevance score meters.
3. **Notes & Document Highlights:** Interactive scholarly annotations tied to specific pages and text highlights.
4. **Collaborative Project Workspaces:** Research dossier collections enabling students and professors to group papers around specific theses or research tracks.

---

## 2. Sprint Backlog Deliverables & Status

| Task ID | Component | Description | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| **S4.1-T1** | Citation Service | Standards-compliant reference formatting for APA, MLA, IEEE, Harvard, Chicago, BibTeX | Vishal M | Done |
| **S4.1-T2** | Search API | Hybrid semantic vector search with keyword fallback and venue/year filtering | Vishal M | Done |
| **S4.1-T3** | Workspaces & Notes Models | Database models (`Project`, `ProjectPaper`, `PaperNote`, `CitationExport`) | Vishal M | Done |
| **S4.2-T1** | Semantic Search UI | Next.js search interface with live query matching and relevance meters | Steve Isaiah | Done |
| **S4.2-T2** | Project Workspaces UI | Project collection manager with paper pinning, unpinning, and note review | Steve Isaiah | Done |
| **S4.3-T1** | Automated Test Suite | Pytest suite (`test_search_projects.py`) covering all citation styles, search, and notes | Yashwanth | Done |
| **S4.3-T2** | Sprint Retrospective | Sprint 4 retrospective analysis and delivery metrics report | Yashwanth | Done |

---

## 3. Engineering Metrics & Testing Verification
- **Total Automated Tests:** 32 tests (27 regression from Sprints 1–3 + 5 new Sprint 4 tests)
- **Test Pass Rate:** 100% (32 passed)
- **Citation Precision:** Validated author initials, journal formatting, issue dates, and DOI links across all 6 supported citation standards.
- **Multi-Tenant Isolation:** Project workspaces and notes are strictly partitioned by user ownership with CASCADE integrity.
