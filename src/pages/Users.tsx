import { useState, useEffect } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { adminApi, type User } from "@/lib/api";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.users().then((res) => {
      if (res.success && res.users) setUsers(res.users);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <button
          onClick={() => window.location.reload()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">Balance</th>
                <th className="text-left p-3 text-sm font-medium text-gray-400">KYC</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-700">
                  <td className="p-3 text-sm text-gray-500">{u.id?.slice(-8)}</td>
                  <td className="p-3 text-sm text-white">{u.email}</td>
                  <td className="p-3 text-sm text-gray-400">{u.full_name || "—"}</td>
                  <td className="p-3 text-sm font-medium text-white">
                    ${Number(u.balance || 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.kyc_status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : u.kyc_status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-600 text-gray-400"
                      }`}
                    >
                      {u.kyc_status || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
