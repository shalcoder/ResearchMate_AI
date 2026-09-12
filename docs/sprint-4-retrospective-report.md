# Sprint 4 Retrospective Report

**Date:** 12 September 2026  
**Project:** ResearchMate AI  
**Sprint Focus:** Semantic Repository Search, Multi-Style Academic Citations, Notes/Highlights & Workspaces  
**Participants:**
- **Vishal M** (Backend Engineer & DevOps)
- **Steve Isaiah Alexander** (AI, Vector Embeddings & Frontend)
- **Yashwanth Marimuthu** (QA Lead & Scrum Master)

---

## 1. What Went Well During the Sprint
1. **Academic Citation Precision:** Implementing exact parsing for APA 7th, MLA 9th, IEEE, Harvard, Chicago, and BibTeX solved one of the highest-friction pain points in scholarly writing.
2. **Hybrid Semantic + Keyword Search:** Combining ChromaDB vector cosine queries with SQL ILIKE fallback ensured zero false-negative search results even with rare or domain-specific acronyms.
3. **Workspace Organization:** Researchers can now curate dedicated project workspaces (e.g. "PhD Chapter 2", "Survey Paper 2026") and pin relevant papers and notes.

---

## 2. Challenges Encountered
1. **Author Name Parsing Variations:** Scientific papers feature diverse author formatting (`Last, First`, `First Middle Last`, `F. Last`). Vishal built a robust author parsing tokenizer in `citation_service.py` that handles single-author and multi-author edge cases.
2. **Year and Venue Filter Leakage:** Initial fallback search bypassed venue/year filters; Yashwanth's automated tests immediately caught the discrepancy, which was patched before release.
3. **Multi-paper Pinning Transactions:** Managing many-to-many relationships between papers and workspaces required clear CASCADE definitions to maintain referential integrity.

---

## 3. Areas for Improvement
1. **One-Click BibTeX Copy:** Add a floating quick-copy button in the paper header for instant BibTeX clipboard export.
2. **Collaborative Real-time Notes:** Enable multi-user live cursors on paper notes (potential post-v1 enhancement).
3. **Docker Orchestration & CI/CD:** Containerize the complete application stack for turnkey production deployment (scheduled for Sprint 5).

---

## 4. Scrum Practice Impact on Execution
- **Continuous Test-Driven Feedback:** Catching the search filter edge case via `test_search_projects.py` proved the indispensability of continuous automated QA before merging.
- **Sprint Velocity:** 30 story points completed across all 3 team members.
