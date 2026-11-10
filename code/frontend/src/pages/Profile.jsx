import { useState } from 'react';
import { authApi, parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { validatePassword } from '../utils/format';
import { Alert, Button, Input } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, current_password: '', new_password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.new_password && validatePassword(form.new_password)) errs.new_password = validatePassword(form.new_password);
    if (form.new_password && !form.current_password) errs.current_password = 'Required to change password';
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const body = { name: form.name };
      if (form.new_password) { body.new_password = form.new_password; body.current_password = form.current_password; }
      setUser(await authApi.update(body));
      setForm({ ...form, current_password: '', new_password: '' });
      toast.push('Profile updated');
    } catch (er) { const p = parseError(er); setMsg(p.message); setErrors(p.fields); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6">Your profile</h1>
      <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
        {msg && <Alert>{msg}</Alert>}
        <Input label="Email" name="email" value={user.email} disabled readOnly />
        <Input label="Name" name="name" value={form.name} onChange={on('name')} error={errors.name} />
        <h2 className="pt-2">Change password</h2>
        <Input label="Current password" name="current_password" type="password" autoComplete="current-password" value={form.current_password} onChange={on('current_password')} error={errors.current_password} />
        <Input label="New password" name="new_password" type="password" autoComplete="new-password" value={form.new_password} onChange={on('new_password')} error={errors.new_password} />
        <Button type="submit" loading={busy}>Save changes</Button>
      </form>
    </div>
  );
}
