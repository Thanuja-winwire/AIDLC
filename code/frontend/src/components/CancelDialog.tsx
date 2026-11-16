import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, Modal } from "./ui";
import { useCancel } from "../hooks/queries";
import { toApiError } from "../lib/api";
import { formatDate } from "../lib/format";

interface Props { open: boolean; periodEnd: string; onClose: () => void; onDone: () => void }

export default function CancelDialog({ open, periodEnd, onClose, onDone }: Props) {
  const cancel = useCancel();
  const [mode, setMode] = useState<"period_end" | "immediate">("period_end");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try { await cancel.mutateAsync(mode); onDone(); }
    catch (e) { setError(toApiError(e).message); }
  };

  const opt = (value: "period_end" | "immediate", title: string, text: string) => (
    <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${mode === value ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}>
      <input type="radio" name="cancel-mode" data-testid={`cancel-mode-${value}`} checked={mode === value} onChange={() => setMode(value)} />
      <span><span className="block font-medium">{title}</span><span className="text-slate-500">{text}</span></span>
    </label>
  );

  return (
    <Modal open={open} title="Cancel subscription" onClose={onClose} testid="cancel-dialog">
      <div className="space-y-3">
        {opt("period_end", "Cancel at period end", `Keep access until ${formatDate(periodEnd)}. You can undo this before then.`)}
        {opt("immediate", "Cancel immediately", "Access ends now. No refund is issued.")}
        {error && <Alert kind="error">{error}</Alert>}
        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-secondary" onClick={onClose} data-testid="cancel-dialog-back">Keep subscription</button>
          <button className="btn-danger" onClick={submit} disabled={cancel.isPending} data-testid="cancel-dialog-confirm">
            {cancel.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Cancel subscription
          </button>
        </div>
      </div>
    </Modal>
  );
}
