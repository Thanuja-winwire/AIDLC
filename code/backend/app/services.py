from collections import Counter

from .errors import DuplicateEmailError, StudentNotFoundError
from .models import Student
from .repository import StudentRepository
from .schemas import CourseCount, DashboardOut, StudentCreate, StudentUpdate


class StudentService:
    def __init__(self, repo: StudentRepository):
        self.repo = repo

    def list_students(self, q: str | None = None) -> list[Student]:
        return self.repo.list(q)

    def get_student(self, student_id: int) -> Student:
        student = self.repo.get(student_id)
        if student is None:
            raise StudentNotFoundError()
        return student

    def create_student(self, data: StudentCreate) -> Student:
        if self.repo.get_by_email(data.email):
            raise DuplicateEmailError()
        return self.repo.add(Student(**data.model_dump()))

    def update_student(self, student_id: int, data: StudentUpdate) -> Student:
        student = self.get_student(student_id)
        if self.repo.get_by_email(data.email, exclude_id=student_id):
            raise DuplicateEmailError()
        return self.repo.update(student, data.model_dump())

    def delete_student(self, student_id: int) -> None:
        self.repo.delete(self.get_student(student_id))


class DashboardService:
    def __init__(self, repo: StudentRepository):
        self.repo = repo

    def summary(self) -> DashboardOut:
        groups: dict[str, Counter] = {}
        for course in self.repo.courses_in_creation_order():
            key = course.strip().lower()
            groups.setdefault(key, Counter())[course.strip()] += 1
        courses = []
        for spellings in groups.values():
            display = spellings.most_common(1)[0][0]  # ties: earliest seen wins
            courses.append(CourseCount(course=display, count=sum(spellings.values())))
        courses.sort(key=lambda c: (-c.count, c.course.lower()))
        return DashboardOut(total_students=self.repo.count(), courses=courses)
