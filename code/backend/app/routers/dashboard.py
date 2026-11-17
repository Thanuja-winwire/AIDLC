from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import StudentRepository
from ..schemas import DashboardOut
from ..services import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    return DashboardService(StudentRepository(db)).summary()
