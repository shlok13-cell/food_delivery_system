import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, MapPin, ReceiptText, LogOut, User, ChefHat, Bike, Shield, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { theme, toggleTheme } = useTheme();

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
    toast.success("Signed out successfully");
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

  const isScrolledBg = scrolled
    ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/10 dark:shadow-black/30"
    : "bg-transparent";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolledBg}`}
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
          <div className="hidden md:flex items-center gap-1.5 bg-muted/60 border border-border rounded-full px-3 py-1.5 cursor-pointer hover:bg-muted transition-colors">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-foreground/70">Mumbai, MH</span>
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
                    : "text-foreground/70 hover:text-foreground"
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
                  location.pathname.startsWith("/dashboard") ? "text-orange-400" : "text-foreground/70 hover:text-foreground"
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
                  location.pathname.startsWith("/delivery") ? "text-blue-400" : "text-foreground/70 hover:text-foreground"
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
                  location.pathname.startsWith("/admin") ? "text-violet-400" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-all"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4.5 h-4.5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4.5 h-4.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground transition-colors"
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
                  to="/profile"
                  className="flex items-center gap-2 bg-muted/50 border border-border rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors"
                  title="My Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                    {initials || <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm text-foreground/80 max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground/40 hover:text-red-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-foreground/70 hover:text-foreground font-medium transition-colors px-2">
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

          {/* Mobile: cart + theme + menu */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground/60 hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 text-foreground/80">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="text-foreground/80 hover:text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
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
              className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="px-4 py-4 flex flex-col gap-3">
                {user && (
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 pb-3 border-b border-border mb-1 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm font-bold text-white">
                      {initials || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role} · View Profile</p>
                    </div>
                  </Link>
                )}
                {navLinks.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 ${location.pathname === to ? "text-orange-400" : "text-foreground/80 hover:text-foreground"}`}
                  >
                    {label}
                  </Link>
                ))}
                {(user?.role === "restaurant" || user?.role === "admin") && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/dashboard") ? "text-orange-400" : "text-foreground/80 hover:text-foreground"}`}
                  >
                    <ChefHat className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                {(user?.role === "delivery" || user?.role === "admin") && (
                  <Link
                    to="/delivery"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/delivery") ? "text-blue-400" : "text-foreground/80 hover:text-foreground"}`}
                  >
                    <Bike className="w-4 h-4" /> My Deliveries
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`font-medium py-2 flex items-center gap-2 ${location.pathname.startsWith("/admin") ? "text-violet-400" : "text-foreground/80 hover:text-foreground"}`}
                  >
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <div className="flex gap-3 pt-2 border-t border-border">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex-1 text-center py-2.5 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2.5 border border-border rounded-full text-sm text-foreground/80 hover:bg-muted/50"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/auth?tab=register"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 text-center py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-sm font-semibold text-white"
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
