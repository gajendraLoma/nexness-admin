import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Check, X, Loader2 } from "lucide-react";
import { adminApi, type AdminWithdrawal } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";

type PendingAction =
  | { kind: "approve"; row: AdminWithdrawal }
  | { kind: "reject"; row: AdminWithdrawal }
  | null;

export default function Withdrawals() {
  const [rows, setRows] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);

  const closeModal = useCallback(() => {
    if (!actionLoading) setPending(null);
  }, [actionLoading]);

  const load = () => {
    setLoading(true);
    adminApi.withdrawalsPending().then((res) => {
      if (res.success && res.withdrawals) {
        setRows(res.withdrawals);
      }
      setLoading(false);
    });
  };

  useEffect(() => load(), []);

  const runApprove = async () => {
    if (!pending || pending.kind !== "approve") return;
    const id = pending.row.id;
    setActionLoading(true);
    const res = await adminApi.withdrawalApprove(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: (res as { message?: string }).message || "Approved." });
      setPending(null);
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  const runReject = async () => {
    if (!pending || pending.kind !== "reject") return;
    const id = pending.row.id;
    setActionLoading(true);
    const res = await adminApi.withdrawalReject(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "Withdrawal rejected." });
      setPending(null);
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pending Withdrawals</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      {message && (
        <p className={`mb-4 text-sm ${message.type === "ok" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-12 text-center text-gray-400">
          No pending withdrawals.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">User</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Currency</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Address</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">User balance</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-t border-gray-700">
                  <td className="p-3 text-sm text-gray-300">{w.id.slice(-8)}</td>
                  <td className="p-3 text-sm text-white">{w.email}</td>
                  <td className="p-3 text-sm font-medium text-white">${w.amount?.toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-400">{w.currency}</td>
                  <td className="p-3 text-sm text-gray-400 max-w-[200px] truncate" title={w.address || ""}>
                    {w.address || "—"}
                  </td>
                  <td className="p-3 text-sm text-gray-300">
                    {typeof w.user_balance === "number" ? `$${w.user_balance.toFixed(2)}` : "—"}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {w.created_at ? new Date(w.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPending({ kind: "approve", row: w })}
                      disabled={actionLoading}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setPending({ kind: "reject", row: w })}
                      disabled={actionLoading}
                      className="p-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={pending?.kind === "approve"}
        title="Approve withdrawal"
        description={
          pending?.kind === "approve"
            ? `Debit $${pending.row.amount?.toFixed(2)} ${pending.row.currency} from ${pending.row.email}? Their wallet balance will be reduced by this amount.`
            : ""
        }
        confirmLabel="Approve"
        cancelLabel="Cancel"
        confirmVariant="default"
        loading={actionLoading}
        onConfirm={runApprove}
        onCancel={closeModal}
      />
      <ConfirmModal
        open={pending?.kind === "reject"}
        title="Reject withdrawal"
        description={
          pending?.kind === "reject"
            ? `Reject the request for ${pending.row.email} ($${pending.row.amount?.toFixed(2)} ${pending.row.currency})? Their balance will not change.`
            : ""
        }
        confirmLabel="Reject"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={runReject}
        onCancel={closeModal}
      />
    </>
  );
}
