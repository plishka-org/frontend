import { useEffect, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { canAccessAdmin } from "../../config/roles";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectPath?: string;
};

export function ProtectedRoute({
  children,
  redirectPath = "#/login",
}: ProtectedRouteProps) {
  const { user, isAuthChecked } = useAuth();

  useEffect(() => {
    if (!isAuthChecked) return;

    if (!user || !canAccessAdmin(user.role)) {
      window.location.hash = redirectPath;
    }
  }, [isAuthChecked, user, redirectPath]);

  if (!isAuthChecked) {
    return null;
  }

  if (!user || !canAccessAdmin(user.role)) {
    return null;
  }

  return <>{children}</>;
}