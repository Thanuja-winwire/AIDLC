import { Box, Card, CardContent, LinearProgress, Skeleton, Typography } from "@mui/material";
import type { CourseCount } from "../types";
import { EmptyState, ErrorState } from "./StatusViews";

interface Props {
  courses: CourseCount[];
  loading: boolean;
  error: string | null;
}

export default function CourseBreakdown({ courses, loading, error }: Props) {
  const max = Math.max(1, ...courses.map((c) => c.count));
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Students by course
        </Typography>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} height={36} />)
        ) : courses.length === 0 ? (
          <EmptyState title="No courses yet" message="Add a student to see course counts." />
        ) : (
          <Box sx={{ display: "grid", gap: 2, maxHeight: 220, overflowY: "auto", pr: 1 }}>
            {courses.map((c) => (
              <Box key={c.course}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {c.course}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.count}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(c.count / max) * 100}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#eef2ff" }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
