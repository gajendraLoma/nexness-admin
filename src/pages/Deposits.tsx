import { useState, useEffect } from "react";
import { RefreshCw, Check, X, Eye, Loader2 } from "lucide-react";
import { adminApi, type AdminDeposit } from "@/lib/api";

export default function Deposits() {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<{ id: string; email: string; amount_requested: number } | null>(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.depositsPending().then((res) => {
      if (res.success && (res as { deposits?: AdminDeposit[] }).deposits) {
        setDeposits((res as { deposits: AdminDeposit[] }).deposits);
      }
      setLoading(false);
    });
  };

  useEffect(() => load(), []);

  const handleVerify = async (id: string) => {
    setActionLoading(true);
    const res = await adminApi.depositVerify(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "Deposit verified." });
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    const amt = parseFloat(approveAmount);
    if (isNaN(amt) || amt <= 0) {
      setMessage({ type: "err", text: "Invalid amount" });
      return;
    }
    setActionLoading(true);
    const res = await adminApi.depositApprove(approveModal.id, amt);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "Deposit approved and balance updated." });
      setApproveModal(null);
      setApproveAmount("");
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this deposit?")) return;
    setActionLoading(true);
    const res = await adminApi.depositReject(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "Deposit rejected." });
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pending Deposits</h1>
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
      ) : deposits.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-12 text-center text-gray-400">
          No pending deposits.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">User</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Method</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id} className="border-t border-gray-700">
                  <td className="p-3 text-sm text-gray-300">{d.id.slice(-8)}</td>
                  <td className="p-3 text-sm text-white">{d.email}</td>
                  <td className="p-3 text-sm font-medium text-white">${d.amount_requested?.toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-400">{d.payment_method || "qr"}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        d.status === "verified" ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {d.screenshot_url && (
                      <a href={d.screenshot_url} target="_blank" rel="noopener noreferrer">
                        <button className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700">
                          <Eye className="h-4 w-4" />
                        </button>
                      </a>
                    )}
                    {d.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleVerify(d.id)}
                          disabled={actionLoading}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30"
                        >
                          <Check className="h-4 w-4" /> Verify
                        </button>
                        <button
                          onClick={() => handleReject(d.id)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {(d.status === "verified" || d.status === "pending") && (
                      <button
                        onClick={() =>
                          setApproveModal({ id: d.id, email: d.email, amount_requested: d.amount_requested })
                        }
                        className="px-3 py-1 rounded-lg bg-amber-500 text-gray-900 text-sm font-medium hover:bg-amber-400"
                      >
                        Approve Amount
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {approveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Approve Deposit Amount</h3>
            <p className="text-sm text-gray-400 mb-4">
              User requested ${approveModal.amount_requested?.toFixed(2)}. Enter amount to credit.
            </p>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={approveModal.amount_requested?.toString()}
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg bg-amber-500 text-gray-900 font-medium disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Approve & Credit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
