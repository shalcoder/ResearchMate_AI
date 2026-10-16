# ResearchMate AI — Master Viva & Technical Defense Guide

---

## SECTION 1: AI, RAG & NLP (Critical for "Mam" & AI Evaluators)

### Q1. What is RAG and why did you choose it over fine-tuning?
**Answer:**
> *"RAG stands for **Retrieval-Augmented Generation**. Instead of retraining or fine-tuning weights—which is computationally expensive and prone to catastrophic forgetting—RAG dynamically retrieves real, authoritative text chunks from a vector database (ChromaDB) and injects them into the LLM context prompt.*
> *This guarantees zero hallucination, provides exact page citations (`[1]`, `[2]`), and allows users to query freshly uploaded scientific papers immediately without retraining."*

---

### Q2. How does your chunking strategy work? What parameters did you choose?
**Answer:**
> *"We built section-aware sliding-window chunking in `text_chunker.py`:*
> - **Chunk Size:** `1,200 characters` (~200–250 tokens), optimal for encapsulating a complete scientific idea without losing context.
> - **Overlap Window:** `150 characters`, preserving sentence boundaries across chunks so ideas split at the boundary aren't lost.
> - **Section Awareness:** It tracks headers (`Abstract`, `Methodology`, `Results`, `Conclusion`) and tags each chunk with its exact PDF `page_number` and `section_name`."*

---

