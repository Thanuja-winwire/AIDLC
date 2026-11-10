import { AlertTriangle, Loader2, PackageOpen, ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { STATUS_LABEL, STATUS_TONE } from '../utils/format';

export function Button({ variant = 'primary', loading = false, className = '', children, disabled, ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60';
  const styles = {
    primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Input({ label, error, id, ...rest }) {
  const fid = id || rest.name;
  return (
    <Field label={label} error={error} htmlFor={fid}>
      <input id={fid} className={`input ${error ? 'input-error' : ''}`} {...rest} />
    </Field>
  );
}

export function Select({ label, error, id, children, ...rest }) {
  const fid = id || rest.name;
  return (
    <Field label={label} error={error} htmlFor={fid}>
      <select id={fid} className={`input ${error ? 'input-error' : ''}`} {...rest}>{children}</select>
    </Field>
  );
}

const TONES = {
  amber: 'bg-amber-100 text-amber-800', blue: 'bg-blue-100 text-blue-800', red: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800', indigo: 'bg-indigo-100 text-indigo-800', slate: 'bg-slate-200 text-slate-700',
};

export function Badge({ tone = 'slate', children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}

export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status] || status}</Badge>;

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500" role="status">
      <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary-600" /> {label}…
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function EmptyState({ title, message, action, icon: Icon = PackageOpen }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-primary-50 p-4"><Icon className="h-8 w-8 text-primary-600" /></div>
      <h2>{title}</h2>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <p className="text-sm font-medium text-red-800">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function Alert({ tone = 'red', children }) {
  const t = { red: 'border-red-200 bg-red-50 text-red-800', green: 'border-green-200 bg-green-50 text-green-800', amber: 'border-amber-200 bg-amber-50 text-amber-800' };
  return <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${t[tone]}`}>{children}</div>;
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
      <span className="text-sm text-slate-600">Page {page} of {pages}</span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
    </nav>
  );
}

export function QuantityStepper({ value, max = 99, onChange, disabled }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
      <button type="button" aria-label="Decrease quantity" className="p-2 hover:bg-slate-50 disabled:opacity-40" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center text-sm font-medium" aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" className="p-2 hover:bg-slate-50 disabled:opacity-40" disabled={disabled || value >= Math.min(max, 99)} onClick={() => onChange(value + 1)}><Plus className="h-4 w-4" /></button>
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, loading, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
