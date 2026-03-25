import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: "Pending",          color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20" },
  confirmed:        { label: "Confirmed",        color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20" },
  preparing:        { label: "Preparing",        color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/20" },
  out_for_delivery: { label: "Out for Delivery", color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20" },
  delivered:        { label: "Delivered",        color: "text-green-400",   bg: "bg-green-400/10 border-green-400/20" },
  cancelled:        { label: "Cancelled",        color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20" },
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

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: "text-white/50", bg: "bg-white/5 border-white/10" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color} ${meta.bg}`}>
      {meta.label}
    </span>
  );
}

function StatusSelect({ orderId, current }: { orderId: number; current: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[current] ?? STATUS_META.pending;

  const mutation = useMutation({
    mutationFn: (status: string) =>
      api.put(`/api/dashboard/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-orders"] });
      setOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={current === "delivered" || current === "cancelled"}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors
          ${meta.color} ${meta.bg}
          ${current === "delivered" || current === "cancelled" ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}`}
      >
        {meta.label}
        {current !== "delivered" && current !== "cancelled" && <ChevronDown size={12} />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
            {STATUS_FLOW.map(s => {
              const m = STATUS_META[s];
              return (
                <button
                  key={s}
                  onClick={() => mutation.mutate(s)}
                  disabled={s === current || mutation.isPending}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors
                    ${s === current ? `${m.color} bg-white/5 cursor-default` : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const FILTER_OPTIONS = ["all", "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

export default function DashboardOrders() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => api.get<{ data: Order[] }>("/api/dashboard/orders").then(r => r.data.data),
    refetchInterval: 30000,
  });

  const filtered = (data ?? []).filter(o => filter === "all" || o.status === filter);

  const counts = (data ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-white/40 text-sm mt-0.5">{data?.length ?? 0} total orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(f => {
          const meta = f === "all" ? null : STATUS_META[f];
          const count = f === "all" ? (data?.length ?? 0) : (counts[f] ?? 0);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${filter === f
                  ? (meta ? `${meta.color} ${meta.bg}` : "text-white bg-white/10 border-white/20")
                  : "text-white/40 bg-transparent border-white/10 hover:border-white/20 hover:text-white/60"
                }`}
            >
              {meta ? meta.label : "All"} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders{filter !== "all" ? ` with status "${STATUS_META[filter]?.label}"` : ""}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">#{order.id}</span>
                  <StatusBadge status={order.status} />
                  <span className="text-white/30 text-xs">{timeAgo(order.created_at)}</span>
                </div>
                <p className="text-white/70 text-sm mt-1 font-medium">{order.customer_name}</p>
                <p className="text-white/30 text-xs">{order.delivery_address}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-400 font-bold">₹{order.total_amount}</span>
                <StatusSelect orderId={order.id} current={order.status} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
              {order.items.map((item, i) => (
                <span key={i} className="text-xs bg-white/5 text-white/50 px-2 py-1 rounded-lg">
                  {item.quantity}× {item.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
