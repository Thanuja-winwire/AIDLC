from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import init_db
from .errors import DuplicateEmailError, StudentNotFoundError
from .routers import dashboard, students


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Student Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router)
app.include_router(dashboard.router)


@app.exception_handler(StudentNotFoundError)
async def _not_found(_: Request, __: StudentNotFoundError):
    return JSONResponse(status_code=404, content={"detail": "Student not found"})


@app.exception_handler(DuplicateEmailError)
async def _duplicate(_: Request, __: DuplicateEmailError):
    return JSONResponse(
        status_code=409,
        content={"field": "email", "message": "A student with this email already exists"},
    )


@app.exception_handler(RequestValidationError)
async def _validation(_: Request, exc: RequestValidationError):
    errors: dict[str, str] = {}
    for err in exc.errors():
        loc = [p for p in err["loc"] if p != "body"]
        field = str(loc[0]) if loc else "body"
        msg = err["msg"].removeprefix("Value error, ")
        errors.setdefault(field, msg)
    return JSONResponse(status_code=422, content={"errors": errors})


@app.get("/api/health")
def health():
    return {"status": "ok"}
