import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { Alert, EmptyState, ErrorState, PageHeader, Pagination, Skeleton, StatusBadge } from "../../components/ui";
import { api, toApiError } from "../../lib/api";
import { formatDate } from "../../lib/format";

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const q = useQuery({ queryKey: ["admin-customers", search, page], queryFn: () => api.adminCustomers(search, page) });

  const renew = useMutation({
    mutationFn: (subId: number) => api.adminRenew(subId),
    onSuccess: (s) => {
      setMessage(s.status === "active" ? { kind: "success", text: "Renewal succeeded." } : { kind: "error", text: `Renewal did not complete (status: ${s.status}).` });
    },
    onError: (e) => setMessage({ kind: "error", text: toApiError(e).message }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin-customers"] }),
  });

  return (
    <div>
      <PageHeader title="Customers" subtitle="Search customers and manage their subscriptions" />
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(input.trim()); }}
      >
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input data-testid="customer-search" className="input pl-9" placeholder="Search by name or email" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <button type="submit" data-testid="customer-search-submit" className="btn-secondary">Search</button>
      </form>
      {message && <div className="mb-4"><Alert kind={message.kind}>{message.text}</Alert></div>}

      <div className="card overflow-hidden">
        {q.isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {q.isError && <ErrorState message={toApiError(q.error).message} onRetry={() => q.refetch()} />}
        {q.data && q.data.items.length === 0 && <EmptyState title="No customers found" message={search ? "Try a different search." : "Customers appear here after they register."} />}
        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="customer-table">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr><th className="th">Customer</th><th className="th">Plan</th><th className="th">Status</th><th className="th">Renews / ends</th><th className="th text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {q.data.items.map((c) => (
                    <tr key={c.id} data-testid={`customer-row-${c.id}`} className="hover:bg-slate-50">
                      <td className="td"><div className="font-medium text-slate-900">{c.name}</div><div className="text-xs text-slate-500">{c.email}</div></td>
                      <td className="td">{c.subscription?.plan.name ?? "—"}</td>
                      <td className="td">{c.subscription ? <StatusBadge status={c.subscription.status} /> : <span className="text-slate-400">No subscription</span>}</td>
                      <td className="td">{c.subscription ? formatDate(c.subscription.current_period_end) : "—"}</td>
                      <td className="td text-right">
                        {c.subscription && (c.subscription.status === "active" || c.subscription.status === "past_due") && (
                          <button data-testid={`customer-renew-${c.id}`} className="btn-secondary px-3 py-1" disabled={renew.isPending} onClick={() => { setMessage(null); renew.mutate(c.subscription!.id); }}>
                            <RefreshCw className="h-3.5 w-3.5" /> Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={q.data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
