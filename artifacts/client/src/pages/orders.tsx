import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Package, ChevronRight, ReceiptText } from "lucide-react";
import api from "@/lib/axios";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: "Pending",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", emoji: "⏳" },
  confirmed:  { label: "Confirmed",  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",     emoji: "✅" },
  preparing:  { label: "Preparing",  color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", emoji: "👨‍🍳" },
  ready:      { label: "Ready",      color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   emoji: "🍱" },
  picked_up:  { label: "Picked up",  color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", emoji: "🛵" },
  delivered:  { label: "Delivered",  color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   emoji: "🎉" },
  cancelled:  { label: "Cancelled",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       emoji: "❌" },
};

interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  created_at: string;
  restaurant_name: string;
  cuisine_type: string;
  item_count: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Orders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api.get("/orders").then((r) => r.data.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔐</span>
        <h2 className="text-xl font-bold">Sign in to view orders</h2>
        <p className="text-white/40 text-sm">Track your past and current orders.</p>
        <Link to="/auth" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="relative pt-14 pb-8 bg-gradient-to-b from-[#1a0500]/40 to-transparent">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-1">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold">My Orders</h1>
              <p className="text-sm text-white/40">Track and reorder your meals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-white/[0.04] border border-white/[0.06] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-white/40 text-sm">Could not load orders. Please try again.</p>
          </div>
        ) : !data?.length ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <ReceiptText className="w-14 h-14 text-white/15 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-white/40 text-sm mb-6">Your order history will appear here.</p>
            <Link to="/restaurants" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90">
              Browse Restaurants
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {data.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
              return (
                <motion.div
                  key={order.id}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  variants={fadeUp}
                  className="bg-white/[0.04] border border-white/[0.08] hover:border-orange-500/20 rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-lg hover:shadow-orange-500/5"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold group-hover:text-orange-300 transition-colors">{order.restaurant_name}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{order.cuisine_type}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(order.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                    <span className="text-sm font-bold text-white">₹{Number(order.total_amount).toFixed(0)}</span>
                    <div className="flex items-center gap-1 text-xs text-white/40 group-hover:text-orange-400 transition-colors">
                      View details <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
