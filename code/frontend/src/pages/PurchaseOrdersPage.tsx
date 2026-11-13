import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, dateOnly, errorMessage, money } from "../api/client";
import { useApiMutation, useLocations, useProducts, usePurchaseOrders, useSuppliers } from "../api/hooks";
import type { POInput, POStatus, PurchaseOrder } from "../api/types";
import { RoleGate } from "../components/RoleGate";
import { Alert, Badge, Button, DataList, Input, Modal, PageHeader, Pagination, Select, Textarea, useToast } from "../components/ui";

const SIZE = 15;
export const poTone: Record<POStatus, "slate" | "blue" | "amber" | "green" | "red"> = {
  DRAFT: "slate", APPROVED: "blue", PARTIALLY_RECEIVED: "amber", RECEIVED: "green", CANCELLED: "red",
};
export const poLabel = (s: POStatus) => s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

interface LineDraft { product_id: string; quantity: string; unit_cost: string }

export function PurchaseOrderForm({ existing, onDone }: { existing?: PurchaseOrder; onDone: () => void }) {
  const toast = useToast();
  const { data: suppliers } = useSuppliers({ active: true, size: 100 });
  const { data: locations = [] } = useLocations(true);
  const { data: products } = useProducts({ active: true, size: 100 });
  const [supplier, setSupplier] = useState(existing?.supplier_id.toString() ?? "");
  const [location, setLocation] = useState(existing?.destination_location_id.toString() ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [lines, setLines] = useState<LineDraft[]>(
    existing?.lines.map((l) => ({ product_id: String(l.product_id), quantity: String(l.quantity_ordered), unit_cost: l.unit_cost })) ?? [{ product_id: "", quantity: "1", unit_cost: "" }],
  );
  const [err, setErr] = useState<string | null>(null);
  const save = useApiMutation(
    (body: POInput) => (existing ? api.put(`/purchase-orders/${existing.id}`, body) : api.post("/purchase-orders", body)),
    ["purchase-orders", "dashboard"],
  );

  const setLine = (i: number, patch: Partial<LineDraft>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const pickProduct = (i: number, id: string) => {
    const p = products?.items.find((x) => String(x.id) === id);
    setLine(i, { product_id: id, unit_cost: p ? p.unit_cost : "" });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!supplier || !location) return setErr("Choose a supplier and a destination location");
    if (lines.some((l) => !l.product_id)) return setErr("Choose a product for every line");
    const ids = lines.map((l) => l.product_id);
    if (new Set(ids).size !== ids.length) return setErr("Each product can appear only once");
    if (lines.some((l) => !Number.isInteger(Number(l.quantity)) || Number(l.quantity) < 1)) return setErr("Quantities must be whole numbers of at least 1");
    if (lines.some((l) => l.unit_cost !== "" && Number(l.unit_cost) < 0)) return setErr("Costs cannot be negative");
    const body: POInput = {
      supplier_id: Number(supplier), destination_location_id: Number(location), notes: notes || null,
      lines: lines.map((l) => ({ product_id: Number(l.product_id), quantity_ordered: Number(l.quantity), unit_cost: l.unit_cost === "" ? null : Number(l.unit_cost) })),
    };
    try {
      await save.mutateAsync(body);
      toast.success(existing ? "Purchase order updated" : "Draft purchase order created");
      onDone();
    } catch (x) { setErr(errorMessage(x)); }
  }

  const total = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_cost || 0), 0);

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
          <option value="">Select supplier…</option>
          {suppliers?.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select label="Deliver to" value={location} onChange={(e) => setLocation(e.target.value)} required>
          <option value="">Select location…</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
      </div>
      <div>
        <p className="field-label">Lines</p>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_110px_auto] items-center gap-2">
              <select className="field-input" aria-label={`Product line ${i + 1}`} value={l.product_id} onChange={(e) => pickProduct(i, e.target.value)}>
                <option value="">Select product…</option>
                {products?.items.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
              </select>
              <input className="field-input" type="number" min="1" step="1" aria-label={`Quantity line ${i + 1}`} value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
              <input className="field-input" type="number" min="0" step="0.01" aria-label={`Unit cost line ${i + 1}`} value={l.unit_cost} onChange={(e) => setLine(i, { unit_cost: e.target.value })} />
              <Button variant="ghost" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} aria-label={`Remove line ${i + 1}`}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Button variant="secondary" onClick={() => setLines((ls) => [...ls, { product_id: "", quantity: "1", unit_cost: "" }])}><Plus className="h-4 w-4" /> Add line</Button>
          <p className="text-sm text-slate-600">Estimated total <span className="font-semibold text-slate-900">{money(total)}</span></p>
        </div>
      </div>
      <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{existing ? "Save changes" : "Create draft"}</Button>
      </div>
    </form>
  );
}

export default function PurchaseOrdersPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error, refetch } = usePurchaseOrders({ status, page, size: SIZE });

  return (
    <>
      <PageHeader
        title="Purchase orders" subtitle="Order stock from suppliers and receive it into a location"
        actions={<RoleGate><Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New purchase order</Button></RoleGate>}
      />
      <div className="mb-4 max-w-[240px]">
        <select className="field-input" aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {(["DRAFT", "APPROVED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"] as POStatus[]).map((s) => <option key={s} value={s}>{poLabel(s)}</option>)}
        </select>
      </div>
      <DataList
        head={["Number", "Supplier", "Deliver to", "Status", "Total", "Created"]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.items.length}
        empty={{ title: "No purchase orders", message: status ? "No orders with this status." : "Create a draft order to get started." }}
      >
        {data?.items.map((po) => (
          <tr key={po.id} className="hover:bg-slate-50">
            <td className="td font-medium"><Link className="text-brand-600 hover:underline" to={`/purchase-orders/${po.id}`}>{po.number}</Link></td>
            <td className="td">{po.supplier_name}</td>
            <td className="td">{po.destination_location_name}</td>
            <td className="td"><Badge tone={poTone[po.status]}>{poLabel(po.status)}</Badge></td>
            <td className="td">{money(po.total_amount)}</td>
            <td className="td">{dateOnly(po.created_at)}</td>
          </tr>
        ))}
      </DataList>
      {data && <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />}
      <Modal title="New purchase order" open={creating} onClose={() => setCreating(false)} wide>
        {creating && <PurchaseOrderForm onDone={() => setCreating(false)} />}
      </Modal>
    </>
  );
}
