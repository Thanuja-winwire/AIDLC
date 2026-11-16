// Mirrors the backend schemas. Money values arrive as strings with 2 decimals.
export type Role = "customer" | "admin";

export interface User { id: number; email: string; name: string; role: Role }
export interface TokenResponse { access_token: string; token_type: string; user: User }

export type Interval = "monthly" | "yearly";
export interface Plan {
  id: number; name: string; description: string; price: string;
  interval: Interval; features: string[]; is_active: boolean;
}
export interface PlanInput {
  name: string; description: string; price: string; interval: Interval; features: string[];
}

export interface Card { number: string; expiry: string; cvc: string; name?: string }
export interface PaymentMethod { brand: string; last4: string }

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired";
export interface Subscription {
  id: number; status: SubscriptionStatus; plan: Plan;
  current_period_start: string; current_period_end: string;
  cancel_at_period_end: boolean; cancelled_at: string | null;
  renewal_attempts: number; price_at_subscription: string; created_at: string;
}

export interface ChangePreview {
  kind: "upgrade" | "downgrade" | "interval_change";
  amount_due_now: string; new_plan: Plan; new_price: string;
  new_period_end: string; explanation: string;
}

export interface InvoiceLine { id: number; description: string; amount: string }
export interface Payment {
  id: number; invoice_id: number; invoice_number: string | null; user_id: number;
  amount: string; status: string; gateway_reference: string | null;
  failure_reason: string | null; attempted_at: string;
}
export interface Invoice {
  id: number; number: string | null; user_id: number; subscription_id: number;
  type: string; status: string; amount: string;
  period_start: string; period_end: string; issued_at: string; paid_at: string | null;
  lines: InvoiceLine[]; payments: Payment[]; customer_email: string | null;
}

export interface Page<T> { items: T[]; total: number; page: number; page_size: number }

export interface Customer {
  id: number; email: string; name: string; created_at: string; subscription: Subscription | null;
}
export interface AnalyticsSummary {
  mrr: string; active_subscriptions: number; new_subscriptions: number; cancellations: number;
  churn_rate: number; failed_payments: number; period_start: string; period_end: string;
}
export interface RevenuePoint { period: string; revenue: string }
export interface PlanSubscribers { plan_id: number; plan_name: string; subscribers: number }

export interface ApiErrorBody { error: { code: string; message: string; details?: unknown } }
