import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Navbar from "@/components/Navbar";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

const ROLE_BADGES: Record<string, { label: string; color: string; emoji: string }> = {
  customer:   { label: "Customer",          color: "bg-blue-500/10 border-blue-500/20 text-blue-500",   emoji: "🛍️" },
  restaurant: { label: "Restaurant Owner",  color: "bg-orange-500/10 border-orange-500/20 text-orange-500", emoji: "🍽️" },
  delivery:   { label: "Delivery Partner",  color: "bg-purple-500/10 border-purple-500/20 text-purple-500", emoji: "🛵" },
  admin:      { label: "Administrator",     color: "bg-red-500/10 border-red-500/20 text-red-500",     emoji: "🛡️" },
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) { navigate("/auth"); return; }

    api.get("/auth/me")
      .then(r => {
        const data: UserProfile = r.data.data;
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
      })
      .catch(() => {
        const stored = user as UserProfile;
        setProfile(stored);
        setName(stored.name ?? "");
        setPhone(stored.phone ?? "");
        setAddress(stored.address ?? "");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put("/auth/profile", { name, phone, address });
      const updated = data.data;
      setProfile(updated);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, address: updated.address, phone: updated.phone }));
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Signed out successfully");
    navigate("/");
  }

  const badge = ROLE_BADGES[profile?.role ?? "customer"] ?? ROLE_BADGES.customer;
  const initials = profile?.name
    ? profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 bg-muted/50 border border-border rounded-xl hover:bg-muted/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account details</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full skeleton-shimmer" />
                <div className="space-y-2">
                  <div className="h-5 skeleton-shimmer rounded-lg w-36" />
                  <div className="h-3 skeleton-shimmer rounded-lg w-24" />
                </div>
              </div>
            </div>
          </div>
        ) : profile ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Avatar card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-orange-500/25 shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground truncate">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mt-2 ${badge.color}`}>
                    <span>{badge.emoji}</span> {badge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-orange-400" /> Personal Information
              </h2>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-3.5 py-3 focus-within:border-orange-500/60 transition-all">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 bg-muted/20 border border-border rounded-xl px-3.5 py-3 opacity-60 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={profile.email}
                    disabled
                    className="flex-1 bg-transparent text-sm text-foreground outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                <div className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-3.5 py-3 focus-within:border-orange-500/60 transition-all">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Default Delivery Address
                </label>
                <div className="flex items-start gap-3 bg-muted/40 border border-border rounded-xl px-3.5 py-3 focus-within:border-orange-500/60 transition-all">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    placeholder="Flat no., Building, Street, Landmark, City..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none resize-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">This address will be pre-filled at checkout</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
              >
                <AnimatePresence mode="wait">
                  {saving ? (
                    <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </motion.span>
                  ) : saved ? (
                    <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Saved!
                    </motion.span>
                  ) : (
                    <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Quick links */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="font-semibold text-foreground text-sm">Quick Links</h2>
              <Link
                to="/orders"
                className="flex items-center justify-between py-3 border-b border-border last:border-0 text-sm text-foreground/80 hover:text-orange-500 transition-colors"
              >
                <span>My Orders</span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link
                to="/restaurants"
                className="flex items-center justify-between py-3 border-b border-border last:border-0 text-sm text-foreground/80 hover:text-orange-500 transition-colors"
              >
                <span>Browse Restaurants</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </div>

            {/* Danger zone */}
            <div className="bg-card border border-destructive/20 rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-foreground text-sm mb-4">Account</h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" /> Sign out of FoodRush
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
