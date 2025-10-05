import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AboutUs from "./pages/AboutUs"
import ProtectedRoute from "./components/ProtectedRoute"
import DebugInfo from "./components/DebugInfo"
import AuthDebugger from "./components/AuthDebugger"
import KycNotification from "./components/KycNotification"

function App() {
  return (
    <>
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
        {/* Catch-all route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DebugInfo />
      <AuthDebugger />
      <KycNotification />
    </>
  )
}

export default App
