import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Modal, Skeleton } from "./ui";
import { useChangePlan } from "../hooks/queries";
import { api, toApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { Plan } from "../types";

interface Props { plan: Plan | null; onClose: () => void; onDone: () => void }

/** The amount shown is always the backend's preview; the frontend never computes proration. */
export default function ConfirmPlanChangeDialog({ plan, onClose, onDone }: Props) {
  const change = useChangePlan();
  const [error, setError] = useState<string | null>(null);
  const preview = useQuery({
    queryKey: ["change-preview", plan?.id],
    queryFn: () => api.changePreview(plan!.id),
    enabled: !!plan,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => { if (!plan) setError(null); }, [plan]);

  const confirm = async () => {
    if (!plan) return;
    setError(null);
    try { await change.mutateAsync(plan.id); onDone(); }
    catch (e) { setError(toApiError(e).message); }
  };

  const p = preview.data;
  const title = p?.kind === "downgrade" ? "Confirm downgrade" : "Confirm plan change";

  return (
    <Modal open={!!plan} title={title} onClose={onClose} testid="plan-change-dialog">
      {preview.isLoading && <div className="space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-16 w-full" /></div>}
      {preview.isError && <Alert kind="error">{toApiError(preview.error).message}</Alert>}
      {p && plan && (
        <div className="space-y-4">
          <p className="text-slate-600">{p.explanation}</p>
          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
            <div className="flex justify-between px-3 py-2"><dt className="text-slate-500">New plan</dt><dd className="font-medium">{p.new_plan.name}</dd></div>
            <div className="flex justify-between px-3 py-2"><dt className="text-slate-500">New price</dt><dd className="font-medium">{formatMoney(p.new_price)}</dd></div>
            <div className="flex justify-between px-3 py-2"><dt className="text-slate-500">Next renewal</dt><dd className="font-medium">{formatDate(p.new_period_end)}</dd></div>
            <div className="flex justify-between bg-slate-50 px-3 py-2">
              <dt className="font-medium">Due now</dt>
              <dd className="font-semibold" data-testid="plan-change-amount">{formatMoney(p.amount_due_now)}</dd>
            </div>
          </dl>
          {error && <Alert kind="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={onClose} data-testid="plan-change-cancel">Keep current plan</button>
            <button className="btn-primary" onClick={confirm} disabled={change.isPending} data-testid="plan-change-confirm">
              {change.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Confirm
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
