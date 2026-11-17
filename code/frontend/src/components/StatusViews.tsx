import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { ReactNode } from "react";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, py: 6 }}>
      <CircularProgress size={24} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

interface EmptyProps {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyProps) {
  return (
    <Box sx={{ textAlign: "center", py: 7, px: 2 }}>
      <Box sx={{ color: "primary.light", mb: 1 }}>{icon ?? <InboxOutlinedIcon sx={{ fontSize: 48 }} />}</Box>
      <Typography variant="h6">{title}</Typography>
      {message && (
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: action ? 2.5 : 0 }}>
          {message}
        </Typography>
      )}
      {action}
    </Box>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Box
      role="alert"
      sx={{
        textAlign: "center",
        py: 5,
        px: 2,
        m: 2,
        borderRadius: 3,
        bgcolor: "#fef2f2",
        border: "1px solid #fecaca",
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
      <Typography variant="h6" color="error" sx={{ mt: 0.5 }}>
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ mb: onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}
