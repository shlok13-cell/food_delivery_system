import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, CheckCircle2, Package, ChevronLeft, Wifi, WifiOff } from "lucide-react";
import { getSocket } from "@/lib/socket";

interface LocationUpdate {
  lat: number;
  lng: number;
  progress: number;
  status: string;
  restaurant_name: string;
  customer_name: string;
  simulated: boolean;
}

const STATUS_INFO: Record<string, { label: string; sub: string; color: string; emoji: string }> = {
  assigned:   { label: "Order Confirmed",   sub: "Your delivery partner is heading to the restaurant", color: "text-yellow-400", emoji: "✅" },
  picked_up:  { label: "On the Way!",       sub: "Your food has been picked up and is heading to you", color: "text-blue-400",   emoji: "🛵" },
  en_route:   { label: "Almost There!",     sub: "Your delivery partner is close by",                  color: "text-purple-400", emoji: "🚀" },
  delivered:  { label: "Delivered!",        sub: "Your order has been delivered. Enjoy your meal!",    color: "text-green-400",  emoji: "🎉" },
  failed:     { label: "Delivery Issue",    sub: "There was an issue with your delivery",              color: "text-red-400",    emoji: "⚠️" },
};

const SVG_W = 600;
const SVG_H = 360;

const PICKUP_SVG  = { x: 138, y: 158 };
const DROPOFF_SVG = { x: 455, y: 208 };
const CP1_SVG     = { x: 240, y: 115 };
const CP2_SVG     = { x: 350, y: 255 };

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t;
  return u ** 3 * p0 + 3 * u ** 2 * t * p1 + 3 * u * t ** 2 * p2 + t ** 3 * p3;
}

function getRiderPos(progress: number): { x: number; y: number; angle: number } {
  const t = Math.max(0, Math.min(1, progress));
  const dt = 0.01;
  const x = cubicBezier(t, PICKUP_SVG.x, CP1_SVG.x, CP2_SVG.x, DROPOFF_SVG.x);
  const y = cubicBezier(t, PICKUP_SVG.y, CP1_SVG.y, CP2_SVG.y, DROPOFF_SVG.y);
  const x2 = cubicBezier(Math.min(t + dt, 1), PICKUP_SVG.x, CP1_SVG.x, CP2_SVG.x, DROPOFF_SVG.x);
  const y2 = cubicBezier(Math.min(t + dt, 1), PICKUP_SVG.y, CP1_SVG.y, CP2_SVG.y, DROPOFF_SVG.y);
  const angle = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI);
  return { x, y, angle };
}

