import { useState } from "react";
import { Alert, Box, Button, Card, Container, Grid, Snackbar, Typography } from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import { api } from "../api/client";
import type { Student, StudentInput } from "../types";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useStudents } from "../hooks/useStudents";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import CourseBreakdown from "../components/CourseBreakdown";
import SearchBar from "../components/SearchBar";
import StudentTable from "../components/StudentTable";
import StudentFormModal from "../components/StudentFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

type ModalState = { mode: "create" | "edit"; student?: Student } | null;

export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const q = useDebouncedValue(searchInput, 300);
  const list = useStudents(q);
  const dash = useDashboard();

  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const refreshAll = () => {
    void list.refetch();
    void dash.refetch();
  };

  const handleSubmit = async (values: StudentInput) => {
    if (modal?.mode === "edit" && modal.student) {
      await api.updateStudent(modal.student.id, values);
      setToast({ message: "Student updated", severity: "success" });
    } else {
      await api.createStudent(values);
      setToast({ message: "Student added", severity: "success" });
    }
    setModal(null);
    refreshAll();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.id);
      setToast({ message: "Student deleted", severity: "success" });
      setDeleteTarget(null);
      refreshAll();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Delete failed", severity: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SchoolOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4">Student Management</Typography>
            <Typography color="text.secondary">Manage enrollments and track students by course</Typography>
          </Box>
        </Box>
        <Button variant="contained" size="large" startIcon={<PersonAddAltIcon />} onClick={() => setModal({ mode: "create" })}>
          Add student
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "grid", gap: 3, height: "100%" }}>
            <StatCard
              label="Total students"
              value={dash.summary?.total_students ?? 0}
              icon={<PeopleAltOutlinedIcon />}
              loading={dash.loading && !dash.summary}
            />
            <StatCard
              label="Courses"
              value={dash.summary?.courses.length ?? 0}
              icon={<AutoStoriesOutlinedIcon />}
              loading={dash.loading && !dash.summary}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <CourseBreakdown courses={dash.summary?.courses ?? []} loading={dash.loading && !dash.summary} error={dash.error} />
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h5">Students</Typography>
          <Box sx={{ width: { xs: "100%", sm: 380 } }}>
            <SearchBar value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput("")} />
          </Box>
        </Box>
        <StudentTable
          students={list.students}
          loading={list.loading}
          error={list.error}
          query={q}
          onEdit={(s) => setModal({ mode: "edit", student: s })}
          onDelete={setDeleteTarget}
          onRetry={() => void list.refetch()}
          onAdd={() => setModal({ mode: "create" })}
          onClearSearch={() => setSearchInput("")}
        />
      </Card>

      <StudentFormModal
        open={modal !== null}
        mode={modal?.mode ?? "create"}
        student={modal?.student}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete student?"
        message={`This will permanently remove ${deleteTarget?.name ?? "this student"}. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar
        open={toast !== null}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Container>
  );
}
