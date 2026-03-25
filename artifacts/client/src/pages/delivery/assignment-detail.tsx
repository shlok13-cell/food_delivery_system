import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, MapPin, Package, Clock, Navigation, CheckCircle2, Bike, Store, ChevronRight, Radio } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import DeliveryMap from "@/components/DeliveryMap";
import { getSocket } from "@/lib/socket";

interface Assignment {
  id: number;
  order_id: number;
  status: "assigned" | "picked_up" | "en_route" | "delivered" | "failed";
  restaurant_name: string;
  restaurant_address: string;
  restaurant_lat: number;
  restaurant_lng: number;
  customer_name: string;
  customer_address: string;
  customer_lat: number;
  customer_lng: number;
  customer_phone: string;
  total_amount: number;
  distance_km: number;
  eta_minutes: number;
  created_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  earnings: number;
  items: { name: string; quantity: number }[];
}

const STATUS_FLOW: { status: string; label: string; action: string; color: string }[] = [
  { status: "assigned",  label: "Assigned",  action: "Head to Restaurant",   color: "bg-yellow-500 hover:bg-yellow-600" },
  { status: "picked_up", label: "Picked Up", action: "Mark as Picked Up",    color: "bg-blue-500 hover:bg-blue-600" },
  { status: "en_route",  label: "En Route",  action: "Start Delivery",       color: "bg-purple-500 hover:bg-purple-600" },
  { status: "delivered", label: "Delivered", action: "Confirm Delivery",     color: "bg-green-500 hover:bg-green-600" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  assigned:   { label: "Assigned",  color: "text-yellow-400" },
  picked_up:  { label: "Picked Up", color: "text-blue-400" },
  en_route:   { label: "En Route",  color: "text-purple-400" },
  delivered:  { label: "Delivered", color: "text-green-400" },
  failed:     { label: "Failed",    color: "text-red-400" },
};

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const socketRef = useRef(getSocket());
  const gpsWatchRef = useRef<number | null>(null);
  const [isEmitting, setIsEmitting] = useState(false);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["delivery-assignment", id],
    queryFn: () => api.get<{ data: Assignment }>(`/api/delivery/assignments/${id}`).then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      api.put(`/api/delivery/assignments/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-assignment", id] });
      qc.invalidateQueries({ queryKey: ["delivery-assignments"] });
      qc.invalidateQueries({ queryKey: ["delivery-stats"] });
      toast.success("Status updated!");
    },
    onError: () => toast.error("Failed to update status"),
  });

  useEffect(() => {
    if (!assignment) return;
    const isActive = assignment.status === "picked_up" || assignment.status === "en_route";
    if (!isActive) return;

    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    socket.emit("join:delivery", assignment.id);
    setIsEmitting(true);

    const emitLocation = (lat: number, lng: number) => {
      socket.emit("location:update", { assignmentId: assignment.id, lat, lng });
    };

    if ("geolocation" in navigator) {
      gpsWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => emitLocation(pos.coords.latitude, pos.coords.longitude),
        () => {
          const simInterval = setInterval(() => {
            const progress = 0.3 + Math.random() * 0.4;
            const lat = assignment.restaurant_lat + (assignment.customer_lat - assignment.restaurant_lat) * progress;
            const lng = assignment.restaurant_lng + (assignment.customer_lng - assignment.restaurant_lng) * progress;
            emitLocation(lat, lng);
          }, 5000);
          return () => clearInterval(simInterval);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    return () => {
      setIsEmitting(false);
      if (gpsWatchRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
      socket.off("connect");
    };
  }, [assignment]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse max-w-2xl mx-auto">
        <div className="h-8 bg-white/5 rounded-xl w-32" />
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-center text-white/40">
        <p>Assignment not found</p>
        <button onClick={() => navigate("/delivery/assignments")} className="mt-3 text-blue-400 text-sm hover:underline">
          Back to Assignments
        </button>
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.findIndex(s => s.status === assignment.status);
  const nextStep = STATUS_FLOW[currentIdx + 1];
  const isComplete = assignment.status === "delivered" || assignment.status === "failed";
  const isActive = assignment.status === "picked_up" || assignment.status === "en_route";
  const meta = STATUS_META[assignment.status] ?? STATUS_META.assigned;

  const timeline = [
    { label: "Order Assigned", time: assignment.created_at, done: true },
    { label: "Picked Up from Restaurant", time: assignment.picked_up_at, done: !!assignment.picked_up_at },
    { label: "Delivered to Customer", time: assignment.delivered_at, done: !!assignment.delivered_at },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/8 z-10 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/delivery/assignments")}
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors -ml-2"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold">Order #{assignment.order_id}</h1>
            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="text-white/30 text-xs">{assignment.distance_km} km · ₹{assignment.earnings} earnings</p>
        </div>
        {isEmitting && isActive && (
          <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
            <Radio size={12} className="animate-pulse" />
            Live
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="h-64 md:h-80 rounded-2xl overflow-hidden">
          <DeliveryMap
            restaurantName={assignment.restaurant_name}
            restaurantAddress={assignment.restaurant_address}
            customerName={assignment.customer_name}
            customerAddress={assignment.customer_address}
            distanceKm={assignment.distance_km}
            etaMinutes={assignment.eta_minutes}
            status={assignment.status}
          />
        </div>

        {isActive && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-center gap-2">
            <Radio size={14} className="text-blue-400 animate-pulse shrink-0" />
            <p className="text-blue-400/90 text-xs">
              Broadcasting your location live to the customer. Customers can track at{" "}
              <span className="font-mono text-blue-300">/track/{assignment.order_id}</span>
            </p>
          </div>
        )}

        {!isComplete && nextStep && (
          <button
            onClick={() => statusMutation.mutate(nextStep.status)}
            disabled={statusMutation.isPending}
            className={`w-full py-4 rounded-2xl text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${nextStep.color}`}
          >
            {statusMutation.isPending ? (
              <span>Updating…</span>
            ) : (
              <>
                {nextStep.status === "picked_up" && <Bike size={18} />}
                {nextStep.status === "en_route" && <Navigation size={18} />}
                {nextStep.status === "delivered" && <CheckCircle2 size={18} />}
                {nextStep.action}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}

        {isComplete && (
          <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm
            ${assignment.status === "delivered" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
            <CheckCircle2 size={18} />
            {assignment.status === "delivered" ? "Delivery Completed!" : "Delivery Failed"}
          </div>
        )}

        <div className="bg-[#161616] border border-white/8 rounded-2xl p-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Store size={14} className="text-orange-400" />
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Pick up from</p>
            </div>
            <p className="text-white font-semibold">{assignment.restaurant_name}</p>
            <p className="text-white/50 text-sm mt-0.5">{assignment.restaurant_address}</p>
          </div>
          <div className="border-t border-white/5" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-green-400" />
                <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Deliver to</p>
              </div>
              <a
                href={`tel:${assignment.customer_phone}`}
                className="flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded-lg"
              >
                <Phone size={12} />
                Call
              </a>
            </div>
            <p className="text-white font-semibold">{assignment.customer_name}</p>
            <p className="text-white/50 text-sm mt-0.5">{assignment.customer_address}</p>
            <p className="text-white/30 text-xs mt-0.5">{assignment.customer_phone}</p>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-white/50" />
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Order Items</p>
          </div>
          <div className="space-y-2">
            {assignment.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{item.name}</span>
                <span className="text-white/40">×{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 mt-3 pt-3 flex justify-between items-center">
            <span className="text-white/50 text-sm">Order Total</span>
            <span className="text-white font-bold">₹{assignment.total_amount}</span>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-white/50" />
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Timeline</p>
          </div>
          <div className="space-y-4">
            {timeline.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-blue-500" : "bg-white/10"}`}>
                  {step.done && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.done ? "text-white" : "text-white/30"}`}>{step.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{formatTime(step.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isComplete && (
          <button
            onClick={() => statusMutation.mutate("failed")}
            disabled={statusMutation.isPending}
            className="w-full py-3 rounded-2xl text-red-400/70 text-sm font-medium border border-red-500/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            Report Delivery Issue
          </button>
        )}
      </div>
    </div>
  );
}
