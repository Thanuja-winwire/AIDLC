import { AlertTriangle, ClipboardList, DollarSign, Package, TrendingUp, Warehouse } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { errorMessage, money } from "../api/client";
import { useDashboard } from "../api/hooks";
import { Card, ErrorState, PageHeader } from "../components/ui";

function Stat({ to, label, value, icon: Icon, tone, sub }: { to: string; label: string; value: ReactNode; icon: ComponentType<{ className?: string }>; tone: string; sub?: string }) {
  return (
    <Link to={to} className="group block focus:outline-none">
      <Card className="p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-brand-500">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></div>
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A snapshot of stock, orders and sales" />
      {error ? <Card><ErrorState message={errorMessage(error)} onRetry={() => refetch()} /></Card> : isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-slate-100" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Stat to="/products" label="Active products" value={data.total_products.toLocaleString()} icon={Package} tone="bg-brand-50 text-brand-600" />
          <Stat to="/stock" label="Units in stock" value={data.total_units.toLocaleString()} icon={Warehouse} tone="bg-sky-50 text-sky-600" sub={`Stock value ${money(data.stock_value)}`} />
          <Stat to="/alerts" label="Low-stock items" value={data.low_stock_count} icon={AlertTriangle} tone={data.low_stock_count > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"} sub={data.low_stock_count > 0 ? "Needs reordering" : "All products healthy"} />
          <Stat to="/purchase-orders" label="Open purchase orders" value={data.open_purchase_orders} icon={ClipboardList} tone="bg-amber-50 text-amber-600" />
          <Stat to="/sales" label="Sales today" value={money(data.sales_today)} icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
          <Stat to="/reports" label="Sales, last 30 days" value={money(data.sales_last_30_days)} icon={TrendingUp} tone="bg-brand-50 text-brand-600" />
        </div>
      )}
    </>
  );
}
