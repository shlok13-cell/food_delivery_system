import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users, ShoppingBag, IndianRupee, Store, Bike, TrendingUp, Package, Star } from "lucide-react";
import api from "@/lib/axios";

interface Analytics {
  kpis: {
    totalUsers: number; totalOrders: number; totalRevenue: number;
    activeRestaurants: number; activeDeliveries: number;
    weekRevenue: number; weekOrders: number; avgOrderValue: number;
  };
  weeklyData: { date: string; orders: number; revenue: number; newUsers: number }[];
  ordersByStatus: { name: string; value: number; color: string }[];
  topRestaurants: { name: string; orders: number; revenue: number; rating: number; trend: string }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
  border: string;
  bg: string;
  i: number;
}

function KPICard({ icon: Icon, label, value, sub, color, border, bg, i }: KPICardProps) {
  return (
    <motion.div
      initial="hidden" animate="visible" custom={i} variants={fadeUp}
      className={`bg-[#141414] border ${border} rounded-2xl p-5`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-white/50 text-sm mt-0.5">{label}</p>
      <p className={`text-xs mt-1 ${color}`}>{sub}</p>
    </motion.div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/api/admin/analytics").then(r => r.data.data),
    refetchInterval: 30000,
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 bg-white/[0.04] border border-white/[0.06] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const { kpis, weeklyData, ordersByStatus, topRestaurants } = data;

  const kpiCards = [
    { icon: Users,        label: "Total Users",        value: kpis.totalUsers.toLocaleString(),      sub: "+2 this week",               color: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/10" },
    { icon: ShoppingBag,  label: "Total Orders",       value: kpis.totalOrders.toLocaleString(),     sub: `${kpis.weekOrders} this week`, color: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/10"   },
    { icon: IndianRupee,  label: "Total Revenue",      value: `₹${(kpis.totalRevenue/1000).toFixed(1)}k`, sub: `₹${(kpis.weekRevenue/1000).toFixed(1)}k this week`, color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/10" },
    { icon: Store,        label: "Restaurants",        value: kpis.activeRestaurants.toString(),     sub: "All active",                 color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/10" },
    { icon: Bike,         label: "Live Deliveries",    value: kpis.activeDeliveries.toString(),      sub: "In progress now",            color: "text-cyan-400",   border: "border-cyan-500/20",   bg: "bg-cyan-500/10"   },
    { icon: TrendingUp,   label: "Avg Order Value",    value: `₹${kpis.avgOrderValue}`,             sub: "Per order this week",        color: "text-pink-400",   border: "border-pink-500/20",   bg: "bg-pink-500/10"   },
    { icon: Package,      label: "Week Orders",        value: kpis.weekOrders.toString(),            sub: "Last 7 days",                color: "text-amber-400",  border: "border-amber-500/20",  bg: "bg-amber-500/10"  },
    { icon: Star,         label: "Avg Rating",         value: "4.72",                               sub: "Across all restaurants",     color: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 text-white">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold">Analytics Overview</h1>
        <p className="text-white/40 text-sm mt-0.5">Platform-wide stats and trends</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((c, i) => <KPICard key={c.label} {...c} i={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial="hidden" animate="visible" custom={4} variants={fadeUp}
          className="lg:col-span-2 bg-[#141414] border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Revenue — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={tooltipStyle.contentStyle}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial="hidden" animate="visible" custom={5} variants={fadeUp}
          className="bg-[#141414] border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {ordersByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={tooltipStyle.contentStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {ordersByStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-white/50">{s.name}</span>
                </div>
                <span className="text-white font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial="hidden" animate="visible" custom={6} variants={fadeUp}
          className="bg-[#141414] border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Orders — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial="hidden" animate="visible" custom={7} variants={fadeUp}
          className="bg-[#141414] border border-white/8 rounded-2xl p-5"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">New Users — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Area type="monotone" dataKey="newUsers" stroke="#22c55e" strokeWidth={2.5} fill="url(#usrGrad)" dot={{ fill: "#22c55e", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial="hidden" animate="visible" custom={8} variants={fadeUp}
        className="bg-[#141414] border border-white/8 rounded-2xl p-5"
      >
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">Top Restaurants This Month</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2 pr-4 text-white/40 font-medium">#</th>
                <th className="text-left py-2 pr-4 text-white/40 font-medium">Restaurant</th>
                <th className="text-right py-2 pr-4 text-white/40 font-medium">Orders</th>
                <th className="text-right py-2 pr-4 text-white/40 font-medium">Revenue</th>
                <th className="text-right py-2 pr-4 text-white/40 font-medium">Rating</th>
                <th className="text-right py-2 text-white/40 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {topRestaurants.map((r, i) => (
                <tr key={r.name} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 text-white/30 font-mono">{i + 1}</td>
                  <td className="py-3 pr-4 text-white font-semibold">{r.name}</td>
                  <td className="py-3 pr-4 text-right text-white/70">{r.orders}</td>
                  <td className="py-3 pr-4 text-right text-white/70">₹{r.revenue.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-yellow-400">★ {r.rating}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-green-400 text-xs font-semibold">{r.trend}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
