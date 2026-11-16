import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, Modal } from "./ui";
import CardForm, { emptyCard } from "./CardForm";
import { usePaymentMethod, useSubscribe } from "../hooks/queries";
import { hasErrors, validateCard } from "../lib/validation";
import { formatMoney, intervalLabel } from "../lib/format";
import { toApiError } from "../lib/api";
import type { Plan } from "../types";

interface Props { plan: Plan | null; onClose: () => void; onDone: () => void }

export default function SubscribeDialog({ plan, onClose, onDone }: Props) {
  const method = usePaymentMethod();
  const subscribe = useSubscribe();
  const [card, setCard] = useState(emptyCard);
  const [useSaved, setUseSaved] = useState(true);
  const [errors, setErrors] = useState<ReturnType<typeof validateCard>>({});
  const [error, setError] = useState<string | null>(null);

  const saved = method.data ?? null;
  const needCard = !saved || !useSaved;

  const close = () => { setError(null); setErrors({}); setCard(emptyCard); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setError(null);
    if (needCard) {
      const errs = validateCard(card);
      setErrors(errs);
      if (hasErrors(errs)) return;
    }
    try {
      await subscribe.mutateAsync({ plan_id: plan.id, card: needCard ? card : undefined });
      setCard(emptyCard);
      onDone();
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <Modal open={!!plan} title={plan ? `Subscribe to ${plan.name}` : "Subscribe"} onClose={close} testid="subscribe-dialog">
      {plan && (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-600">You will be charged now and then every {intervalLabel(plan.interval)}.</p>
            <p className="mt-1 text-xl font-semibold" data-testid="subscribe-dialog-total">
              {formatMoney(plan.price)} <span className="text-sm font-normal text-slate-500">/ {intervalLabel(plan.interval)}</span>
            </p>
          </div>
          {saved && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" data-testid="subscribe-use-saved" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} />
              Use saved card ({saved.brand} ending {saved.last4})
            </label>
          )}
          {needCard && <CardForm value={card} onChange={setCard} errors={errors} disabled={subscribe.isPending} />}
          {error && <Alert kind="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={close} data-testid="subscribe-cancel">Cancel</button>
            <button type="submit" className="btn-primary" disabled={subscribe.isPending} data-testid="subscribe-confirm">
              {subscribe.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Pay {formatMoney(plan.price)}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
