import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Alert, EmptyState, ErrorState, PageHeader, Skeleton, StatusBadge } from "../components/ui";
import CancelDialog from "../components/CancelDialog";
import { useRenew, useSubscription, useUndoCancel } from "../hooks/queries";
import { toApiError } from "../lib/api";
import { daysUntil, formatDate, formatMoney, intervalLabel } from "../lib/format";

export default function MySubscriptionPage() {
  const sub = useSubscription();
  const renew = useRenew();
  const undo = useUndoCancel();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setMessage(null);
    try { await fn(); setMessage({ kind: "success", text: ok }); }
    catch (e) { setMessage({ kind: "error", text: toApiError(e).message }); }
  };

  if (sub.isLoading) return <div><PageHeader title="My subscription" /><Skeleton className="h-56" /></div>;
  if (sub.isError) return <div><PageHeader title="My subscription" /><div className="card"><ErrorState message={toApiError(sub.error).message} onRetry={() => sub.refetch()} /></div></div>;

  const s = sub.data;
  const live = s && (s.status === "active" || s.status === "past_due");

  if (!s || !live) {
    return (
      <div>
        <PageHeader title="My subscription" />
        {message && <div className="mb-4"><Alert kind={message.kind}>{message.text}</Alert></div>}
        <div className="card">
          <EmptyState
            title={s ? `Your subscription is ${s.status}` : "No active subscription"}
            message="Pick a plan to get started."
            action={<Link to="/plans" className="btn-primary" data-testid="subscription-browse-plans">Browse plans</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My subscription" subtitle="Your current plan and billing cycle" />
      {message && <div className="mb-4" data-testid="subscription-message"><Alert kind={message.kind}>{message.text}</Alert></div>}
      {s.status === "past_due" && (
        <div className="mb-4"><Alert kind="warning">
          Your last renewal payment failed (attempt {s.renewal_attempts}). Update your payment method, then choose Renew now.
        </Alert></div>
      )}
      {s.cancel_at_period_end && (
        <div className="mb-4"><Alert kind="info">
          Scheduled to cancel on {formatDate(s.current_period_end)}. You keep access until then.
        </Alert></div>
      )}
      <div className="card p-6" data-testid="subscription-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><h2>{s.plan.name}</h2><StatusBadge status={s.status} /></div>
            <p className="mt-1 text-slate-500">{s.plan.description}</p>
          </div>
          <p className="text-2xl font-semibold">
            {formatMoney(s.price_at_subscription)}<span className="text-sm font-normal text-slate-500"> / {intervalLabel(s.plan.interval)}</span>
          </p>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div><dt className="label">Current period</dt><dd>{formatDate(s.current_period_start)} – {formatDate(s.current_period_end)}</dd></div>
          <div><dt className="label">{s.cancel_at_period_end ? "Ends in" : "Renews in"}</dt><dd data-testid="subscription-days-left">{daysUntil(s.current_period_end)} days</dd></div>
          <div><dt className="label">Member since</dt><dd>{formatDate(s.created_at)}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Link to="/plans" className="btn-secondary" data-testid="subscription-change-plan">Change plan</Link>
          <button className="btn-secondary" data-testid="subscription-renew" disabled={renew.isPending}
            onClick={() => run(() => renew.mutateAsync(), "Renewal successful.")}>
            {renew.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Renew now
          </button>
          <Link to="/payment-method" className="btn-secondary" data-testid="subscription-update-card">Update payment method</Link>
          {s.cancel_at_period_end ? (
            <button className="btn-secondary" data-testid="subscription-undo-cancel" disabled={undo.isPending}
              onClick={() => run(() => undo.mutateAsync(), "Cancellation undone.")}>Undo cancellation</button>
          ) : (
            <button className="btn-danger ml-auto" data-testid="subscription-cancel" onClick={() => setCancelOpen(true)}>Cancel subscription</button>
          )}
        </div>
      </div>
      <CancelDialog open={cancelOpen} periodEnd={s.current_period_end} onClose={() => setCancelOpen(false)}
        onDone={() => { setCancelOpen(false); setMessage({ kind: "success", text: "Your cancellation was recorded." }); }} />
    </div>
  );
}
