import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  address?: string;
}

const seedUsers: StoredUser[] = [
  { id: 1, name: "Alice Johnson",    email: "alice@example.com",      password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "customer",    phone: "+91 98765 11111" },
  { id: 2, name: "Bob Smith",        email: "bob@example.com",        password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "customer",    phone: "+91 98765 22222" },
  { id: 3, name: "Admin User",       email: "admin@example.com",      password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "admin",       phone: "+91 98765 00000" },
  { id: 4, name: "Spice Garden",     email: "restaurant@example.com", password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "restaurant",  phone: "+91 98765 43210" },
  { id: 5, name: "Raj Delivery",     email: "delivery@example.com",   password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "delivery",    phone: "+91 98765 55555" },
];

let nextId = 100;
const registeredUsers: StoredUser[] = [...seedUsers];

export function getUserById(id: number): StoredUser | undefined {
  return registeredUsers.find(u => u.id === id);
}

export function getUserByEmail(email: string): StoredUser | undefined {
  return registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function safeUser(u: StoredUser) {
  const { password: _, ...out } = u;
  return out;
}

function getAuthUser(req: Request): { id: number; email: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as { id: number; email: string; role: string }; }
  catch { return null; }
}

router.post("/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: safeUser(user) });
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body ?? {};
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "name, email, phone, and password are required" });
    return;
  }

  if (registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const userRole = ["customer", "restaurant", "delivery", "admin"].includes(role) ? role : "customer";
  const newUser: StoredUser = { id: ++nextId, name, email, phone, password: hash, role: userRole };
  registeredUsers.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: safeUser(newUser) });
});

router.get("/auth/me", (req: Request, res: Response) => {
  const tokenUser = getAuthUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Authentication required" }); return; }
  const user = registeredUsers.find(u => u.id === tokenUser.id);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ data: safeUser(user) });
});

router.put("/auth/profile", (req: Request, res: Response) => {
  const tokenUser = getAuthUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Authentication required" }); return; }
  const idx = registeredUsers.findIndex(u => u.id === tokenUser.id);
  if (idx === -1) { res.status(404).json({ error: "User not found" }); return; }

  const { name, phone, address } = req.body ?? {};
  const user = registeredUsers[idx];
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  res.json({ data: safeUser(user) });
});

export default router;
