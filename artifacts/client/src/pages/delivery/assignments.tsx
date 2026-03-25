import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Clock, Package, ChevronRight, Bike, CheckCircle2, AlertCircle, Navigation } from "lucide-react";
import api from "@/lib/axios";

interface Assignment {
  id: number;
  order_id: number;
  status: "assigned" | "picked_up" | "en_route" | "delivered" | "failed";
  restaurant_name: string;
  restaurant_address: string;
  customer_name: string;
  customer_address: string;
  total_amount: number;
  distance_km: number;
  eta_minutes: number;
  created_at: string;
  delivered_at: string | null;
  earnings: number;
  items: { name: string; quantity: number }[];
}

interface Stats {
  total_deliveries: number;
  today_deliveries: number;
  active_deliveries: number;
  total_earnings: number;
  today_earnings: number;
  rating: number;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  assigned:   { label: "Assigned",        color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20", icon: <Package size={12} /> },
  picked_up:  { label: "Picked Up",       color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",    icon: <Bike size={12} /> },
  en_route:   { label: "En Route",        color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20", icon: <Navigation size={12} /> },
  delivered:  { label: "Delivered",       color: "text-green-400",   bg: "bg-green-400/10 border-green-400/20",  icon: <CheckCircle2 size={12} /> },
  failed:     { label: "Failed",          color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20",      icon: <AlertCircle size={12} /> },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function DeliveryAssignments() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["delivery-assignments"],
    queryFn: () => api.get<{ data: Assignment[] }>("/api/delivery/assignments").then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ["delivery-stats"],
    queryFn: () => api.get<{ data: Stats }>("/api/delivery/stats").then(r => r.data.data),
  });

  const active = (assignments ?? []).filter(a => a.status !== "delivered" && a.status !== "failed");
  const history = (assignments ?? []).filter(a => a.status === "delivered" || a.status === "failed");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Deliveries</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {active.length} active · {history.length} completed today
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.today_deliveries}</p>
            <p className="text-white/40 text-xs mt-1">Today's Trips</p>
          </div>
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">₹{stats.today_earnings}</p>
            <p className="text-white/40 text-xs mt-1">Today's Earnings</p>
          </div>
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.rating}</p>
            <p className="text-white/40 text-xs mt-1">Rating ⭐</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && active.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Active</h2>
          <div className="space-y-3">
            {active.map(a => {
              const meta = STATUS_META[a.status];
              return (
                <Link
                  key={a.id}
                  to={`/delivery/assignments/${a.id}`}
                  className="block bg-[#161616] border border-blue-500/20 rounded-2xl p-4 hover:border-blue-500/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">Order #{a.order_id}</span>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.color} ${meta.bg}`}>
                          {meta.icon}{meta.label}
                        </span>
                        <span className="text-white/30 text-xs">{timeAgo(a.created_at)}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-400 mt-1 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white/80 text-xs font-medium">{a.restaurant_name}</p>
                            <p className="text-white/40 text-xs truncate">{a.restaurant_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 mt-1 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white/80 text-xs font-medium">{a.customer_name}</p>
                            <p className="text-white/40 text-xs truncate">{a.customer_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                      <span className="text-green-400 font-bold text-sm">₹{a.earnings}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><MapPin size={11} />{a.distance_km} km</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{a.eta_minutes} min ETA</span>
                    <span className="flex items-center gap-1"><Package size={11} />{a.items.length} items</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && active.length === 0 && (
        <div className="text-center py-10 bg-[#161616] border border-white/8 rounded-2xl">
          <Bike size={36} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 font-medium text-sm">No active deliveries</p>
          <p className="text-white/20 text-xs mt-1">New assignments will appear here</p>
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">Completed</h2>
          <div className="space-y-2">
            {history.map(a => {
              const meta = STATUS_META[a.status];
              return (
                <Link
                  key={a.id}
                  to={`/delivery/assignments/${a.id}`}
                  className="flex items-center gap-4 bg-[#161616] border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-colors group opacity-70 hover:opacity-90"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    {a.status === "delivered"
                      ? <CheckCircle2 size={18} className="text-green-400" />
                      : <AlertCircle size={18} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-medium">#{a.order_id} · {a.customer_name}</p>
                    <p className="text-white/30 text-xs">{timeAgo(a.delivered_at ?? a.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold text-sm">₹{a.earnings}</p>
                    <p className="text-white/30 text-xs">{a.distance_km} km</p>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
