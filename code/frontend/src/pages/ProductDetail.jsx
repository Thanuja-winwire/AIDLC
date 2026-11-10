import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { productsApi, parseError } from '../api/client';
import { useAsync } from '../utils/useAsync';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { money } from '../utils/format';
import { Alert, Badge, Button, ErrorState, QuantityStepper, Skeleton } from '../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const { data: p, loading, error, reload } = useAsync(() => productsApi.get(id), [id]);

  if (loading) return <div className="grid gap-8 md:grid-cols-2"><Skeleton className="aspect-square" /><Skeleton className="h-64" /></div>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const addToCart = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setBusy(true); setErr('');
    try { await add(p.id, qty); toast.push('Added to cart'); } catch (e) { setErr(parseError(e).message); } finally { setBusy(false); }
  };

  return (
    <div>
      <Link to="/products" className="mb-4 inline-block text-sm text-primary-600 hover:underline">← Back to products</Link>
      <div className="card grid gap-8 p-6 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-slate-100">
          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ShoppingCart className="h-20 w-20 text-primary-500/50" />}
        </div>
        <div className="space-y-4">
          <span className="text-xs font-medium uppercase tracking-wide text-primary-600">{p.category.name}</span>
          <h1>{p.name}</h1>
          <p className="text-3xl font-bold">{money(p.price)}</p>
          {p.stock > 0 ? <Badge tone={p.stock <= 5 ? 'amber' : 'green'}>{p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}</Badge> : <Badge>Out of stock</Badge>}
          <p className="text-slate-600">{p.description || 'No description available.'}</p>
          {err && <Alert>{err}</Alert>}
          {p.stock > 0 && (
            <div className="flex items-center gap-4">
              <QuantityStepper value={qty} max={p.stock} onChange={setQty} />
              <Button onClick={addToCart} loading={busy}><ShoppingCart className="h-4 w-4" /> {user ? 'Add to cart' : 'Log in to buy'}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
