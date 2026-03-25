import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, FileText, Loader2, CheckCircle2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import api from "@/lib/axios";

type Step = "review" | "success";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<Step>("review");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const deliveryFee = 49;
  const platformFee = 5;
  const grandTotal = totalPrice + deliveryFee + platformFee;

  async function placeOrder() {
    if (!address.trim()) { setError("Please enter your delivery address."); return; }
    if (!items.length) { navigate("/restaurants"); return; }

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) { navigate("/auth"); return; }

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        restaurant_id: restaurantId,
        items: items.map((i) => ({ menu_item_id: i.menuItemId, quantity: i.quantity, unit_price: i.price })),
        delivery_address: address,
        notes: notes || undefined,
      });
      setOrderId(data.data.id);
      clearCart();
      setStep("success");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Failed to place order. Are you logged in?");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center flex-col gap-4">
        <span className="text-5xl">🛒</span>
        <p className="text-white/50">Your cart is empty.</p>
        <Link to="/restaurants" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <AnimatePresence mode="wait">
        {step === "review" ? (
          <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 mt-2">
              <button onClick={() => navigate(-1)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold">Checkout</h1>
                <p className="text-sm text-white/40">{restaurantName}</p>
              </div>
            </div>

            {/* Order summary card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-400" /> Order Summary
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/80">
                      <span className="text-base">{item.emoji}</span>
                      <span>{item.name}</span>
                      <span className="text-white/30">× {item.quantity}</span>
                    </div>
                    <span className="text-white/70">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 space-y-2 text-sm text-white/50">
                <div className="flex justify-between"><span>Item total</span><span>₹{totalPrice.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between"><span>Platform fee</span><span>₹{platformFee}</span></div>
                <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/10">
                  <span>Grand Total</span><span>₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" /> Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Flat no., Building name, Street, Landmark, City..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-orange-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" /> Special Instructions (optional)
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. extra spicy, no onions, ring the doorbell..."
                className="w-full bg-white/[0.05] border border-white/10 focus:border-orange-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-white text-base hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing order...</> : `Place Order • ₹${grandTotal.toFixed(0)}`}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center text-center px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-extrabold mb-2">
              Order Placed! 🎉
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white/50 mb-2">
              Your order #{orderId} is confirmed
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-white/30 mb-8">
              Estimated delivery: 25–35 minutes
            </motion.p>

            {/* Animated delivery steps */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 mb-10">
              {["Order confirmed", "Preparing", "On the way", "Delivered"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex flex-col items-center gap-1 ${i === 0 ? "opacity-100" : "opacity-30"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-gradient-to-br from-orange-500 to-red-500 text-white" : "bg-white/10 text-white/40"}`}>
                      {i + 1}
                    </div>
                    <span className="text-[10px] text-white/40 w-16 text-center leading-tight">{s}</span>
                  </div>
                  {i < 3 && <div className={`w-6 h-px mb-4 ${i === 0 ? "bg-orange-500" : "bg-white/10"}`} />}
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3">
              <Link
                to="/orders"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              >
                Track Order
              </Link>
              <Link
                to="/restaurants"
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/10"
              >
                Order More
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
