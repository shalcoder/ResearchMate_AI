# Sprint 3 Retrospective Report

**Date:** 05 September 2026  
**Project:** ResearchMate AI  
**Sprint Focus:** Grounded RAG Query Pipeline, Citation Tracing, Multi-Paper Comparative Matrix & Research Gaps  
**Participants:**
- **Vishal M** (Backend Engineer & DevOps)
- **Steve Isaiah Alexander** (AI, Vector Embeddings & Frontend)
- **Yashwanth Marimuthu** (QA Lead & Scrum Master)

---

## 1. What Went Well During the Sprint
1. **Grounded Source Attribution:** Unlike generic chatbots that hallucinate citations, ResearchMate AI extracts the exact page and section from ChromaDB chunks, attaching clickable tags (`[1] p.2 Introduction`) that open the exact excerpt in a verified source drawer.
2. **Side-by-Side Comparison Matrix:** Researchers can multi-select 2 to 5 papers and immediately generate an aspect-by-aspect matrix table contrasting architecture, benchmark datasets, and complexity tradeoffs.
3. **Smooth Team Hand-offs:** Clear boundaries between AI services (`rag_service.py`, `comparison_service.py`), REST routers (`chat.py`, `compare.py`), and frontend interfaces allowed Steve and Vishal to work concurrently with zero merge conflicts.

---

## 2. Challenges Encountered
1. **Context Window Limitations:** Squeezing multiple lengthy research papers into a single prompt for comparison risked exceeding token limits. Steve solved this by selecting the most representative chunks (Abstract, Intro, Conclusion, and high-relevance methods) per paper.
2. **Citation Consistency:** Ensuring that citation numbers `[1]`, `[2]` in the generated markdown correctly map to the retrieved metadata array required strict index alignment.
3. **Session State Synchronization:** When switching between different research papers in the chat UI, previous message history needed to remain neatly partitioned per session.

---

## 3. Areas for Improvement
1. **Streaming Responses:** Implement server-sent events (SSE) or WebSockets for streaming token generation in real time.
2. **Exportable Comparison Tables:** Allow researchers to download the comparison matrix as Markdown, CSV, or PDF.
3. **Cross-paper Semantic Search:** Implement full global search across the user's entire repository (scheduled for Sprint 4).

---

## 4. Scrum Practice Impact on Execution
- **Pair Programming on Interfaces:** Yashwanth, Steve, and Vishal held a joint design session to finalize the `CitationOut` and `ComparisonMatrixRow` schemas before writing tests.
- **Sprint Goal Adherence:** The team stayed strictly focused on grounding and comparison, pushing advanced search and note-taking into Sprint 4.
- **Sprint Burn-down:** 28 story points completed on time across all 3 branches.
