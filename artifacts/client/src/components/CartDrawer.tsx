import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, setQty, removeItem, restaurantName } = useCart();
  const navigate = useNavigate();
  const deliveryFee = totalPrice > 0 ? 49 : 0;
  const platformFee = totalPrice > 0 ? 5 : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-bold text-lg text-foreground">Your Cart</h2>
                {restaurantName && <p className="text-xs text-muted-foreground mt-0.5">{restaurantName}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Your cart is empty</p>
                  <button onClick={onClose} className="text-orange-500 text-sm hover:text-orange-400 transition-colors">
                    Browse restaurants
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      className="flex items-center gap-3 bg-background border border-border rounded-xl p-3"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                        <p className="text-xs text-orange-500 font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQty(item.menuItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-muted hover:bg-destructive/20 flex items-center justify-center transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3 text-foreground" />}
                        </motion.button>
                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-bold w-4 text-center text-foreground"
                        >
                          {item.quantity}
                        </motion.span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQty(item.menuItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-orange-500/20 hover:bg-orange-500/40 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3 text-orange-500" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Bill summary + CTA */}
            {items.length > 0 && (
              <div className="px-5 py-4 border-t border-border space-y-4 bg-card">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Item total</span><span>₹{totalPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span><span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform fee</span><span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                    <span>Total</span><span>₹{(totalPrice + deliveryFee + platformFee).toFixed(0)}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onClose(); navigate("/checkout"); }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs">₹{(totalPrice + deliveryFee + platformFee).toFixed(0)}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
