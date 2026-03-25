import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bike, LayoutDashboard, LogOut, Menu, X, Star } from "lucide-react";
import api from "@/lib/axios";

interface Stats {
  total_deliveries: number;
  today_deliveries: number;
  active_deliveries: number;
  total_earnings: number;
  today_earnings: number;
  rating: number;
}

interface StoredUser { name: string; email: string }

export default function DeliveryLayout() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    try { setUser(stored ? JSON.parse(stored) : null); } catch { setUser(null); }
    api.get<{ data: Stats }>("/api/delivery/stats")
      .then(r => setStats(r.data.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  }

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "DP";

  const navItems = [
    { to: "/delivery/assignments", icon: LayoutDashboard, label: "My Deliveries" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#111] border-r border-white/8 z-30
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bike size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">Delivery Partner</span>
            <button className="ml-auto md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{user?.name ?? "Delivery Partner"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold">{stats?.rating ?? "4.8"}</span>
                <span className="text-white/30 text-xs">rating</span>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <div className="p-4 border-b border-white/8 grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-blue-400 font-bold text-lg leading-none">{stats.today_deliveries}</p>
              <p className="text-white/40 text-[10px] mt-1">Today</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-green-400 font-bold text-lg leading-none">₹{stats.today_earnings}</p>
              <p className="text-white/40 text-[10px] mt-1">Earned</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          {stats && (
            <div className="bg-white/5 rounded-xl p-3 mb-3">
              <p className="text-white/40 text-xs mb-1">Total Earnings</p>
              <p className="text-white font-bold">₹{stats.total_earnings}</p>
              <p className="text-white/30 text-xs">{stats.total_deliveries} deliveries total</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#111] border-b border-white/8 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={22} />
          </button>
          <Bike className="text-blue-400" size={20} />
          <span className="font-bold text-white text-sm">Delivery Partner</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
