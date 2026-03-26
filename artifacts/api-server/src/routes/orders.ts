import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { seedRestaurants, seedMenuItems } from "../seeds";
import { getUserById } from "./auth";

interface JWTUser { id: number; email: string; role: string }

function getUser(req: Request): JWTUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET ?? "change-me-in-production") as JWTUser;
  } catch { return null; }
}

export interface StoredOrder {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  restaurant_id: number;
  delivery_address: string;
  notes?: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: { id: number; menu_item_id: number; item_name: string; category: string; quantity: number; unit_price: number; subtotal: number }[];
}

let orderStore: StoredOrder[] = [];
let nextOrderId = 20000;

export function getOrderStore(): StoredOrder[] {
  return orderStore;
}

export function addOrderToStore(order: StoredOrder): void {
  orderStore.push(order);
}

const router = Router();

router.post("/orders", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }

  const { restaurant_id, items, delivery_address, notes } = req.body ?? {};
  if (!restaurant_id || !items?.length || !delivery_address) {
    res.status(400).json({ error: "restaurant_id, items, and delivery_address are required" }); return;
  }

  const restaurant = seedRestaurants.find(r => r.id === Number(restaurant_id));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" }); return;
  }

  const orderedItems = (items as { menu_item_id: number; quantity: number; unit_price: number }[]).map((i, idx) => {
    const menuItem = seedMenuItems.find(m => m.id === i.menu_item_id);
    return {
      id: idx + 1,
      menu_item_id: i.menu_item_id,
      item_name: menuItem?.name ?? "Unknown Item",
      category: menuItem?.category ?? "Main",
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.unit_price * i.quantity,
    };
  });

  const total_amount = orderedItems.reduce((s, i) => s + i.subtotal, 0) + 49 + 5;
  const orderId = ++nextOrderId;

  const storedUser = getUserById(user.id);
  const storedName = storedUser?.name ?? user.email.split("@")[0];

  const order: StoredOrder = {
    id: orderId,
    user_id: user.id,
    user_email: user.email,
    user_name: storedName,
    restaurant_id: Number(restaurant_id),
    delivery_address,
    notes: notes || undefined,
    status: "pending",
    total_amount,
    created_at: new Date().toISOString(),
    items: orderedItems,
  };

  orderStore.push(order);

  res.status(201).json({
    data: {
      id: orderId,
      status: "pending",
      total_amount,
      message: "Order placed successfully!",
    },
  });
});

router.get("/orders", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }

  const userOrders = orderStore
    .filter(o => o.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(o => {
      const restaurant = seedRestaurants.find(r => r.id === o.restaurant_id);
      return {
        id: o.id,
        status: o.status,
        total_amount: o.total_amount,
        delivery_address: o.delivery_address,
        created_at: o.created_at,
        restaurant_name: restaurant?.name ?? "Unknown Restaurant",
        cuisine_type: restaurant?.cuisine_type ?? "",
        item_count: o.items.reduce((s, i) => s + i.quantity, 0),
      };
    });

  res.json({ data: userOrders });
});

router.get("/orders/:id", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }

  const order = orderStore.find(o => o.id === Number(req.params.id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  if (order.user_id !== user.id && user.role !== "admin" && user.role !== "restaurant") {
    res.status(403).json({ error: "Access denied" }); return;
  }

  const restaurant = seedRestaurants.find(r => r.id === order.restaurant_id);

  res.json({
    data: {
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      delivery_address: order.delivery_address,
      notes: order.notes,
      created_at: order.created_at,
      restaurant_name: restaurant?.name ?? "Unknown Restaurant",
      cuisine_type: restaurant?.cuisine_type ?? "",
      restaurant_phone: restaurant?.phone,
      items: order.items,
    },
  });
});

router.put("/orders/:id/status", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  if (user.role !== "admin" && user.role !== "restaurant") {
    res.status(403).json({ error: "Not authorized to update order status" }); return;
  }

  const order = orderStore.find(o => o.id === Number(req.params.id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const { status } = req.body ?? {};
  const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }); return;
  }

  order.status = status;
  res.json({ data: order });
});

export default router;
