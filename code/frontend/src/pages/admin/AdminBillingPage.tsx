import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, PageHeader, Pagination, Skeleton, StatusBadge } from "../../components/ui";
import { api, toApiError } from "../../lib/api";
import { formatDate, formatMoney } from "../../lib/format";

const PAGE_SIZE = 20;
type Tab = "invoices" | "payments";

export default function AdminBillingPage() {
  const [tab, setTab] = useState<Tab>("invoices");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const invoices = useQuery({
    queryKey: ["admin-invoices", status, page], enabled: tab === "invoices",
    queryFn: () => api.adminInvoices({ status: status || undefined, page }),
  });
  const payments = useQuery({
    queryKey: ["admin-payments", status, page], enabled: tab === "payments",
    queryFn: () => api.adminPayments({ status: status || undefined, page }),
  });

  const switchTab = (t: Tab) => { setTab(t); setStatus(""); setPage(1); };
  const q = tab === "invoices" ? invoices : payments;
  const statuses = tab === "invoices" ? ["open", "paid", "failed"] : ["succeeded", "failed"];

  return (
    <div>
      <PageHeader title="Billing" subtitle="All invoices and payments across customers" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {(["invoices", "payments"] as Tab[]).map((t) => (
            <button key={t} data-testid={`billing-tab-${t}`} onClick={() => switchTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${tab === t ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t}
            </button>
          ))}
        </div>
        <select data-testid="billing-status-filter" className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}

        {tab === "invoices" && invoices.data && (invoices.data.items.length === 0
          ? <EmptyState title="No invoices found" />
          : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="admin-invoice-table">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><th className="th">Number</th><th className="th">Customer</th><th className="th">Date</th><th className="th">Status</th><th className="th text-right">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.data.items.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50" data-testid={`admin-invoice-row-${i.id}`}>
                        <td className="td font-medium">{i.number ?? `#${i.id}`}</td>
                        <td className="td">{i.customer_email ?? `User ${i.user_id}`}</td>
                        <td className="td">{formatDate(i.issued_at)}</td>
                        <td className="td"><StatusBadge status={i.status} /></td>
                        <td className="td text-right font-medium">{formatMoney(i.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={invoices.data.total} onChange={setPage} />
            </>
          ))}

        {tab === "payments" && payments.data && (payments.data.items.length === 0
          ? <EmptyState title="No payments found" />
          : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="admin-payment-table">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr><th className="th">Invoice</th><th className="th">Date</th><th className="th">Status</th><th className="th">Reason</th><th className="th text-right">Amount</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.data.items.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50" data-testid={`admin-payment-row-${p.id}`}>
                        <td className="td font-medium">{p.invoice_number ?? `#${p.invoice_id}`}</td>
                        <td className="td">{formatDate(p.attempted_at)}</td>
                        <td className="td"><StatusBadge status={p.status} /></td>
                        <td className="td text-slate-500">{p.failure_reason ?? "—"}</td>
                        <td className="td text-right font-medium">{formatMoney(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={payments.data.total} onChange={setPage} />
            </>
          ))}
      </div>
    </div>
  );
}
