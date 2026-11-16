import axios, { AxiosError } from "axios";
import type {
  AnalyticsSummary, ApiErrorBody, Card, ChangePreview, Customer, Invoice, Page, Payment,
  PaymentMethod, Plan, PlanInput, PlanSubscribers, RevenuePoint, Subscription, TokenResponse, User,
} from "../types";

export const TOKEN_KEY = "sub_token";
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) { onUnauthorized = fn; }

http.interceptors.response.use(
  (r) => r,
  (err: AxiosError<ApiErrorBody>) => {
    const isAuthCall = err.config?.url?.startsWith("/auth/login");
    if (err.response?.status === 401 && !isAuthCall) onUnauthorized?.();
    return Promise.reject(err);
  },
);

export class ApiError extends Error {
  constructor(public code: string, message: string, public status?: number, public details?: unknown) {
    super(message);
  }
}

export function toApiError(e: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorBody>(e)) {
    const body = e.response?.data?.error;
    if (body) return new ApiError(body.code, body.message, e.response?.status, body.details);
    // FastAPI request-validation fallback
    if (e.response?.status === 422) return new ApiError("validation_error", "Please check the form values.", 422);
    if (!e.response) return new ApiError("network_error", "Cannot reach the server. Please try again.");
  }
  return new ApiError("unknown", e instanceof Error ? e.message : "Something went wrong.");
}

async function call<T>(p: Promise<{ data: T }>): Promise<T> {
  try { return (await p).data; } catch (e) { throw toApiError(e); }
}

export const api = {
  // auth
  register: (b: { email: string; password: string; name: string }) => call<{ user: User } | User>(http.post("/auth/register", b)),
  login: (b: { email: string; password: string }) => call<TokenResponse>(http.post("/auth/login", b)),
  me: () => call<User>(http.get("/auth/me")),
  // plans
  plans: () => call<Plan[]>(http.get("/plans")),
  // subscriptions
  currentSubscription: () => call<Subscription | null>(http.get("/subscriptions/current")),
  subscribe: (b: { plan_id: number; card?: Card }) => call<Subscription>(http.post("/subscriptions", b)),
  changePreview: (plan_id: number) => call<ChangePreview>(http.get("/subscriptions/change-preview", { params: { plan_id } })),
  changePlan: (plan_id: number) => call<Subscription>(http.post("/subscriptions/change", { plan_id })),
  renew: () => call<Subscription>(http.post("/subscriptions/renew")),
  cancel: (mode: "period_end" | "immediate") => call<Subscription>(http.post("/subscriptions/cancel", { mode })),
  undoCancel: () => call<Subscription>(http.post("/subscriptions/cancel/undo")),
  // billing
  invoices: (page = 1, page_size = 10) => call<Page<Invoice>>(http.get("/invoices", { params: { page, page_size } })),
  invoice: (id: number) => call<Invoice>(http.get(`/invoices/${id}`)),
  invoicePdf: async (id: number): Promise<Blob> => {
    try { return (await http.get(`/invoices/${id}/pdf`, { responseType: "blob" })).data; }
    catch (e) { throw toApiError(e); }
  },
  payments: (page = 1, page_size = 10) => call<Page<Payment>>(http.get("/payments", { params: { page, page_size } })),
  paymentMethod: () => call<PaymentMethod | null>(http.get("/payment-method")),
  updatePaymentMethod: (card: Card) => call<PaymentMethod>(http.put("/payment-method", { card })),
  // admin
  adminSummary: (p: { from?: string; to?: string }) => call<AnalyticsSummary>(http.get("/admin/analytics/summary", { params: p })),
  adminRevenue: (p: { from?: string; to?: string; group_by?: "day" | "month" }) => call<RevenuePoint[]>(http.get("/admin/analytics/revenue", { params: p })),
  adminPlanBreakdown: () => call<PlanSubscribers[]>(http.get("/admin/analytics/plans")),
  adminPlans: () => call<Plan[]>(http.get("/admin/plans")),
  adminCreatePlan: (b: PlanInput) => call<Plan>(http.post("/admin/plans", b)),
  adminUpdatePlan: (id: number, b: Partial<PlanInput>) => call<Plan>(http.put(`/admin/plans/${id}`, b)),
  adminDeactivatePlan: (id: number) => call<Plan>(http.post(`/admin/plans/${id}/deactivate`)),
  adminCustomers: (q: string | undefined, page = 1) => call<Page<Customer>>(http.get("/admin/customers", { params: { q: q || undefined, page } })),
  adminRenew: (subId: number) => call<Subscription>(http.post(`/admin/subscriptions/${subId}/renew`)),
  adminInvoices: (p: { status?: string; user_id?: number; page?: number }) => call<Page<Invoice>>(http.get("/admin/invoices", { params: p })),
  adminPayments: (p: { status?: string; user_id?: number; page?: number }) => call<Page<Payment>>(http.get("/admin/payments", { params: p })),
};
