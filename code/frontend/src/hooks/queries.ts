import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Card } from "../types";

export const keys = {
  plans: ["plans"] as const,
  subscription: ["subscription"] as const,
  invoices: (page: number) => ["invoices", page] as const,
  invoice: (id: number) => ["invoice", id] as const,
  payments: (page: number) => ["payments", page] as const,
  paymentMethod: ["payment-method"] as const,
};

export const usePlans = () => useQuery({ queryKey: keys.plans, queryFn: api.plans });
export const useSubscription = () => useQuery({ queryKey: keys.subscription, queryFn: api.currentSubscription });
export const useInvoices = (page: number) => useQuery({ queryKey: keys.invoices(page), queryFn: () => api.invoices(page) });
export const useInvoice = (id: number) => useQuery({ queryKey: keys.invoice(id), queryFn: () => api.invoice(id) });
export const usePayments = (page: number) => useQuery({ queryKey: keys.payments(page), queryFn: () => api.payments(page) });
export const usePaymentMethod = () => useQuery({ queryKey: keys.paymentMethod, queryFn: api.paymentMethod });

/** Invalidate everything a billing action can change. */
function useInvalidateBilling() {
  const qc = useQueryClient();
  return () => {
    for (const k of ["subscription", "invoices", "invoice", "payments", "payment-method"]) {
      qc.invalidateQueries({ queryKey: [k] });
    }
  };
}

export function useSubscribe() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: (b: { plan_id: number; card?: Card }) => api.subscribe(b), onSettled: done });
}
export function useChangePlan() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: (plan_id: number) => api.changePlan(plan_id), onSettled: done });
}
export function useRenew() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: () => api.renew(), onSettled: done });
}
export function useCancel() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: (mode: "period_end" | "immediate") => api.cancel(mode), onSettled: done });
}
export function useUndoCancel() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: () => api.undoCancel(), onSettled: done });
}
export function useUpdatePaymentMethod() {
  const done = useInvalidateBilling();
  return useMutation({ mutationFn: (card: Card) => api.updatePaymentMethod(card), onSettled: done });
}
