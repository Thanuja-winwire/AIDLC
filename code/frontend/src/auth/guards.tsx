import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spinner } from "../components/ui";
import type { Role } from "../types";

export const homeFor = (role: Role) => (role === "admin" ? "/admin" : "/plans");

/** Requires a signed-in user; optionally a specific role. */
export function RequireAuth({ role }: { role?: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

/** Login/register pages bounce signed-in users to their home. */
export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (user) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
