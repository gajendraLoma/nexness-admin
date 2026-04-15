import { useEffect, useState, useCallback } from "react";
import { adminApi, type AdminContractOrder } from "@/lib/api";
import InfoModal from "@/components/InfoModal";
import { ADMIN_CONTRACT_ACTIVITY_KEY } from "@/lib/contractOrderNotify";

const OUTCOMES = [
  { value: "normal", label: "Normal" },
  { value: "profit", label: "Profit" },
  { value: "loss", label: "Loss" },
] as const;

function readActivity(): Array<{ t: string; msg: string }> {
  try {
    const raw = sessionStorage.getItem(ADMIN_CONTRACT_ACTIVITY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is { t: string; msg: string } =>
        x && typeof x === "object" && typeof (x as { t?: string }).t === "string" && typeof (x as { msg?: string }).msg === "string"
    );
  } catch {
    return [];
  }
}

function writeActivity(entries: Array<{ t: string; msg: string }>) {
  try {
    sessionStorage.setItem(ADMIN_CONTRACT_ACTIVITY_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export default function ContractOrders() {
  const [rows, setRows] = useState<AdminContractOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<Array<{ t: string; msg: string }>>(readActivity);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    const res = await adminApi.contractOrders();
    if (res.success && Array.isArray(res.orders)) {
      setRows(res.orders as AdminContractOrder[]);
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load({ silent: true }), 5000);
    return () => clearInterval(t);
  }, [load]);

  const setOutcome = async (id: string, outcome: "normal" | "profit" | "loss") => {
    const prev = rows;
    setRows((r) => r.map((row) => (row.id === id ? { ...row, admin_outcome: outcome } : row)));
    const res = await adminApi.contractSetOutcome(id, outcome);
    if (!res.success) {
      setRows(prev);
      alert((res as { message?: string }).message || "Update failed");
      return;
    }
    const label = OUTCOMES.find((o) => o.value === outcome)?.label ?? outcome;
    const shortId = id.slice(-8);
    setActivityLog((prev) => {
      const entry = {
        t: new Date().toISOString(),
        msg: `Control set to "${label}" for order …${shortId}`,
      };
      const nextLog = [entry, ...prev].slice(0, 40);
      writeActivity(nextLog);
      return nextLog;
    });
    setSuccessModalOpen(true);
    await load({ silent: true });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Contract orders</h1>
      <p className="text-sm text-amber-200/90 mb-4 max-w-3xl">
        Pending orders appear here immediately after a user confirms. Choose Normal (market price at expiry), Profit, or
        Loss before the timer ends. Settlement runs every second.
      </p>

      <InfoModal
        open={successModalOpen}
        title="Operation successful"
        message="Operation successful"
        actionLabel="OK"
        onClose={() => setSuccessModalOpen(false)}
      />

      {loading && rows.length === 0 ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/50">
          <table className="w-full text-sm text-left text-gray-200">
            <thead className="text-xs uppercase bg-gray-800 text-gray-400">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Pair</th>
                <th className="px-3 py-2">Direction</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Entry</th>
                <th className="px-3 py-2">Close</th>
                <th className="px-3 py-2">P&amp;L</th>
                <th className="px-3 py-2">Control</th>
                <th className="px-3 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-700 hover:bg-gray-800/80">
                  <td className="px-3 py-2 font-mono text-xs">{r.id.slice(-8)}</td>
                  <td className="px-3 py-2 max-w-[10rem] truncate">{r.email ?? "—"}</td>
                  <td className="px-3 py-2">{r.symbol_display}</td>
                  <td className={`px-3 py-2 ${r.direction === "buy_up" ? "text-emerald-400" : "text-red-400"}`}>
                    {r.direction === "buy_up" ? "Buy Up" : "Sell Down"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        r.status === "active"
                          ? "text-amber-400"
                          : r.status === "settled_win"
                            ? "text-emerald-400"
                            : "text-red-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{r.amount}</td>
                  <td className="px-3 py-2 tabular-nums text-xs">{r.entry_price}</td>
                  <td className="px-3 py-2 tabular-nums text-xs">{r.closing_price ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums text-xs">{r.pnl_amount ?? "—"}</td>
                  <td className="px-3 py-2">
                    {r.status === "active" ? (
                      <select
                        className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white min-w-[6.5rem]"
                        value={r.admin_outcome}
                        onChange={(e) =>
                          setOutcome(r.id, e.target.value as "normal" | "profit" | "loss")
                        }
                      >
                        {OUTCOMES.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500">{r.admin_outcome}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-gray-700 bg-gray-800/40 p-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-white mb-1">Control action log (this browser)</h2>
        <p className="text-xs text-gray-500 mb-3">
          Recent Normal / Profit / Loss changes are stored here for this session. Server-side audit: API process logs on
          your host (e.g. Railway → Deployments → View logs) include each outcome update.
        </p>
        {activityLog.length === 0 ? (
          <p className="text-xs text-gray-500">No actions yet.</p>
        ) : (
          <ul className="text-xs text-gray-300 space-y-2 max-h-48 overflow-y-auto [scrollbar-width:thin]">
            {activityLog.map((a, i) => (
              <li key={`${a.t}-${i}`} className="border-b border-gray-700/60 pb-2">
                <span className="text-gray-500">{new Date(a.t).toLocaleString()}</span>
                <span className="ml-2">{a.msg}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
