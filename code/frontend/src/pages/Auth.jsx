import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input } from '../components/ui';
import { validateEmail, validatePassword } from '../utils/format';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-8">
        <h1 className="mb-1">{title}</h1>
        <p className="mb-6 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
      <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (validateEmail(form.email)) errs.email = validateEmail(form.email);
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(location.state?.from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (er) { setMsg(parseError(er).message); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your account" footer={<>New here? <Link className="font-medium text-primary-600 hover:underline" to="/register">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {msg && <Alert>{msg}</Alert>}
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={on('email')} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={on('password')} error={errors.password} />
        <Button type="submit" className="w-full" loading={busy}>Log in</Button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (validateEmail(form.email)) errs.email = validateEmail(form.email);
    if (validatePassword(form.password)) errs.password = validatePassword(form.password);
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try { await register(form); navigate('/', { replace: true }); }
    catch (er) { const p = parseError(er); setMsg(p.message); setErrors(p.fields); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start shopping in under a minute" footer={<>Already registered? <Link className="font-medium text-primary-600 hover:underline" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {msg && <Alert>{msg}</Alert>}
        <Input label="Full name" name="name" value={form.name} onChange={on('name')} error={errors.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={on('email')} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={on('password')} error={errors.password} />
        <p className="text-xs text-slate-500">At least 8 characters, with a letter and a digit.</p>
        <Button type="submit" className="w-full" loading={busy}>Create account</Button>
      </form>
    </AuthShell>
  );
}
