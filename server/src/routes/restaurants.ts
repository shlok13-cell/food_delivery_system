import { Router, type Request, type Response } from "express";
import pool from "../db.js";
import { seedRestaurants, seedMenuItems } from "../seeds.js";

const router = Router();

// ─── GET /api/restaurants ────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response) => {
  const { cuisine, search } = req.query as { cuisine?: string; search?: string };
  try {
    let sql = `
      SELECT r.*, u.name AS owner_name
      FROM restaurants r
      JOIN users u ON u.id = r.user_id
      WHERE r.is_active = 1
    `;
    const params: unknown[] = [];
    if (cuisine) { sql += " AND r.cuisine_type = ?"; params.push(cuisine); }
    if (search)  { sql += " AND (r.name LIKE ? OR r.cuisine_type LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    sql += " ORDER BY r.rating DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, _source: "db" });
  } catch {
    let data = seedRestaurants;
    if (cuisine) data = data.filter((r) => r.cuisine_type.toLowerCase() === cuisine.toLowerCase());
    if (search)  data = data.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine_type.toLowerCase().includes(search.toLowerCase()));
    res.json({ data, _source: "seed" });
  }
});

// ─── GET /api/restaurants/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<import("mysql2").RowDataPacket[]>(
      "SELECT * FROM restaurants WHERE id = ? AND is_active = 1 LIMIT 1",
      [id],
    );
    if (!rows.length) { res.status(404).json({ error: "Restaurant not found" }); return; }
    res.json({ data: rows[0], _source: "db" });
  } catch {
    const r = seedRestaurants.find((r) => r.id === Number(id));
    if (!r) { res.status(404).json({ error: "Restaurant not found" }); return; }
    res.json({ data: r, _source: "seed" });
  }
});

// ─── GET /api/restaurants/:id/menu ───────────────────────────────────────────
router.get("/:id/menu", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<import("mysql2").RowDataPacket[]>(
      "SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY category, name",
      [id],
    );
    res.json({ data: rows, _source: "db" });
  } catch {
    const items = seedMenuItems.filter((m) => m.restaurant_id === Number(id));
    res.json({ data: items, _source: "seed" });
  }
});

export default router;
