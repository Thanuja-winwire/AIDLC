from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import StudentRepository
from ..schemas import StudentCreate, StudentOut, StudentUpdate
from ..services import StudentService

router = APIRouter(prefix="/api/students", tags=["students"])


def get_service(db: Session = Depends(get_db)) -> StudentService:
    return StudentService(StudentRepository(db))


@router.get("", response_model=list[StudentOut])
def list_students(q: str | None = None, service: StudentService = Depends(get_service)):
    return service.list_students(q)


@router.post("", response_model=StudentOut, status_code=201)
def create_student(data: StudentCreate, service: StudentService = Depends(get_service)):
    return service.create_student(data)


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, service: StudentService = Depends(get_service)):
    return service.get_student(student_id)


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentUpdate, service: StudentService = Depends(get_service)):
    return service.update_student(student_id, data)


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, service: StudentService = Depends(get_service)):
    service.delete_student(student_id)
    return Response(status_code=204)
