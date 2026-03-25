import { Router, type Request, type Response } from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

// ─── POST /api/orders  (customer places an order) ────────────────────────────
router.post(
  "/",
  roleMiddleware("customer", "admin"),
  async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const { restaurant_id, items, delivery_address, notes } = req.body as {
      restaurant_id: number;
      items: { menu_item_id: number; quantity: number; unit_price: number }[];
      delivery_address: string;
      notes?: string;
    };

    if (!restaurant_id || !items?.length || !delivery_address) {
      res.status(400).json({ error: "restaurant_id, items, and delivery_address are required" });
      return;
    }

    const total_amount = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query<import("mysql2").ResultSetHeader>(
        `INSERT INTO orders (customer_id, restaurant_id, status, total_amount, delivery_address, notes)
         VALUES (?, ?, 'pending', ?, ?, ?)`,
        [customerId, restaurant_id, total_amount, delivery_address, notes ?? null],
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.menu_item_id, item.quantity, item.unit_price, item.unit_price * item.quantity],
        );
      }

      await conn.commit();
      res.status(201).json({
        data: { id: orderId, status: "pending", total_amount, message: "Order placed successfully!" },
      });
    } catch (err) {
      await conn.rollback();
      console.error("Order creation failed:", err);
      res.status(500).json({ error: "Failed to place order. Please try again." });
    } finally {
      conn.release();
    }
  },
);

// ─── GET /api/orders  (customer sees their own orders) ───────────────────────
router.get(
  "/",
  roleMiddleware("customer", "admin"),
  async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    try {
      const [rows] = await pool.query<import("mysql2").RowDataPacket[]>(
        `SELECT o.id, o.status, o.total_amount, o.delivery_address, o.created_at,
                r.name AS restaurant_name, r.cuisine_type,
                COUNT(oi.id) AS item_count
         FROM orders o
         JOIN restaurants r ON r.id = o.restaurant_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [customerId],
      );
      res.json({ data: rows });
    } catch {
      res.json({ data: [], _source: "empty" });
    }
  },
);

// ─── GET /api/orders/:id  (single order detail) ──────────────────────────────
router.get(
  "/:id",
  roleMiddleware("customer", "admin"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const customerId = req.user!.id;
    try {
      const [orderRows] = await pool.query<import("mysql2").RowDataPacket[]>(
        `SELECT o.*, r.name AS restaurant_name, r.cuisine_type, r.phone AS restaurant_phone
         FROM orders o
         JOIN restaurants r ON r.id = o.restaurant_id
         WHERE o.id = ? AND o.customer_id = ?
         LIMIT 1`,
        [id, customerId],
      );
      if (!orderRows.length) { res.status(404).json({ error: "Order not found" }); return; }

      const [itemRows] = await pool.query<import("mysql2").RowDataPacket[]>(
        `SELECT oi.*, m.name AS item_name, m.category
         FROM order_items oi
         JOIN menu_items m ON m.id = oi.menu_item_id
         WHERE oi.order_id = ?`,
        [id],
      );
      res.json({ data: { ...orderRows[0], items: itemRows } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not fetch order details" });
    }
  },
);

export default router;
