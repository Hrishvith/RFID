import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Gates Dashboard/Students/Attendance/Reports - the pages that show every
 * student's data - to Administrator accounts only. A "User" account hitting
 * one of these directly (typed URL, old bookmark, etc.) is bounced to their
 * own scoped Check Status page instead of seeing everyone else's records.
 */
export function RequireAdmin() {
  const { user } = useAuth();

  if (user?.role !== "Administrator") {
    return <Navigate to="/check-status" replace />;
  }

  return <Outlet />;
}
