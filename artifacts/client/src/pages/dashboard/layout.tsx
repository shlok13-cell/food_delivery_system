import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UtensilsCrossed, ClipboardList, LogOut, ChefHat, Menu, X } from "lucide-react";
import api from "@/lib/axios";

interface Restaurant {
  id: number;
  name: string;
  cuisine_type: string;
  emoji: string;
  gradient: string;
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get<{ data: Restaurant }>("/api/dashboard/restaurant")
      .then(r => setRestaurant(r.data.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  const navItems = [
    { to: "/dashboard/menu", icon: UtensilsCrossed, label: "Menu Items" },
    { to: "/dashboard/orders", icon: ClipboardList, label: "Orders" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#141414] border-r border-white/10 z-30
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="text-orange-400" size={22} />
            <span className="font-bold text-white text-sm tracking-wide uppercase">Restaurant Portal</span>
            <button
              className="ml-auto md:hidden text-white/40 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          {restaurant ? (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${restaurant.gradient} flex items-center justify-center text-lg`}>
                {restaurant.emoji}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">{restaurant.name}</p>
                <p className="text-white/40 text-xs">{restaurant.cuisine_type}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-white/10 rounded animate-pulse" />
                <div className="h-2.5 bg-white/5 rounded animate-pulse w-2/3" />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
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
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#141414] border-b border-white/10 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <ChefHat className="text-orange-400" size={20} />
          <span className="font-bold text-white text-sm">Restaurant Portal</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
