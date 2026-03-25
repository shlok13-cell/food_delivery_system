import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { testConnection } from "./db.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import restaurantRoutes from "./routes/restaurants.js";
import orderRoutes from "./routes/orders.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ message: "Server running", status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/protected/me          (any role)`);
  console.log(`   GET  /api/protected/admin        (admin)`);
  console.log(`   GET  /api/protected/restaurant   (restaurant, admin)`);
  console.log(`   GET  /api/protected/customer     (customer, admin)`);
  console.log(`   GET  /api/protected/delivery     (delivery, admin)`);

  try {
    await testConnection();
  } catch (err) {
    console.warn("⚠️  MySQL connection failed — check your .env credentials:", (err as Error).message);
  }
});

export default app;
