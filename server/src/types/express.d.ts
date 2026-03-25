import "express";

export type UserRole = "customer" | "restaurant" | "delivery" | "admin";

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
