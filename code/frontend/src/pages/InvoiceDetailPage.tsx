import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Alert, ErrorState, PageHeader, Skeleton, StatusBadge } from "../components/ui";
import { useInvoice } from "../hooks/queries";
import { api, toApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";

export default function InvoiceDetailPage() {
  const id = Number(useParams().id);
  const q = useInvoice(id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setBusy(true); setError(null);
    try {
      const blob = await api.invoicePdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${q.data?.number ?? `invoice-${id}`}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { setError(toApiError(e).message); }
    finally { setBusy(false); }
  };

  if (q.isLoading) return <div><Skeleton className="mb-4 h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (q.isError || !q.data) return <div className="card"><ErrorState message={q.error ? toApiError(q.error).message : "Invoice not found."} onRetry={() => q.refetch()} /></div>;

  const inv = q.data;
  return (
    <div>
      <Link to="/invoices" className="mb-3 inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to invoices</Link>
      <PageHeader title={`Invoice ${inv.number ?? `#${inv.id}`}`} subtitle={`Issued ${formatDate(inv.issued_at)}`}
        action={
          <button className="btn-primary" onClick={download} disabled={busy} data-testid="invoice-download-pdf">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
          </button>
        } />
      {error && <div className="mb-4"><Alert kind="error">{error}</Alert></div>}
      <div className="card p-6" data-testid="invoice-detail">
        <div className="flex flex-wrap justify-between gap-4">
          <div><p className="label">Status</p><StatusBadge status={inv.status} /></div>
          <div><p className="label">Billing period</p><p>{formatDate(inv.period_start)} – {formatDate(inv.period_end)}</p></div>
          <div><p className="label">Paid</p><p>{formatDate(inv.paid_at)}</p></div>
        </div>
        <table className="mt-6 w-full">
          <thead className="border-b border-slate-200"><tr><th className="th px-0">Description</th><th className="th px-0 text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {inv.lines.map((l) => (
              <tr key={l.id}><td className="td px-0">{l.description}</td><td className="td px-0 text-right">{formatMoney(l.amount)}</td></tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t border-slate-300"><td className="px-0 py-3 font-semibold">Total</td><td className="px-0 py-3 text-right text-lg font-semibold" data-testid="invoice-total">{formatMoney(inv.amount)}</td></tr></tfoot>
        </table>
        {inv.payments.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2">Payment attempts</h3>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {inv.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-3 py-2">
                  <span>{formatDate(p.attempted_at)}{p.failure_reason ? ` · ${p.failure_reason}` : ""}</span>
                  <span className="flex items-center gap-3"><StatusBadge status={p.status} /><span className="font-medium">{formatMoney(p.amount)}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
