// Mirrors the backend Pydantic schemas (read from code/backend/app/schemas/*). Decimals arrive as strings.
export type Role = "ADMIN" | "STAFF";

export interface Page<T> { items: T[]; total: number; page: number; size: number }

export interface User { id: number; email: string; full_name: string; role: Role; is_active: boolean; last_login_at: string | null }
export interface TokenResponse { access_token: string; token_type: string; user: User }

export interface Category { id: number; name: string; description: string | null }
export interface Product {
  id: number; sku: string; name: string; description: string | null; category_id: number | null;
  category_name: string | null; unit_of_measure: string; unit_cost: string; sale_price: string;
  reorder_level: number; is_active: boolean; total_stock: number; created_at: string;
}
export interface ProductInput {
  sku?: string; name: string; description?: string | null; category_id?: number | null; unit_of_measure: string;
  unit_cost: number; sale_price: number; reorder_level: number; is_active?: boolean;
}

export interface Location { id: number; code: string; name: string; address: string | null; is_active: boolean }
export interface StockLevel {
  product_id: number; product_sku: string; product_name: string; location_id: number; location_code: string;
  location_name: string; quantity: number; reorder_level: number;
}
export type MovementType = "PO_RECEIPT" | "SALE" | "TRANSFER_OUT" | "TRANSFER_IN" | "ADJUSTMENT";
export interface Movement {
  id: number; product_id: number; product_sku: string; product_name: string; location_id: number; location_code: string;
  type: MovementType; quantity_delta: number; quantity_after: number; reference_type: string | null;
  reference_id: number | null; note: string | null; user_id: number | null; created_at: string;
}

export interface Supplier {
  id: number; name: string; contact_person: string | null; email: string | null; phone: string | null;
  address: string | null; is_active: boolean;
}

export type POStatus = "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
export interface POLine {
  id: number; product_id: number; product_sku: string; product_name: string; quantity_ordered: number;
  quantity_received: number; unit_cost: string;
}
export interface PurchaseOrder {
  id: number; number: string; supplier_id: number; supplier_name: string; destination_location_id: number;
  destination_location_name: string; status: POStatus; notes: string | null; total_amount: string; created_by: number;
  approved_by: number | null; approved_at: string | null; cancelled_at: string | null; created_at: string; lines: POLine[];
}
export interface POLineInput { product_id: number; quantity_ordered: number; unit_cost?: number | null }
export interface POInput { supplier_id: number; destination_location_id: number; notes?: string | null; lines: POLineInput[] }

export interface Transfer {
  id: number; number: string; product_id: number; product_sku: string; product_name: string; from_location_id: number;
  from_location_name: string; to_location_id: number; to_location_name: string; quantity: number; note: string | null;
  created_by: number; created_at: string;
}
export type AdjustmentMode = "DELTA" | "COUNT";
export type AdjustmentReason = "DAMAGE" | "LOSS" | "RECOUNT" | "CORRECTION" | "OTHER";
export interface Adjustment {
  id: number; product_id: number; product_sku: string; product_name: string; location_id: number; location_name: string;
  mode: AdjustmentMode; delta: number; counted_quantity: number | null; reason: AdjustmentReason; note: string | null;
  created_by: number; created_at: string;
}

export interface SaleLine {
  id: number; product_id: number; product_sku: string; product_name: string; quantity: number; unit_price: string; line_total: string;
}
export interface Sale {
  id: number; number: string; location_id: number; location_name: string; customer_name: string | null;
  total_amount: string; created_by: number; sold_at: string; lines: SaleLine[];
}

export interface LowStockItem {
  product_id: number; sku: string; name: string; location_id: number | null; location_name: string | null;
  quantity: number; reorder_level: number;
}
export interface Dashboard {
  total_products: number; total_units: number; stock_value: string; low_stock_count: number;
  open_purchase_orders: number; sales_today: string; sales_last_30_days: string;
}
export interface SalesReportRow { group: string; orders: number; units: number; revenue: string; cost: string; margin: string }
export interface SalesReport { group_by: string; rows: SalesReportRow[]; total_revenue: string; total_cost: string; total_margin: string }
export interface TopProduct { product_id: number; sku: string; name: string; units: number; revenue: string }

/** Backend error body: { detail, code, errors?: [{field, message}] } */
export interface ApiError { detail: string; code?: string; errors?: { field: string; message: string }[] }
