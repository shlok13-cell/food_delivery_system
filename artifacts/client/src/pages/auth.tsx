import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

type Tab = "login" | "register";
type Role = "customer" | "restaurant" | "delivery";

const roles: { value: Role; label: string; emoji: string }[] = [
  { value: "customer", label: "Customer", emoji: "🛍️" },
  { value: "restaurant", label: "Restaurant Owner", emoji: "🍽️" },
  { value: "delivery", label: "Delivery Partner", emoji: "🛵" },
];

function InputField({
  label, type = "text", value, onChange, placeholder, icon, error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <div className={`flex items-center gap-3 bg-muted/40 border ${error ? "border-destructive/50" : "border-border"} rounded-xl px-3.5 py-3 focus-within:border-orange-500/60 focus-within:bg-muted/60 transition-all`}>
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "register" ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regRole, setRegRole] = useState<Role>("customer");

  useEffect(() => {
    setApiError("");
  }, [tab]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPass) return;
    setLoading(true);
    setApiError("");
    try {
      const { data } = await api.post("/auth/login", { email: loginEmail, password: loginPass });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}! 👋`);
      const role = data.user?.role;
      setTimeout(() => {
        if (role === "restaurant") navigate("/dashboard");
        else if (role === "delivery") navigate("/delivery");
        else if (role === "admin") navigate("/dashboard");
        else navigate("/");
      }, 400);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Login failed. Please try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPass) return;
    setLoading(true);
    setApiError("");
    try {
      const { data } = await api.post("/auth/register", {
        name: regName, email: regEmail, phone: regPhone, password: regPass, role: regRole,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Account created! Welcome to FoodRush, ${data.user.name.split(" ")[0]}! 🎉`);
      const role = data.user?.role;
      setTimeout(() => {
        if (role === "restaurant") navigate("/dashboard");
        else if (role === "delivery") navigate("/delivery");
        else if (role === "admin") navigate("/dashboard");
        else navigate("/");
      }, 400);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Registration failed. Please try again.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* ── LEFT PANEL (always dark, branded) ── */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden bg-gradient-to-br from-[#1a0500] via-[#110800] to-[#0d0500]">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-red-700/15 rounded-full blur-3xl" />
        </div>

        <div className="relative flex-1 flex flex-col p-12">
          <Link to="/" className="flex items-center gap-2 mb-auto">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">FoodRush</span>
          </Link>

          <div className="py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-7xl mb-8 leading-none"
            >
              🍜🍕🍔
            </motion.div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white">
              Food you love,
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">delivered fast.</span>
            </h2>
            <p className="text-white/40 leading-relaxed">
              Join 50,000+ customers ordering from 500+ restaurants. Fresh food, real‑time tracking, zero fuss.
            </p>

            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { val: "4.9★", label: "App rating" },
                { val: "30 min", label: "Avg delivery" },
                { val: "Free", label: "First delivery" },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-center">
                  <div className="text-lg font-bold text-orange-400">{val}</div>
                  <div className="text-xs text-white/40 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/20 mt-auto">© 2026 FoodRush Technologies</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-background">
        {/* Back link (mobile) */}
        <Link
          to="/"
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </Link>

        <div className="relative w-full max-w-md">
          {/* Glass card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">

            {/* Tab switcher */}
            <div className="flex bg-muted/50 border border-border rounded-2xl p-1 mb-8">
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 capitalize ${
                    tab === t
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Welcome back 👋</h1>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to your FoodRush account</p>
                  </div>

                  <InputField label="Email address" type="email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} />
                  <InputField label="Password" type="password" value={loginPass} onChange={setLoginPass} placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />

                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-orange-500 hover:text-orange-400 transition-colors">Forgot password?</button>
                  </div>

                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive"
                      >
                        {apiError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !loginEmail || !loginPass}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>

                  <p className="text-center text-sm text-muted-foreground">
                    New to FoodRush?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                      Create account
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Create account 🚀</h1>
                    <p className="text-sm text-muted-foreground mt-1">Join FoodRush — your first delivery is free!</p>
                  </div>

                  <InputField label="Full name" value={regName} onChange={setRegName} placeholder="Alex Johnson" icon={<User className="w-4 h-4" />} />
                  <InputField label="Email address" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} />
                  <InputField label="Phone number" type="tel" value={regPhone} onChange={setRegPhone} placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />} />
                  <InputField label="Password" type="password" value={regPass} onChange={setRegPass} placeholder="••••••••" icon={<Lock className="w-4 h-4" />} />

                  {/* Role selector */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">I'm a</label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map(({ value, label, emoji }) => (
                        <motion.button
                          key={value}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setRegRole(value)}
                          className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                            regRole === value
                              ? "bg-orange-500/15 border-orange-500/40 text-orange-500"
                              : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          <span className="text-xl">{emoji}</span>
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive"
                      >
                        {apiError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !regName || !regEmail || !regPhone || !regPass}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">Terms</a> and{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
