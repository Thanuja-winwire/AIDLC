import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type { FieldErrors, Student, StudentField, StudentInput } from "../types";
import { ApiError } from "../api/client";
import { validateStudent } from "../validation";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  student?: Student;
  onClose: () => void;
  onSubmit: (values: StudentInput) => Promise<void>;
}

const EMPTY: StudentInput = { name: "", email: "", phone: "", course: "", enrollment_date: "" };
const FIELDS: { key: StudentField; label: string; type?: string; autoComplete?: string }[] = [
  { key: "name", label: "Full name", autoComplete: "off" },
  { key: "email", label: "Email", type: "email", autoComplete: "off" },
  { key: "phone", label: "Phone number", type: "tel", autoComplete: "off" },
  { key: "course", label: "Course", autoComplete: "off" },
  { key: "enrollment_date", label: "Enrollment date", type: "date" },
];

export default function StudentFormModal({ open, mode, student, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<StudentInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<StudentField, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      mode === "edit" && student
        ? {
            name: student.name,
            email: student.email,
            phone: student.phone,
            course: student.course,
            enrollment_date: student.enrollment_date,
          }
        : EMPTY
    );
    setErrors({});
    setTouched({});
    setServerError(null);
  }, [open, mode, student]);

  const change = (key: StudentField, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key]) setErrors((prev) => ({ ...prev, [key]: validateStudent(next)[key] }));
  };

  const blur = (key: StudentField) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateStudent(values)[key] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateStudent(values);
    setErrors(found);
    setTouched({ name: true, email: true, phone: true, course: true, enrollment_date: true });
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        course: values.course.trim(),
        enrollment_date: values.enrollment_date,
      });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
      } else {
        setServerError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={submit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>{mode === "edit" ? "Edit student" : "Add student"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2.5, pt: "8px !important" }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          {FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              type={f.type ?? "text"}
              value={values[f.key]}
              onChange={(e) => change(f.key, e.target.value)}
              onBlur={() => blur(f.key)}
              error={Boolean(errors[f.key])}
              helperText={errors[f.key] ?? " "}
              autoComplete={f.autoComplete}
              InputLabelProps={f.type === "date" ? { shrink: true } : undefined}
              required
              fullWidth
              disabled={submitting}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {mode === "edit" ? "Save changes" : "Add student"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
