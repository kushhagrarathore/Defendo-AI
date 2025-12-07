import { Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
const Home = lazy(() => import("./pages/Home"))
const LandingPage = lazy(() => import("./pages/LandingPage"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const AdminLogin = lazy(() => import("./pages/AdminLogin"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const AboutUs = lazy(() => import("./pages/AboutUs"))
const PartnerWithDefendo = lazy(() => import("./pages/PartnerWithDefendo"))
const UserLogin = lazy(() => import("./pages/UserLogin"))
const UserSignup = lazy(() => import("./pages/UserSignup"))
const UserPortal = lazy(() => import("./pages/UserPortal"))
import ProtectedRoute from "./components/ProtectedRoute"
const DebugInfo = lazy(() => import("./components/DebugInfo"))
const KycNotification = lazy(() => import("./components/KycNotification"))

function App() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-[#111714] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user-signup" element={<UserSignup />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/user-portal/*"
            element={
              <ProtectedRoute redirectTo="/user-login">
                <UserPortal />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/partner" element={<PartnerWithDefendo />} />
          {/* Catch-all route for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <DebugInfo />
        <KycNotification />
      </Suspense>
    </>
  )
}

export default App
