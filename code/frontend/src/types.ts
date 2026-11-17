export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  course: string;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudentInput {
  name: string;
  email: string;
  phone: string;
  course: string;
  enrollment_date: string;
}

export type StudentField = keyof StudentInput;
export type FieldErrors = Partial<Record<StudentField, string>>;

export interface CourseCount {
  course: string;
  count: number;
}

export interface DashboardSummary {
  total_students: number;
  courses: CourseCount[];
}
