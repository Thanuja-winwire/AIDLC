import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import { ordersApi, parseError } from '../api/client';
import { useAsync } from '../utils/useAsync';
import { useToast } from '../components/Toast';
import { dateTime, money, STATUS_LABEL, validateCard } from '../utils/format';
import { Alert, Button, ConfirmDialog, EmptyState, ErrorState, Pagination, Skeleton, StatusBadge } from '../components/ui';
import { CardForm } from './Checkout';

export function Orders() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const { data, loading, error, reload } = useAsync(() => ordersApi.list({ page, page_size: 10 }), [page]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div>
      <h1 className="mb-6">My orders</h1>
      {loading ? <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div> :
        data.items.length === 0 ? <EmptyState icon={ClipboardList} title="No orders yet" message="Once you place an order it will show up here." action={<Link to="/products"><Button>Browse products</Button></Link>} /> : (
          <>
            <ul className="space-y-3">
              {data.items.map((o) => (
                <li key={o.id}>
                  <Link to={`/orders/${o.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-md">
                    <div><p className="font-semibold">Order #{o.id}</p><p className="text-sm text-slate-500">{dateTime(o.created_at)} · {o.items.length} item(s)</p></div>
                    <div className="flex items-center gap-4"><StatusBadge status={o.status} /><span className="font-semibold">{money(o.total)}</span></div>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={(p) => setParams({ page: p })} />
          </>
        )}
    </div>
  );
}

export function Timeline({ events }) {
  return (
    <ol className="space-y-4">
      {events.map((e, i) => (
        <li key={i} className="flex items-start gap-3">
          {i === events.length - 1 ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary-600" /> : <Circle className="mt-0.5 h-5 w-5 text-slate-300" />}
          <div><p className="text-sm font-medium">{STATUS_LABEL[e.status] || e.status}</p><p className="text-xs text-slate-500">{dateTime(e.created_at)}</p></div>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: o, loading, error, reload } = useAsync(() => ordersApi.get(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  if (loading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const cancellable = ['pending', 'paid', 'processing', 'payment_failed'].includes(o.status);
  const payable = ['pending', 'payment_failed'].includes(o.status);

  const cancel = async () => {
    setBusy(true);
    try { await ordersApi.cancel(o.id); toast.push('Order cancelled', 'info'); setConfirm(false); await reload(); }
    catch (e) { setMsg(parseError(e).message); setConfirm(false); } finally { setBusy(false); }
  };
  const pay = async (e) => {
    e.preventDefault();
    const errs = validateCard(card); setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const r = await ordersApi.pay(o.id, { ...card, number: card.number.replace(/\s/g, '') });
      toast.push(r.message, r.payment_success ? 'success' : 'error');
      await reload();
    } catch (er) { const p = parseError(er); setMsg(p.message); setErrors(p.fields); } finally { setBusy(false); }
  };

  return (
    <div>
      <Link to="/orders" className="mb-4 inline-block text-sm text-primary-600 hover:underline">← All orders</Link>
      <div className="mb-6 flex flex-wrap items-center gap-3"><h1>Order #{o.id}</h1><StatusBadge status={o.status} /></div>
      {msg && <div className="mb-4"><Alert>{msg}</Alert></div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3">Items</h2>
            <ul className="divide-y divide-slate-100">
              {o.items.map((it) => <li key={it.id} className="flex justify-between py-2 text-sm"><span>{it.product_name} × {it.quantity}</span><span>{money(it.line_total)}</span></li>)}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{money(o.shipping)}</dd></div>
              <div className="flex justify-between"><dt>Tax</dt><dd>{money(o.tax)}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{money(o.total)}</dd></div>
            </dl>
          </section>
          <section className="card p-5 text-sm">
            <h2 className="mb-2">Shipping to</h2>
            <p>{o.ship_full_name}</p><p>{o.ship_line1}{o.ship_line2 ? `, ${o.ship_line2}` : ''}</p><p>{o.ship_city}, {o.ship_state} {o.ship_postal_code}</p><p>{o.ship_country}</p>
          </section>
          {payable && (
            <form onSubmit={pay} className="card space-y-4 p-5" noValidate>
              <h2>{o.status === 'payment_failed' ? 'Payment failed — try again' : 'Complete payment'}</h2>
              <CardForm card={card} setCard={setCard} errors={errors} />
              <Button type="submit" loading={busy}>Pay {money(o.total)}</Button>
            </form>
          )}
        </div>
        <div className="space-y-6">
          <section className="card p-5"><h2 className="mb-4">Status timeline</h2><Timeline events={o.events} /></section>
          {cancellable && <Button variant="danger" className="w-full" onClick={() => setConfirm(true)}>Cancel order</Button>}
        </div>
      </div>
      <ConfirmDialog open={confirm} danger loading={busy} title="Cancel this order?" message="Items return to stock and any payment is refunded." confirmLabel="Cancel order" onConfirm={cancel} onClose={() => setConfirm(false)} />
    </div>
  );
}
