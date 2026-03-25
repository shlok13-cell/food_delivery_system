import { useState } from "react";
import { Navigation, ZoomIn, ZoomOut, Maximize2, MapPin, Store } from "lucide-react";

interface DeliveryMapProps {
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  distanceKm: number;
  etaMinutes: number;
  status: string;
}

export default function DeliveryMap({
  restaurantName,
  restaurantAddress,
  customerName,
  customerAddress,
  distanceKm,
  etaMinutes,
  status,
}: DeliveryMapProps) {
  const [zoom, setZoom] = useState(14);
  const [mapStyle, setMapStyle] = useState<"map" | "satellite">("map");

  const delivered = status === "delivered" || status === "failed";
  const pickedUp = status === "picked_up" || status === "en_route" || delivered;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1a2035] border border-white/10 select-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapStyle === "map" ? "#1e293b" : "#1a2a1a"} strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        <rect width="600" height="400" fill={mapStyle === "map" ? "#162032" : "#0d1a0d"} />
        <rect width="600" height="400" fill="url(#grid)" />

        {mapStyle === "map" ? (
          <>
            <rect x="0" y="160" width="600" height="18" fill="#1e3a52" opacity="0.6" />
            <rect x="0" y="200" width="600" height="12" fill="#1e3a52" opacity="0.5" />
            <rect x="0" y="240" width="600" height="8" fill="#1e3a52" opacity="0.4" />
            <rect x="120" y="0" width="16" height="400" fill="#1e3a52" opacity="0.6" />
            <rect x="200" y="0" width="10" height="400" fill="#1e3a52" opacity="0.5" />
            <rect x="350" y="0" width="14" height="400" fill="#1e3a52" opacity="0.6" />
            <rect x="450" y="0" width="8" height="400" fill="#1e3a52" opacity="0.4" />

            <rect x="30" y="90" width="70" height="50" rx="4" fill="#1e3045" opacity="0.7" />
            <rect x="240" y="50" width="90" height="65" rx="4" fill="#1e3045" opacity="0.7" />
            <rect x="400" y="100" width="60" height="40" rx="4" fill="#1e3045" opacity="0.7" />
            <rect x="50" y="280" width="55" height="60" rx="4" fill="#1e3045" opacity="0.7" />
            <rect x="300" y="270" width="80" height="55" rx="4" fill="#1e3045" opacity="0.7" />
            <rect x="480" y="250" width="90" height="70" rx="4" fill="#1e3045" opacity="0.7" />
            <circle cx="180" cy="310" r="40" fill="#162b20" opacity="0.6" />
            <circle cx="430" cy="60" r="30" fill="#162b20" opacity="0.6" />
          </>
        ) : (
          <>
            <rect x="0" y="160" width="600" height="18" fill="#2a4a2a" opacity="0.8" />
            <rect x="0" y="200" width="600" height="12" fill="#2a4a2a" opacity="0.6" />
            <rect x="120" y="0" width="16" height="400" fill="#2a4a2a" opacity="0.8" />
            <rect x="350" y="0" width="14" height="400" fill="#2a4a2a" opacity="0.8" />
            <rect x="30" y="90" width="70" height="50" rx="4" fill="#1a3a1a" opacity="0.8" />
            <rect x="240" y="50" width="90" height="65" rx="4" fill="#1a3a1a" opacity="0.8" />
            <circle cx="180" cy="310" r="40" fill="#0d2a0d" opacity="0.8" />
          </>
        )}

        <path
          d="M 140 170 Q 200 165 250 200 Q 310 235 350 200 Q 400 165 430 200"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeDasharray="8 4"
          opacity="0.3"
        />
        <path
          d="M 140 170 Q 200 165 250 200 Q 310 235 350 200 Q 400 165 430 200"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="3.5"
          strokeDasharray={delivered ? "none" : "12 6"}
          opacity={delivered ? 1 : 0.9}
          filter="url(#glow)"
        />

        <g transform="translate(120, 150)">
          <circle cx="0" cy="0" r="18" fill="#f97316" opacity="0.2" />
          <circle cx="0" cy="0" r="12" fill="#f97316" opacity="0.4" />
          <circle cx="0" cy="0" r="7" fill="#f97316" />
          <text x="0" y="-22" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold" fontFamily="system-ui">
            PICK UP
          </text>
        </g>

        <g transform="translate(450, 200)">
          <circle cx="0" cy="0" r="18" fill={pickedUp ? "#22c55e" : "#6b7280"} opacity="0.2" />
          <circle cx="0" cy="0" r="12" fill={pickedUp ? "#22c55e" : "#6b7280"} opacity="0.4" />
          <circle cx="0" cy="0" r="7" fill={pickedUp ? "#22c55e" : "#6b7280"} />
          <text x="0" y="-22" textAnchor="middle" fill={pickedUp ? "#22c55e" : "#9ca3af"} fontSize="10" fontWeight="bold" fontFamily="system-ui">
            DROP OFF
          </text>
        </g>

        {!delivered && (
          <g transform="translate(280, 195)">
            <circle cx="0" cy="0" r="14" fill="#3b82f6" opacity="0.3" />
            <circle cx="0" cy="0" r="8" fill="#3b82f6" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="middle" fontSize="10">🛵</text>
          </g>
        )}

        <text x="10" y="395" fill="#ffffff20" fontSize="8" fontFamily="system-ui">© FoodRush Maps</text>
        <text x="510" y="395" fill="#ffffff20" fontSize="8" fontFamily="system-ui">Zoom {zoom}</text>
      </svg>

      <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
        <div className="bg-[#0d0d0d]/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 max-w-[60%]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Store size={11} className="text-orange-400 shrink-0" />
            <span className="text-white/50 text-[10px] font-medium truncate">{restaurantName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-green-400 shrink-0" />
            <span className="text-white/50 text-[10px] truncate">{customerName}</span>
          </div>
        </div>

        {!delivered && (
          <div className="bg-blue-600/90 backdrop-blur-sm border border-blue-500/40 rounded-xl px-3 py-2 text-right">
            <p className="text-white font-bold text-sm leading-none">{etaMinutes} min</p>
            <p className="text-blue-200 text-[10px] mt-0.5">{distanceKm} km away</p>
          </div>
        )}
        {delivered && (
          <div className="bg-green-600/90 backdrop-blur-sm border border-green-500/40 rounded-xl px-3 py-2">
            <p className="text-white font-bold text-xs">✓ Delivered</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3">
        <div className="flex bg-[#0d0d0d]/90 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setMapStyle("map")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${mapStyle === "map" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}
          >
            Map
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${mapStyle === "satellite" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"}`}
          >
            Satellite
          </button>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 19))}
          className="w-8 h-8 bg-[#0d0d0d]/90 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 8))}
          className="w-8 h-8 bg-[#0d0d0d]/90 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ZoomOut size={14} />
        </button>
        <button className="w-8 h-8 bg-[#0d0d0d]/90 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Navigation size={14} />
        </button>
        <button className="w-8 h-8 bg-[#0d0d0d]/90 border border-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="absolute bottom-14 right-3 bg-[#0d0d0d]/90 border border-white/10 rounded-lg p-2">
        <div className="flex items-center gap-2 text-[10px] text-white/50 mb-1">
          <div className="w-3 h-0.5 bg-orange-400 rounded" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <div className="w-3 h-0.5 bg-green-400 rounded" />
          <span>Dropoff</span>
        </div>
      </div>
    </div>
  );
}
