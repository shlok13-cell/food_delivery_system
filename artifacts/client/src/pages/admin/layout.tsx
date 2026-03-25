import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BarChart3, Users, ShoppingBag, Store, LogOut, Shield, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  }

  const navItems = [
    { to: "/admin/analytics",    icon: BarChart3,    label: "Analytics"    },
    { to: "/admin/users",        icon: Users,        label: "Users"        },
    { to: "/admin/orders",       icon: ShoppingBag,  label: "Orders"       },
    { to: "/admin/restaurants",  icon: Store,        label: "Restaurants"  },
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
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Shield size={16} className="text-violet-400" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">Admin Panel</span>
            <button className="ml-auto md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3 p-2.5 bg-violet-500/8 border border-violet-500/15 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name ?? "Admin"}</p>
              <p className="text-violet-400/70 text-xs truncate">{user?.email ?? ""}</p>
            </div>
          </div>
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
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#111] border-b border-white/8 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={22} />
          </button>
          <Shield size={18} className="text-violet-400" />
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
