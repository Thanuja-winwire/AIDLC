import type { DashboardSummary, FieldErrors, Student, StudentInput } from "../types";

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    if (res.status === 422 && body?.errors) {
      throw new ApiError(422, "Please fix the highlighted fields.", body.errors as FieldErrors);
    }
    if (res.status === 409) {
      const message = body?.message ?? "A student with this email already exists";
      throw new ApiError(409, message, { email: message });
    }
    if (res.status === 404) throw new ApiError(404, body?.detail ?? "Student not found");
    throw new ApiError(res.status, "Something went wrong. Please try again.");
  }
  return body as T;
}

export const api = {
  listStudents: (q: string) =>
    request<Student[]>(`/api/students${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`),
  createStudent: (data: StudentInput) =>
    request<Student>("/api/students", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id: number, data: StudentInput) =>
    request<Student>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id: number) => request<void>(`/api/students/${id}`, { method: "DELETE" }),
  getDashboard: () => request<DashboardSummary>("/api/dashboard"),
};
