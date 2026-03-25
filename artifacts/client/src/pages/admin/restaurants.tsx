import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Store, Star, MapPin, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Restaurant {
  id: number;
  name: string;
  cuisine_type: string;
  address: string;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  minimum_order: number;
  emoji: string;
  gradient: string;
  active: boolean;
}

export default function AdminRestaurants() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const qc = useQueryClient();

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["admin-restaurants"],
    queryFn: () => api.get("/api/admin/restaurants").then(r => r.data.data),
  });

  const toggleActive = useMutation({
    mutationFn: (id: number) => api.patch(`/api/admin/restaurants/${id}/toggle`, {}),
    onSuccess: (res, id) => {
      qc.setQueryData<Restaurant[]>(["admin-restaurants"], prev =>
        prev?.map(r => r.id === id ? { ...r, active: res.data.data.active } : r)
      );
      toast.success(res.data.data.active ? "Restaurant activated" : "Restaurant deactivated");
    },
    onError: () => toast.error("Failed to update restaurant"),
  });

  const filtered = (restaurants ?? []).filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.cuisine_type.toLowerCase().includes(q);
    const matchFilter = filter === "all" || (filter === "active" ? r.active : !r.active);
    return matchSearch && matchFilter;
  });

  const activeCount = restaurants?.filter(r => r.active).length ?? 0;
  const totalCount = restaurants?.length ?? 0;

  return (
    <div className="p-6 space-y-5 text-white">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Restaurants</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {activeCount} active · {totalCount - activeCount} inactive · {totalCount} total
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants or cuisine…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/40"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                filter === f
                  ? f === "active" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : f === "inactive" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/[0.04] border border-white/[0.06] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-white/30">
          <Store size={32} className="mx-auto mb-2 opacity-40" />
          <p>No restaurants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[#141414] border rounded-2xl p-4 transition-all ${
                r.active ? "border-white/8 hover:border-white/15" : "border-white/5 opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-2xl shrink-0`}>
                    {r.emoji}
                  </div>
                  <div>
                    <p className="text-white font-bold leading-tight">{r.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.cuisine_type}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive.mutate(r.id)}
                  disabled={toggleActive.isPending}
                  className="shrink-0 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                  title={r.active ? "Deactivate restaurant" : "Activate restaurant"}
                >
                  {r.active
                    ? <ToggleRight size={28} className="text-green-400" />
                    : <ToggleLeft size={28} className="text-white/30" />
                  }
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{r.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">{r.rating}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {r.delivery_time_min}–{r.delivery_time_max} min
                  </span>
                  <span>Min ₹{r.minimum_order}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  r.active ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                }`}>
                  {r.active ? "● Active" : "○ Inactive"}
                </span>
                <span className="text-white/30 text-xs">ID #{r.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
