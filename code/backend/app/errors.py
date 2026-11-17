class StudentNotFoundError(Exception):
    """Raised when a student id does not exist."""


class DuplicateEmailError(Exception):
    """Raised when another student already uses the email (case-insensitive)."""
