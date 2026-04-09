import { useState, useEffect } from "react";
import { RefreshCw, Check, X, Eye, Loader2 } from "lucide-react";
import { adminApi, type AdminKyc } from "@/lib/api";

export default function Kyc() {
  const [submissions, setSubmissions] = useState<AdminKyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.kycPending().then((res) => {
      if (res.success && res.submissions) {
        setSubmissions(res.submissions);
      }
      setLoading(false);
    });
  };

  useEffect(() => load(), []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    const res = await adminApi.kycApprove(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "KYC approved." });
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  const handleReject = async (id: string) => {
    setActionLoading(true);
    const res = await adminApi.kycReject(id);
    setActionLoading(false);
    if (res.success) {
      setMessage({ type: "ok", text: "KYC rejected." });
      load();
    } else setMessage({ type: "err", text: (res as { message?: string }).message || "Error" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Pending KYC</h1>
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
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-12 text-center text-gray-400">
          No pending KYC.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-700 bg-gray-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-white">{s.email}</p>
                <p className="text-sm text-gray-400">{s.full_name || "—"} • {s.document_type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {s.id_front_url && (
                  <a href={s.id_front_url} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 text-sm">
                      <Eye className="h-4 w-4" /> Front
                    </button>
                  </a>
                )}
                {s.id_back_url && (
                  <a href={s.id_back_url} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 text-sm">
                      <Eye className="h-4 w-4" /> Back
                    </button>
                  </a>
                )}
                {s.selfie_url && (
                  <a href={s.selfie_url} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 text-sm">
                      <Eye className="h-4 w-4" /> Selfie
                    </button>
                  </a>
                )}
                <button
                  onClick={() => handleApprove(s.id)}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(s.id)}
                  disabled={actionLoading}
                  className="p-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
