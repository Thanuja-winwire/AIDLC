import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, errorMessage } from "../api/client";
import { useApiMutation, useLocations } from "../api/hooks";
import type { Location } from "../api/types";
import { RoleGate } from "../components/RoleGate";
import { Alert, Badge, Button, DataList, Input, Modal, PageHeader, Textarea, useToast } from "../components/ui";

function LocationForm({ location, onDone }: { location: Location | null; onDone: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ code: location?.code ?? "", name: location?.name ?? "", address: location?.address ?? "", is_active: location?.is_active ?? true });
  const [err, setErr] = useState<string | null>(null);
  const save = useApiMutation(
    (body: Record<string, unknown>) => (location ? api.patch(`/locations/${location.id}`, body) : api.post("/locations", body)),
    ["locations", "stock", "alerts"],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.name.trim() || (!location && !f.code.trim())) return setErr("Code and name are required");
    try {
      await save.mutateAsync(location
        ? { name: f.name.trim(), address: f.address || null, is_active: f.is_active }
        : { code: f.code.trim(), name: f.name.trim(), address: f.address || null });
      toast.success(location ? "Location updated" : "Location created");
      onDone();
    } catch (x) { setErr(errorMessage(x)); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <Alert>{err}</Alert>}
      <Input label="Code" value={f.code} disabled={!!location} onChange={(e) => setF({ ...f, code: e.target.value })} required />
      <Input label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
      <Textarea label="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      {location && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="rounded border-slate-300 text-brand-600" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} />
          Location is active
        </label>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{location ? "Save changes" : "Create location"}</Button>
      </div>
    </form>
  );
}

export default function LocationsPage() {
  const { data, isLoading, error, refetch } = useLocations();
  const [editing, setEditing] = useState<Location | null | undefined>(undefined);

  return (
    <>
      <PageHeader
        title="Locations" subtitle="Warehouses, stores and other places where stock is held"
        actions={<RoleGate><Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> New location</Button></RoleGate>}
      />
      <DataList
        head={["Code", "Name", "Address", "Status", ""]} loading={isLoading} error={error ? errorMessage(error) : undefined}
        onRetry={() => refetch()} isEmpty={!data?.length}
        empty={{ title: "No locations yet", message: "Add a location before receiving or selling stock." }}
      >
        {data?.map((l) => (
          <tr key={l.id} className="hover:bg-slate-50">
            <td className="td font-mono text-xs">{l.code}</td>
            <td className="td font-medium text-slate-900">{l.name}</td>
            <td className="td">{l.address ?? "—"}</td>
            <td className="td"><Badge tone={l.is_active ? "green" : "slate"}>{l.is_active ? "Active" : "Inactive"}</Badge></td>
            <td className="td text-right"><RoleGate><Button variant="ghost" onClick={() => setEditing(l)} aria-label={`Edit ${l.name}`}><Pencil className="h-4 w-4" /></Button></RoleGate></td>
          </tr>
        ))}
      </DataList>
      <Modal title={editing ? "Edit location" : "New location"} open={editing !== undefined} onClose={() => setEditing(undefined)}>
        {editing !== undefined && <LocationForm location={editing} onDone={() => setEditing(undefined)} />}
      </Modal>
    </>
  );
}
