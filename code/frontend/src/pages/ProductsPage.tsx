import { Pencil, Plus, Search, Tags } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessage, money } from "../api/client";
import { useApiMutation, useCategories, useProducts } from "../api/hooks";
import type { Category, Product, ProductInput } from "../api/types";
import { RoleGate } from "../components/RoleGate";
import {
  Alert, Badge, Button, Card, DataList, Input, Modal, PageHeader, Pagination, Select, Textarea, useToast,
} from "../components/ui";

const SIZE = 15;

function ProductForm({ product, categories, onDone }: { product: Product | null; categories: Category[]; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    sku: product?.sku ?? "", name: product?.name ?? "", description: product?.description ?? "",
    category_id: product?.category_id?.toString() ?? "", unit_of_measure: product?.unit_of_measure ?? "unit",
    unit_cost: product?.unit_cost ?? "0", sale_price: product?.sale_price ?? "0", reorder_level: String(product?.reorder_level ?? 0),
    is_active: product?.is_active ?? true,
  });
  const [err, setErr] = useState<string | null>(null);
  const save = useApiMutation(
    (body: ProductInput) => (product ? api.patch(`/products/${product.id}`, body) : api.post("/products", body)),
    ["products", "dashboard", "alerts"],
  );
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const problems: string[] = [];
  if (!product && !f.sku.trim()) problems.push("SKU is required");
  if (!f.name.trim()) problems.push("Name is required");
  if (Number(f.unit_cost) < 0 || Number(f.sale_price) < 0) problems.push("Prices cannot be negative");
  if (!Number.isInteger(Number(f.reorder_level)) || Number(f.reorder_level) < 0) problems.push("Reorder level must be a whole number, 0 or more");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (problems.length) return setErr(problems.join(". "));
    const body: ProductInput = {
      name: f.name.trim(), description: f.description || null, category_id: f.category_id ? Number(f.category_id) : null,
      unit_of_measure: f.unit_of_measure.trim() || "unit", unit_cost: Number(f.unit_cost), sale_price: Number(f.sale_price),
      reorder_level: Number(f.reorder_level),
    };
    if (product) body.is_active = f.is_active; else body.sku = f.sku.trim();
    try {
      await save.mutateAsync(body);
      toast.success(product ? "Product updated" : "Product created");
      onDone();
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="SKU" value={f.sku} onChange={set("sku")} disabled={!!product} required />
        <Input label="Name" value={f.name} onChange={set("name")} required />
        <Select label="Category" value={f.category_id} onChange={set("category_id")}>
          <option value="">No category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input label="Unit of measure" value={f.unit_of_measure} onChange={set("unit_of_measure")} />
        <Input label="Unit cost" type="number" min="0" step="0.01" value={f.unit_cost} onChange={set("unit_cost")} />
        <Input label="Sale price" type="number" min="0" step="0.01" value={f.sale_price} onChange={set("sale_price")} />
        <Input label="Reorder level" type="number" min="0" step="1" value={f.reorder_level} onChange={set("reorder_level")} hint="Alerts fire when stock is at or below this level" />
      </div>
      <Textarea label="Description" value={f.description} onChange={set("description")} />
      {product && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="rounded border-slate-300 text-brand-600" checked={f.is_active} onChange={(e) => setF((s) => ({ ...s, is_active: e.target.checked }))} />
          Product is active
        </label>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{product ? "Save changes" : "Create product"}</Button>
      </div>
    </form>
  );
}

function CategoriesModal({ open, onClose, categories }: { open: boolean; onClose: () => void; categories: Category[] }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const add = useApiMutation((n: string) => api.post("/categories", { name: n }), ["categories"]);
  const del = useApiMutation((id: number) => api.delete(`/categories/${id}`), ["categories", "products"]);

  return (
    <Modal title="Manage categories" open={open} onClose={onClose}>
      {err && <div className="mb-3"><Alert>{err}</Alert></div>}
      <form
        className="mb-4 flex items-end gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setErr(null);
          try { await add.mutateAsync(name.trim()); setName(""); toast.success("Category added"); } catch (x) { setErr(errorMessage(x)); }
        }}
      >
        <div className="flex-1"><Input label="New category" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <Button type="submit" loading={add.isPending}>Add</Button>
      </form>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {categories.length === 0 && <li className="p-4 text-center text-sm text-slate-500">No categories yet.</li>}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
            {c.name}
            <Button variant="ghost" onClick={async () => {
              setErr(null);
              try { await del.mutateAsync(c.id); toast.success("Category deleted"); } catch (x) { setErr(errorMessage(x)); }
            }}>Delete</Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = closed, null = new
  const [catsOpen, setCatsOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setDebounced(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const { data, isLoading, error, refetch } = useProducts({ q: debounced, category_id: category, page, size: SIZE });
  const { data: categories = [] } = useCategories();

  return (
    <>
      <PageHeader
        title="Products" subtitle="Your catalog, with stock totals across all locations"
        actions={
          <RoleGate>
            <Button variant="secondary" onClick={() => setCatsOpen(true)}><Tags className="h-4 w-4" /> Categories</Button>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> New product</Button>
          </RoleGate>
        }
      />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
            <input className="field-input pl-9" placeholder="Search by name or SKU" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="field-input" aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>
      <DataList
        head={["SKU", "Name", "Category", "Price", "In stock", "Status", ""]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.items.length}
        empty={{ title: "No products found", message: debounced || category ? "Try a different search or filter." : "Create your first product to start tracking stock." }}
      >
        {data?.items.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50">
            <td className="td font-mono text-xs">{p.sku}</td>
            <td className="td font-medium text-slate-900">{p.name}</td>
            <td className="td">{p.category_name ?? "—"}</td>
            <td className="td">{money(p.sale_price)}</td>
            <td className="td">
              <span className={p.total_stock <= p.reorder_level ? "font-semibold text-red-600" : ""}>{p.total_stock}</span>
              <span className="text-xs text-slate-400"> / min {p.reorder_level}</span>
            </td>
            <td className="td"><Badge tone={p.is_active ? "green" : "slate"}>{p.is_active ? "Active" : "Inactive"}</Badge></td>
            <td className="td text-right">
              <RoleGate><Button variant="ghost" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></Button></RoleGate>
            </td>
          </tr>
        ))}
      </DataList>
      {data && <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />}

      <Modal title={editing ? "Edit product" : "New product"} open={editing !== undefined} onClose={() => setEditing(undefined)} wide>
        {editing !== undefined && <ProductForm product={editing} categories={categories} onDone={() => setEditing(undefined)} />}
      </Modal>
      <CategoriesModal open={catsOpen} onClose={() => setCatsOpen(false)} categories={categories} />
    </>
  );
}
