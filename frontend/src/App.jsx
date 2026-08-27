import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./hooks/useMiddleware";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { NotificationProvider } from "./context/NotificationSystem";
import { ThemeProvider } from "./context/ThemeContext";
import Landing from "./features/Landing/pages/Landing";
import IOSInstallBanner from "./components/layout/IOSInstallBanner";
import SplashScreen from "./components/layout/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

const Dashboard = lazy(() => import("./features/Dashboard/pages/Dashboard"));
const Plans = lazy(() => import("./features/Plan/pages/Plans"));
const Analytics = lazy(() => import("./features/Analytics/pages/Analytics"));
const CameraWorkout = lazy(() => import("./features/CameraWorkout/pages/CameraWorkout"));
const Log = lazy(() => import("./features/Log/pages/Log"));
const NutritionTracker = lazy(() => import("./features/MealTracker/pages/MealTracker"));
const VirtualClinic = lazy(() => import("./features/Coach/pages/VirtualClinic"));
const Profile = lazy(() => import("./features/Profile/pages/Profile"));
const ActivityMap = lazy(() => import("./features/ActivityMap/pages/ActivityMap"));
const SharedActivity = lazy(() => import("./features/ActivityMap/pages/SharedActivity"));
const Register = lazy(() => import("./features/Auth/Register/pages/Register"));
const Login = lazy(() => import("./features/Auth/Login/pages/Login"));
const ClinicalMessenger = lazy(() => import("./features/Social/pages/Social"));
const ForgotPassword = lazy(() => import("./features/Auth/ForgotPassword/pages/ForgotPassword"));
const VerifyEmail = lazy(() => import("./features/Auth/VerifyEmail/pages/VerifyEmail"));


const RouteFallback = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "3px solid rgba(143,191,99,0.25)",
        borderTopColor: "#8FBF63",
        animation: "spin 0.7s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <div className="w-auto min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <RoutesHandler />
              <IOSInstallBanner />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </div>
    </ErrorBoundary>
  );
}

function RoutesHandler() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PublicRoute>
                <Login />
              </PublicRoute>
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <PublicRoute>
                <Register />
              </PublicRoute>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/messenger"
          element={
            <ProtectedRoute>
              <ClinicalMessenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/plans"
          element={
            <ProtectedRoute>
              <Plans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/activity-map"
          element={
            <ProtectedRoute>
              <ActivityMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/workouts"
          element={
            <ProtectedRoute>
              <CameraWorkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/logs"
          element={
            <ProtectedRoute>
              <Log />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/meal-tracker"
          element={
            <ProtectedRoute>
              <NutritionTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/virtual-clinic"
          element={
            <ProtectedRoute>
              <VirtualClinic />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Public read-only share link for activities */}
        <Route path="/activity/:token" element={<SharedActivity />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}