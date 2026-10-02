import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup safely
    try:
        Base.metadata.create_all(bind=engine)
        print("Database schema successfully verified/initialized.")
        if not os.environ.get("PYTEST_CURRENT_TEST") and settings.ENVIRONMENT.lower() not in ("test", "testing"):
            try:
                from seed_data import seed
                seed()
            except Exception as se:
                print(f"Notice: Auto-seeding deferred or encountered: {se}")
    except Exception as e:
        print(f"Notice: Database initialization deferred or encountered: {e}")
    yield


is_prod = settings.ENVIRONMENT.lower() == "production" and not settings.DEBUG

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Persistent AI-enabled academic research workspace and literature-review platform REST API.",
    version="1.0.0",
    openapi_url=None if is_prod else f"{settings.API_V1_STR}/openapi.json",
    docs_url=None if is_prod else f"{settings.API_V1_STR}/docs",
    redoc_url=None if is_prod else f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
raw_cors = settings.BACKEND_CORS_ORIGINS
if isinstance(raw_cors, str):
    raw_cors = [i.strip() for i in raw_cors.split(",") if i.strip()]
origins = [str(origin).rstrip("/") for origin in (raw_cors or [])]
is_wildcard = "*" in origins

if is_wildcard:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    exact_origins = [o for o in origins if "*" not in o]
    for local_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        if local_origin not in exact_origins:
            exact_origins.append(local_origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=exact_origins,
        allow_origin_regex=r"^https://([a-zA-Z0-9_-]+\.)*(vercel\.app|github\.io)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Middleware to normalize repeated slashes (e.g. //auth/register -> /auth/register)
@app.middleware("http")
async def normalize_path_slashes(request, call_next):
    raw_path = request.scope.get("path", "")
    if "//" in raw_path:
        import re
        request.scope["path"] = re.sub(r"/+", "/", raw_path)
    return await call_next(request)


# Include API router with /api/v1 prefix and root fallback
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
