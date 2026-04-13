import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Wallet, ArrowUpFromLine, UserCheck, Users, LogOut, ArrowLeft } from "lucide-react";
import { getUserAppUrl } from "@/lib/siteUrls";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/deposits", label: "Deposits", icon: Wallet },
    { to: "/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
    { to: "/kyc", label: "KYC", icon: UserCheck },
    { to: "/users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
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
