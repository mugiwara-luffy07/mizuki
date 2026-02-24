import { Navigate, Outlet, useLocation } from "react-router-dom";

const SUPERADMIN_AUTH_KEY = "superadmin-authed";

export function setSuperadminAuth(isAuthed: boolean): void {
  if (isAuthed) {
    localStorage.setItem(SUPERADMIN_AUTH_KEY, "true");
  } else {
    localStorage.removeItem(SUPERADMIN_AUTH_KEY);
  }
}

export function clearSuperadminAuth(): void {
  localStorage.removeItem(SUPERADMIN_AUTH_KEY);
}

export function isSuperadminAuthed(): boolean {
  return localStorage.getItem(SUPERADMIN_AUTH_KEY) === "true";
}

export function ProtectedRouteSuperadmin() {
  const location = useLocation();

  if (!isSuperadminAuthed()) {
    return <Navigate to="/superadmin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
