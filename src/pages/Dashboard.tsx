import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowUpFromLine, UserCheck, Users } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending_deposits: 0,
    pending_withdrawals: 0,
    pending_kyc: 0,
    total_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then((res) => {
      if (res.success && res.stats) setStats(res.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Loading...</div>;

  const cards = [
    { label: "Pending Deposits", value: stats.pending_deposits, icon: Wallet, to: "/deposits", color: "text-amber-400" },
    {
      label: "Pending Withdrawals",
      value: stats.pending_withdrawals,
      icon: ArrowUpFromLine,
      to: "/withdrawals",
      color: "text-amber-400",
    },
    { label: "Pending KYC", value: stats.pending_kyc, icon: UserCheck, to: "/kyc", color: "text-amber-400" },
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-white" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <div key={label} className="rounded-xl border border-gray-700 bg-gray-800 p-4 flex items-center justify-between relative">
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              {to && (
                <Link to={to} className="text-sm text-amber-400 hover:underline">
                  View
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
