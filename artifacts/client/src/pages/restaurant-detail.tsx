import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingCart, Leaf, Flame } from "lucide-react";
import api from "@/lib/axios";
import { useCart, type CartItem } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

interface Restaurant {
  id: number; name: string; cuisine_type: string; rating: number;
  description?: string; address?: string; city?: string; delivery_time?: string;
  min_order?: number; phone?: string; gradient?: string; emoji?: string;
}
interface MenuItem {
  id: number; restaurant_id: number; name: string; description?: string;
  price: number; category: string; emoji?: string; is_veg?: boolean;
  is_bestseller?: boolean; is_available?: number;
}

const GRADIENTS = ["from-orange-600 to-red-700", "from-red-700 to-rose-800", "from-violet-700 to-purple-900", "from-amber-600 to-orange-700", "from-green-700 to-emerald-900", "from-pink-700 to-red-900"];

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, setQty, getItemQty, totalItems, totalPrice, restaurantId: cartRestaurantId } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [switchWarning, setSwitchWarning] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  const { data: restaurant, isLoading: rLoading } = useQuery<Restaurant>({
    queryKey: ["restaurant", id],
    queryFn: () => api.get(`/restaurants/${id}`).then((r) => r.data.data),
  });

  const { data: menuItems = [], isLoading: mLoading } = useQuery<MenuItem[]>({
    queryKey: ["menu", id],
    queryFn: () => api.get(`/restaurants/${id}/menu`).then((r) => r.data.data),
    enabled: !!id,
  });

  const categories = [...new Set(menuItems.map((m) => m.category))];
  useEffect(() => { if (categories[0] && !activeCategory) setActiveCategory(categories[0]); });

  function scrollTo(cat: string) {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAdd(item: MenuItem) {
    if (cartRestaurantId && cartRestaurantId !== item.restaurant_id && totalItems > 0) {
      setSwitchWarning(true);
      return;
    }
    const cartItem: CartItem = {
      menuItemId: item.id,
      restaurantId: item.restaurant_id,
      restaurantName: restaurant?.name ?? "",
      name: item.name,
      price: item.price,
      quantity: 1,
      emoji: item.emoji ?? "🍽️",
    };
    addItem(cartItem);
  }

  const grad = restaurant?.gradient ?? GRADIENTS[Number(id) % GRADIENTS.length];
  const emoji = restaurant?.emoji ?? "🍽️";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* ── HERO ── */}
      <div className={`relative h-64 bg-gradient-to-br ${grad} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-9xl opacity-40">{emoji}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {totalItems > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="absolute top-4 right-4 p-2 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">{totalItems}</span>
          </button>
        )}
      </div>

      {/* ── RESTAURANT INFO ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 -mt-8 relative shadow-xl mb-6">
          {rLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/10 rounded w-1/3" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold">{restaurant?.name}</h1>
                  <p className="text-white/50 text-sm mt-0.5">{restaurant?.cuisine_type}</p>
                  {restaurant?.description && <p className="text-white/40 text-xs mt-2 max-w-lg">{restaurant.description}</p>}
                </div>
                <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5 shrink-0 ml-3">
                  <Star className="w-4 h-4 text-green-400 fill-green-400" />
                  <span className="text-sm font-bold text-green-400">{restaurant?.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-orange-400" />{restaurant?.delivery_time ?? "30-40"} mins</span>
                <span className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5 text-orange-400" />₹{restaurant?.min_order ?? 149} min order</span>
                {restaurant?.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-orange-400" />{restaurant.city}</span>}
              </div>
            </>
          )}
        </div>

        {/* ── STICKY CATEGORY TABS ── */}
        {categories.length > 0 && (
          <div className="sticky top-0 z-20 bg-[#0d0d0d]/90 backdrop-blur-xl -mx-4 px-4 py-3 mb-6 border-b border-white/5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollTo(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent text-white"
                      : "bg-white/[0.04] border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {mLoading ? (
          <div className="space-y-3 pb-32">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/[0.04] border border-white/[0.06] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="pb-32 space-y-10">
            {categories.map((cat) => (
              <div key={cat} ref={(el) => { categoryRefs.current[cat] = el; }}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
                  {cat}
                  <span className="text-xs text-white/30 font-normal">({menuItems.filter((m) => m.category === cat).length})</span>
                </h2>
                <div className="space-y-3">
                  {menuItems.filter((m) => m.category === cat).map((item) => {
                    const qty = getItemQty(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className="flex items-start gap-4 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-4 transition-all duration-200 group"
                      >
                        {/* Veg/Non-veg indicator */}
                        <span className={`shrink-0 mt-0.5 w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.is_veg ? "border-green-500" : "border-red-500"}`}>
                          <span className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-green-500" : "bg-red-500"}`} />
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold">{item.name}</span>
                            {item.is_bestseller && (
                              <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                                <Flame className="w-3 h-3" /> Bestseller
                              </span>
                            )}
                            {item.is_veg && <Leaf className="w-3 h-3 text-green-500 shrink-0" />}
                          </div>
                          <p className="text-orange-400 font-bold text-sm">₹{item.price}</p>
                          {item.description && <p className="text-xs text-white/30 mt-1 line-clamp-2">{item.description}</p>}
                        </div>

                        {/* Emoji + Add button */}
                        <div className="shrink-0 flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                            {item.emoji ?? "🍽️"}
                          </div>
                          <AnimatePresence mode="wait">
                            {qty === 0 ? (
                              <motion.button
                                key="add"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => handleAdd(item)}
                                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-90 transition-opacity"
                              >
                                <Plus className="w-3 h-3" /> ADD
                              </motion.button>
                            ) : (
                              <motion.div
                                key="qty"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20"
                              >
                                <button onClick={() => setQty(item.id, qty - 1)} className="px-2 py-1.5 hover:bg-black/20 transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{qty}</span>
                                <button onClick={() => setQty(item.id, qty + 1)} className="px-2 py-1.5 hover:bg-black/20 transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SWITCH RESTAURANT WARNING ── */}
      <AnimatePresence>
        {switchWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-bold text-lg mb-2">Start a new cart?</h3>
              <p className="text-sm text-white/50 mb-5">Your cart has items from another restaurant. Adding this item will clear your current cart.</p>
              <div className="flex gap-3">
                <button onClick={() => setSwitchWarning(false)} className="flex-1 py-2.5 border border-white/15 rounded-xl text-sm text-white/70 hover:bg-white/5">
                  Keep current
                </button>
                <button
                  onClick={() => { setSwitchWarning(false); }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-bold text-white hover:opacity-90"
                >
                  Start fresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING CART BAR ── */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-5 py-4 shadow-2xl shadow-orange-500/40 hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold">{totalItems}</span>
                <span className="text-sm font-semibold">View Cart</span>
              </div>
              <span className="text-sm font-bold">₹{totalPrice.toFixed(0)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