### Q3. How does the Vector Database and Similarity Search work?
**Answer:**
> *"We use **ChromaDB**. When a PDF is chunked:*
> 1. Each chunk's text is converted into a dense vector embedding using sentence-transformers (384-dimensional dense vectors).
> 2. Chunks are saved with metadata (`paper_id`, `page_number`, `section_name`).
> 3. During chat queries, the user's question is embedded into the same vector space, and ChromaDB computes **Cosine Similarity** to retrieve the Top-K (default $K=4$) most relevant chunks."*
>
> **Formula:**
> $$\text{Cosine Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$$

---

### Q4. How do you prevent hallucinations and ensure verifiable citations?
**Answer:**
> *"We enforce strict system prompt constraints in `gemini_harness.py`:*
> 1. The model is given **only** the retrieved chunks and explicitly instructed: *'Answer strictly using the provided context. If the answer is not present, state that the literature does not provide this information.'*
> 2. Every statement must cite its source using citation pills like `[1]`, `[2]`.
> 3. The frontend maps `[1]` to the metadata card in the right sidebar, showing the exact page number and verbatim excerpt."*

---

### Q5. What happens if the Gemini API rate limit or quota is exceeded?
**Answer:**
> *"We implemented a dual-engine fallback in `summary_service.py` and `gemini_harness.py`:*
> - If Gemini returns HTTP 429 (`RESOURCE_EXHAUSTED`), the backend catches the exception and immediately invokes our **heuristic extraction engine**.
> - It parses the document's structured sections, abstracts, and empirical tables directly from the PyMuPDF document model, ensuring the platform never crashes or returns blank pages."*

---

## SECTION 2: Backend Architecture & FastAPI

### Q6. Why did you choose FastAPI over Flask or Django?
**Answer:**
> *"Three reasons:*
> 1. **Asynchronous Concurrency (ASGI):** Native `async`/`await` support using Uvicorn, which handles heavy I/O tasks like PDF parsing and vector searches without blocking the event loop.
> 2. **Automatic OpenAPI / Swagger Docs:** Generates interactive documentation at `/docs` directly from Python type hints.
> 3. **Pydantic Validation:** Strict request and response schemas that automatically validate and sanitize data."*

---

### Q7. How does Dependency Injection work in your project?
**Answer:**
> *"FastAPI uses `Depends()` for modular, testable middleware. In our codebase:*
> - `db: Session = Depends(get_db)` provides a scoped SQLAlchemy database session that automatically closes after the request completes.
> - `current_user: User = Depends(get_current_user)` extracts the Bearer JWT token from the HTTP Authorization header, verifies the signature, and loads the active user."*

---

### Q8. How is Authentication and Security implemented?
**Answer:**
> - **Passwords:** Salted and hashed using **bcrypt** via Passlib (`pwd_context.hash(password)`). Plaintext passwords are never stored.
> - **Sessions:** Stateless JSON Web Tokens (**JWT**) signed with `HS256` using a secret key and a 60-minute expiration (`exp`).
> - **RBAC (Role-Based Access Control):** Custom dependency decorator `require_roles(UserRole.ADMIN)` checks the token payload. If a Student tries to call an Admin endpoint, FastAPI immediately returns `HTTP 403 Forbidden`."*

---

## SECTION 3: Database & ORM (SQLAlchemy, SQLite, ChromaDB)

### Q9. What is the difference between your relational database and your vector database?
**Answer:**
> - **Relational DB (SQLite in dev, PostgreSQL in prod):** Stores structured entity relationships: User credentials, paper metadata (title, DOI, authors), project notebooks, and user bookmarks.
> - **Vector DB (ChromaDB):** Stores unstructured text representations as high-dimensional mathematical embeddings for approximate nearest-neighbor similarity searches."*

---

### Q10. What is an ORM and what models did you design?
**Answer:**
> *"An Object-Relational Mapper translates Python classes into SQL tables without writing raw SQL queries. We defined 5 core models in SQLAlchemy:*
> 1. **User**: `id`, `email`, `hashed_password`, `role` (Enum), `department`, `institution`.
> 2. **ResearchPaper**: `id`, `title`, `abstract`, `authors` (JSON), `total_pages`, `total_chunks`, `owner_id`.
> 3. **PaperChunk**: `id`, `paper_id` (Foreign Key), `chunk_index`, `section_name`, `page_number`, `token_count`.
> 4. **PaperSummary**: `id`, `paper_id`, `executive_summary`, `key_findings`, `limitations`.
> 5. **Project / ProjectPaper**: Many-to-many relationship grouping papers into research lab notebooks."*

---

### Q11. How do you handle cascade deletions?
**Answer:**
> *"When a paper is deleted in `papers.py`:*
> 1. Its vector chunks are purged from ChromaDB via `vector_store_service.delete_paper_chunks(paper_id)`.
> 2. Associated database records (`PaperChunk` and `PaperSummary`) are deleted to prevent orphaned foreign keys.
> 3. The physical PDF file on disk is unlinked using `os.remove()`."*

---

## SECTION 4: Frontend & Fullstack (Next.js 14, React, TypeScript)

### Q12. Why Next.js 14 App Router instead of basic React (Vite/CRA)?
**Answer:**
> *"Next.js 14 provides:*
> 1. **Hybrid Rendering:** Pre-renders 23 static pages (`SSG`) at build time for near-instant load times, while using client components for interactive chat.
> 2. **Server-Side API Routing & Proxying:** Avoids CORS issues and securely handles backend redirects.
> 3. **TypeScript Integration:** Strict compile-time safety across all component props and API responses."*

---

### Q13. What is `'use client'` and why is it necessary?
**Answer:**
> *"In Next.js 14 App Router, components default to Server Components. Marking a file with `'use client'` signals to Next.js that the component requires client-side browser features such as `useState`, `useEffect`, event listeners (`onClick`), or browser APIs (`localStorage`)."*

---

### Q14. What is `package.json` and what is the difference between `dependencies` and `devDependencies`?
**Answer:**
> - `package.json` is the project manifest declaring metadata, scripts (`dev`, `build`, `start`, `lint`), and external packages.
> - **dependencies:** Libraries required at runtime in production (e.g., `react`, `next`, `lucide-react`, `axios`, `clsx`).
> - **devDependencies:** Tools needed only during local development and build time (e.g., `typescript`, `tailwindcss`, `@types/react`, `postcss`)."*

---

### Q15. Why did `useSearchParams()` require a `<Suspense>` boundary in Next.js?
**Answer:**
> *"Because Next.js pre-renders static HTML at build time (`next build`). Since query parameters (like `?role=researcher`) are only known at runtime on the client's browser, Next.js requires wrapping the component in `<React.Suspense fallback={...}>` to prevent client-side hydration mismatch bailouts."*

---

## SECTION 5: Testing (Pytest & E2E)

### Q16. How did you test your application?
**Answer:**
> *"We implemented a 33-test automated test suite using **Pytest** with `pytest-asyncio`:*
> 1. **Auth & RBAC Tests (`test_rbac.py`, `test_login_logout.py`):** Verified password verification, duplicate email rejections, valid JWT issuance, and strict 403 Forbidden enforcement.
> 2. **PDF Ingestion Tests (`test_papers.py`):** Verified parsing of real academic papers and token chunking.
> 3. **RAG & Comparison Tests (`test_rag_compare.py`):** Verified vector retrieval precision and side-by-side paper comparisons.
> 4. **Integration Tests (`test_system_integration.py`):** End-to-end multi-step flow simulating real user sessions.
> *All 33 tests execute and pass in ~31 seconds using `python -m pytest`."*

---

## SECTION 6: Git & Version Control

### Q17. What Git commands did you use in this project?
| Git Command | What It Does / When You Use It |
| :--- | :--- |
| `git status` | Inspect modified, staged, or untracked files. |
| `git add <files>` | Stage changes for the next commit. |
| `git commit -m "msg"` | Save a snapshot of staged changes with a descriptive message. |
| `git push origin main` | Upload local commits to the remote GitHub repository. |
| `git checkout -b <branch>` | Create and switch to a new feature branch (e.g. `Vishal`). |
| `git merge <branch>` | Combine changes from one branch into another (e.g. merging `main` into `Vishal`). |
| `git pull origin main` | Fetch and merge remote changes into the current local branch. |

---

### Q18. How do you resolve a Git merge conflict?
**Answer:**
> *"When Git cannot automatically resolve overlapping edits between branches, it places conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in the affected files. We open the file, decide which code to keep, delete the conflict markers, run `git add <file>`, and complete the merge with `git commit`."*

---

## SECTION 7: Docker & Containerization

### Q19. What is Docker and why is it used?
**Answer:**
> *"Docker packages an application and all its dependencies (Python version, C libraries like PyMuPDF, ChromaDB drivers) into a portable, isolated container image. This eliminates the 'it works on my machine' bug and ensures identical execution across development, CI/CD, and production."*

---

### Q20. Explain your backend Dockerfile line by line:
```dockerfile
FROM python:3.10-slim              # 1. Minimal lightweight Linux base image
WORKDIR /app                       # 2. Set container working directory
COPY requirements.txt .            # 3. Copy dependencies first for Docker layer caching
RUN pip install --no-cache-dir -r requirements.txt  # 4. Install dependencies
COPY . .                           # 5. Copy application source code
EXPOSE 8000                        # 6. Document application listening port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] # 7. Container start command
```

---

### Q21. Essential Docker commands to know:
| Docker Command | Description |
| :--- | :--- |
| `docker build -t researchmate-api .` | Builds a Docker image tagged `researchmate-api` from the Dockerfile. |
| `docker run -d -p 8000:8000 --env-file .env researchmate-api` | Runs container in background (`-d`) mapping port 8000 to host. |
| `docker ps` | Lists all currently running containers. |
| `docker logs -f <container_id>` | Streams live stdout/stderr logs from a container. |
| `docker stop <container_id>` | Gracefully terminates a running container. |

---

## SECTION 8: Production Deployment (Vercel & Render)

### Q22. How is your production architecture deployed?
**Answer:**
> - **Frontend (Vercel):** Deployed on Vercel's global Edge CDN, serving pre-rendered Next.js static pages with zero server latency.
> - **Backend (Render):** Deployed as a web service running FastAPI via Uvicorn.
> - **Networking & CORS:** The backend uses `CORSMiddleware` explicitly whitelisting the Vercel domain (`https://research-mate-ai-ten.vercel.app`) with credentials, headers, and preflight (`OPTIONS`) handling."*

---

### Q23. What is a "Cold Start" on free cloud hosting and how did you diagnose it?
**Answer:**
> *"Free cloud instances (like Render) spin down container instances after 15 minutes of inactivity to conserve resources. When a new user hits the site, the container takes 30–50 seconds to boot up.*
> *If a browser request times out during this boot window, Chrome reports a CORS / network error. Once awake, the container returns normal HTTP 200 responses. We can eliminate cold starts by setting up a periodic ping worker to `/health` or deploying on a persistent tier."*
