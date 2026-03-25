import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";

const seedUsers = [
  { id: 1, name: "Alice Johnson",    email: "alice@example.com",      password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "customer" },
  { id: 2, name: "Bob Smith",        email: "bob@example.com",        password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "customer" },
  { id: 3, name: "Admin User",       email: "admin@example.com",      password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "admin" },
  { id: 4, name: "Spice Garden",     email: "restaurant@example.com", password: "$2b$10$WaXhTyQbYuHn./CcLB1AfenE.f5IHsyzHzN2OgZXWIulNOe9a/NYG", role: "restaurant" },
];

let nextId = 100;
const registeredUsers = [...seedUsers];

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
  const { password: _, ...userOut } = user;
  res.json({ token, user: userOut });
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
  const newUser = { id: ++nextId, name, email, phone, password: hash, role: userRole };
  registeredUsers.push(newUser as typeof registeredUsers[0]);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
  const { password: _, ...userOut } = newUser;
  res.status(201).json({ token, user: userOut });
});

export default router;
