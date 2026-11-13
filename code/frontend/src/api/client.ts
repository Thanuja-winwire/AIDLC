import axios, { AxiosError } from "axios";
import type { ApiError } from "./types";

export const TOKEN_KEY = "ims.token";

// Relative base: the Vite dev proxy and the docker nginx both forward /api to the backend.
export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** Turns any thrown error into a readable message (reads the backend's `detail`). */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.errors?.length) return data.errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join("; ");
    if (data?.detail && typeof data.detail === "string") return data.detail;
    if (!err.response) return "Cannot reach the server. Check your connection and try again.";
    return `Request failed (${err.response.status})`;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export const money = (v: string | number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(v));
export const dateTime = (v: string) => new Date(v).toLocaleString();
export const dateOnly = (v: string) => new Date(v).toLocaleDateString();
