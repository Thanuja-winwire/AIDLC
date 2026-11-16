"""Uniform error format: {"error": {"code", "message", "details"?}}."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details=None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def bad_request(message: str, code: str = "bad_request", details=None) -> AppError:
    return AppError(400, code, message, details)


def unauthorized(message: str = "Invalid credentials") -> AppError:
    return AppError(401, "unauthorized", message)


def forbidden(message: str = "You do not have access to this resource") -> AppError:
    return AppError(403, "forbidden", message)


def not_found(message: str = "Not found") -> AppError:
    return AppError(404, "not_found", message)


def conflict(message: str, code: str = "conflict") -> AppError:
    return AppError(409, code, message)


def payment_failed(reason: str, details=None) -> AppError:
    return AppError(402, "payment_failed", f"Payment failed: {reason}", details or {"reason": reason})


def _body(code: str, message: str, details=None) -> dict:
    err = {"code": code, "message": message}
    if details is not None:
        err["details"] = details
    return {"error": err}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=_body(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        details = [
            {"field": ".".join(str(p) for p in e["loc"] if p != "body"), "message": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422, content=_body("validation_error", "Request validation failed", details)
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        code = {401: "unauthorized", 403: "forbidden", 404: "not_found", 405: "method_not_allowed"}.get(
            exc.status_code, "http_error"
        )
        return JSONResponse(status_code=exc.status_code, content=_body(code, str(exc.detail)))
