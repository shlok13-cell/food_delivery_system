import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { seedRestaurants, seedMenuItems, type SeedMenuItem } from "../seeds";
import { getOrderStore } from "./orders";

interface JWTUser { id: number; email: string; role: string }

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

function getUser(req: Request): JWTUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as JWTUser;
  } catch { return null; }
}

function requireRestaurant(req: Request, res: Response): JWTUser | null {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return null; }
  if (user.role !== "restaurant" && user.role !== "admin") {
    res.status(403).json({ error: "Restaurant access required" }); return null;
  }
  return user;
}

const restaurantOwners: Record<number, number> = { 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6 };

let mutableMenuItems: SeedMenuItem[] = seedMenuItems.map(i => ({ ...i }));
let nextMenuId = 200;

export interface DashboardOrder {
  id: number;
  restaurant_id: number;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: { name: string; quantity: number; unit_price: number }[];
}

const orderStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];

let dashboardOrders: DashboardOrder[] = [
  {
    id: 10001, restaurant_id: 1, customer_name: "Alice Johnson", customer_email: "alice@example.com",
    delivery_address: "42 Park Street, Mumbai", total_amount: 657, status: "pending",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [{ name: "Butter Chicken", quantity: 2, unit_price: 299 }, { name: "Garlic Naan", quantity: 1, unit_price: 59 }],
  },
  {
    id: 10002, restaurant_id: 1, customer_name: "Bob Smith", customer_email: "bob@example.com",
    delivery_address: "17 Sea View Road, Mumbai", total_amount: 487, status: "confirmed",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    items: [{ name: "Chicken Biryani", quantity: 1, unit_price: 299 }, { name: "Mango Lassi", quantity: 2, unit_price: 79 }, { name: "Gulab Jamun", quantity: 1, unit_price: 89 }],
  },
  {
    id: 10003, restaurant_id: 1, customer_name: "Carol White", customer_email: "carol@example.com",
    delivery_address: "8 Bandra West, Mumbai", total_amount: 528, status: "preparing",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    items: [{ name: "Paneer Tikka Masala", quantity: 1, unit_price: 259 }, { name: "Veg Biryani", quantity: 1, unit_price: 229 }, { name: "Garlic Naan", quantity: 1, unit_price: 59 }],
  },
  {
    id: 10004, restaurant_id: 1, customer_name: "Dan Kumar", customer_email: "dan@example.com",
    delivery_address: "3 Juhu Tara Rd, Mumbai", total_amount: 378, status: "out_for_delivery",
    created_at: new Date(Date.now() - 70 * 60000).toISOString(),
    items: [{ name: "Dal Makhani", quantity: 1, unit_price: 199 }, { name: "Garlic Naan", quantity: 3, unit_price: 59 }],
  },
  {
    id: 10005, restaurant_id: 1, customer_name: "Eve Sharma", customer_email: "eve@example.com",
    delivery_address: "22 Andheri East, Mumbai", total_amount: 388, status: "delivered",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    items: [{ name: "Chicken Biryani", quantity: 1, unit_price: 299 }, { name: "Gulab Jamun", quantity: 1, unit_price: 89 }],
  },
];

const router = Router();

router.get("/dashboard/restaurant", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const restaurant = seedRestaurants.find(r => r.id === restaurantId);
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }
  res.json({ data: restaurant });
});

router.get("/dashboard/menu", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const items = mutableMenuItems.filter(m => m.restaurant_id === restaurantId);
  res.json({ data: items });
});

router.post("/dashboard/menu", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const { name, description, price, category, emoji, is_veg, is_bestseller } = req.body ?? {};
  if (!name || !description || price === undefined || !category) {
    res.status(400).json({ error: "name, description, price, and category are required" }); return;
  }
  const newItem: SeedMenuItem = {
    id: ++nextMenuId, restaurant_id: restaurantId,
    name, description, price: Number(price), category,
    image_url: null, is_available: 1,
    emoji: emoji ?? "🍽️",
    is_veg: Boolean(is_veg), is_bestseller: Boolean(is_bestseller),
  };
  mutableMenuItems.push(newItem);
  res.status(201).json({ data: newItem });
});

router.put("/dashboard/menu/:id", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const idx = mutableMenuItems.findIndex(m => m.id === Number(req.params.id) && m.restaurant_id === restaurantId);
  if (idx === -1) { res.status(404).json({ error: "Menu item not found" }); return; }
  const { name, description, price, category, emoji, is_veg, is_bestseller, is_available } = req.body ?? {};
  const existing = mutableMenuItems[idx];
  mutableMenuItems[idx] = {
    ...existing,
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price: Number(price) }),
    ...(category !== undefined && { category }),
    ...(emoji !== undefined && { emoji }),
    ...(is_veg !== undefined && { is_veg: Boolean(is_veg) }),
    ...(is_bestseller !== undefined && { is_bestseller: Boolean(is_bestseller) }),
    ...(is_available !== undefined && { is_available: is_available ? 1 : 0 }),
  };
  res.json({ data: mutableMenuItems[idx] });
});

router.delete("/dashboard/menu/:id", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const idx = mutableMenuItems.findIndex(m => m.id === Number(req.params.id) && m.restaurant_id === restaurantId);
  if (idx === -1) { res.status(404).json({ error: "Menu item not found" }); return; }
  mutableMenuItems.splice(idx, 1);
  res.json({ message: "Item deleted" });
});

router.get("/dashboard/orders", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);

  const realOrders: DashboardOrder[] = getOrderStore()
    .filter(o => o.restaurant_id === restaurantId)
    .map(o => ({
      id: o.id,
      restaurant_id: o.restaurant_id,
      customer_name: o.user_name,
      customer_email: o.user_email,
      delivery_address: o.delivery_address,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.created_at,
      items: o.items.map(i => ({ name: i.item_name, quantity: i.quantity, unit_price: i.unit_price })),
    }));

  const allOrders = [...realOrders, ...dashboardOrders.filter(o => o.restaurant_id === restaurantId)]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ data: allOrders });
});

router.put("/dashboard/orders/:id/status", (req: Request, res: Response) => {
  const user = requireRestaurant(req, res);
  if (!user) return;
  const restaurantId = user.role === "admin" ? 1 : (restaurantOwners[user.id] ?? 1);
  const { status } = req.body ?? {};
  if (!orderStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${orderStatuses.join(", ")}` }); return;
  }
  const orderId = Number(req.params.id);

  const realOrder = getOrderStore().find(o => o.id === orderId && o.restaurant_id === restaurantId);
  if (realOrder) {
    realOrder.status = status;
    res.json({ data: { ...realOrder, customer_name: realOrder.user_name, customer_email: realOrder.user_email } });
    return;
  }

  const order = dashboardOrders.find(o => o.id === orderId && o.restaurant_id === restaurantId);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  order.status = status;
  res.json({ data: order });
});

export default router;
