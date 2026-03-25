import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { getIO } from "../socket";

interface JWTUser { id: number; email: string; role: string }

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

function getUser(req: Request): JWTUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as JWTUser;
  } catch { return null; }
}

function requireDelivery(req: Request, res: Response): JWTUser | null {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return null; }
  if (user.role !== "delivery" && user.role !== "admin") {
    res.status(403).json({ error: "Delivery partner access required" }); return null;
  }
  return user;
}

export interface DeliveryAssignment {
  id: number;
  order_id: number;
  partner_id: number;
  status: "assigned" | "picked_up" | "en_route" | "delivered" | "failed";
  restaurant_name: string;
  restaurant_address: string;
  restaurant_lat: number;
  restaurant_lng: number;
  customer_name: string;
  customer_address: string;
  customer_lat: number;
  customer_lng: number;
  customer_phone: string;
  total_amount: number;
  distance_km: number;
  eta_minutes: number;
  created_at: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  earnings: number;
  items: { name: string; quantity: number }[];
}

let assignments: DeliveryAssignment[] = [
  {
    id: 1, order_id: 10001, partner_id: 5, status: "assigned",
    restaurant_name: "Spice Garden", restaurant_address: "12 MG Road, Mumbai",
    restaurant_lat: 19.076, restaurant_lng: 72.877,
    customer_name: "Alice Johnson", customer_address: "42 Park Street, Bandra West, Mumbai",
    customer_lat: 19.059, customer_lng: 72.836,
    customer_phone: "+91 98765 11111",
    total_amount: 657, distance_km: 5.2, eta_minutes: 28,
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    picked_up_at: null, delivered_at: null, earnings: 45,
    items: [{ name: "Butter Chicken", quantity: 2 }, { name: "Garlic Naan", quantity: 1 }],
  },
  {
    id: 2, order_id: 10002, partner_id: 5, status: "picked_up",
    restaurant_name: "Burger Hub", restaurant_address: "23 Carter Road, Bandra, Mumbai",
    restaurant_lat: 19.065, restaurant_lng: 72.831,
    customer_name: "Bob Smith", customer_address: "17 Sea View Road, Juhu, Mumbai",
    customer_lat: 19.098, customer_lng: 72.826,
    customer_phone: "+91 98765 22222",
    total_amount: 478, distance_km: 3.8, eta_minutes: 15,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    picked_up_at: new Date(Date.now() - 18 * 60000).toISOString(),
    delivered_at: null, earnings: 38,
    items: [{ name: "Classic Smash Burger", quantity: 2 }, { name: "Truffle Fries", quantity: 1 }],
  },
  {
    id: 3, order_id: 10003, partner_id: 5, status: "delivered",
    restaurant_name: "Tokyo Bites", restaurant_address: "78 Linking Road, Bandra, Mumbai",
    restaurant_lat: 19.062, restaurant_lng: 72.833,
    customer_name: "Carol White", customer_address: "8 Bandstand, Bandra West, Mumbai",
    customer_lat: 19.047, customer_lng: 72.822,
    customer_phone: "+91 98765 33333",
    total_amount: 798, distance_km: 2.1, eta_minutes: 0,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    picked_up_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    earnings: 55,
    items: [{ name: "Salmon Nigiri", quantity: 1 }, { name: "Dragon Roll", quantity: 1 }, { name: "Tonkotsu Ramen", quantity: 1 }],
  },
  {
    id: 4, order_id: 10004, partner_id: 5, status: "delivered",
    restaurant_name: "Green Bowl", restaurant_address: "56 Bandstand, Bandra, Mumbai",
    restaurant_lat: 19.048, restaurant_lng: 72.823,
    customer_name: "Dan Kumar", customer_address: "3 Juhu Tara Rd, Juhu, Mumbai",
    customer_lat: 19.1, customer_lng: 72.827,
    customer_phone: "+91 98765 44444",
    total_amount: 349, distance_km: 6.4, eta_minutes: 0,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    picked_up_at: new Date(Date.now() - 7.5 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 7 * 3600000).toISOString(),
    earnings: 40,
    items: [{ name: "Caesar Salad", quantity: 1 }, { name: "Cold Press Juice", quantity: 2 }],
  },
];

export function getAssignments(): DeliveryAssignment[] {
  return assignments;
}

const VALID_STATUSES: DeliveryAssignment["status"][] = ["assigned", "picked_up", "en_route", "delivered", "failed"];

const router = Router();

router.get("/delivery/assignments", (req: Request, res: Response) => {
  const user = requireDelivery(req, res);
  if (!user) return;
  const partnerId = user.role === "admin" ? undefined : user.id;
  const result = assignments
    .filter(a => partnerId === undefined || a.partner_id === partnerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ data: result });
});

router.get("/delivery/assignments/:id", (req: Request, res: Response) => {
  const user = requireDelivery(req, res);
  if (!user) return;
  const a = assignments.find(a =>
    a.id === Number(req.params.id) &&
    (user.role === "admin" || a.partner_id === user.id)
  );
  if (!a) { res.status(404).json({ error: "Assignment not found" }); return; }
  res.json({ data: a });
});

router.put("/delivery/assignments/:id/status", (req: Request, res: Response) => {
  const user = requireDelivery(req, res);
  if (!user) return;
  const idx = assignments.findIndex(a =>
    a.id === Number(req.params.id) &&
    (user.role === "admin" || a.partner_id === user.id)
  );
  if (idx === -1) { res.status(404).json({ error: "Assignment not found" }); return; }
  const { status } = req.body ?? {};
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }); return;
  }
  const now = new Date().toISOString();
  assignments[idx] = {
    ...assignments[idx],
    status,
    picked_up_at: status === "picked_up" && !assignments[idx].picked_up_at ? now : assignments[idx].picked_up_at,
    delivered_at: status === "delivered" && !assignments[idx].delivered_at ? now : assignments[idx].delivered_at,
    eta_minutes: status === "delivered" || status === "failed" ? 0 : assignments[idx].eta_minutes,
  };

  const io = getIO();
  if (io) {
    io.to(`order:${assignments[idx].order_id}`).emit("location:update", {
      lat: status === "delivered" ? assignments[idx].customer_lat : assignments[idx].restaurant_lat,
      lng: status === "delivered" ? assignments[idx].customer_lng : assignments[idx].restaurant_lng,
      progress: status === "delivered" ? 1 : 0,
      status,
      restaurant_name: assignments[idx].restaurant_name,
      customer_name: assignments[idx].customer_name,
      simulated: false,
    });
  }

  res.json({ data: assignments[idx] });
});

router.get("/delivery/stats", (req: Request, res: Response) => {
  const user = requireDelivery(req, res);
  if (!user) return;
  const partnerId = user.role === "admin" ? undefined : user.id;
  const mine = assignments.filter(a => partnerId === undefined || a.partner_id === partnerId);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayDeliveries = mine.filter(a => a.status === "delivered" && a.delivered_at && new Date(a.delivered_at) >= today);
  const totalEarnings = mine.filter(a => a.status === "delivered").reduce((s, a) => s + a.earnings, 0);
  const todayEarnings = todayDeliveries.reduce((s, a) => s + a.earnings, 0);
  const active = mine.filter(a => a.status === "assigned" || a.status === "picked_up" || a.status === "en_route");
  res.json({
    data: {
      total_deliveries: mine.filter(a => a.status === "delivered").length,
      today_deliveries: todayDeliveries.length,
      active_deliveries: active.length,
      total_earnings: totalEarnings,
      today_earnings: todayEarnings,
      rating: 4.8,
    },
  });
});

export default router;
