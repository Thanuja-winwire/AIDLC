import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, dateTime, errorMessage } from "../api/client";
import { useApiMutation, useUsers } from "../api/hooks";
import type { Role, User } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Alert, Badge, Button, DataList, Input, Modal, PageHeader, Pagination, Select, useToast } from "../components/ui";

const SIZE = 15;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UserForm({ user, onDone }: { user: User | null; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ email: user?.email ?? "", full_name: user?.full_name ?? "", password: "", role: (user?.role ?? "STAFF") as Role, is_active: user?.is_active ?? true });
  const [err, setErr] = useState<string | null>(null);
  const save = useApiMutation(
    (body: Record<string, unknown>) => (user ? api.patch(`/users/${user.id}`, body) : api.post("/users", body)), ["users"],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.full_name.trim()) return setErr("Full name is required");
    if (!user && !EMAIL.test(f.email)) return setErr("Enter a valid email address");
    if ((!user || f.password) && f.password.length < 8) return setErr("Password must be at least 8 characters");
    const body: Record<string, unknown> = user
      ? { full_name: f.full_name.trim(), role: f.role, is_active: f.is_active, ...(f.password ? { password: f.password } : {}) }
      : { email: f.email.trim(), full_name: f.full_name.trim(), password: f.password, role: f.role };
    try {
      await save.mutateAsync(body);
      toast.success(user ? "User updated" : "User created");
      onDone();
    } catch (x) { setErr(errorMessage(x)); } // lockout rules (BR) surface here
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <Input label="Email" type="email" value={f.email} disabled={!!user} onChange={(e) => setF({ ...f, email: e.target.value })} required />
      <Input label="Full name" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required />
      <Input label={user ? "New password (leave blank to keep)" : "Password"} type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} hint="At least 8 characters" />
      <Select label="Role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
        <option value="STAFF">Staff</option><option value="ADMIN">Admin</option>
      </Select>
      {user && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="rounded border-slate-300 text-brand-600" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Account is active
        </label>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{user ? "Save changes" : "Create user"}</Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const { data, isLoading, error, refetch } = useUsers({ page, size: SIZE });

  return (
    <>
      <PageHeader title="Users" subtitle="Manage who can sign in and what they can do" actions={<Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> New user</Button>} />
      <DataList
        head={["Name", "Email", "Role", "Status", "Last sign-in", ""]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.items.length} empty={{ title: "No users", message: "Create a user to give someone access." }}
      >
        {data?.items.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50">
            <td className="td font-medium text-slate-900">{u.full_name}{u.id === me?.id && <span className="ml-2 text-xs text-slate-400">(you)</span>}</td>
            <td className="td">{u.email}</td>
            <td className="td"><Badge tone={u.role === "ADMIN" ? "indigo" : "slate"}>{u.role}</Badge></td>
            <td className="td"><Badge tone={u.is_active ? "green" : "red"}>{u.is_active ? "Active" : "Deactivated"}</Badge></td>
            <td className="td text-xs">{u.last_login_at ? dateTime(u.last_login_at) : "Never"}</td>
            <td className="td text-right"><Button variant="ghost" onClick={() => setEditing(u)} aria-label={`Edit ${u.full_name}`}><Pencil className="h-4 w-4" /></Button></td>
          </tr>
        ))}
      </DataList>
      {data && <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />}
      <Modal title={editing ? "Edit user" : "New user"} open={editing !== undefined} onClose={() => setEditing(undefined)}>
        {editing !== undefined && <UserForm user={editing} onDone={() => setEditing(undefined)} />}
      </Modal>
    </>
  );
}
