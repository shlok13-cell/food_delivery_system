import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import type { UserRole } from "../types/express.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
const SALT_ROUNDS = 12;

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  is_active: number;
}

function signToken(user: Pick<UserRow, "id" | "email" | "role">): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password, role = "customer" } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: UserRole;
  };

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "name, email, phone, and password are required" });
    return;
  }

  const validRoles: UserRole[] = ["customer", "restaurant", "delivery", "admin"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: `role must be one of: ${validRoles.join(", ")}` });
    return;
  }

  try {
    const [existing] = await pool.execute<UserRow[] & any[]>(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [email, phone],
    );

    if ((existing as UserRow[]).length > 0) {
      res.status(409).json({ error: "Email or phone already in use" });
      return;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.execute<any>(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, password_hash, role],
    );

    const userId: number = result.insertId;
    const token = signToken({ id: userId, email, role });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: userId, name, email, phone, role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const [rows] = await pool.execute<UserRow[] & any[]>(
      "SELECT id, name, email, phone, password_hash, role, is_active FROM users WHERE email = ?",
      [email],
    );

    const user = (rows as UserRow[])[0];

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
