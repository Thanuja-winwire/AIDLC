import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Info, Loader2, X, XCircle } from "lucide-react";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------- Buttons ---------- */
type Variant = "primary" | "secondary" | "danger" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-200",
  secondary: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 disabled:text-slate-400",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-200",
  ghost: "text-slate-600 hover:bg-slate-100 disabled:text-slate-300",
};

export function Button({
  variant = "primary", loading, className, children, disabled, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        variants[variant], className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Form fields ---------- */
interface FieldProps { label: string; error?: string; hint?: string }

function FieldShell({ label, error, hint, children, htmlFor }: FieldProps & { children: ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600" role="alert">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Input({ label, error, hint, id, className, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fid = id ?? `in-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={fid}>
      <input id={fid} className={cx("field-input", error && "border-red-400 focus:border-red-500", className)} {...rest} />
    </FieldShell>
  );
}

export function Select({ label, error, hint, id, className, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = id ?? `sel-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={fid}>
      <select id={fid} className={cx("field-input", error && "border-red-400", className)} {...rest}>{children}</select>
    </FieldShell>
  );
}

export function Textarea({ label, error, hint, id, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = id ?? `ta-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={fid}>
      <textarea id={fid} rows={3} className={cx("field-input", error && "border-red-400")} {...rest} />
    </FieldShell>
  );
}

/* ---------- Layout bits ---------- */
export function Card({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cx("rounded-xl border border-slate-200 bg-white shadow-card", className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

type Tone = "green" | "amber" | "red" | "blue" | "slate" | "indigo";
const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  indigo: "bg-brand-50 text-brand-700 ring-brand-600/20",
};
export function Badge({ tone = "slate", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden /> {label}…
    </div>
  );
}

export function SkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <tbody aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-slate-100">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400"><Inbox className="h-6 w-6" aria-hidden /></div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Something went wrong</p>
        <p className="mt-0.5 text-sm text-red-700">{message}</p>
      </div>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function Alert({ tone = "red", children }: { tone?: "red" | "amber" | "blue"; children: ReactNode }) {
  const styles = { red: "border-red-200 bg-red-50 text-red-800", amber: "border-amber-200 bg-amber-50 text-amber-800", blue: "border-sky-200 bg-sky-50 text-sky-800" };
  const Icon = tone === "blue" ? Info : AlertTriangle;
  return (
    <div className={cx("flex items-start gap-2 rounded-lg border p-3 text-sm", styles[tone])} role="alert">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <div>{children}</div>
    </div>
  );
}

/* ---------- Table ---------- */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50"><tr>{head.map((h) => <th key={h} className="th" scope="col">{h}</th>)}</tr></thead>
        {children}
      </table>
    </div>
  );
}

/** Card + table with the loading / error / empty states every list needs. */
export function DataList({
  head, loading, error, onRetry, isEmpty, empty, children,
}: {
  head: string[]; loading: boolean; error?: string; onRetry?: () => void; isEmpty: boolean;
  empty: { title: string; message?: string; action?: ReactNode }; children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      {error ? <ErrorState message={error} onRetry={onRetry} /> : loading ? (
        <Table head={head}><SkeletonRows cols={head.length} /></Table>
      ) : isEmpty ? <EmptyState {...empty} /> : (
        <Table head={head}><tbody className="divide-y divide-slate-100">{children}</tbody></Table>
      )}
    </Card>
  );
}

export function Pagination({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total <= size) return null;
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
      <span>Page {page} of {pages} · {total} items</span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ title, open, onClose, children, wide }: { title: string; open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8" onMouseDown={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className={cx("animate-fade-in w-full rounded-xl bg-white shadow-xl", wide ? "max-w-3xl" : "max-w-lg")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", danger, loading, onConfirm, onClose,
}: { open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ---------- Toasts ---------- */
interface ToastItem { id: number; tone: "success" | "error"; text: string }
const ToastCtx = createContext<{ success: (t: string) => void; error: (t: string) => void }>({ success: () => {}, error: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((tone: ToastItem["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, tone, text }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 4500);
  }, []);
  const api = useMemo(() => ({ success: (t: string) => push("success", t), error: (t: string) => push("error", t) }), [push]);
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className="animate-fade-in pointer-events-auto flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
            {i.tone === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="h-5 w-5 shrink-0 text-red-500" />}
            <span className="text-slate-700">{i.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
