import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { seedRestaurants, seedMenuItems, type SeedRestaurant } from "../seeds";

const router = Router();

function getUser(req: Request): { id: number; email: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET ?? "change-me-in-production") as { id: number; email: string; role: string };
  } catch { return null; }
}

let mutableRestaurants: SeedRestaurant[] = seedRestaurants.map(r => ({ ...r }));
let nextRestaurantId = 100;

export function getRestaurants(): SeedRestaurant[] {
  return mutableRestaurants;
}

router.get("/restaurants", (req, res) => {
  const { cuisine, search } = req.query as { cuisine?: string; search?: string };
  let data = [...mutableRestaurants].filter(r => r.is_active === 1);
  if (cuisine) data = data.filter((r) => r.cuisine_type.toLowerCase() === cuisine.toLowerCase());
  if (search)  data = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine_type.toLowerCase().includes(search.toLowerCase()));
  data.sort((a, b) => b.rating - a.rating);
  res.json({ data, _source: "seed" });
});

router.get("/restaurants/:id", (req, res) => {
  const r = mutableRestaurants.find((r) => r.id === Number(req.params.id));
  if (!r) { res.status(404).json({ error: "Restaurant not found" }); return; }
  res.json({ data: r, _source: "seed" });
});

router.get("/restaurants/:id/menu", (req, res) => {
  const items = seedMenuItems.filter((m) => m.restaurant_id === Number(req.params.id));
  res.json({ data: items, _source: "seed" });
});

router.post("/restaurants", (req: Request, res: Response) => {
  const user = getUser(req);
  if (!user) { res.status(401).json({ error: "Authentication required" }); return; }
  if (user.role !== "admin" && user.role !== "restaurant") {
    res.status(403).json({ error: "Admin or restaurant access required" }); return;
  }

  const { name, description, address, city, cuisine_type, phone, email, delivery_time, min_order, offer, gradient, emoji } = req.body ?? {};
  if (!name || !cuisine_type) {
    res.status(400).json({ error: "name and cuisine_type are required" }); return;
  }

  const newRestaurant: SeedRestaurant = {
    id: ++nextRestaurantId,
    name,
    description: description ?? "",
    address: address ?? "",
    city: city ?? "Mumbai",
    state: "MH",
    zip: "400001",
    phone: phone ?? "",
    email: email ?? "",
    cuisine_type,
    rating: 4.0,
    is_active: 1,
    delivery_time: delivery_time ?? "30-40",
    min_order: Number(min_order) || 149,
    offer: offer ?? "",
    gradient: gradient ?? "from-orange-600 to-red-700",
    emoji: emoji ?? "🍽️",
  };

  mutableRestaurants.push(newRestaurant);
  res.status(201).json({ data: newRestaurant });
});

export default router;
