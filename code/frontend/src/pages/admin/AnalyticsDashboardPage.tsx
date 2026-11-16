import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState, EmptyState, PageHeader, Skeleton, StatCard } from "../../components/ui";
import { api, toApiError } from "../../lib/api";
import { formatMoney, formatPercent } from "../../lib/format";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function AnalyticsDashboardPage() {
  const [days, setDays] = useState(30);
  const range = useMemo(() => ({ from: isoDaysAgo(days), to: new Date().toISOString() }), [days]);

  const summary = useQuery({ queryKey: ["admin-summary", days], queryFn: () => api.adminSummary(range) });
  const revenue = useQuery({
    queryKey: ["admin-revenue", days],
    queryFn: () => api.adminRevenue({ ...range, group_by: days > 90 ? "month" : "day" }),
  });
  const plans = useQuery({ queryKey: ["admin-plan-breakdown"], queryFn: api.adminPlanBreakdown });

  const revenueData = (revenue.data ?? []).map((r) => ({ period: r.period, revenue: Number(r.revenue) }));
  const planData = (plans.data ?? []).filter((p) => p.subscribers > 0);

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Revenue and subscription health"
        action={
          <select data-testid="analytics-range" className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 12 months</option>
          </select>
        }
      />

      {summary.isLoading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28" />)}</div>}
      {summary.isError && <ErrorState message={toApiError(summary.error).message} onRetry={() => summary.refetch()} />}
      {summary.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard testid="stat-mrr" label="MRR" value={formatMoney(summary.data.mrr)} hint="Active subscriptions, yearly ÷ 12" />
          <StatCard testid="stat-active" label="Active subscriptions" value={String(summary.data.active_subscriptions)} />
          <StatCard testid="stat-new" label="New subscriptions" value={String(summary.data.new_subscriptions)} hint="In selected period" />
          <StatCard testid="stat-cancellations" label="Cancellations" value={String(summary.data.cancellations)} hint="In selected period" />
          <StatCard testid="stat-churn" label="Churn rate" value={formatPercent(summary.data.churn_rate)} hint="Cancellations ÷ active at start" />
          <StatCard testid="stat-failed" label="Failed payments" value={String(summary.data.failed_payments)} hint="In selected period" />
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2" data-testid="revenue-chart">
          <h3 className="mb-4">Revenue</h3>
          {revenue.isLoading && <Skeleton className="h-64" />}
          {revenue.isError && <ErrorState message={toApiError(revenue.error).message} onRetry={() => revenue.refetch()} />}
          {revenue.data && revenueData.length === 0 && <EmptyState title="No revenue in this period" message="Paid invoices will appear here." />}
          {revenueData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5" data-testid="plan-chart">
          <h3 className="mb-4">Subscribers by plan</h3>
          {plans.isLoading && <Skeleton className="h-64" />}
          {plans.isError && <ErrorState message={toApiError(plans.error).message} onRetry={() => plans.refetch()} />}
          {plans.data && planData.length === 0 && <EmptyState title="No subscribers yet" />}
          {planData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} dataKey="subscribers" nameKey="plan_name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {planData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {planData.map((p, i) => (
              <li key={p.plan_id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {p.plan_name} · {p.subscribers}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
