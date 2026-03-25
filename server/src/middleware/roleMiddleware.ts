import { type Request, type Response, type NextFunction } from "express";
import type { UserRole } from "../types/express.js";

/**
 * Restrict a route to one or more roles.
 *
 * Usage:
 *   router.get("/admin-only", authMiddleware, roleMiddleware("admin"), handler)
 *   router.get("/staff",      authMiddleware, roleMiddleware("admin", "restaurant"), handler)
 */
export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: `This route requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}
