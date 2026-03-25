import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, ChefHat, Bike, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin" | "restaurant" | "delivery";
  created_at: string;
  status: "active" | "suspended";
  orders: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  customer:   { label: "Customer",   color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   Icon: Users     },
  admin:      { label: "Admin",      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", Icon: ShieldCheck },
  restaurant: { label: "Restaurant", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", Icon: ChefHat   },
  delivery:   { label: "Delivery",   color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   Icon: Bike      },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/api/admin/users").then(r => r.data.data),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/api/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const filtered = (users ?? []).filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users?.length ?? 0,
    customer: users?.filter(u => u.role === "customer").length ?? 0,
    admin: users?.filter(u => u.role === "admin").length ?? 0,
    restaurant: users?.filter(u => u.role === "restaurant").length ?? 0,
    delivery: users?.filter(u => u.role === "delivery").length ?? 0,
  };

  return (
    <div className="p-6 space-y-5 text-white">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Users</h1>
        <p className="text-white/40 text-sm mt-0.5">{users?.length ?? "…"} registered accounts</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "customer", "admin", "restaurant", "delivery"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                roleFilter === r
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white"
              }`}
            >
              {r} <span className="opacity-60 ml-1">{counts[r]}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium hidden sm:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium hidden md:table-cell">Orders</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.customer;
                  const RoleIcon = rc.Icon;
                  const isActive = user.status === "active";
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium leading-tight">{user.name}</p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${rc.bg} ${rc.color} ${rc.border}`}>
                          <RoleIcon size={11} />
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-right text-white/60 hidden md:table-cell">{user.orders > 0 ? user.orders : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold ${isActive ? "text-green-400" : "text-red-400"}`}>
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => toggleStatus.mutate({ id: user.id, status: isActive ? "suspended" : "active" })}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? "text-red-400/70 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                                : "text-green-400/70 border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
                            }`}
                          >
                            {isActive ? <><UserX size={11} /> Suspend</> : <><UserCheck size={11} /> Activate</>}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
