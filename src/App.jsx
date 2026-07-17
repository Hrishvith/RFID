import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { RequireAdmin } from "./components/common/RequireAdmin";
import { CampusAuthLayout } from "./layouts/CampusAuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PageLoader } from "./components/common/PageLoader";

const Login = lazy(() => import("./pages/Login"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CheckStatus = lazy(() => import("./pages/CheckStatus"));
const Students = lazy(() => import("./pages/Students"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />

              <Route element={<CampusAuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/user-login" element={<UserLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/check-status" element={<CheckStatus />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route element={<RequireAdmin />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/reports" element={<Reports />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
