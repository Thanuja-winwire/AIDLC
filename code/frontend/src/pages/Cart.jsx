import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { parseError } from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { money } from '../utils/format';
import { Alert, Badge, Button, EmptyState, QuantityStepper } from '../components/ui';

export function OrderSummary({ cart }) {
  return (
    <div className="card h-fit space-y-3 p-5">
      <h2>Order summary</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{money(cart.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{money(cart.shipping)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Tax (8%)</dt><dd>{money(cart.tax)}</dd></div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold"><dt>Total</dt><dd>{money(cart.total)}</dd></div>
      </dl>
    </div>
  );
}

export default function Cart() {
  const { cart, update, remove, clear } = useCart();
  const toast = useToast();
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const run = async (id, fn) => {
    setBusyId(id); setErr('');
    try { await fn(); } catch (e) { setErr(parseError(e).message); } finally { setBusyId(null); }
  };

  if (cart.items.length === 0)
    return <EmptyState icon={ShoppingCart} title="Your cart is empty" message="Browse the catalog and add something you like." action={<Link to="/products"><Button>Start shopping</Button></Link>} />;

  const hasUnavailable = cart.items.some((i) => i.unavailable);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1>Shopping cart</h1>
        <Button variant="ghost" onClick={() => run('all', async () => { await clear(); toast.push('Cart cleared', 'info'); })}>Clear cart</Button>
      </div>
      {err && <div className="mb-4"><Alert>{err}</Alert></div>}
      {hasUnavailable && <div className="mb-4"><Alert tone="amber">Some items are no longer available. Remove them to check out.</Alert></div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="space-y-3">
          {cart.items.map((it) => (
            <li key={it.id} className={`card flex flex-wrap items-center gap-4 p-4 ${it.unavailable ? 'opacity-60' : ''}`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-50"><ShoppingCart className="h-6 w-6 text-primary-500" /></div>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${it.product.id}`} className="font-medium hover:text-primary-600">{it.product.name}</Link>
                <p className="text-sm text-slate-500">{money(it.product.price)} each</p>
                {it.unavailable && <Badge tone="red">Unavailable</Badge>}
              </div>
              {!it.unavailable && <QuantityStepper value={it.quantity} max={it.product.stock} disabled={busyId === it.id} onChange={(q) => run(it.id, () => update(it.id, q))} />}
              <span className="w-24 text-right font-semibold">{money(it.line_total)}</span>
              <button aria-label={`Remove ${it.product.name}`} className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => run(it.id, () => remove(it.id))}><Trash2 className="h-5 w-5" /></button>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <OrderSummary cart={cart} />
          {hasUnavailable ? <Button className="w-full" disabled>Checkout</Button> : <Link to="/checkout" className="block"><Button className="w-full">Proceed to checkout</Button></Link>}
        </div>
      </div>
    </div>
  );
}
