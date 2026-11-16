import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power } from "lucide-react";
import { Alert, EmptyState, ErrorState, Field, Modal, PageHeader, Skeleton, StatusBadge } from "../../components/ui";
import { api, toApiError } from "../../lib/api";
import { formatMoney, intervalLabel } from "../../lib/format";
import type { Interval, Plan, PlanInput } from "../../types";

interface FormState { name: string; description: string; price: string; interval: Interval; features: string }
const EMPTY: FormState = { name: "", description: "", price: "", interval: "monthly", features: "" };

function PlanDialog({ plan, open, onClose }: { plan: Plan | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(
    plan ? { name: plan.name, description: plan.description, price: plan.price, interval: plan.interval, features: plan.features.join("\n") } : EMPTY,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (b: PlanInput) => (plan ? api.adminUpdatePlan(plan.id, b) : api.adminCreatePlan(b)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
      onClose();
    },
    onError: (e) => setServerError(toApiError(e).message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0) errs.price = "Enter a valid price.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setServerError(null);
    save.mutate({
      name: form.name.trim(), description: form.description.trim(), price: price.toFixed(2),
      interval: form.interval, features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={plan ? "Edit plan" : "New plan"} testid="plan-dialog">
      <form onSubmit={submit} className="space-y-3" noValidate>
        <Field label="Name" error={errors.name} htmlFor="plan-name">
          <input id="plan-name" data-testid="plan-input-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description" htmlFor="plan-desc">
          <input id="plan-desc" data-testid="plan-input-description" className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (USD)" error={errors.price} htmlFor="plan-price">
            <input id="plan-price" data-testid="plan-input-price" className="input" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Interval" htmlFor="plan-interval">
            <select id="plan-interval" data-testid="plan-input-interval" className="input" value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value as Interval })}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
        </div>
        <Field label="Features (one per line)" htmlFor="plan-features">
          <textarea id="plan-features" data-testid="plan-input-features" rows={4} className="input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
        </Field>
        {plan && <p className="text-xs text-slate-500">Existing subscribers keep the price they subscribed at.</p>}
        {serverError && <Alert kind="error">{serverError}</Alert>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" data-testid="plan-save" className="btn-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save plan"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-plans"], queryFn: api.adminPlans });
  const [editing, setEditing] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivate = useMutation({
    mutationFn: (id: number) => api.adminDeactivatePlan(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-plans"] }); qc.invalidateQueries({ queryKey: ["plans"] }); },
    onError: (e) => setError(toApiError(e).message),
  });

  const openDialog = (p: Plan | null) => { setEditing(p); setOpen(true); };

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Create and manage subscription plans"
        action={<button data-testid="plan-new" className="btn-primary" onClick={() => openDialog(null)}><Plus className="h-4 w-4" /> New plan</button>}
      />
      {error && <div className="mb-4"><Alert kind="error">{error}</Alert></div>}
      <div className="card overflow-hidden">
        {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}
        {q.data && q.data.length === 0 && <EmptyState title="No plans yet" message="Create your first plan to start selling." />}
        {q.data && q.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="admin-plan-table">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><th className="th">Name</th><th className="th">Price</th><th className="th">Status</th><th className="th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {q.data.map((p) => (
                  <tr key={p.id} data-testid={`admin-plan-row-${p.id}`} className="hover:bg-slate-50">
                    <td className="td"><div className="font-medium text-slate-900">{p.name}</div><div className="text-xs text-slate-500">{p.description}</div></td>
                    <td className="td">{formatMoney(p.price)} / {intervalLabel(p.interval)}</td>
                    <td className="td"><StatusBadge status={p.is_active ? "active" : "cancelled"} /></td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <button data-testid={`plan-edit-${p.id}`} className="btn-secondary px-3 py-1" onClick={() => openDialog(p)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                        {p.is_active && (
                          <button data-testid={`plan-deactivate-${p.id}`} className="btn-secondary px-3 py-1" disabled={deactivate.isPending} onClick={() => { setError(null); deactivate.mutate(p.id); }}>
                            <Power className="h-3.5 w-3.5" /> Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {open && <PlanDialog key={editing?.id ?? "new"} plan={editing} open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
