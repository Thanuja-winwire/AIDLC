import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RoleGate";
import { ToastProvider } from "./components/ui";
import AdjustmentsPage from "./pages/AdjustmentsPage";
import AlertsPage from "./pages/AlertsPage";
import DashboardPage from "./pages/DashboardPage";
import LocationsPage from "./pages/LocationsPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import PurchaseOrderDetailPage from "./pages/PurchaseOrderDetailPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import ReportsPage from "./pages/ReportsPage";
import SalesPage from "./pages/SalesPage";
import StockPage from "./pages/StockPage";
import SuppliersPage from "./pages/SuppliersPage";
import TransfersPage from "./pages/TransfersPage";
import UsersPage from "./pages/UsersPage";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="stock" element={<StockPage />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                <Route path="transfers" element={<TransfersPage />} />
                <Route path="adjustments" element={<AdjustmentsPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="users" element={<RequireAuth admin><UsersPage /></RequireAuth>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
