import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { errorMessage } from "../api/client";
import { useAlerts } from "../api/hooks";
import { Badge, DataList, PageHeader, cx } from "../components/ui";

export default function AlertsPage() {
  const [view, setView] = useState<"total" | "location">("total");
  const { data, isLoading, error, refetch } = useAlerts(view);

  return (
    <>
      <PageHeader title="Low-stock alerts" subtitle="Products at or below their reorder level" />
      <div className="mb-4 inline-flex rounded-lg bg-slate-200/70 p-1" role="tablist">
        {(["total", "location"] as const).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={cx("rounded-md px-3 py-1.5 text-sm font-medium transition", view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
            {v === "total" ? "Total across locations" : "Per location"}
          </button>
        ))}
      </div>
      <DataList
        head={view === "total" ? ["SKU", "Product", "In stock", "Reorder level", "Shortfall"] : ["SKU", "Product", "Location", "In stock", "Reorder level", "Shortfall"]}
        loading={isLoading} error={error ? errorMessage(error) : undefined} onRetry={() => refetch()} isEmpty={!data?.length}
        empty={{ title: "Everything is stocked", message: "No products are at or below their reorder level.", action: <CheckCircle2 className="h-6 w-6 text-emerald-500" /> }}
      >
        {data?.map((a) => (
          <tr key={`${a.product_id}-${a.location_id ?? "t"}`} className="hover:bg-slate-50">
            <td className="td font-mono text-xs">{a.sku}</td>
            <td className="td font-medium text-slate-900">{a.name}</td>
            {view === "location" && <td className="td">{a.location_name}</td>}
            <td className="td font-semibold text-red-600">{a.quantity}</td>
            <td className="td">{a.reorder_level}</td>
            <td className="td"><Badge tone={a.quantity === 0 ? "red" : "amber"}>{Math.max(a.reorder_level - a.quantity, 0)} below</Badge></td>
          </tr>
        ))}
      </DataList>
    </>
  );
}
