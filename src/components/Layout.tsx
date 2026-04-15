import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Wallet, ArrowUpFromLine, UserCheck, Users, LogOut, ArrowLeft, LineChart } from "lucide-react";
import { getUserAppUrl } from "@/lib/siteUrls";
import { adminApi, type AdminContractOrder } from "@/lib/api";
import { notifyIfNewContractOrders } from "@/lib/contractOrderNotify";
import InfoModal from "@/components/InfoModal";

export default function Layout() {
  const { user, logout, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [newOrdersModalOpen, setNewOrdersModalOpen] = useState(false);

  useEffect(() => {
    if (!token || !user) return;
    let cancelled = false;
    const tick = async () => {
      const res = await adminApi.contractOrders();
      if (cancelled || !res.success || !Array.isArray(res.orders)) return;
      const ids = (res.orders as AdminContractOrder[]).map((o) => o.id);
      notifyIfNewContractOrders(ids, () => setNewOrdersModalOpen(true));
    };
    tick();
    const interval = setInterval(tick, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, user]);

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/deposits", label: "Deposits", icon: Wallet },
    { to: "/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
    { to: "/kyc", label: "KYC", icon: UserCheck },
    { to: "/users", label: "Users", icon: Users },
    { to: "/contracts", label: "Contract orders", icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <InfoModal
        open={newOrdersModalOpen}
        title="information"
        message="There are new contract orders."
        actionLabel="OK"
        onClose={() => setNewOrdersModalOpen(false)}
      />
      <aside className="w-56 border-r border-gray-700 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-white">Exness Admin</h2>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>
        <nav className="p-2 flex-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-700 space-y-1">
          <a
            href={getUserAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            User App
          </a>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
