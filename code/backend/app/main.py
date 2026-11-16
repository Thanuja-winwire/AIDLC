from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_error_handlers
from app.routers import admin, auth, billing, plans, subscriptions
from app.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler = start_scheduler()
    yield
    if scheduler:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Subscription Management API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_error_handlers(app)

for r in (auth.router, plans.router, subscriptions.router, billing.router, admin.router):
    app.include_router(r)


@app.get("/health")
def health():
    return {"status": "ok"}
