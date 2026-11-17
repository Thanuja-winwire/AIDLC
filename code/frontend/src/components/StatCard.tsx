import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: number | string;
  icon: ReactNode;
  loading: boolean;
}

export default function StatCard({ label, value, icon, loading }: Props) {
  return (
    <Card sx={{ height: "100%", transition: "box-shadow .2s", "&:hover": { boxShadow: "0 4px 12px rgba(16,24,40,0.1)" } }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2.5, p: 3 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(79,70,229,0.1)",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2">{label}</Typography>
          {loading ? <Skeleton width={60} height={40} /> : <Typography variant="h4">{value}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}
