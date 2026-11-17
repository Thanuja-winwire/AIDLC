import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardPage />
    </ThemeProvider>
  );
}
