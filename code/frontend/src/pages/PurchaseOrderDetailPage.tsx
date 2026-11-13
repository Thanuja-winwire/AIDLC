import { ArrowLeft, CheckCircle2, PackageCheck, Pencil, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, dateTime, errorMessage, money } from "../api/client";
import { STOCK_KEYS, useApiMutation, usePurchaseOrder } from "../api/hooks";
import type { PurchaseOrder } from "../api/types";
import { RoleGate } from "../components/RoleGate";
import { Alert, Badge, Button, Card, ConfirmDialog, ErrorState, Modal, PageHeader, Spinner, Table, useToast } from "../components/ui";
import { PurchaseOrderForm, poLabel, poTone } from "./PurchaseOrdersPage";

function ReceiveDialog({ po, open, onClose }: { po: PurchaseOrder; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [qty, setQty] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const receive = useApiMutation(
    (body: { note: string | null; lines: { po_line_id: number; quantity: number }[] }) => api.post(`/purchase-orders/${po.id}/receive`, body),
    ["purchase-orders", ...STOCK_KEYS],
  );

  async function submit() {
    setErr(null);
    const lines: { po_line_id: number; quantity: number }[] = [];
    for (const l of po.lines) {
      const remaining = l.quantity_ordered - l.quantity_received;
      const n = Number(qty[l.id] ?? 0);
      if (!qty[l.id] || n === 0) continue;
      if (!Number.isInteger(n) || n < 1) return setErr(`${l.product_name}: enter a whole number of at least 1`);
      if (n > remaining) return setErr(`${l.product_name}: only ${remaining} left to receive`);
      lines.push({ po_line_id: l.id, quantity: n });
    }
    if (!lines.length) return setErr("Enter a quantity for at least one line");
    try {
      await receive.mutateAsync({ note: note || null, lines });
      toast.success("Stock received");
      setQty({}); setNote("");
      onClose();
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <Modal title={`Receive ${po.number}`} open={open} onClose={onClose} wide>
      {err && <div className="mb-3"><Alert>{err}</Alert></div>}
      <div className="space-y-2">
        {po.lines.map((l) => {
          const remaining = l.quantity_ordered - l.quantity_received;
          return (
            <div key={l.id} className="grid grid-cols-[1fr_auto_110px] items-center gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{l.product_name}</p>
                <p className="text-xs text-slate-500">{l.product_sku} · received {l.quantity_received} of {l.quantity_ordered}</p>
              </div>
              <Badge tone={remaining ? "amber" : "green"}>{remaining} left</Badge>
              <input className="field-input" type="number" min="0" max={remaining} step="1" disabled={remaining === 0} placeholder="0"
                aria-label={`Receive quantity for ${l.product_name}`} value={qty[l.id] ?? ""} onChange={(e) => setQty({ ...qty, [l.id]: e.target.value })} />
            </div>
          );
        })}
      </div>
      <div className="mt-3"><label className="field-label" htmlFor="rcv-note">Note</label><input id="rcv-note" className="field-input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={receive.isPending} onClick={submit}>Receive stock</Button>
      </div>
    </Modal>
  );
}

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const poId = Number(id);
  const toast = useToast();
  const { data: po, isLoading, error, refetch } = usePurchaseOrder(poId);
  const [editing, setEditing] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const approve = useApiMutation(() => api.post(`/purchase-orders/${poId}/approve`), ["purchase-orders", "dashboard"]);
  const cancel = useApiMutation(() => api.post(`/purchase-orders/${poId}/cancel`), ["purchase-orders", "dashboard"]);

  if (isLoading) return <Spinner />;
  if (error || !po) return <Card><ErrorState message={error ? errorMessage(error) : "Purchase order not found"} onRetry={() => refetch()} /></Card>;

  const canReceive = po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED";
  const canCancel = po.status === "DRAFT" || po.status === "APPROVED" || po.status === "PARTIALLY_RECEIVED";

  async function run(fn: () => Promise<unknown>, ok: string) {
    setErr(null);
    try { await fn(); toast.success(ok); } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <>
      <Link to="/purchase-orders" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Purchase orders</Link>
      <PageHeader
        title={po.number} subtitle={`${po.supplier_name} → ${po.destination_location_name}`}
        actions={
          <>
            <Badge tone={poTone[po.status]}>{poLabel(po.status)}</Badge>
            <RoleGate>
              {po.status === "DRAFT" && <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>}
              {po.status === "DRAFT" && <Button loading={approve.isPending} onClick={() => run(() => approve.mutateAsync(undefined), "Purchase order approved")}><CheckCircle2 className="h-4 w-4" /> Approve</Button>}
              {canCancel && <Button variant="danger" onClick={() => setCancelling(true)}><XCircle className="h-4 w-4" /> Cancel order</Button>}
            </RoleGate>
            {canReceive && <Button onClick={() => setReceiving(true)}><PackageCheck className="h-4 w-4" /> Receive</Button>}
          </>
        }
      />
      {err && <div className="mb-4"><Alert>{err}</Alert></div>}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <Table head={["Product", "Ordered", "Received", "Unit cost", "Line total"]}>
            <tbody className="divide-y divide-slate-100">
              {po.lines.map((l) => (
                <tr key={l.id}>
                  <td className="td"><span className="font-medium text-slate-900">{l.product_name}</span> <span className="font-mono text-xs text-slate-400">{l.product_sku}</span></td>
                  <td className="td">{l.quantity_ordered}</td>
                  <td className="td">{l.quantity_received}</td>
                  <td className="td">{money(l.unit_cost)}</td>
                  <td className="td">{money(Number(l.unit_cost) * l.quantity_ordered)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card className="p-5">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">Total</dt><dd className="text-xl font-semibold text-slate-900">{money(po.total_amount)}</dd></div>
            <div><dt className="text-slate-500">Created</dt><dd>{dateTime(po.created_at)}</dd></div>
            {po.approved_at && <div><dt className="text-slate-500">Approved</dt><dd>{dateTime(po.approved_at)}</dd></div>}
            {po.cancelled_at && <div><dt className="text-slate-500">Cancelled</dt><dd>{dateTime(po.cancelled_at)}</dd></div>}
            {po.notes && <div><dt className="text-slate-500">Notes</dt><dd className="whitespace-pre-wrap">{po.notes}</dd></div>}
          </dl>
        </Card>
      </div>
      <ReceiveDialog po={po} open={receiving} onClose={() => setReceiving(false)} />
      <Modal title={`Edit ${po.number}`} open={editing} onClose={() => setEditing(false)} wide>
        {editing && <PurchaseOrderForm existing={po} onDone={() => setEditing(false)} />}
      </Modal>
      <ConfirmDialog
        open={cancelling} danger title="Cancel purchase order" confirmLabel="Cancel order" loading={cancel.isPending}
        message={po.status === "DRAFT" ? "This draft will be cancelled." : "Cancelling stops further receiving. Stock already received is kept."}
        onClose={() => setCancelling(false)}
        onConfirm={async () => { await run(() => cancel.mutateAsync(undefined), "Purchase order cancelled"); setCancelling(false); }}
      />
    </>
  );
}
