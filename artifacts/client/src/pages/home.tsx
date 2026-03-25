import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Clock, ChevronRight, Zap, Smile } from "lucide-react";
import Navbar from "@/components/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const categories = [
  { emoji: "🍕", name: "Pizza",    cuisine: "Italian" },
  { emoji: "🍔", name: "Burger",   cuisine: "American" },
  { emoji: "🍣", name: "Sushi",    cuisine: "Japanese" },
  { emoji: "🍜", name: "Noodles",  cuisine: "Chinese" },
  { emoji: "🍛", name: "Biryani",  cuisine: "Indian" },
  { emoji: "🥗", name: "Healthy",  cuisine: "Healthy" },
  { emoji: "🍰", name: "Desserts", cuisine: "Italian" },
  { emoji: "🍱", name: "Bento",    cuisine: "Japanese" },
];

const restaurants = [
  { id: 1, name: "Spice Garden",  cuisine: "Indian · Biryani · Curries",  rating: 4.8, time: "25–35", min: 149, badge: "⚡ Fast",      gradient: "from-orange-600 to-red-700",   emoji: "🍛" },
  { id: 2, name: "Pizza Plaza",   cuisine: "Italian · Pizza · Pasta",     rating: 4.6, time: "30–40", min: 199, badge: "🔥 Popular",   gradient: "from-red-700 to-rose-800",      emoji: "🍕" },
  { id: 3, name: "Tokyo Bites",   cuisine: "Japanese · Sushi · Ramen",    rating: 4.9, time: "35–45", min: 299, badge: "⭐ Top Rated", gradient: "from-violet-700 to-purple-900", emoji: "🍣" },
  { id: 4, name: "Burger Hub",    cuisine: "American · Burgers · Fries",  rating: 4.5, time: "20–30", min: 129, badge: "💎 Premium",   gradient: "from-amber-600 to-orange-700",  emoji: "🍔" },
  { id: 5, name: "Green Bowl",    cuisine: "Healthy · Salads · Wraps",    rating: 4.7, time: "25–35", min: 179, badge: "🌿 Healthy",   gradient: "from-green-700 to-emerald-900", emoji: "🥗" },
  { id: 6, name: "Noodle House",  cuisine: "Chinese · Noodles · Dim Sum", rating: 4.4, time: "30–40", min: 159, badge: "🥢 Asian",     gradient: "from-pink-700 to-red-900",     emoji: "🍜" },
];

const steps = [
  { icon: <Search className="w-6 h-6" />, title: "Choose a Restaurant", desc: "Browse hundreds of restaurants near you with filters by cuisine, rating, and delivery time." },
  { icon: <Zap className="w-6 h-6" />,    title: "Place Your Order",     desc: "Customize your meal, add to cart, and checkout in seconds with our seamless ordering flow." },
  { icon: <Smile className="w-6 h-6" />,  title: "Enjoy Your Food",      desc: "Track your order in real-time and get it delivered hot and fresh right to your doorstep." },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/restaurants?search=${encodeURIComponent(query.trim())}`);
    else navigate("/restaurants");
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/80 via-background to-background dark:from-[#1a0800] dark:via-[#0b0b0b] dark:to-background" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-red-600/8 dark:bg-red-700/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}
                className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6"
              >
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-sm text-orange-500 dark:text-orange-400 font-medium">500+ Restaurants • Free Delivery</span>
              </motion.div>

              <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-foreground"
              >
                Order Food.{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Fast. Fresh.
                </span>
              </motion.h1>

              <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
                className="text-lg text-muted-foreground mb-10 max-w-md"
              >
                Discover top restaurants near you. Track your order in real‑time and get it delivered hot to your door.
              </motion.p>

              {/* Search bar */}
              <motion.form initial="hidden" animate="visible" custom={3} variants={fadeUp}
                onSubmit={handleSearch}
                className="relative bg-card border border-border rounded-2xl p-2 flex items-center gap-3 max-w-lg shadow-xl"
              >
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for food or restaurants..."
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="shrink-0 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30"
                >
                  Search
                </motion.button>
              </motion.form>

              {/* Trust indicators */}
              <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="flex items-center gap-6 mt-8">
                {[
                  { val: "50K+", label: "Happy customers" },
                  { val: "500+", label: "Restaurants" },
                  { val: "30 min", label: "Avg delivery" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div className="text-xl font-bold text-foreground">{val}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Visual side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                <div className="text-[200px] leading-none select-none drop-shadow-2xl">🍜</div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-8 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">4.9 Rating</span>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -left-10 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-foreground">25 min delivery</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground">What are you craving?</h2>
          <Link to="/restaurants" className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 transition-colors font-medium">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map(({ emoji, name, cuisine }, i) => (
            <motion.button
              key={name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.05}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(cuisine)}`)}
              className="shrink-0 flex flex-col items-center gap-2 bg-card hover:bg-muted/60 border border-border hover:border-orange-500/30 rounded-2xl px-5 py-4 transition-all duration-200 group cursor-pointer shadow-sm"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">{name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── RESTAURANTS ──────────────────────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground">Top Restaurants</h2>
            <p className="text-sm text-muted-foreground mt-1">Handpicked for you today</p>
          </div>
          <Link to="/restaurants" className="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-400 transition-colors font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map(({ id, name, cuisine, rating, time, min, badge, gradient, emoji }, i) => (
            <motion.div
              key={name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.08}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/restaurants/${id}`)}
              className="bg-card border border-border hover:border-orange-500/30 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/10"
            >
              <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border border-white/10 text-xs font-semibold px-2.5 py-1 rounded-full text-white">
                  {badge}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors">{name}</h3>
                  <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-0.5 ml-2 shrink-0">
                    <Star className="w-3 h-3 text-green-500 fill-green-500" />
                    <span className="text-xs font-bold text-green-500">{rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{cuisine}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time} mins</span>
                  <span className="w-1 h-1 bg-border rounded-full" />
                  <span>₹{min} min order</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 dark:via-orange-950/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3 text-foreground">How FoodRush works</h2>
            <p className="text-muted-foreground">From craving to doorstep in three simple steps</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-card border border-border hover:border-orange-500/20 rounded-2xl p-8 text-center transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500/15 via-red-500/15 to-orange-500/15 border border-orange-500/20 rounded-3xl p-10 text-center shadow-xl"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-3 text-foreground">Ready to order?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join 50,000+ happy customers and get your first delivery free.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/restaurants"
                  className="inline-block px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30"
                >
                  Browse Restaurants
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/auth"
                  className="inline-block px-8 py-3.5 bg-card border border-border rounded-full font-semibold text-foreground hover:bg-muted/60 transition-colors"
                >
                  Sign in
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="font-bold text-foreground/80">FoodRush</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 FoodRush. Built with ❤️ for food lovers.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
