import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Alert, ErrorState, PageHeader, Skeleton } from "../components/ui";
import CardForm, { emptyCard } from "../components/CardForm";
import { usePaymentMethod, useUpdatePaymentMethod } from "../hooks/queries";
import { toApiError } from "../lib/api";
import { hasErrors, validateCard } from "../lib/validation";

export default function PaymentMethodPage() {
  const q = usePaymentMethod();
  const update = useUpdatePaymentMethod();
  const [card, setCard] = useState(emptyCard);
  const [errors, setErrors] = useState<ReturnType<typeof validateCard>>({});
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const errs = validateCard(card);
    setErrors(errs);
    if (hasErrors(errs)) return;
    try {
      const pm = await update.mutateAsync(card);
      setCard(emptyCard);
      setMessage({ kind: "success", text: `Saved ${pm.brand} ending ${pm.last4}.` });
    } catch (err) {
      setMessage({ kind: "error", text: toApiError(err).message });
    }
  };

  return (
    <div>
      <PageHeader title="Payment method" subtitle="The card used for renewals and plan changes" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-3">Current card</h3>
          {q.isLoading && <Skeleton className="h-14" />}
          {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}
          {q.isSuccess && (q.data ? (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3" data-testid="payment-method-current">
              <CreditCard className="h-6 w-6 text-slate-400" />
              <div><p className="font-medium capitalize">{q.data.brand}</p><p className="text-slate-500">Ending in {q.data.last4}</p></div>
            </div>
          ) : (
            <p className="text-slate-500" data-testid="payment-method-none">No card on file yet.</p>
          ))}
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          <h3>{q.data ? "Replace card" : "Add a card"}</h3>
          {message && <Alert kind={message.kind}>{message.text}</Alert>}
          <CardForm value={card} onChange={setCard} errors={errors} disabled={update.isPending} />
          <button type="submit" className="btn-primary" disabled={update.isPending} data-testid="payment-method-save">
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save card
          </button>
        </form>
      </div>
    </div>
  );
}
