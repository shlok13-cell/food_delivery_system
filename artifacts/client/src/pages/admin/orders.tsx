import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Clock, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/lib/axios";

interface Order {
  id: number;
  restaurant: string;
  customer: string;
  amount: number;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:          { label: "Pending",          color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20"  },
  confirmed:        { label: "Confirmed",        color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  preparing:        { label: "Preparing",        color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20"  },
  out_for_delivery: { label: "Out for Delivery", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20"  },
  picked_up:        { label: "Picked Up",        color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20"    },
  delivered:        { label: "Delivered",        color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20"   },
  cancelled:        { label: "Cancelled",        color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20"     },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"id" | "amount" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: () => api.get("/api/admin/orders").then(r => r.data.data),
    refetchInterval: 15000,
  });

  const statuses = ["all", "pending", "confirmed", "preparing", "out_for_delivery", "picked_up", "delivered", "cancelled"];

  const filtered = (orders ?? [])
    .filter(o => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.restaurant.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || String(o.id).includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let v = 0;
      if (sortBy === "id") v = a.id - b.id;
      else if (sortBy === "amount") v = a.amount - b.amount;
      else v = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? v : -v;
    });

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    sortBy === col
      ? (sortDir === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />)
      : null
  );

  const totalRevenue = filtered.reduce((s, o) => o.status !== "cancelled" ? s + o.amount : s, 0);

  return (
    <div className="p-6 space-y-5 text-white">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">All Orders</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {filtered.length} orders · ₹{totalRevenue.toLocaleString()} revenue
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, restaurant or customer…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = s === "all" ? (orders?.length ?? 0) : (orders?.filter(o => o.status === s).length ?? 0);
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  statusFilter === s
                    ? cfg ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white"
                }`}
              >
                {s.replace("_", " ")} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-white/40 font-medium cursor-pointer hover:text-white/60 select-none" onClick={() => toggleSort("id")}>
                    <span className="flex items-center gap-1">Order <SortIcon col="id" /></span>
                  </th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Restaurant</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium hidden sm:table-cell">Customer</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium cursor-pointer hover:text-white/60 select-none hidden md:table-cell" onClick={() => toggleSort("amount")}>
                    <span className="flex items-center justify-end gap-1">Amount <SortIcon col="amount" /></span>
                  </th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium cursor-pointer hover:text-white/60 select-none hidden lg:table-cell" onClick={() => toggleSort("created_at")}>
                    <span className="flex items-center justify-end gap-1"><Clock size={12} /> Time <SortIcon col="created_at" /></span>
                  </th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-white/70 text-xs">#{order.id}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{order.restaurant}</td>
                      <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{order.customer}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold hidden md:table-cell">₹{order.amount}</td>
                      <td className="px-4 py-3 text-right text-white/40 text-xs hidden lg:table-cell">{formatTime(order.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border} whitespace-nowrap`}>
                          {cfg.label}
                        </span>
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
