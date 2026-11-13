import {
  keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey,
} from "@tanstack/react-query";
import { api } from "./client";
import type {
  Adjustment, Category, Dashboard, Location, LowStockItem, Movement, Page, Product, PurchaseOrder, Sale, SalesReport,
  StockLevel, Supplier, TopProduct, Transfer, User,
} from "./types";

type Params = Record<string, string | number | boolean | null | undefined>;
const clean = (p: Params = {}) => Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v != null));

function usePage<T>(key: string, path: string, params?: Params) {
  return useQuery({
    queryKey: [key, "page", params],
    queryFn: async () => (await api.get<Page<T>>(path, { params: clean(params) })).data,
    placeholderData: keepPreviousData,
  });
}
function useArray<T>(key: string, path: string, params?: Params, enabled = true) {
  return useQuery({
    queryKey: [key, "list", params], enabled,
    queryFn: async () => (await api.get<T[]>(path, { params: clean(params) })).data,
  });
}

export const useProducts = (p?: Params) => usePage<Product>("products", "/products", p);
export const useCategories = () => useArray<Category>("categories", "/categories");
export const useLocations = (active?: boolean) => useArray<Location>("locations", "/locations", { active });
export const useStock = (p?: Params) => usePage<StockLevel>("stock", "/stock", p);
export const useMovements = (p?: Params) => usePage<Movement>("movements", "/stock/movements", p);
export const useSuppliers = (p?: Params) => usePage<Supplier>("suppliers", "/suppliers", p);
export const usePurchaseOrders = (p?: Params) => usePage<PurchaseOrder>("purchase-orders", "/purchase-orders", p);
export const useTransfers = (p?: Params) => usePage<Transfer>("transfers", "/transfers", p);
export const useAdjustments = (p?: Params) => usePage<Adjustment>("adjustments", "/adjustments", p);
export const useSales = (p?: Params) => usePage<Sale>("sales", "/sales", p);
export const useUsers = (p?: Params) => usePage<User>("users", "/users", p);
export const useAlerts = (view: "total" | "location") => useArray<LowStockItem>("alerts", "/alerts", { view });

export const usePurchaseOrder = (id: number) =>
  useQuery({ queryKey: ["purchase-orders", "one", id], queryFn: async () => (await api.get<PurchaseOrder>(`/purchase-orders/${id}`)).data });

export const useDashboard = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: async () => (await api.get<Dashboard>("/dashboard")).data });

export const useSalesReport = (p: Params) =>
  useQuery({ queryKey: ["reports", "sales", p], queryFn: async () => (await api.get<SalesReport>("/reports/sales", { params: clean(p) })).data });

export const useTopProducts = (p: Params) =>
  useQuery({ queryKey: ["reports", "top", p], queryFn: async () => (await api.get<TopProduct[]>("/reports/top-products", { params: clean(p) })).data });

/** Stock changes ripple into many views; mutations that touch stock invalidate all of these. */
export const STOCK_KEYS = ["stock", "movements", "alerts", "dashboard", "products", "reports"];

export function useApiMutation<TIn, TOut = unknown>(
  fn: (input: TIn) => Promise<TOut>, invalidate: string[] = [],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] as QueryKey }));
    },
  });
}
