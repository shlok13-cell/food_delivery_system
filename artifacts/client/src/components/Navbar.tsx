import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, MapPin, ReceiptText, LogOut, User, ChefHat, Bike, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    try {
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  }

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Restaurants", to: "/restaurants" },
    { label: "My Orders", to: "/orders" },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              FoodRush
            </span>
          </Link>

          {/* Location pill */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-white/70">Mumbai, MH</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === to || (to !== "/" && location.pathname.startsWith(to))
                    ? "text-orange-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {to === "/orders" && <ReceiptText className="w-3.5 h-3.5" />}
                {label}
              </Link>
            ))}
            {(user?.role === "restaurant" || user?.role === "admin") && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith("/dashboard") ? "text-orange-400" : "text-white/70 hover:text-white"
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            )}
            {(user?.role === "delivery" || user?.role === "admin") && (
              <Link
                to="/delivery"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith("/delivery") ? "text-blue-400" : "text-white/70 hover:text-white"
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                My Deliveries
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith("/admin") ? "text-violet-400" : "text-white/70 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-white/70 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                    {initials || <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm text-white/80 max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-white/70 hover:text-white font-medium transition-colors">
                  Log in
                </Link>
                <Link
                  to="/auth?tab=register"
                  className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + menu */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-white/80">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="text-white/80 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {user && (
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm font-bold text-white">
                      {initials || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-white/40">{user.role}</p>
                    </div>
                  </div>
                )}
                {navLinks.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 ${location.pathname === to ? "text-orange-400" : "text-white/80 hover:text-white"}`}
                  >
                    {label}
                  </Link>
                ))}
                {(user?.role === "restaurant" || user?.role === "admin") && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/dashboard") ? "text-orange-400" : "text-white/80 hover:text-white"}`}
                  >
                    <ChefHat className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                {(user?.role === "delivery" || user?.role === "admin") && (
                  <Link
                    to="/delivery"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/delivery") ? "text-blue-400" : "text-white/80 hover:text-white"}`}
                  >
                    <Bike className="w-4 h-4" /> My Deliveries
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/admin") ? "text-violet-400" : "text-white/80 hover:text-white"}`}
                  >
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex-1 text-center py-2 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2 border border-white/20 rounded-full text-sm text-white/80"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/auth?tab=register"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold text-white"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
