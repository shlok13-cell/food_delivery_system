import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Package, ChevronRight, ReceiptText } from "lucide-react";
import api from "@/lib/axios";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending:    { label: "Pending",    color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", emoji: "⏳" },
  confirmed:  { label: "Confirmed",  color: "text-blue-500",   bg: "bg-blue-500/10 border-blue-500/20",     emoji: "✅" },
  preparing:  { label: "Preparing",  color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", emoji: "👨‍🍳" },
  ready:      { label: "Ready",      color: "text-green-500",  bg: "bg-green-500/10 border-green-500/20",   emoji: "🍱" },
  picked_up:  { label: "Picked up",  color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", emoji: "🛵" },
  delivered:  { label: "Delivered",  color: "text-green-500",  bg: "bg-green-500/10 border-green-500/20",   emoji: "🎉" },
  cancelled:  { label: "Cancelled",  color: "text-red-500",    bg: "bg-red-500/10 border-red-500/20",       emoji: "❌" },
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

function OrderSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-5 skeleton-shimmer rounded-lg w-36" />
          <div className="h-3 skeleton-shimmer rounded-lg w-24" />
        </div>
        <div className="h-6 skeleton-shimmer rounded-full w-20" />
      </div>
      <div className="flex gap-4 mb-3">
        <div className="h-3 skeleton-shimmer rounded-lg w-20" />
        <div className="h-3 skeleton-shimmer rounded-lg w-32" />
      </div>
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <div className="h-5 skeleton-shimmer rounded-lg w-16" />
        <div className="h-3 skeleton-shimmer rounded-lg w-24" />
      </div>
    </div>
  );
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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔐</span>
        <h2 className="text-xl font-bold text-foreground">Sign in to view orders</h2>
        <p className="text-muted-foreground text-sm">Track your past and current orders.</p>
        <Link to="/auth" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 shadow-lg shadow-orange-500/25">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative pt-14 pb-8 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 mb-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 bg-muted/50 border border-border rounded-xl hover:bg-muted/70 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">Track and reorder your meals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-muted-foreground text-sm">Could not load orders. Please try again.</p>
          </div>
        ) : !data?.length ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <ReceiptText className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No orders yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Your order history will appear here.</p>
            <Link to="/restaurants" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 shadow-lg shadow-orange-500/25">
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
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-card border border-border hover:border-orange-500/20 rounded-2xl p-5 cursor-pointer group transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/5"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors">{order.restaurant_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.cuisine_type}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(order.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-sm font-bold text-foreground">₹{Number(order.total_amount).toFixed(0)}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-orange-400 transition-colors">
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
