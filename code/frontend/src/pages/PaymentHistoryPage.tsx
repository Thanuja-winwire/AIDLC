import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, PageHeader, Pagination, Skeleton, StatusBadge } from "../components/ui";
import { usePayments } from "../hooks/queries";
import { toApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const q = usePayments(page);

  return (
    <div>
      <PageHeader title="Payment history" subtitle="All payment attempts, successful and failed" />
      <div className="card overflow-hidden">
        {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}
        {q.data && q.data.items.length === 0 && <EmptyState title="No payments yet" message="Your payment attempts will be listed here." />}
        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="payment-table">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr><th className="th">Date</th><th className="th">Invoice</th><th className="th">Status</th><th className="th">Details</th><th className="th text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q.data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50" data-testid={`payment-row-${p.id}`}>
                      <td className="td">{formatDate(p.attempted_at)}</td>
                      <td className="td"><Link className="text-brand-600 hover:underline" to={`/invoices/${p.invoice_id}`}>{p.invoice_number ?? `#${p.invoice_id}`}</Link></td>
                      <td className="td"><StatusBadge status={p.status} /></td>
                      <td className="td text-slate-500">{p.failure_reason ?? p.gateway_reference ?? "—"}</td>
                      <td className="td text-right font-medium">{formatMoney(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={q.data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
