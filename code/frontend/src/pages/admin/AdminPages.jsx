import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { adminApi, parseError } from '../../api/client';
import { useAsync } from '../../utils/useAsync';
import { useToast } from '../../components/Toast';
import { dateTime, money, STATUS_LABEL } from '../../utils/format';
import { Alert, Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, Modal, Pagination, Select, Skeleton, StatusBadge } from '../../components/ui';

export function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => adminApi.metrics(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const cards = data && [
    { label: 'Total orders', value: data.total_orders, icon: ShoppingBag, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Revenue', value: money(data.revenue), icon: DollarSign, tone: 'bg-green-50 text-green-600' },
    { label: 'Users', value: data.user_count, icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Low stock', value: data.low_stock_count, icon: AlertTriangle, tone: 'bg-amber-50 text-amber-600' },
  ];
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />) : cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-5">
            <div className={`rounded-lg p-3 ${c.tone}`}><c.icon className="h-6 w-6" /></div>
            <div><p className="text-sm text-slate-500">{c.label}</p><p className="text-2xl font-bold">{c.value}</p></div>
          </div>
        ))}
      </div>
      <section className="card p-5">
        <div className="mb-3 flex justify-between"><h2>Recent orders</h2><Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">View all</Link></div>
        {loading ? <Skeleton className="h-32" /> : data.recent_orders.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No orders yet.</p> : (
          <ul className="divide-y divide-slate-100">
            {data.recent_orders.map((o) => (
              <li key={o.id}><Link to={`/admin/orders/${o.id}`} className="flex items-center justify-between py-3 text-sm hover:bg-slate-50">
                <span>#{o.id} · {o.user_email} · {dateTime(o.created_at)}</span><span className="flex items-center gap-3"><StatusBadge status={o.status} /><b>{money(o.total)}</b></span>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const EMPTY = { name: '', description: '', price: '', stock: 0, image_url: '', category_id: '', is_active: true };

export function AdminProducts() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.products({ q: search || undefined, page, page_size: 20 }), [page, search]);
  const cats = useAsync(() => import('../../api/client').then((m) => m.productsApi.categories()), []);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const open = (p) => {
    setEdit(p || {});
    setForm(p ? { name: p.name, description: p.description, price: p.price, stock: p.stock, image_url: p.image_url, category_id: p.category_id, is_active: p.is_active } : EMPTY);
    setErrors({}); setMsg('');
  };
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!(Number(form.price) > 0)) errs.price = 'Price must be greater than 0';
    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Stock must be 0 or more';
    if (!form.category_id) errs.category_id = 'Choose a category';
    if (form.image_url && !/^https?:\/\//.test(form.image_url)) errs.image_url = 'Must start with http(s)://';
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    const body = { ...form, price: String(form.price), stock: Number(form.stock), category_id: Number(form.category_id) };
    try {
      if (edit.id) await adminApi.updateProduct(edit.id, body); else await adminApi.createProduct(body);
      toast.push('Product saved'); setEdit(null); reload();
    } catch (er) { const p = parseError(er); setMsg(p.message); setErrors(p.fields); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await adminApi.deleteProduct(del.id); toast.push('Product removed from catalog', 'info'); setDel(null); reload(); }
    catch (er) { toast.push(parseError(er).message, 'error'); } finally { setBusy(false); }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Products</h1>
        <Button onClick={() => open(null)}>Add product</Button>
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(q); }}>
        <input className="input max-w-xs" aria-label="Search products" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      {loading ? <Skeleton className="h-64" /> : data.items.length === 0 ? <EmptyState title="No products" message="Add your first product." action={<Button onClick={() => open(null)}>Add product</Button>} /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.category.name}</td><td className="p-3">{money(p.price)}</td>
                  <td className="p-3">{p.stock <= 5 ? <Badge tone="amber">{p.stock}</Badge> : p.stock}</td>
                  <td className="p-3">{p.is_active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}</td>
                  <td className="space-x-2 p-3 text-right"><Button variant="secondary" onClick={() => open(p)}>Edit</Button>{p.is_active && <Button variant="danger" onClick={() => setDel(p)}>Delete</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={setPage} />}

      <Modal open={!!edit} title={edit?.id ? 'Edit product' : 'New product'} onClose={() => setEdit(null)}>
        <form onSubmit={save} className="space-y-3" noValidate>
          {msg && <Alert>{msg}</Alert>}
          <Input label="Name" name="name" value={form.name} onChange={on('name')} error={errors.name} />
          <Input label="Description" name="description" value={form.description} onChange={on('description')} error={errors.description} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={on('price')} error={errors.price} />
            <Input label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={on('stock')} error={errors.stock} />
          </div>
          <Select label="Category" name="category_id" value={form.category_id} onChange={on('category_id')} error={errors.category_id}>
            <option value="">Select…</option>{cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Image URL" name="image_url" value={form.image_url} onChange={on('image_url')} error={errors.image_url} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={on('is_active')} /> Active (visible in catalog)</label>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button type="submit" loading={busy}>Save</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} danger loading={busy} title="Remove product?" message={`“${del?.name}” will be hidden from the catalog. Order history is kept and you can re-activate it later.`} confirmLabel="Remove" onConfirm={remove} onClose={() => setDel(null)} />
    </div>
  );
}

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.users({ q: search || undefined, page, page_size: 20 }), [page, search]);
  const patch = async (u, body) => {
    try { await adminApi.updateUser(u.id, body); toast.push('User updated'); reload(); } catch (er) { toast.push(parseError(er).message, 'error'); }
  };
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <h1>Users</h1>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(q); }}>
        <input className="input max-w-xs" aria-label="Search users" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      {loading ? <Skeleton className="h-64" /> : data.items.length === 0 ? <EmptyState icon={Users} title="No users found" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium">{u.name}</td><td className="p-3">{u.email}</td>
                  <td className="p-3"><Badge tone={u.role === 'admin' ? 'indigo' : 'slate'}>{u.role}</Badge></td>
                  <td className="p-3">{u.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Inactive</Badge>}</td>
                  <td className="space-x-2 p-3 text-right">
                    <Button variant="secondary" onClick={() => patch(u, { is_active: !u.is_active })}>{u.is_active ? 'Deactivate' : 'Activate'}</Button>
                    <Button variant="secondary" onClick={() => patch(u, { role: u.role === 'admin' ? 'customer' : 'admin' })}>{u.role === 'admin' ? 'Make customer' : 'Make admin'}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={setPage} />}
    </div>
  );
}

export function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync(() => adminApi.orders({ status: status || undefined, page, page_size: 20 }), [page, status]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><h1>Orders</h1>
        <div className="w-48"><Select label="Status" name="status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select></div>
      </div>
      {loading ? <Skeleton className="h-64" /> : data.items.length === 0 ? <EmptyState title="No orders" message="No orders match this filter." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3"><Link className="font-medium text-primary-600 hover:underline" to={`/admin/orders/${o.id}`}>#{o.id}</Link></td>
                  <td className="p-3">{o.user_email}</td><td className="p-3">{dateTime(o.created_at)}</td><td className="p-3"><StatusBadge status={o.status} /></td><td className="p-3 text-right">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={setPage} />}
    </div>
  );
}
