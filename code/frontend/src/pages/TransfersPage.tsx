import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, dateTime, errorMessage } from "../api/client";
import { STOCK_KEYS, useApiMutation, useLocations, useProducts, useStock, useTransfers } from "../api/hooks";
import { Alert, Button, Card, DataList, Input, PageHeader, Pagination, Select, useToast } from "../components/ui";

const SIZE = 10;

export default function TransfersPage() {
  const toast = useToast();
  const { data: products } = useProducts({ active: true, size: 100 });
  const { data: locations = [] } = useLocations(true);
  const [product, setProduct] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: avail } = useStock({ product_id: product, location_id: from, size: 1 });
  const available = product && from ? avail?.items[0]?.quantity ?? 0 : null;
  const history = useTransfers({ page, size: SIZE });
  const create = useApiMutation(
    (body: Record<string, unknown>) => api.post("/transfers", body), ["transfers", ...STOCK_KEYS],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!product || !from || !to) return setErr("Choose a product, a source and a destination");
    if (from === to) return setErr("Source and destination must be different");
    const n = Number(qty);
    if (!Number.isInteger(n) || n < 1) return setErr("Quantity must be a whole number of at least 1");
    try {
      await create.mutateAsync({ product_id: Number(product), from_location_id: Number(from), to_location_id: Number(to), quantity: n, note: note || null });
      toast.success("Transfer completed");
      setQty("1"); setNote("");
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <>
      <PageHeader title="Stock transfers" subtitle="Move stock between locations" />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit p-5">
          <form onSubmit={submit} className="space-y-4" aria-label="New transfer">
            {err && <Alert>{err}</Alert>}
            <Select label="Product" value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="">Select product…</option>
              {products?.items.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
            </Select>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">Select…</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
              <ArrowRight className="mb-2.5 h-4 w-4 text-slate-400" aria-hidden />
              <Select label="To" value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Select…</option>
                {locations.filter((l) => String(l.id) !== from).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </div>
            <Input label="Quantity" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)}
              hint={available !== null ? `${available} available at the source` : undefined} />
            <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" className="w-full" loading={create.isPending}>Transfer stock</Button>
          </form>
        </Card>
        <div>
          <DataList
            head={["Number", "Product", "From", "To", "Qty", "When"]} loading={history.isLoading} error={history.error ? errorMessage(history.error) : undefined}
            onRetry={() => history.refetch()} isEmpty={!history.data?.items.length} empty={{ title: "No transfers yet", message: "Completed transfers appear here." }}
          >
            {history.data?.items.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="td font-medium">{t.number}</td>
                <td className="td">{t.product_name}</td>
                <td className="td">{t.from_location_name}</td>
                <td className="td">{t.to_location_name}</td>
                <td className="td font-semibold">{t.quantity}</td>
                <td className="td text-xs">{dateTime(t.created_at)}</td>
              </tr>
            ))}
          </DataList>
          {history.data && <Pagination page={page} size={SIZE} total={history.data.total} onPage={setPage} />}
        </div>
      </div>
    </>
  );
}
