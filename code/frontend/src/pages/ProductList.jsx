import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchX, ShoppingCart } from 'lucide-react';
import { productsApi } from '../api/client';
import { useAsync } from '../utils/useAsync';
import { money } from '../utils/format';
import { Badge, EmptyState, ErrorState, Pagination, Select, Skeleton, Button, Input } from '../components/ui';

export function ProductCard({ p }) {
  return (
    <Link to={`/products/${p.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
        {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ShoppingCart className="h-10 w-10 text-primary-500/60" />}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-primary-600">{p.category.name}</span>
        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-primary-600">{p.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">{money(p.price)}</span>
          {p.stock > 0 ? (p.stock <= 5 ? <Badge tone="amber">Only {p.stock} left</Badge> : <Badge tone="green">In stock</Badge>) : <Badge tone="slate">Out of stock</Badge>}
        </div>
      </div>
    </Link>
  );
}

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category_id = params.get('category_id') || '';
  const sort = params.get('sort') || 'newest';
  const in_stock = params.get('in_stock') === 'true';
  const min_price = params.get('min_price') || '';
  const max_price = params.get('max_price') || '';
  const page = Number(params.get('page') || 1);
  const [range, setRange] = useState({ min: min_price, max: max_price });
  useEffect(() => setRange({ min: min_price, max: max_price }), [min_price, max_price]);

  const cats = useAsync(() => productsApi.categories(), []);
  const { data, loading, error, reload } = useAsync(
    () => productsApi.list({ q: q || undefined, category_id: category_id || undefined, sort, in_stock: in_stock || undefined, min_price: min_price || undefined, max_price: max_price || undefined, page, page_size: 12 }),
    [q, category_id, sort, in_stock, min_price, max_price, page]
  );

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: 1, ...patch }).forEach(([k, v]) => (v === '' || v === false || v == null ? next.delete(k) : next.set(k, v)));
    setParams(next);
  };
  const applyPrice = (e) => { e.preventDefault(); set({ min_price: range.min, max_price: range.max }); };
  const clear = () => setParams({});
  const filtered = q || category_id || in_stock || min_price || max_price;

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside className="card h-fit space-y-5 p-4">
        <h2>Filters</h2>
        <Select label="Category" name="category" value={category_id} onChange={(e) => set({ category_id: e.target.value })}>
          <option value="">All categories</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Min $" name="min_price" type="number" min="0" value={range.min} onChange={(e) => setRange({ ...range, min: e.target.value })} />
            <Input label="Max $" name="max_price" type="number" min="0" value={range.max} onChange={(e) => setRange({ ...range, max: e.target.value })} />
          </div>
          <Button type="submit" variant="secondary" className="w-full">Apply price</Button>
        </form>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={in_stock} onChange={(e) => set({ in_stock: e.target.checked })} className="rounded border-slate-300 text-primary-600" /> In stock only</label>
        {filtered && <Button variant="ghost" className="w-full" onClick={clear}>Clear all filters</Button>}
      </aside>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1>{q ? `Results for “${q}”` : 'All products'}</h1>
            {data && <p className="text-sm text-slate-500">{data.total} product{data.total === 1 ? '' : 's'}</p>}
          </div>
          <div className="w-48"><Select label="Sort by" name="sort" value={sort} onChange={(e) => set({ sort: e.target.value })}>
            <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
          </Select></div>
        </div>
        {error ? <ErrorState message={error} onRetry={reload} /> : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-72" />)}</div>
        ) : data.items.length === 0 ? (
          <EmptyState icon={SearchX} title="No products found" message="Try a different keyword or loosen your filters." action={filtered && <Button onClick={clear}>Clear filters</Button>} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={(pg) => set({ page: pg })} />
          </>
        )}
      </section>
    </div>
  );
}
