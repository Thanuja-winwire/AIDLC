import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Repeat } from "lucide-react";
import { Alert, Field } from "../components/ui";
import { api, toApiError } from "../lib/api";
import { hasErrors, validateRegister } from "../lib/validation";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<ReturnType<typeof validateRegister>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs = validateRegister(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    setBusy(true);
    try {
      await api.register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(toApiError(err).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="rounded-xl bg-brand-600 p-2.5 shadow-sm"><Repeat className="h-6 w-6 text-white" /></div>
          <h1>Create your account</h1>
          <p className="text-slate-500">Pick a plan in under a minute</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          {error && <Alert kind="error">{error}</Alert>}
          <Field label="Name" htmlFor="reg-name" error={errors.name}>
            <input id="reg-name" data-testid="register-name" className="input" autoComplete="name" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Email" htmlFor="reg-email" error={errors.email}>
            <input id="reg-email" data-testid="register-email" type="email" className="input" autoComplete="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Password" htmlFor="reg-password" error={errors.password}>
            <input id="reg-password" data-testid="register-password" type="password" className="input" autoComplete="new-password" value={form.password} onChange={set("password")} />
          </Field>
          <button type="submit" className="btn-primary w-full" disabled={busy} data-testid="register-submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
          </button>
        </form>
        <p className="mt-4 text-center text-slate-500">
          Already registered? <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
