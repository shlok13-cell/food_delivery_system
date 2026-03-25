import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, SlidersHorizontal, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import Navbar from "@/components/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" } }),
};

const CUISINES = ["All", "Indian", "Italian", "Japanese", "American", "Healthy", "Chinese"];

function SkeletonCard() {
  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-white/10" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

export default function Restaurants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "time" | "min_order">("rating");

  const { data, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => api.get("/restaurants").then((r) => r.data.data as Restaurant[]),
    staleTime: 60_000,
  });

  type Restaurant = {
    id: number; name: string; cuisine_type: string; rating: number;
    delivery_time?: string; min_order?: number; offer?: string;
    gradient?: string; emoji?: string; description?: string;
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let r = [...data];
    if (cuisine !== "All") r = r.filter((x) => x.cuisine_type === cuisine);
    if (search.trim()) r = r.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()) || x.cuisine_type.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "rating") r.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sortBy === "time") r.sort((a, b) => parseInt(a.delivery_time ?? "99") - parseInt(b.delivery_time ?? "99"));
    if (sortBy === "min_order") r.sort((a, b) => (a.min_order ?? 0) - (b.min_order ?? 0));
    return r;
  }, [data, cuisine, search, sortBy]);

  const gradients = ["from-orange-600 to-red-700", "from-red-700 to-rose-800", "from-violet-700 to-purple-900", "from-amber-600 to-orange-700", "from-green-700 to-emerald-900", "from-pink-700 to-red-900"];
  const emojis = ["🍛", "🍕", "🍣", "🍔", "🥗", "🍜"];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Navbar />

      {/* Header */}
      <div className="relative pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0500]/60 to-transparent" />
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl font-extrabold mb-2">
            Restaurants near you
          </motion.h1>
          <motion.p initial="hidden" animate="visible" custom={1} variants={fadeUp} className="text-white/40 mb-8">
            {isLoading ? "Fetching restaurants..." : `${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""} found`}
          </motion.p>

          {/* Search + Sort */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 focus-within:border-orange-500/40 transition-colors">
              <Search className="w-4 h-4 text-white/30 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2">
              <SlidersHorizontal className="w-4 h-4 text-white/40 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-sm text-white/70 outline-none"
              >
                <option value="rating" className="bg-[#1a1a1a]">Sort: Rating</option>
                <option value="time" className="bg-[#1a1a1a]">Sort: Delivery Time</option>
                <option value="min_order" className="bg-[#1a1a1a]">Sort: Min. Order</option>
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Cuisine filter tabs */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                cuisine === c
                  ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {c}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-white/40">No restaurants match your search.</p>
              <button onClick={() => { setSearch(""); setCuisine("All"); }} className="mt-4 text-orange-400 text-sm hover:text-orange-300">Clear filters</button>
            </motion.div>
          ) : (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r, i) => {
                const grad = r.gradient ?? gradients[i % gradients.length];
                const emoji = r.emoji ?? emojis[i % emojis.length];
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    custom={i * 0.06}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    className="bg-white/[0.04] backdrop-blur-sm border border-white/10 hover:border-orange-500/20 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-lg hover:shadow-orange-500/10 hover:shadow-xl"
                  >
                    <div className={`relative h-44 bg-gradient-to-br ${grad} flex items-center justify-center overflow-hidden`}>
                      <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                      {r.offer && (
                        <span className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold px-2.5 py-1 rounded-full text-white">
                          {r.offer}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full p-1.5">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">{r.name}</h3>
                        <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-0.5 ml-2 shrink-0">
                          <Star className="w-3 h-3 text-green-400 fill-green-400" />
                          <span className="text-xs font-bold text-green-400">{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mb-3">{r.cuisine_type}</p>
                      {r.description && <p className="text-xs text-white/30 mb-3 line-clamp-1">{r.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-white/50 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.delivery_time ?? "30-40"} mins</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>₹{r.min_order ?? 149} min</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
