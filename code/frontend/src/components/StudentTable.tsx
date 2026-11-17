import {
  Button,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import type { Student } from "../types";
import { EmptyState, ErrorState } from "./StatusViews";

interface Props {
  students: Student[];
  loading: boolean;
  error: string | null;
  query: string;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
  onRetry: () => void;
  onAdd: () => void;
  onClearSearch: () => void;
}

const COLUMNS = ["Name", "Email", "Phone", "Course", "Enrollment date", "Actions"];

export default function StudentTable(p: Props) {
  if (p.error) return <ErrorState message={p.error} onRetry={p.onRetry} />;

  if (!p.loading && p.students.length === 0) {
    return p.query.trim() ? (
      <EmptyState
        icon={<SearchOffIcon sx={{ fontSize: 48 }} />}
        title="No matching students"
        message={`Nothing matches "${p.query.trim()}".`}
        action={
          <Button variant="outlined" onClick={p.onClearSearch}>
            Clear search
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No students yet"
        message="Add your first student to get started."
        action={
          <Button variant="contained" startIcon={<PersonAddAltIcon />} onClick={p.onAdd}>
            Add student
          </Button>
        }
      />
    );
  }

  return (
    <TableContainer>
      <Table size="medium" aria-label="Students">
        <TableHead>
          <TableRow>
            {COLUMNS.map((c) => (
              <TableCell key={c} align={c === "Actions" ? "right" : "left"}>
                {c}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {p.loading
            ? [0, 1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  {COLUMNS.map((c) => (
                    <TableCell key={c}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : p.students.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{s.phone}</TableCell>
                  <TableCell>
                    <Chip label={s.course} size="small" sx={{ bgcolor: "#eef2ff", color: "primary.dark", fontWeight: 500 }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{s.enrollment_date}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Edit">
                      <IconButton aria-label={`Edit ${s.name}`} onClick={() => p.onEdit(s)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton aria-label={`Delete ${s.name}`} color="error" onClick={() => p.onDelete(s)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
