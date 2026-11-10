import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, parseError } from '../../api/client';
import { useAsync } from '../../utils/useAsync';
import { useToast } from '../../components/Toast';
import { money } from '../../utils/format';
import { Alert, Button, ConfirmDialog, ErrorState, Skeleton, StatusBadge } from '../../components/ui';
import { Timeline } from '../Orders';

const NEXT = { paid: 'processing', processing: 'shipped', shipped: 'delivered' };

export default function AdminOrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: o, loading, error, reload } = useAsync(() => adminApi.order(id), [id]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState('');

  if (loading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const move = async (status) => {
    setBusy(true); setMsg('');
    try { await adminApi.setStatus(o.id, status); toast.push(`Order marked ${status}`); setConfirm(false); await reload(); }
    catch (e) { setMsg(parseError(e).message); setConfirm(false); } finally { setBusy(false); }
  };
  const next = NEXT[o.status];
  const canCancel = !['delivered', 'cancelled'].includes(o.status);

  return (
    <div className="space-y-6">
      <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">← All orders</Link>
      <div className="flex flex-wrap items-center gap-3"><h1>Order #{o.id}</h1><StatusBadge status={o.status} /><span className="text-sm text-slate-500">{o.user_email}</span></div>
      {msg && <Alert>{msg}</Alert>}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3">Items</h2>
            <ul className="divide-y divide-slate-100 text-sm">{o.items.map((it) => <li key={it.id} className="flex justify-between py-2"><span>{it.product_name} × {it.quantity}</span><span>{money(it.line_total)}</span></li>)}</ul>
            <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold"><span>Total</span><span>{money(o.total)}</span></p>
          </section>
          <section className="card p-5 text-sm"><h2 className="mb-2">Ship to</h2><p>{o.ship_full_name}</p><p>{o.ship_line1} {o.ship_line2}</p><p>{o.ship_city}, {o.ship_state} {o.ship_postal_code}, {o.ship_country}</p></section>
          <section className="card p-5 text-sm"><h2 className="mb-2">Payments</h2>
            {o.payments.length === 0 ? <p className="text-slate-500">No payment attempts.</p> : <ul className="space-y-1">{o.payments.map((p) => <li key={p.id}>•••• {p.card_last4} — {p.status} — {money(p.amount)}{p.failure_reason ? ` (${p.failure_reason})` : ''}</li>)}</ul>}
          </section>
        </div>
        <div className="space-y-4">
          <section className="card p-5"><h2 className="mb-4">Timeline</h2><Timeline events={o.events} /></section>
          {next && <Button className="w-full" loading={busy} onClick={() => move(next)}>Mark as {next}</Button>}
          {canCancel && <Button className="w-full" variant="danger" onClick={() => setConfirm(true)}>Cancel order</Button>}
        </div>
      </div>
      <ConfirmDialog open={confirm} danger loading={busy} title="Cancel order?" message="Stock will be restored and any payment refunded." confirmLabel="Cancel order" onConfirm={() => move('cancelled')} onClose={() => setConfirm(false)} />
    </div>
  );
}
