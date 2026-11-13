import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { dateTime, errorMessage } from "../api/client";
import { useLocations, useMovements, useStock } from "../api/hooks";
import type { MovementType } from "../api/types";
import { Badge, Card, DataList, PageHeader, Pagination, cx } from "../components/ui";

const SIZE = 20;
const typeTone: Record<MovementType, "green" | "red" | "blue" | "amber" | "slate"> = {
  PO_RECEIPT: "green", SALE: "red", TRANSFER_OUT: "amber", TRANSFER_IN: "blue", ADJUSTMENT: "slate",
};

export default function StockPage() {
  const [tab, setTab] = useState<"levels" | "movements">("levels");
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const { data: locations = [] } = useLocations();

  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  const levels = useStock({ q: dq, location_id: location, page, size: SIZE });
  const moves = useMovements({ location_id: location, page, size: SIZE });
  const cur = tab === "levels" ? levels : moves;

  return (
    <>
      <PageHeader title="Stock" subtitle="Current quantities per location and the full movement history" />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-slate-200/70 p-1" role="tablist">
          {(["levels", "movements"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setPage(1); }}
              className={cx("rounded-md px-3 py-1.5 text-sm font-medium transition", tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
              {t === "levels" ? "Stock levels" : "Movements"}
            </button>
          ))}
        </div>
        <select className="field-input max-w-[220px]" aria-label="Filter by location" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
          <option value="">All locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {tab === "levels" && (
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
            <input className="field-input pl-9" placeholder="Search product" aria-label="Search stock" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        )}
      </div>

      {tab === "levels" ? (
        <DataList head={["SKU", "Product", "Location", "Quantity", "Reorder level"]} loading={levels.isLoading} error={levels.error ? errorMessage(levels.error) : undefined}
          onRetry={() => levels.refetch()} isEmpty={!levels.data?.items.length}
          empty={{ title: "No stock recorded", message: "Receive a purchase order or record an adjustment to add stock." }}>
          {levels.data?.items.map((s) => (
            <tr key={`${s.product_id}-${s.location_id}`} className="hover:bg-slate-50">
              <td className="td font-mono text-xs">{s.product_sku}</td>
              <td className="td font-medium text-slate-900">{s.product_name}</td>
              <td className="td">{s.location_name}</td>
              <td className="td">
                <span className={cx("font-semibold", s.quantity <= s.reorder_level ? "text-red-600" : "text-slate-900")}>{s.quantity}</span>{" "}
                {s.quantity <= s.reorder_level && <Badge tone="red">Low</Badge>}
              </td>
              <td className="td">{s.reorder_level}</td>
            </tr>
          ))}
        </DataList>
      ) : (
        <DataList head={["When", "Product", "Location", "Type", "Change", "Balance", "Note"]} loading={moves.isLoading} error={moves.error ? errorMessage(moves.error) : undefined}
          onRetry={() => moves.refetch()} isEmpty={!moves.data?.items.length} empty={{ title: "No movements yet", message: "Every stock change is recorded here." }}>
          {moves.data?.items.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="td whitespace-nowrap text-xs">{dateTime(m.created_at)}</td>
              <td className="td"><span className="font-medium text-slate-900">{m.product_name}</span> <span className="font-mono text-xs text-slate-400">{m.product_sku}</span></td>
              <td className="td">{m.location_code}</td>
              <td className="td"><Badge tone={typeTone[m.type]}>{m.type.replace("_", " ")}</Badge></td>
              <td className={cx("td font-semibold", m.quantity_delta > 0 ? "text-emerald-600" : "text-red-600")}>{m.quantity_delta > 0 ? `+${m.quantity_delta}` : m.quantity_delta}</td>
              <td className="td">{m.quantity_after}</td>
              <td className="td text-slate-500">{m.note ?? "—"}</td>
            </tr>
          ))}
        </DataList>
      )}
      {cur.data && <Pagination page={page} size={SIZE} total={cur.data.total} onPage={setPage} />}
      <Card className="hidden" />
    </>
  );
}
