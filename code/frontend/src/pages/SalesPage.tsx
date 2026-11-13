import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, dateTime, errorMessage, money } from "../api/client";
import { STOCK_KEYS, useApiMutation, useLocations, useProducts, useSales } from "../api/hooks";
import { Alert, Button, Card, DataList, Input, Modal, PageHeader, Pagination, Select, useToast } from "../components/ui";

const SIZE = 10;
interface Line { product_id: string; quantity: string; unit_price: string }
const blank = (): Line => ({ product_id: "", quantity: "1", unit_price: "" });

function SaleForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const { data: products } = useProducts({ active: true, size: 100 });
  const { data: locations = [] } = useLocations(true);
  const [location, setLocation] = useState("");
  const [customer, setCustomer] = useState("");
  const [lines, setLines] = useState<Line[]>([blank()]);
  const [err, setErr] = useState<string | null>(null);
  const create = useApiMutation((body: Record<string, unknown>) => api.post("/sales", body), ["sales", ...STOCK_KEYS]);

  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const pick = (i: number, id: string) => setLine(i, { product_id: id, unit_price: products?.items.find((p) => String(p.id) === id)?.sale_price ?? "" });
  const total = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!location) return setErr("Choose the location the sale is made from");
    if (lines.some((l) => !l.product_id)) return setErr("Choose a product for every line");
    const ids = lines.map((l) => l.product_id);
    if (new Set(ids).size !== ids.length) return setErr("Each product can appear only once");
    if (lines.some((l) => !Number.isInteger(Number(l.quantity)) || Number(l.quantity) < 1)) return setErr("Quantities must be whole numbers of at least 1");
    if (lines.some((l) => l.unit_price === "" || Number(l.unit_price) < 0)) return setErr("Enter a valid price for every line");
    try {
      await create.mutateAsync({
        location_id: Number(location), customer_name: customer || null,
        lines: lines.map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity), unit_price: Number(l.unit_price) })),
      });
      toast.success("Sale recorded");
      onDone();
    } catch (x) { setErr(errorMessage(x)); } // stock shortages name every short product (server message)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Sold from" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select location…</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
        <Input label="Customer (optional)" value={customer} onChange={(e) => setCustomer(e.target.value)} />
      </div>
      <div>
        <div className="mb-1 grid grid-cols-[1fr_90px_110px_auto] gap-2 text-xs font-medium text-slate-500"><span>Product</span><span>Qty</span><span>Unit price</span><span className="w-9" /></div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_110px_auto] items-center gap-2">
              <select className="field-input" aria-label={`Product line ${i + 1}`} value={l.product_id} onChange={(e) => pick(i, e.target.value)}>
                <option value="">Select product…</option>
                {products?.items.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
              </select>
              <input className="field-input" type="number" min="1" step="1" aria-label={`Quantity line ${i + 1}`} value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
              <input className="field-input" type="number" min="0" step="0.01" aria-label={`Unit price line ${i + 1}`} value={l.unit_price} onChange={(e) => setLine(i, { unit_price: e.target.value })} />
              <Button variant="ghost" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setLines((ls) => [...ls, blank()])}><Plus className="h-4 w-4" /> Add line</Button>
          <p className="text-sm text-slate-600">Total <span className="text-lg font-semibold text-slate-900">{money(total)}</span></p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={create.isPending}>Record sale</Button>
      </div>
    </form>
  );
}

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading, error, refetch } = useSales({ page, size: SIZE });

  return (
    <>
      <PageHeader title="Sales" subtitle="Record sales and deduct stock automatically" actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New sale</Button>} />
      <DataList
        head={["Number", "Location", "Customer", "Items", "Total", "When"]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.items.length} empty={{ title: "No sales yet", message: "Record your first sale to see it here." }}
      >
        {data?.items.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="td font-medium">{s.number}</td>
            <td className="td">{s.location_name}</td>
            <td className="td">{s.customer_name ?? "—"}</td>
            <td className="td text-slate-500">{s.lines.map((l) => `${l.product_name} ×${l.quantity}`).join(", ")}</td>
            <td className="td font-semibold">{money(s.total_amount)}</td>
            <td className="td text-xs">{dateTime(s.sold_at)}</td>
          </tr>
        ))}
      </DataList>
      {data && <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />}
      <Modal title="New sale" open={open} onClose={() => setOpen(false)} wide>{open && <SaleForm onDone={() => setOpen(false)} />}</Modal>
      <Card className="hidden" />
    </>
  );
}
