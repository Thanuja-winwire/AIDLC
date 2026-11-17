import type { FieldErrors, StudentInput } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 -]+$/;

export function validateStudent(values: StudentInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const course = values.course.trim();

  if (!name) errors.name = "Name is required";
  else if (name.length > 100) errors.name = "Name must be at most 100 characters";

  if (!email) errors.email = "Email is required";
  else if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = "Enter a valid email address";

  if (!phone) errors.phone = "Phone is required";
  else {
    const digits = (phone.match(/[0-9]/g) ?? []).length;
    if (!PHONE_RE.test(phone) || digits < 7 || digits > 15) {
      errors.phone = "Enter a valid phone number (7-15 digits)";
    }
  }

  if (!course) errors.course = "Course is required";
  else if (course.length > 100) errors.course = "Course must be at most 100 characters";

  if (!values.enrollment_date) errors.enrollment_date = "Enrollment date is required";
  else if (Number.isNaN(Date.parse(values.enrollment_date))) errors.enrollment_date = "Enter a valid date";

  return errors;
}