const pathD = `M ${PICKUP_SVG.x} ${PICKUP_SVG.y} C ${CP1_SVG.x} ${CP1_SVG.y}, ${CP2_SVG.x} ${CP2_SVG.y}, ${DROPOFF_SVG.x} ${DROPOFF_SVG.y}`;

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [dots, setDots] = useState(1);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const interval = setInterval(() => setDots(d => (d % 3) + 1), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setConnected(true);
      socket.emit("join:track", orderId);
    };
    const onDisconnect = () => setConnected(false);
    const onLocation = (data: LocationUpdate) => setLocation(data);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("location:update", onLocation);

    if (socket.connected) {
      setConnected(true);
      socket.emit("join:track", orderId);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("location:update", onLocation);
    };
  }, [orderId]);

  const progress = location?.progress ?? 0;
  const status = location?.status ?? "assigned";
  const riderPos = getRiderPos(progress);
  const info = STATUS_INFO[status] ?? STATUS_INFO.assigned;
  const isDelivered = status === "delivered";

  const etaMinutes = isDelivered ? 0 : Math.max(0, Math.round((1 - progress) * 25));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center gap-3">
        <Link to="/orders" className="p-2 bg-white/8 border border-white/10 rounded-xl hover:bg-white/12 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-bold text-base">Track Order #{orderId}</h1>
          <p className="text-white/40 text-xs">Live delivery tracking</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${connected ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-white/30 bg-white/5 border-white/10"}`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Live" : "Connecting" + ".".repeat(dots)}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ height: "min(55vw, 340px)" }}
        >
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
            </filter>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          <rect width={SVG_W} height={SVG_H} fill="url(#bgGrad)" />

          {[...Array(8)].map((_, i) => (
            <line
              key={`h${i}`}
              x1={0} y1={i * 50} x2={SVG_W} y2={i * 50}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1"
            />
          ))}
          {[...Array(13)].map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 50} y1={0} x2={i * 50} y2={SVG_H}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1"
            />
          ))}

          <path d={pathD} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d={pathD} stroke="url(#routeGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="8 5" opacity="0.7" />

          {progress > 0 && !isDelivered && (
            <path
              d={pathD}
              stroke="#f97316"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progress * 430} 430`}
              opacity="0.9"
            />
          )}

          <circle cx={PICKUP_SVG.x} cy={PICKUP_SVG.y} r="22" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
          <circle cx={PICKUP_SVG.x} cy={PICKUP_SVG.y} r="14" fill="#f97316" />
          <text x={PICKUP_SVG.x} y={PICKUP_SVG.y + 5} textAnchor="middle" fontSize="14">🍽️</text>
          <text x={PICKUP_SVG.x} y={PICKUP_SVG.y + 34} textAnchor="middle" fontSize="10" fill="rgba(249,115,22,0.9)" fontFamily="sans-serif" fontWeight="bold">
            {location?.restaurant_name?.split(" ")[0] ?? "Restaurant"}
          </text>

          <circle cx={DROPOFF_SVG.x} cy={DROPOFF_SVG.y} r="22" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
          <circle cx={DROPOFF_SVG.x} cy={DROPOFF_SVG.y} r="14" fill="#22c55e" />
          <text x={DROPOFF_SVG.x} y={DROPOFF_SVG.y + 5} textAnchor="middle" fontSize="14">🏠</text>
          <text x={DROPOFF_SVG.x} y={DROPOFF_SVG.y + 34} textAnchor="middle" fontSize="10" fill="rgba(34,197,94,0.9)" fontFamily="sans-serif" fontWeight="bold">
            Your Place
          </text>

          {!isDelivered && location && (
            <g transform={`translate(${riderPos.x}, ${riderPos.y})`} filter="url(#shadow)">
              <circle r="20" fill="rgba(59,130,246,0.2)" />
              <circle r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" from="20" to="32" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle r="16" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
              <text y="6" textAnchor="middle" fontSize="18">🛵</text>
            </g>
          )}

          {isDelivered && (
            <g transform={`translate(${DROPOFF_SVG.x}, ${DROPOFF_SVG.y})`}>
              <circle r="24" fill="rgba(34,197,94,0.2)" />
              <circle r="16" fill="#16a34a" stroke="#22c55e" strokeWidth="2" />
              <text y="6" textAnchor="middle" fontSize="16">✅</text>
            </g>
          )}
        </svg>

        {location && (
          <div className="absolute top-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-white/70">{Math.round(progress * 100)}% complete</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#161616] border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{info.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base ${info.color}`}>{info.label}</p>
                <p className="text-white/50 text-sm mt-0.5 leading-relaxed">{info.sub}</p>
              </div>
              {!isDelivered && (
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-lg">{etaMinutes}m</p>
                  <p className="text-white/40 text-xs">ETA</p>
                </div>
              )}
            </div>

            {!isDelivered && (
              <div className="mt-3 pt-3 border-t border-white/8">
                <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Restaurant</span>
                  <span className="flex items-center gap-1">Your place <MapPin className="w-3 h-3" /></span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#161616] border border-white/8 rounded-xl p-3 text-center">
            <Package className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-white/40 text-xs">Order</p>
            <p className="text-white text-xs font-bold">#{orderId}</p>
          </div>
          <div className="bg-[#161616] border border-white/8 rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-white/40 text-xs">ETA</p>
            <p className="text-white text-xs font-bold">{isDelivered ? "Done!" : `${etaMinutes} min`}</p>
          </div>
          <div className="bg-[#161616] border border-white/8 rounded-xl p-3 text-center">
            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-white/40 text-xs">Progress</p>
            <p className="text-white text-xs font-bold">{Math.round(progress * 100)}%</p>
          </div>
        </div>

        {!connected && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
            <WifiOff className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-yellow-400/80 text-xs">{"Connecting to live tracking" + ".".repeat(dots)}</p>
          </div>
        )}

        {location?.simulated && connected && (
          <p className="text-white/20 text-xs text-center">📡 Simulated GPS · Updates every 3 seconds</p>
        )}
      </div>
    </div>
  );
}
