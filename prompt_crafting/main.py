"""FastAPI application entrypoint.

Configures the app, registers routers, and sets up middleware
for the prompt crafting backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from prompt_crafting.api.routes import analytics, executions, prompts, security

app = FastAPI(
    title="Prompt Crafting API",
    description=(
        "Security-first prompt engineering platform for crafting, "
        "testing, and analyzing LLM prompts."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules.
app.include_router(prompts.router, prefix="/api/v1")
app.include_router(executions.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(security.router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Dictionary with status indicator.
    """
    return {"status": "ok"}
