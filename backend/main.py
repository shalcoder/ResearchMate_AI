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
    except Exception as e:
        print(f"Notice: Database initialization deferred or encountered: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Persistent AI-enabled academic research workspace and literature-review platform REST API.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else []
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

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "api_docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
