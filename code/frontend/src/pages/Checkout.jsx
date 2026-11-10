import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ordersApi, parseError } from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { luhnFreeCardFormat, validateAddress, validateCard } from '../utils/format';
import { Alert, Button, Input } from '../components/ui';
import { OrderSummary } from './Cart';

export function CardForm({ card, setCard, errors }) {
  return (
    <div className="space-y-4">
      <Input label="Card number" name="number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: luhnFreeCardFormat(e.target.value) })} error={errors.number} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Expiry (MM/YY)" name="expiry" placeholder="12/30" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} error={errors.expiry} />
        <Input label="CVC" name="cvc" inputMode="numeric" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} error={errors.cvc} />
      </div>
      <p className="text-xs text-slate-500">Test mode: 4242 4242 4242 4242 succeeds, 4000 0000 0000 0002 is declined.</p>
    </div>
  );
}

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [addr, setAddr] = useState({ full_name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: '', phone: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  if (cart.items.length === 0 && !busy)
    return <Navigate to="/cart" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = { ...validateAddress(addr), ...validateCard(card) };
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await ordersApi.checkout({
        address: { ...addr, line2: addr.line2 || null, phone: addr.phone || null },
        card: { ...card, number: card.number.replace(/\s/g, '') },
      });
      await refresh();
      toast.push(res.payment_success ? 'Payment successful' : res.message, res.payment_success ? 'success' : 'error');
      navigate(`/orders/${res.order.id}`, { replace: true });
    } catch (er) {
      const p = parseError(er);
      setMsg(p.message);
      setErrors(p.fields);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="mb-6">Checkout</h1>
      {msg && <div className="mb-4"><Alert>{msg} {msg.includes('stock') && <Link to="/cart" className="underline">Review cart</Link>}</Alert></div>}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h2>Shipping address</h2>
            <Input label="Full name" name="full_name" value={addr.full_name} onChange={on('full_name')} error={errors.full_name} />
            <Input label="Address line 1" name="line1" value={addr.line1} onChange={on('line1')} error={errors.line1} />
            <Input label="Address line 2 (optional)" name="line2" value={addr.line2} onChange={on('line2')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City" name="city" value={addr.city} onChange={on('city')} error={errors.city} />
              <Input label="State / Province" name="state" value={addr.state} onChange={on('state')} error={errors.state} />
              <Input label="Postal code" name="postal_code" value={addr.postal_code} onChange={on('postal_code')} error={errors.postal_code} />
              <Input label="Country" name="country" value={addr.country} onChange={on('country')} error={errors.country} />
            </div>
            <Input label="Phone (optional)" name="phone" inputMode="numeric" value={addr.phone} onChange={on('phone')} error={errors.phone} />
          </section>
          <section className="card space-y-4 p-5">
            <h2>Payment</h2>
            <CardForm card={card} setCard={setCard} errors={errors} />
          </section>
        </div>
        <div className="space-y-4">
          <OrderSummary cart={cart} />
          <Button type="submit" className="w-full" loading={busy}>Place order</Button>
        </div>
      </div>
    </form>
  );
}
