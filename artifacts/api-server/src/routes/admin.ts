import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { seedRestaurants } from "../seeds";
import { getAssignments } from "./delivery";

interface JWTUser { id: number; email: string; role: string }

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

function getUser(req: Request): JWTUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as JWTUser; }
  catch { return null; }
}

function requireAdmin(req: Request, res: Response): JWTUser | null {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return null; }
  if (user.role !== "admin") { res.status(403).json({ error: "Admin access required" }); return null; }
  return user;
}

const seedUsers = [
  { id: 1, name: "Alice Johnson",  email: "alice@example.com",      role: "customer",   created_at: "2024-11-10T09:00:00Z", status: "active",   orders: 12 },
  { id: 2, name: "Bob Smith",      email: "bob@example.com",         role: "customer",   created_at: "2024-12-03T14:22:00Z", status: "active",   orders: 7  },
  { id: 3, name: "Admin User",     email: "admin@example.com",       role: "admin",      created_at: "2024-10-01T08:00:00Z", status: "active",   orders: 0  },
  { id: 4, name: "Spice Garden",   email: "restaurant@example.com",  role: "restaurant", created_at: "2024-10-15T10:30:00Z", status: "active",   orders: 0  },
  { id: 5, name: "Raj Delivery",   email: "delivery@example.com",    role: "delivery",   created_at: "2024-11-20T11:45:00Z", status: "active",   orders: 0  },
  { id: 6, name: "Carol White",    email: "carol@example.com",        role: "customer",   created_at: "2025-01-08T16:00:00Z", status: "active",   orders: 4  },
  { id: 7, name: "Dan Kumar",      email: "dan@example.com",          role: "customer",   created_at: "2025-01-22T09:15:00Z", status: "active",   orders: 9  },
  { id: 8, name: "Eve Sharma",     email: "eve@example.com",          role: "customer",   created_at: "2025-02-14T13:00:00Z", status: "active",   orders: 2  },
  { id: 9, name: "Frank Patel",    email: "frank@example.com",        role: "customer",   created_at: "2025-03-01T10:00:00Z", status: "suspended", orders: 1 },
  { id:10, name: "Grace Liu",      email: "grace@example.com",        role: "customer",   created_at: "2025-03-18T08:30:00Z", status: "active",   orders: 0  },
];

const allOrders = [
  { id: 10001, restaurant: "Spice Garden",  customer: "Alice Johnson",  amount: 657,  status: "pending",          created_at: new Date(Date.now() - 5  * 60000).toISOString()    },
  { id: 10002, restaurant: "Spice Garden",  customer: "Bob Smith",      amount: 487,  status: "confirmed",        created_at: new Date(Date.now() - 20 * 60000).toISOString()    },
  { id: 10003, restaurant: "Spice Garden",  customer: "Carol White",    amount: 528,  status: "preparing",        created_at: new Date(Date.now() - 45 * 60000).toISOString()    },
  { id: 10004, restaurant: "Spice Garden",  customer: "Dan Kumar",      amount: 378,  status: "out_for_delivery", created_at: new Date(Date.now() - 70 * 60000).toISOString()    },
  { id: 10005, restaurant: "Spice Garden",  customer: "Eve Sharma",     amount: 388,  status: "delivered",        created_at: new Date(Date.now() - 2  * 3600000).toISOString()  },
  { id: 10006, restaurant: "Burger Hub",    customer: "Alice Johnson",  amount: 478,  status: "picked_up",        created_at: new Date(Date.now() - 35 * 60000).toISOString()    },
  { id: 10007, restaurant: "Tokyo Bites",   customer: "Carol White",    amount: 798,  status: "delivered",        created_at: new Date(Date.now() - 3  * 3600000).toISOString()  },
  { id: 10008, restaurant: "Green Bowl",    customer: "Dan Kumar",      amount: 349,  status: "delivered",        created_at: new Date(Date.now() - 8  * 3600000).toISOString()  },
  { id: 10009, restaurant: "Pizza Planet",  customer: "Bob Smith",      amount: 520,  status: "cancelled",        created_at: new Date(Date.now() - 5  * 3600000).toISOString()  },
  { id: 10010, restaurant: "Noodle House",  customer: "Eve Sharma",     amount: 412,  status: "delivered",        created_at: new Date(Date.now() - 24 * 3600000).toISOString()  },
  { id: 10011, restaurant: "Burger Hub",    customer: "Grace Liu",      amount: 345,  status: "delivered",        created_at: new Date(Date.now() - 28 * 3600000).toISOString()  },
  { id: 10012, restaurant: "Spice Garden",  customer: "Frank Patel",    amount: 219,  status: "cancelled",        created_at: new Date(Date.now() - 30 * 3600000).toISOString()  },
];

