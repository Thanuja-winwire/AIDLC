from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.router import api_router
from app.core.config import settings
from app.core.db import SessionLocal
from app.core.errors import register_error_handlers
from app.services.users import seed_default_admin


@asynccontextmanager
async def lifespan(_: FastAPI):
    # BR-A6: seed the default Admin on first start only. Skipped quietly if the schema is not migrated yet.
    session = SessionLocal()
    try:
        if seed_default_admin(session):
            session.commit()
    except Exception:  # noqa: BLE001 - e.g. tables missing before `alembic upgrade head`
        session.rollback()
    finally:
        session.close()
    yield


app = FastAPI(title="Inventory Management System", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
register_error_handlers(app)


@app.exception_handler(RequestValidationError)
async def _validation(_, exc: RequestValidationError):
    errors = [{"field": ".".join(str(p) for p in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=422, content={"detail": "Validation failed", "code": "validation_error", "errors": errors}
    )


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router)
