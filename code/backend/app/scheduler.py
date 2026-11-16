"""Background renewal runner (APScheduler)."""
import logging

from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.database import SessionLocal
from app.gateway import SimulatedGateway
from app.models import utcnow
from app.services import subscription_service

log = logging.getLogger("scheduler")


def run_renewals() -> int:
    """One scheduler pass. Safe to call repeatedly (idempotent)."""
    with SessionLocal() as db:
        count = subscription_service.process_due(db, SimulatedGateway(), utcnow())
    if count:
        log.info("Processed %s due subscription(s)", count)
    return count


def start_scheduler() -> BackgroundScheduler | None:
    if not settings.scheduler_enabled:
        return None
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        run_renewals, "interval", minutes=settings.scheduler_interval_minutes, id="renewals",
        max_instances=1, coalesce=True,
    )
    scheduler.start()
    return scheduler
