import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5", dark: "#4338ca", light: "#818cf8" },
    secondary: { main: "#0ea5e9" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0284c7" },
    background: { default: "#f5f6fa", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
    divider: "#e5e7eb",
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: "1.75rem", letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1.05rem" },
    subtitle2: { fontWeight: 600, color: "#6b7280" },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.85rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        containedPrimary: { boxShadow: "0 1px 2px rgba(79,70,229,0.4)" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: "#6b7280", backgroundColor: "#f9fafb", whiteSpace: "nowrap" },
      },
    },
  },
});

export default theme;
