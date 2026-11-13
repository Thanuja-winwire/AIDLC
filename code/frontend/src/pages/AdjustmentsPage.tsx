import { useState, type FormEvent } from "react";
import { api, dateTime, errorMessage } from "../api/client";
import { STOCK_KEYS, useAdjustments, useApiMutation, useLocations, useProducts, useStock } from "../api/hooks";
import type { AdjustmentMode, AdjustmentReason } from "../api/types";
import { Alert, Badge, Button, Card, DataList, Input, PageHeader, Pagination, Select, Textarea, cx, useToast } from "../components/ui";

const SIZE = 10;
const REASONS: AdjustmentReason[] = ["DAMAGE", "LOSS", "RECOUNT", "CORRECTION", "OTHER"];

export default function AdjustmentsPage() {
  const toast = useToast();
  const { data: products } = useProducts({ active: true, size: 100 });
  const { data: locations = [] } = useLocations(true);
  const [mode, setMode] = useState<AdjustmentMode>("DELTA");
  const [product, setProduct] = useState("");
  const [location, setLocation] = useState("");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState<AdjustmentReason>("RECOUNT");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: cur } = useStock({ product_id: product, location_id: location, size: 1 });
  const current = product && location ? cur?.items[0]?.quantity ?? 0 : null;
  const history = useAdjustments({ page, size: SIZE });
  const create = useApiMutation((body: Record<string, unknown>) => api.post("/adjustments", body), ["adjustments", ...STOCK_KEYS]);

  const n = Number(value);
  const computedDelta = current !== null && value !== "" ? (mode === "COUNT" ? n - current : n) : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!product || !location) return setErr("Choose a product and a location");
    if (value === "" || !Number.isInteger(n)) return setErr("Enter a whole number");
    if (mode === "DELTA" && n === 0) return setErr("A zero change is not allowed");
    if (mode === "COUNT" && n < 0) return setErr("Counted quantity cannot be negative");
    if (computedDelta === 0) return setErr("The counted quantity matches the current stock, so there is nothing to adjust");
    if (reason === "OTHER" && !note.trim()) return setErr("A note is required when the reason is Other");
    if (current !== null && current + (computedDelta ?? 0) < 0) return setErr("This would make stock negative");
    try {
      await create.mutateAsync({
        product_id: Number(product), location_id: Number(location), mode, reason, note: note || null,
        ...(mode === "DELTA" ? { delta: n } : { counted_quantity: n }),
      });
      toast.success("Adjustment recorded");
      setValue(""); setNote("");
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <>
      <PageHeader title="Inventory adjustments" subtitle="Correct stock for damage, loss or a physical count" />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit p-5">
          <form onSubmit={submit} className="space-y-4" aria-label="New adjustment">
            {err && <Alert>{err}</Alert>}
            <div className="inline-flex w-full rounded-lg bg-slate-200/70 p-1" role="tablist">
              {(["DELTA", "COUNT"] as const).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setValue(""); }}
                  className={cx("flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition", mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-600")}>
                  {m === "DELTA" ? "Change by" : "Set counted qty"}
                </button>
              ))}
            </div>
            <Select label="Product" value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="">Select product…</option>
              {products?.items.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
            </Select>
            <Select label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select location…</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
            <Input
              label={mode === "DELTA" ? "Quantity change (+/−)" : "Counted quantity"} type="number" step="1" value={value} onChange={(e) => setValue(e.target.value)}
              hint={current !== null ? `Current stock: ${current}${computedDelta !== null && !Number.isNaN(computedDelta) ? ` → change of ${computedDelta > 0 ? "+" : ""}${computedDelta}` : ""}` : undefined}
            />
            <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value as AdjustmentReason)}>
              {REASONS.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
            </Select>
            <Textarea label={reason === "OTHER" ? "Note (required)" : "Note"} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" className="w-full" loading={create.isPending}>Record adjustment</Button>
          </form>
        </Card>
        <div>
          <DataList
            head={["When", "Product", "Location", "Change", "Reason", "Note"]} loading={history.isLoading} error={history.error ? errorMessage(history.error) : undefined}
            onRetry={() => history.refetch()} isEmpty={!history.data?.items.length} empty={{ title: "No adjustments yet", message: "Adjustments you record appear here." }}
          >
            {history.data?.items.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="td whitespace-nowrap text-xs">{dateTime(a.created_at)}</td>
                <td className="td font-medium text-slate-900">{a.product_name}</td>
                <td className="td">{a.location_name}</td>
                <td className={cx("td font-semibold", a.delta > 0 ? "text-emerald-600" : "text-red-600")}>{a.delta > 0 ? `+${a.delta}` : a.delta}</td>
                <td className="td"><Badge>{a.reason.toLowerCase()}</Badge></td>
                <td className="td text-slate-500">{a.note ?? "—"}</td>
              </tr>
            ))}
          </DataList>
          {history.data && <Pagination page={page} size={SIZE} total={history.data.total} onPage={setPage} />}
        </div>
      </div>
    </>
  );
}
