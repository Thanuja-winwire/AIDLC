from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models  # noqa: F401  (register tables)
from app.core.config import settings
from app.core.database import Base, engine
from app.core.errors import DomainError
from app.routers import admin, public


def create_app() -> FastAPI:
    app = FastAPI(title="E-commerce API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.on_event("startup")
    def init_db():
        Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.include_router(public.router, prefix="/api/v1")
    app.include_router(admin.router, prefix="/api/v1")
    return app


app = create_app()
