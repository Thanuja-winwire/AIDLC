import { Navigate, Route, Routes } from "react-router-dom";
import { PublicOnly, RequireAuth, homeFor } from "./auth/guards";
import { useAuth } from "./auth/AuthContext";
import AppShell from "./components/AppShell";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlansPage from "./pages/PlansPage";
import MySubscriptionPage from "./pages/MySubscriptionPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import NotFoundPage from "./pages/NotFoundPage";
import AnalyticsDashboardPage from "./pages/admin/AnalyticsDashboardPage";
import AdminPlansPage from "./pages/admin/AdminPlansPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminBillingPage from "./pages/admin/AdminBillingPage";

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth role="customer" />}>
        <Route element={<AppShell />}>
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/subscription" element={<MySubscriptionPage />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/payments" element={<PaymentHistoryPage />} />
          <Route path="/payment-method" element={<PaymentMethodPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth role="admin" />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AnalyticsDashboardPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/billing" element={<AdminBillingPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
