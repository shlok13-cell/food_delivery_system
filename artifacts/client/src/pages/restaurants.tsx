import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, SlidersHorizontal, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import Navbar from "@/components/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const } }),
};

const CUISINES = ["All", "Indian", "Italian", "Japanese", "American", "Healthy", "Chinese"];

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="h-44 skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton-shimmer rounded-lg w-2/3" />
        <div className="h-3 skeleton-shimmer rounded-lg w-1/2" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 skeleton-shimmer rounded-lg w-20" />
          <div className="h-3 skeleton-shimmer rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}

export default function Restaurants() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [cuisine, setCuisine] = useState(() => {
    const c = searchParams.get("cuisine") ?? "All";
    return CUISINES.includes(c) ? c : "All";
  });
  const [sortBy, setSortBy] = useState<"rating" | "time" | "min_order">("rating");

  useEffect(() => {
    const s = searchParams.get("search") ?? "";
    const c = searchParams.get("cuisine") ?? "All";
    setSearch(s);
    setCuisine(CUISINES.includes(c) ? c : "All");
  }, [searchParams]);

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <div className="relative pt-24 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 dark:from-orange-950/30 to-transparent" />
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-orange-500/8 dark:bg-orange-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl font-extrabold mb-2 text-foreground">
            Restaurants near you
          </motion.h1>
          <motion.p initial="hidden" animate="visible" custom={1} variants={fadeUp} className="text-muted-foreground mb-8">
            {isLoading ? "Fetching restaurants..." : `${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""} found`}
          </motion.p>

          {/* Search + Sort */}
          <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-orange-500/40 transition-colors shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-sm text-foreground outline-none"
              >
                <option value="rating">Sort: Rating</option>
                <option value="time">Sort: Delivery Time</option>
                <option value="min_order">Sort: Min. Order</option>
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Cuisine filter tabs */}
        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CUISINES.map((c) => (
            <motion.button
              key={c}
              onClick={() => setCuisine(c)}
              whileTap={{ scale: 0.96 }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                cuisine === c
                  ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent text-white shadow-lg shadow-orange-500/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div key="loading" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-muted-foreground">No restaurants match your search.</p>
              <button onClick={() => { setSearch(""); setCuisine("All"); }} className="mt-4 text-orange-500 text-sm hover:text-orange-400 font-medium">Clear filters</button>
            </motion.div>
          ) : (
            <motion.div layout key="grid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => navigate(`/restaurants/${r.id}`)}
                    className="bg-card border border-border hover:border-orange-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/10"
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
                        <h3 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors">{r.name}</h3>
                        <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-0.5 ml-2 shrink-0">
                          <Star className="w-3 h-3 text-green-500 fill-green-500" />
                          <span className="text-xs font-bold text-green-500">{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{r.cuisine_type}</p>
                      {r.description && <p className="text-xs text-muted-foreground/70 mb-3 line-clamp-1">{r.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.delivery_time ?? "30-40"} mins</span>
                        <span className="w-1 h-1 bg-border rounded-full" />
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
