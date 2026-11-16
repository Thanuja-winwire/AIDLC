import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3, CreditCard, FileText, Layers, LogOut, Receipt, Repeat, Users, Wallet,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const customerNav = [
  { to: "/plans", label: "Plans", icon: Layers },
  { to: "/subscription", label: "My subscription", icon: Repeat },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/payments", label: "Payment history", icon: Receipt },
  { to: "/payment-method", label: "Payment method", icon: CreditCard },
];
const adminNav = [
  { to: "/admin", label: "Analytics", icon: BarChart3, end: true },
  { to: "/admin/plans", label: "Plans", icon: Layers },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/billing", label: "Billing", icon: Wallet },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = user?.role === "admin" ? adminNav : customerNav;

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4">
          <div className="rounded-lg bg-brand-600 p-1.5"><Repeat className="h-5 w-5 text-white" /></div>
          <span className="text-base font-semibold">Subscriptions</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Main">
          {nav.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to} to={to} end={"end" in rest ? rest.end : false}
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-slate-200 p-4 md:absolute md:inset-x-0 md:bottom-0 md:block">
          <p className="truncate text-sm font-medium" data-testid="shell-user-name">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button data-testid="shell-logout" className="btn-secondary mt-3 w-full" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 md:hidden">
          <span className="truncate text-xs text-slate-500">{user?.email}</span>
          <button className="btn-secondary px-3 py-1" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="flex-1 md:ml-60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><Outlet /></div>
      </main>
    </div>
  );
}
