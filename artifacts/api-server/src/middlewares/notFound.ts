import { type Request, type Response } from "express";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: "Route not found", status: 404 } });
}
