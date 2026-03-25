import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

interface JWTUser { id: number; email: string; role: string }

function getUser(req: Request): JWTUser | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET ?? "change-me-in-production") as JWTUser;
  } catch { return null; }
}

const router = Router();

router.post("/orders", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  const { restaurant_id, items, delivery_address } = req.body ?? {};
  if (!restaurant_id || !items?.length || !delivery_address) {
    res.status(400).json({ error: "restaurant_id, items, and delivery_address are required" }); return;
  }
  const total_amount = (items as { unit_price: number; quantity: number }[]).reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const orderId = Math.floor(Math.random() * 90000) + 10000;
  res.status(201).json({ data: { id: orderId, status: "pending", total_amount, message: "Order placed successfully!" } });
});

router.get("/orders", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  res.json({ data: [] });
});

router.get("/orders/:id", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  res.status(404).json({ error: "Order not found" });
});

export default router;
