import {
  AlertTriangle, ArrowLeftRight, BarChart3, Boxes, ClipboardList, LayoutDashboard, LogOut, MapPin, Menu, Package,
  Receipt, ShoppingCart, SlidersHorizontal, Truck, Users, X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAlerts } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { Badge, cx } from "./ui";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/purchase-orders", label: "Purchase orders", icon: ClipboardList },
  { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/adjustments", label: "Adjustments", icon: SlidersHorizontal },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/alerts", label: "Low-stock alerts", icon: AlertTriangle, alerts: true },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/users", label: "Users", icon: Users, admin: true },
];

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: alerts } = useAlerts("total");
  const alertCount = alerts?.length ?? 0;

  const sidebar = (
    <nav className="flex h-full flex-col bg-slate-900 text-slate-300" aria-label="Main navigation">
      <div className="flex items-center gap-2 px-5 py-5 text-white">
        <div className="rounded-lg bg-brand-600 p-1.5"><Receipt className="h-5 w-5" aria-hidden /></div>
        <span className="text-base font-semibold tracking-tight">Inventory</span>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {nav.filter((n) => !n.admin || isAdmin).map(({ to, label, icon: Icon, end, alerts: isAlerts }) => (
          <li key={to}>
            <NavLink
              to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white")}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1">{label}</span>
              {isAlerts && alertCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{alertCount}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="flex h-full">
      <aside className="hidden w-60 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-60 animate-fade-in">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-slate-800">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Badge tone={isAdmin ? "indigo" : "slate"}>{user?.role}</Badge>
            <button onClick={logout} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
