import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Repeat } from "lucide-react";
import { Alert, Field } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { homeFor } from "../auth/guards";
import { toApiError } from "../lib/api";
import { validateEmail } from "../lib/validation";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string; registered?: boolean } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs = { email: validateEmail(email), password: password ? undefined : "Password is required." };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      const from = location.state?.from;
      navigate(from && from !== "/login" ? from : homeFor(user.role), { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="rounded-xl bg-brand-600 p-2.5 shadow-sm"><Repeat className="h-6 w-6 text-white" /></div>
          <h1>Sign in</h1>
          <p className="text-slate-500">Manage your subscription and billing</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          {location.state?.registered && <Alert kind="success">Account created. Please sign in.</Alert>}
          {error && <Alert kind="error">{error}</Alert>}
          <Field label="Email" htmlFor="login-email" error={errors.email}>
            <input id="login-email" data-testid="login-email" type="email" className="input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="login-password" error={errors.password}>
            <input id="login-password" data-testid="login-password" type="password" className="input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <button type="submit" className="btn-primary w-full" disabled={busy} data-testid="login-submit">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-slate-500">
          New here? <Link to="/register" className="font-medium text-brand-600 hover:underline" data-testid="login-register-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
