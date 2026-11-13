import { Download } from "lucide-react";
import { useState } from "react";
import { api, errorMessage, money } from "../api/client";
import { useLocations, useSalesReport, useTopProducts } from "../api/hooks";
import { Alert, Button, Card, DataList, ErrorState, Input, PageHeader, Select, cx, useToast } from "../components/ui";

type Group = "product" | "category" | "day" | "month";

function BarChart({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2" aria-label="Revenue chart">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[140px_1fr_90px] items-center gap-3 text-sm">
          <span className="truncate text-slate-600" title={r.label}>{r.label}</span>
          <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <span className="text-right font-medium text-slate-800">{money(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsPage() {
  const toast = useToast();
  const [group, setGroup] = useState<Group>("product");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [location, setLocation] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState<string | null>(null);
  const { data: locations = [] } = useLocations();

  const params = { group_by: group, date_from: from, date_to: to, location_id: location };
  const report = useSalesReport(params);
  const top = useTopProducts({ date_from: from, date_to: to, location_id: location, limit: 5 });
  const invalidRange = !!from && !!to && from > to;

  async function exportCsv() {
    setExportErr(null);
    setExporting(true);
    try {
      const res = await api.get("/reports/sales/export", { params: Object.fromEntries(Object.entries(params).filter(([, v]) => v)), responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url; a.download = `sales-by-${group}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch (x) { setExportErr(errorMessage(x)); } finally { setExporting(false); }
  }

  const rows = report.data?.rows ?? [];

  return (
    <>
      <PageHeader title="Sales reports" subtitle="Revenue, cost and margin" actions={<Button variant="secondary" loading={exporting} disabled={invalidRange} onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>} />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Group by" value={group} onChange={(e) => setGroup(e.target.value as Group)}>
            <option value="product">Product</option><option value="category">Category</option><option value="day">Day</option><option value="month">Month</option>
          </Select>
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} error={invalidRange ? "End date is before the start date" : undefined} />
          <Select label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All locations</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        </div>
      </Card>
      {exportErr && <div className="mb-4"><Alert>{exportErr}</Alert></div>}

      {report.data && (
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          {[["Revenue", report.data.total_revenue, "text-slate-900"], ["Cost", report.data.total_cost, "text-slate-900"], ["Margin", report.data.total_margin, Number(report.data.total_margin) >= 0 ? "text-emerald-600" : "text-red-600"]].map(([l, v, c]) => (
            <Card key={l} className="p-5"><p className="text-sm text-slate-500">{l}</p><p className={cx("mt-1 text-2xl font-semibold", c)}>{money(v)}</p></Card>
          ))}
        </div>
      )}

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Revenue by {group}</h2>
          {report.error ? <ErrorState message={errorMessage(report.error)} onRetry={() => report.refetch()} /> : rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No sales in this period.</p> : <BarChart rows={rows.slice(0, 8).map((r) => ({ label: r.group, value: Number(r.revenue) }))} />}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Top 5 products</h2>
          {top.error ? <ErrorState message={errorMessage(top.error)} onRetry={() => top.refetch()} /> : !top.data?.length ? <p className="py-6 text-center text-sm text-slate-500">No sales in this period.</p> : <BarChart rows={top.data.map((t) => ({ label: t.name, value: Number(t.revenue) }))} />}
        </Card>
      </div>

      <DataList
        head={["Group", "Orders", "Units", "Revenue", "Cost", "Margin"]} loading={report.isLoading} error={report.error ? errorMessage(report.error) : undefined}
        onRetry={() => report.refetch()} isEmpty={!rows.length} empty={{ title: "No data", message: "Adjust the filters or record some sales." }}
      >
        {rows.map((r) => (
          <tr key={r.group} className="hover:bg-slate-50">
            <td className="td font-medium text-slate-900">{r.group}</td>
            <td className="td">{r.orders}</td>
            <td className="td">{r.units}</td>
            <td className="td">{money(r.revenue)}</td>
            <td className="td">{money(r.cost)}</td>
            <td className={cx("td font-semibold", Number(r.margin) >= 0 ? "text-emerald-600" : "text-red-600")}>{money(r.margin)}</td>
          </tr>
        ))}
      </DataList>
    </>
  );
}
