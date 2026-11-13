import { Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { useApiMutation, useSuppliers } from "../api/hooks";
import type { Supplier } from "../api/types";
import { RoleGate } from "../components/RoleGate";
import { Alert, Badge, Button, Card, DataList, Input, Modal, PageHeader, Pagination, Textarea, useToast } from "../components/ui";

const SIZE = 15;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SupplierForm({ supplier, onDone }: { supplier: Supplier | null; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: supplier?.name ?? "", contact_person: supplier?.contact_person ?? "", email: supplier?.email ?? "",
    phone: supplier?.phone ?? "", address: supplier?.address ?? "", is_active: supplier?.is_active ?? true,
  });
  const [err, setErr] = useState<string | null>(null);
  const save = useApiMutation(
    (body: Record<string, unknown>) => (supplier ? api.patch(`/suppliers/${supplier.id}`, body) : api.post("/suppliers", body)),
    ["suppliers"],
  );
  const set = (k: string) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim()) return setErr("Name is required");
    if (f.email && !EMAIL.test(f.email)) return setErr("Enter a valid email address");
    const body: Record<string, unknown> = {
      name: f.name.trim(), contact_person: f.contact_person || null, email: f.email || null, phone: f.phone || null, address: f.address || null,
    };
    if (supplier) body.is_active = f.is_active;
    try {
      await save.mutateAsync(body);
      toast.success(supplier ? "Supplier updated" : "Supplier created");
      onDone();
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={f.name} onChange={set("name")} required />
        <Input label="Contact person" value={f.contact_person} onChange={set("contact_person")} />
        <Input label="Email" type="email" value={f.email} onChange={set("email")} />
        <Input label="Phone" value={f.phone} onChange={set("phone")} />
      </div>
      <Textarea label="Address" value={f.address} onChange={set("address")} />
      {supplier && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="rounded border-slate-300 text-brand-600" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Supplier is active
        </label>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{supplier ? "Save changes" : "Create supplier"}</Button>
      </div>
    </form>
  );
}

export default function SuppliersPage() {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Supplier | null | undefined>(undefined);
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const { data, isLoading, error, refetch } = useSuppliers({ q: dq, page, size: SIZE });

  return (
    <>
      <PageHeader
        title="Suppliers" subtitle="Vendors you buy stock from"
        actions={<RoleGate><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> New supplier</Button></RoleGate>}
      />
      <Card className="mb-4 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
          <input className="field-input pl-9" placeholder="Search suppliers" aria-label="Search suppliers" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </Card>
      <DataList
        head={["Name", "Contact", "Email", "Phone", "Status", ""]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.items.length}
        empty={{ title: "No suppliers found", message: dq ? "Try a different search." : "Add a supplier to start creating purchase orders." }}
      >
        {data?.items.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="td font-medium text-slate-900">{s.name}</td>
            <td className="td">{s.contact_person ?? "—"}</td>
            <td className="td">{s.email ?? "—"}</td>
            <td className="td">{s.phone ?? "—"}</td>
            <td className="td"><Badge tone={s.is_active ? "green" : "slate"}>{s.is_active ? "Active" : "Inactive"}</Badge></td>
            <td className="td text-right"><RoleGate><Button variant="ghost" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}><Pencil className="h-4 w-4" /></Button></RoleGate></td>
          </tr>
        ))}
      </DataList>
      {data && <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />}
      <Modal title={editing ? "Edit supplier" : "New supplier"} open={editing !== undefined} onClose={() => setEditing(undefined)} wide>
        {editing !== undefined && <SupplierForm supplier={editing} onDone={() => setEditing(undefined)} />}
      </Modal>
    </>
  );
}
