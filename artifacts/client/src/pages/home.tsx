import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Clock, ChevronRight, Zap, Shield, Smile } from "lucide-react";
import Navbar from "@/components/Navbar";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const categories = [
  { emoji: "🍕", name: "Pizza" },
  { emoji: "🍔", name: "Burger" },
  { emoji: "🍣", name: "Sushi" },
  { emoji: "🍜", name: "Noodles" },
  { emoji: "🍛", name: "Biryani" },
  { emoji: "🌮", name: "Tacos" },
  { emoji: "🍰", name: "Desserts" },
  { emoji: "🥗", name: "Salads" },
  { emoji: "🥪", name: "Sandwich" },
  { emoji: "🍱", name: "Bento" },
];

const restaurants = [
  { name: "Spice Garden", cuisine: "Indian · Biryani · Curries", rating: 4.8, time: "25–35", min: 149, badge: "⚡ Fast", gradient: "from-orange-600 to-red-700" },
  { name: "Pizza Plaza", cuisine: "Italian · Pizza · Pasta", rating: 4.6, time: "30–40", min: 199, badge: "🔥 Popular", gradient: "from-red-700 to-rose-800" },
  { name: "Tokyo Bites", cuisine: "Japanese · Sushi · Ramen", rating: 4.9, time: "35–45", min: 299, badge: "⭐ Top Rated", gradient: "from-violet-700 to-purple-900" },
  { name: "Burger Hub", cuisine: "American · Burgers · Fries", rating: 4.5, time: "20–30", min: 129, badge: "💎 Premium", gradient: "from-amber-600 to-orange-700" },
  { name: "Green Bowl", cuisine: "Healthy · Salads · Wraps", rating: 4.7, time: "25–35", min: 179, badge: "🌿 Healthy", gradient: "from-green-700 to-emerald-900" },
  { name: "Noodle House", cuisine: "Chinese · Noodles · Dim Sum", rating: 4.4, time: "30–40", min: 159, badge: "🥢 Asian", gradient: "from-pink-700 to-red-900" },
];

const steps = [
  { icon: <Search className="w-6 h-6" />, title: "Choose a Restaurant", desc: "Browse hundreds of restaurants near you with filters by cuisine, rating, and delivery time." },
  { icon: <Zap className="w-6 h-6" />, title: "Place Your Order", desc: "Customize your meal, add to cart, and checkout in seconds with our seamless ordering flow." },
  { icon: <Smile className="w-6 h-6" />, title: "Enjoy Your Food", desc: "Track your order in real-time and get it delivered hot and fresh right to your doorstep." },
];

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* BG gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0800] via-[#0d0d0d] to-[#0d0d0d]" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-red-700/15 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6"
              >
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-sm text-orange-400 font-medium">500+ Restaurants • Free Delivery</span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                custom={1}
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
              >
                Order Food.{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Fast. Fresh.
                </span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                custom={2}
                variants={fadeUp}
                className="text-lg text-white/60 mb-10 max-w-md"
              >
                Discover top restaurants near you. Track your order in real‑time and get it delivered hot to your door.
              </motion.p>

              {/* Search bar */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={3}
                variants={fadeUp}
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-3 max-w-lg shadow-2xl"
              >
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-white/40 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for food or restaurants..."
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
                  />
                </div>
                <button className="shrink-0 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30">
                  Search
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={4}
                variants={fadeUp}
                className="flex items-center gap-6 mt-8"
              >
                {[
                  { val: "50K+", label: "Happy customers" },
                  { val: "500+", label: "Restaurants" },
                  { val: "30 min", label: "Avg delivery" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div className="text-xl font-bold text-white">{val}</div>
                    <div className="text-xs text-white/40">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Visual side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                {/* Main food emoji */}
                <div className="text-[200px] leading-none select-none drop-shadow-2xl">🍜</div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold">4.9 Rating</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -left-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold">25 min delivery</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <h2 className="text-2xl font-bold">What are you craving?</h2>
          <button className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map(({ emoji, name }, i) => (
            <motion.button
              key={name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.05}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="shrink-0 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-orange-500/30 rounded-2xl px-5 py-4 transition-all duration-200 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors whitespace-nowrap">{name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── RESTAURANTS ──────────────────────────────────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold">Top Restaurants</h2>
            <p className="text-sm text-white/40 mt-1">Handpicked for you today</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map(({ name, cuisine, rating, time, min, badge, gradient }, i) => (
            <motion.div
              key={name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.08}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-lg hover:shadow-orange-500/10 hover:shadow-xl"
            >
              {/* Restaurant image placeholder */}
              <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                <span className="text-6xl opacity-60">🍽️</span>
                {/* Badge */}
                <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border border-white/10 text-xs font-semibold px-2.5 py-1 rounded-full text-white">
                  {badge}
                </span>
                {/* Offer tag */}
                <span className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold px-2.5 py-1 rounded-full text-white">
                  60% OFF up to ₹120
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white group-hover:text-orange-300 transition-colors">{name}</h3>
                  <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-0.5 ml-2 shrink-0">
                    <Star className="w-3 h-3 text-green-400 fill-green-400" />
                    <span className="text-xs font-bold text-green-400">{rating}</span>
                  </div>
                </div>
                <p className="text-xs text-white/40 mb-3">{cuisine}</p>
                <div className="flex items-center gap-3 text-xs text-white/50 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {time} mins
                  </span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>₹{min} min order</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold mb-3">How FoodRush works</h2>
            <p className="text-white/40">From craving to doorstep in three simple steps</p>
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
                className="relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] hover:border-orange-500/20 rounded-2xl p-8 text-center transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-orange-500/30">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
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
          className="relative overflow-hidden bg-gradient-to-r from-orange-600/20 via-red-600/20 to-orange-600/20 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-10 text-center"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-3">Ready to order?</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">Join 50,000+ happy customers and get your first delivery free.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/auth?tab=register"
                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/30"
              >
                Get Started — It's Free
              </Link>
              <Link
                to="/auth"
                className="px-8 py-3.5 bg-white/5 border border-white/15 rounded-full font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍕</span>
            <span className="font-bold text-white/80">FoodRush</span>
          </div>
          <p className="text-sm text-white/30">© 2026 FoodRush. Built with ❤️ for food lovers.</p>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
