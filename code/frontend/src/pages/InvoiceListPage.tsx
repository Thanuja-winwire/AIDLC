import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, PageHeader, Pagination, Skeleton, StatusBadge } from "../components/ui";
import { useInvoices } from "../hooks/queries";
import { toApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";

const PAGE_SIZE = 10;

export default function InvoiceListPage() {
  const [page, setPage] = useState(1);
  const q = useInvoices(page);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Every invoice issued to your account" />
      <div className="card overflow-hidden">
        {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}
        {q.data && q.data.items.length === 0 && <EmptyState title="No invoices yet" message="Invoices appear here after your first payment." />}
        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="invoice-table">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr><th className="th">Number</th><th className="th">Date</th><th className="th">Type</th><th className="th">Status</th><th className="th text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q.data.items.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50" data-testid={`invoice-row-${inv.id}`}>
                      <td className="td"><Link className="font-medium text-brand-600 hover:underline" to={`/invoices/${inv.id}`}>{inv.number ?? `#${inv.id}`}</Link></td>
                      <td className="td">{formatDate(inv.issued_at)}</td>
                      <td className="td capitalize">{inv.type.replace(/_/g, " ")}</td>
                      <td className="td"><StatusBadge status={inv.status} /></td>
                      <td className="td text-right font-medium">{formatMoney(inv.amount)}</td>
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