const weeklyData = [
  { date: "Mar 19", orders: 52, revenue: 18400, newUsers: 14 },
  { date: "Mar 20", orders: 61, revenue: 21200, newUsers: 18 },
  { date: "Mar 21", orders: 47, revenue: 16800, newUsers: 12 },
  { date: "Mar 22", orders: 73, revenue: 25600, newUsers: 22 },
  { date: "Mar 23", orders: 68, revenue: 23900, newUsers: 19 },
  { date: "Mar 24", orders: 85, revenue: 29700, newUsers: 27 },
  { date: "Mar 25", orders: 91, revenue: 31800, newUsers: 31 },
];

const ordersByStatus = [
  { name: "Delivered",       value: 477, color: "#22c55e" },
  { name: "Preparing",       value: 124, color: "#f97316" },
  { name: "Confirmed",       value:  89, color: "#3b82f6" },
  { name: "Out for Delivery",value:  67, color: "#a855f7" },
  { name: "Pending",         value:  34, color: "#eab308" },
  { name: "Cancelled",       value:  45, color: "#ef4444" },
];

const topRestaurants = [
  { name: "Spice Garden",  orders: 234, revenue: 89420, rating: 4.8, trend: "+12%" },
  { name: "Tokyo Bites",   orders: 198, revenue: 92100, rating: 4.9, trend: "+18%" },
  { name: "Burger Hub",    orders: 167, revenue: 67230, rating: 4.6, trend: "+7%"  },
  { name: "Green Bowl",    orders: 143, revenue: 48670, rating: 4.7, trend: "+9%"  },
  { name: "Pizza Planet",  orders: 121, revenue: 55430, rating: 4.5, trend: "+4%"  },
];

let mutableRestaurants = seedRestaurants.map(r => ({ ...r, active: true, total_orders: 0, total_revenue: 0 }));

const router = Router();

router.get("/admin/users", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  res.json({ data: seedUsers });
});

router.patch("/admin/users/:id/status", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const u = seedUsers.find(x => x.id === Number(req.params.id));
  if (!u) { res.status(404).json({ error: "User not found" }); return; }
  const { status } = req.body ?? {};
  if (!["active", "suspended"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  u.status = status;
  res.json({ data: u });
});

router.get("/admin/orders", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  res.json({ data: allOrders });
});

router.get("/admin/restaurants", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  res.json({ data: mutableRestaurants });
});

router.patch("/admin/restaurants/:id/toggle", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const r = mutableRestaurants.find(x => x.id === Number(req.params.id));
  if (!r) { res.status(404).json({ error: "Restaurant not found" }); return; }
  r.active = !r.active;
  res.json({ data: r });
});

router.get("/admin/analytics", (req: Request, res: Response) => {
  if (!requireAdmin(req, res)) return;
  const assignments = getAssignments();
  const totalRevenue = weeklyData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = weeklyData.reduce((s, d) => s + d.orders, 0);
  const activeDeliveries = assignments.filter(a => a.status === "picked_up" || a.status === "en_route").length;
  res.json({
    data: {
      kpis: {
        totalUsers:         seedUsers.length,
        totalOrders:        allOrders.length,
        totalRevenue:       allOrders.reduce((s, o) => s + o.amount, 0),
        activeRestaurants:  mutableRestaurants.filter(r => r.active).length,
        activeDeliveries,
        weekRevenue:        totalRevenue,
        weekOrders:         totalOrders,
        avgOrderValue:      Math.round(totalRevenue / totalOrders),
      },
      weeklyData,
      ordersByStatus,
      topRestaurants,
    },
  });
});

export default router;
