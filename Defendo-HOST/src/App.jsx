import { Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import ProtectedRoute from "./components/ProtectedRoute"
import LoadingSpinner from "./components/LoadingSpinner"

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"))
const Login = lazy(() => import("./pages/Login"))
const Signup = lazy(() => import("./pages/Signup"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const AdminLogin = lazy(() => import("./pages/AdminLogin"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const AboutUs = lazy(() => import("./pages/AboutUs"))
const AdvisoryBoard = lazy(() => import("./pages/AdvisoryBoard"))

// Only load debug components in development
const DebugInfo = lazy(() => 
  import.meta.env.DEV ? import("./components/DebugInfo") : Promise.resolve({ default: () => null })
)
const AuthDebugger = lazy(() => 
  import.meta.env.DEV ? import("./components/AuthDebugger") : Promise.resolve({ default: () => null })
)
const KycNotification = lazy(() => import("./components/KycNotification"))

function App() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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
          <Route path="/about" element={<AboutUs />} />
          <Route path="/advisory-board" element={<AdvisoryBoard />} />
          {/* Catch-all route for 404s */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <DebugInfo />
        <AuthDebugger />
        <KycNotification />
      </Suspense>
    </>
  )
}

export default App
