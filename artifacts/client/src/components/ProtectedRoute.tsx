import { Navigate, useLocation } from "react-router-dom";

function parseJWT(token: string): { role?: string } | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const payload = parseJWT(token);
    if (!payload || !allowedRoles.includes(payload.role ?? "")) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
