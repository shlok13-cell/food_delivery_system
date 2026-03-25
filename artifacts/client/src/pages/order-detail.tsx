import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, MapPin, Package, CheckCircle2, ChefHat,
  Bike, PartyPopper, XCircle, Phone, ReceiptText,
} from "lucide-react";
import api from "@/lib/axios";

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string;
  icon: React.ReactNode; step: number;
}> = {
  pending:   { label: "Order Pending",    color: "text-yellow-500", bg: "bg-yellow-500/10",  border: "border-yellow-500/30", icon: <Clock className="w-4 h-4" />,        step: 0 },
  confirmed: { label: "Order Confirmed",  color: "text-blue-500",   bg: "bg-blue-500/10",    border: "border-blue-500/30",   icon: <CheckCircle2 className="w-4 h-4" />,  step: 1 },
  preparing: { label: "Preparing",        color: "text-orange-500", bg: "bg-orange-500/10",  border: "border-orange-500/30", icon: <ChefHat className="w-4 h-4" />,       step: 2 },
  ready:     { label: "Ready for Pickup", color: "text-green-500",  bg: "bg-green-500/10",   border: "border-green-500/30",  icon: <Package className="w-4 h-4" />,       step: 3 },
  picked_up: { label: "On the Way",       color: "text-purple-500", bg: "bg-purple-500/10",  border: "border-purple-500/30", icon: <Bike className="w-4 h-4" />,          step: 4 },
  delivered: { label: "Delivered",        color: "text-green-500",  bg: "bg-green-500/10",   border: "border-green-500/30",  icon: <PartyPopper className="w-4 h-4" />,   step: 5 },
  cancelled: { label: "Cancelled",        color: "text-red-500",    bg: "bg-red-500/10",     border: "border-red-500/30",    icon: <XCircle className="w-4 h-4" />,       step: -1 },
};

const STEPS = [
  { key: "pending",   label: "Confirmed",  icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: "preparing", label: "Preparing",  icon: <ChefHat className="w-4 h-4" /> },
  { key: "picked_up", label: "On the Way", icon: <Bike className="w-4 h-4" /> },
  { key: "delivered", label: "Delivered",  icon: <PartyPopper className="w-4 h-4" /> },
];

interface OrderItem {
  id: number;
  menu_item_id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderDetail {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  notes?: string;
  created_at: string;
  restaurant_name: string;
  cuisine_type: string;
  restaurant_phone?: string;
  items: OrderItem[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 skeleton-shimmer rounded-lg w-32" />
          <div className="h-4 skeleton-shimmer rounded-lg w-20" />
        </div>
        <div className="flex gap-2 mt-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full skeleton-shimmer" />
              <div className="h-2 skeleton-shimmer rounded w-12" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4 flex gap-4">
        <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton-shimmer rounded-lg w-2/5" />
          <div className="h-3 skeleton-shimmer rounded-lg w-1/4" />
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="h-5 skeleton-shimmer rounded-lg w-28" />
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 skeleton-shimmer rounded-lg w-2/5" />
            <div className="h-4 skeleton-shimmer rounded-lg w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { data: order, isLoading, error } = useQuery<OrderDetail>({
    queryKey: ["order", id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.data),
    enabled: !!user && !!id,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status || status === "delivered" || status === "cancelled") return false;
      return 30_000;
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-5xl">🔐</span>
        <h2 className="text-xl font-bold text-foreground">Sign in to view this order</h2>
        <Link to="/auth" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white">Sign In</Link>
      </div>
    );
  }

  const cfg = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"]) : null;
  const currentStep = cfg?.step ?? 0;
  const deliveryFee = 49;
  const platformFee = 5;
  const itemTotal = order ? order.items.reduce((s, i) => s + i.subtotal, 0) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/orders")}
            className="p-2 bg-muted/50 border border-border rounded-xl hover:bg-muted/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Order #{id}</h1>
            {order && <p className="text-sm text-muted-foreground">{order.restaurant_name} · {formatDate(order.created_at)}</p>}
          </div>
        </motion.div>

        {isLoading ? <Skeleton /> : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-muted-foreground mb-2">Could not load order details.</p>
            <p className="text-muted-foreground/60 text-sm mb-6">This may be due to a database connection issue.</p>
            <button onClick={() => navigate("/orders")} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white">
              Back to Orders
            </button>
          </motion.div>
        ) : order ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Status card */}
            <motion.div
              layout
              className={`border ${cfg!.border} ${cfg!.bg} rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`flex items-center gap-2 text-sm font-semibold ${cfg!.color}`}>
                  {cfg!.icon} {cfg!.label}
                </span>
                {order.status !== "cancelled" && (
                  <span className="text-xs text-muted-foreground">~25–35 min</span>
                )}
              </div>

              {order.status !== "cancelled" && (
                <div className="flex items-center gap-1">
                  {STEPS.map((step, i) => {
                    const done = currentStep > i;
                    const active = currentStep >= i;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`flex flex-col items-center gap-1 flex-1 ${active ? "opacity-100" : "opacity-30"}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                            done
                              ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30"
                              : active && currentStep === i
                              ? "bg-gradient-to-br from-orange-500/60 to-red-500/60 ring-2 ring-orange-400/40"
                              : "bg-muted"
                          }`}>
                            {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : (
                              <span className={active ? "text-foreground" : "text-muted-foreground"}>
                                {step.icon}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight w-14 hidden sm:block">{step.label}</span>
                        </motion.div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-px flex-1 mx-1 transition-all duration-500 ${done ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Restaurant info */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center text-2xl shrink-0">
                🍽️
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground">{order.restaurant_name}</p>
                <p className="text-xs text-muted-foreground">{order.cuisine_type}</p>
              </div>
              {order.restaurant_phone && (
                <a
                  href={`tel:${order.restaurant_phone}`}
                  className="p-2 bg-muted/50 border border-border rounded-xl hover:bg-muted/70 transition-colors shrink-0"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                </a>
              )}
            </div>

            {/* Items */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                <ReceiptText className="w-4 h-4 text-orange-400" /> Order Items
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {order.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-500 shrink-0">
                          {item.quantity}
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground/90 truncate">{item.item_name}</p>
                          <p className="text-xs text-muted-foreground">{item.category} · ₹{item.unit_price} each</p>
                        </div>
                      </div>
                      <span className="text-foreground/70 shrink-0 ml-3 font-medium">₹{Number(item.subtotal).toFixed(0)}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Item total</span><span>₹{itemTotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Platform fee</span><span>₹{platformFee}</span></div>
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Total Paid</span>
                  <span>₹{Number(order.total_amount).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> Delivery Address
              </p>
              <p className="text-sm text-foreground/80">{order.delivery_address}</p>
              {order.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">Note: {order.notes}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                to="/restaurants"
                className="flex-1 py-3 text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
              >
                Order Again
              </Link>
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 py-3 bg-card border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-muted/50 transition-colors"
              >
                All Orders
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
