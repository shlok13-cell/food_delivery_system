import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = Router();

// ─── Any authenticated user ──────────────────────────────────────────────────
// GET /api/protected/me
router.get(
  "/me",
  authMiddleware,
  (req: Request, res: Response) => {
    res.json({
      message: "Your profile",
      user: req.user,
    });
  },
);

// ─── Admin only ───────────────────────────────────────────────────────────────
// GET /api/protected/admin
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin"),
  (_req: Request, res: Response) => {
    res.json({ message: "Welcome, admin. You have full access." });
  },
);

// ─── Restaurant owners ────────────────────────────────────────────────────────
// GET /api/protected/restaurant
router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware("restaurant", "admin"),
  (_req: Request, res: Response) => {
    res.json({ message: "Restaurant dashboard — manage your menu and orders." });
  },
);

// ─── Customers ────────────────────────────────────────────────────────────────
// GET /api/protected/customer
router.get(
  "/customer",
  authMiddleware,
  roleMiddleware("customer", "admin"),
  (_req: Request, res: Response) => {
    res.json({ message: "Customer area — browse restaurants and place orders." });
  },
);

// ─── Delivery partners ────────────────────────────────────────────────────────
// GET /api/protected/delivery
router.get(
  "/delivery",
  authMiddleware,
  roleMiddleware("delivery", "admin"),
  (_req: Request, res: Response) => {
    res.json({ message: "Delivery partner hub — view and manage your deliveries." });
  },
);

export default router;
