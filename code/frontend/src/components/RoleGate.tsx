import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/** Renders children only for Admins (or `fallback` for Staff). The backend remains authoritative. */
export function RoleGate({ admin = true, children, fallback = null }: { admin?: boolean; children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = useAuth();
  return <>{admin && !isAdmin ? fallback : children}</>;
}

/** Route guard: redirects unauthenticated users to /login and Staff away from admin-only routes. */
export function RequireAuth({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-10 text-center text-sm text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
