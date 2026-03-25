import { Router } from "express";
import { seedRestaurants, seedMenuItems } from "../seeds";

const router = Router();

router.get("/restaurants", (req, res) => {
  const { cuisine, search } = req.query as { cuisine?: string; search?: string };
  let data = [...seedRestaurants];
  if (cuisine) data = data.filter((r) => r.cuisine_type.toLowerCase() === cuisine.toLowerCase());
  if (search)  data = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine_type.toLowerCase().includes(search.toLowerCase()));
  data.sort((a, b) => b.rating - a.rating);
  res.json({ data, _source: "seed" });
});

router.get("/restaurants/:id", (req, res) => {
  const r = seedRestaurants.find((r) => r.id === Number(req.params.id));
  if (!r) { res.status(404).json({ error: "Restaurant not found" }); return; }
  res.json({ data: r, _source: "seed" });
});

router.get("/restaurants/:id/menu", (req, res) => {
  const items = seedMenuItems.filter((m) => m.restaurant_id === Number(req.params.id));
  res.json({ data: items, _source: "seed" });
});

export default router;
