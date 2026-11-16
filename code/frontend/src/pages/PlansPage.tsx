import { useState } from "react";
import { Check } from "lucide-react";
import { Alert, EmptyState, ErrorState, PageHeader, Skeleton } from "../components/ui";
import SubscribeDialog from "../components/SubscribeDialog";
import ConfirmPlanChangeDialog from "../components/ConfirmPlanChangeDialog";
import { usePlans, useSubscription } from "../hooks/queries";
import { formatMoney, intervalLabel } from "../lib/format";
import { toApiError } from "../lib/api";
import type { Plan } from "../types";

export default function PlansPage() {
  const plans = usePlans();
  const sub = useSubscription();
  const [subscribing, setSubscribing] = useState<Plan | null>(null);
  const [changing, setChanging] = useState<Plan | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const current = sub.data && (sub.data.status === "active" || sub.data.status === "past_due") ? sub.data : null;

  const action = (p: Plan) => {
    if (current?.plan.id === p.id) return <button className="btn-secondary w-full" disabled data-testid={`plan-current-${p.id}`}>Current plan</button>;
    if (current) {
      const label = Number(p.price) > Number(current.plan.price) ? "Upgrade" : "Switch plan";
      return <button className="btn-primary w-full" data-testid={`plan-change-${p.id}`} onClick={() => setChanging(p)}>{label}</button>;
    }
    return <button className="btn-primary w-full" data-testid={`plan-subscribe-${p.id}`} onClick={() => setSubscribing(p)}>Subscribe</button>;
  };

  return (
    <div>
      <PageHeader title="Plans" subtitle="Choose the plan that fits. Upgrade or cancel any time." />
      {notice && <div className="mb-4"><Alert kind="success">{notice}</Alert></div>}
      {sub.data?.status === "past_due" && (
        <div className="mb-4"><Alert kind="warning">Your last payment failed. Update your payment method on the My subscription page.</Alert></div>
      )}
      {plans.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      )}
      {plans.isError && <div className="card"><ErrorState message={toApiError(plans.error).message} onRetry={() => plans.refetch()} /></div>}
      {plans.data && plans.data.length === 0 && <div className="card"><EmptyState title="No plans available" message="Please check back soon." /></div>}
      {plans.data && plans.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="plans-grid">
          {plans.data.map((p) => (
            <div key={p.id} data-testid={`plan-card-${p.id}`}
              className={`card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md ${current?.plan.id === p.id ? "ring-2 ring-brand-500" : ""}`}>
              <h3>{p.name}</h3>
              <p className="mt-1 min-h-[2.5rem] text-slate-500">{p.description}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {formatMoney(p.price)}<span className="text-sm font-normal text-slate-500"> / {intervalLabel(p.interval)}</span>
              </p>
              <ul className="my-5 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-slate-600"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{f}</li>
                ))}
              </ul>
              {action(p)}
            </div>
          ))}
        </div>
      )}
      <SubscribeDialog plan={subscribing} onClose={() => setSubscribing(null)}
        onDone={() => { setNotice(`You are now subscribed to ${subscribing?.name}.`); setSubscribing(null); }} />
      <ConfirmPlanChangeDialog plan={changing} onClose={() => setChanging(null)}
        onDone={() => { setNotice(`Your plan was changed to ${changing?.name}.`); setChanging(null); }} />
    </div>
  );
}
