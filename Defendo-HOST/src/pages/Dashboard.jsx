import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import BrandLogo from "../components/BrandLogo"
import DashboardHome from "./DashboardHome"
import MyServices from "./MyServices"
import EditService from "./EditService"
import Bookings from "./Bookings"
import AddService from "./AddService"
import Account from "./Account"
import KYCUpload from "./KYCUpload"
import Employees from "./Employees"
import Assignments from "./Assignments"
import Analytics from "./Analytics"
import BookingManagement from "./BookingManagement"

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, hostProfile, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const sidebarItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard", color: "from-blue-500 to-cyan-500" },
    { path: "/dashboard/bookings", label: "Bookings", icon: "event", color: "from-teal-500 to-cyan-600" },
    { path: "/dashboard/services", label: "My Services", icon: "security", color: "from-green-500 to-emerald-500" },
    { path: "/dashboard/employees", label: "My Employees", icon: "group", color: "from-indigo-500 to-blue-600" },
    { path: "/dashboard/assignments", label: "Assignments", icon: "assignment_turned_in", color: "from-sky-500 to-cyan-600" },
    { path: "/dashboard/analytics", label: "Analytics", icon: "analytics", color: "from-purple-500 to-pink-500" },
    { path: "/dashboard/add-service", label: "Add Service", icon: "add", color: "from-purple-500 to-pink-500" },
    { path: "/dashboard/kyc", label: "KYC Verification", icon: "verified_user", color: "from-yellow-500 to-orange-500" },
    { path: "/dashboard/account", label: "Account", icon: "person", color: "from-orange-500 to-red-500" }
  ]

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Add keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(!sidebarCollapsed)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarCollapsed])

  useEffect(() => {
    // Auto-collapse sidebar on mobile screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }

    // Check initial screen size
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/')
    }
  }

  const getHostDisplayName = () => {
    if (hostProfile?.company_name) {
      return hostProfile.company_name
    }
    if (hostProfile?.full_name) {
      return hostProfile.full_name
    }
    return user?.email?.split('@')[0] || 'Host'
  }

  const getHostInitials = () => {
    const name = getHostDisplayName()
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary-color)] border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-slate-200 border-t-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          <h2 className="text-xl font-bold text-slate-700 animate-pulse">Loading dashboard…</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 min-h-screen flex animate-fade-in-up">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white border-r border-slate-200 ${sidebarCollapsed ? 'p-3' : 'p-6'} flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.06)]`}> 
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <div className={`absolute ${sidebarCollapsed ? 'top-6 left-3' : 'top-8 left-8'} w-40 h-40 bg-gradient-to-br from-emerald-200 to-emerald-400 rounded-full blur-3xl`}></div>
          <div className={`absolute ${sidebarCollapsed ? 'bottom-12 right-3' : 'bottom-16 right-8'} w-32 h-32 bg-sky-200 rounded-full blur-2xl`} style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Collapsed Sidebar Accent */}
        {sidebarCollapsed && (
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-400 opacity-60"></div>
        )}
        
        {/* Header */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} mb-8 relative z-10`}>
          <div className="relative">
            <BrandLogo
              showText={!sidebarCollapsed}
              text="Defendo"
              className={`${sidebarCollapsed ? 'justify-center' : 'items-center gap-2'}`}
              imgClassName={`${sidebarCollapsed ? 'h-9 w-9' : 'h-10 w-auto'} drop-shadow-lg`}
              textClassName="text-xl font-bold text-slate-900"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
          {!sidebarCollapsed && (
            <p className="text-xs text-slate-500 font-medium">
              Security Platform
            </p>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 hover:border-emerald-300 hover:shadow-emerald-200/60 transition-all duration-200 z-20 group backdrop-blur-sm"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-emerald-400 text-sm group-hover:scale-110 transition-transform">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
        
        {/* Add Service Button */}
        <div className="mb-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/dashboard/add-service"
              className={`group flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 relative overflow-hidden bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/40 hover:border-[var(--primary-color)]/60 hover:shadow-lg hover:shadow-[var(--primary-color)]/25`}
              title={sidebarCollapsed ? 'Add Service' : ''}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 shadow-lg group-hover:shadow-emerald-300/40 transition-all duration-300`}>
                <span className="material-symbols-outlined text-white text-lg font-bold">add</span>
              </div>
              {!sidebarCollapsed && (
                <span className="font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">Add Service</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-emerald-500/20 shadow-xl">
                  Add Service
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-emerald-500/20 rotate-45"></div>
                </div>
              )}
            </Link>
          </motion.div>
        </div>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>

        {/* Navigation */}
        <nav className={`${sidebarCollapsed ? 'space-y-3' : 'space-y-2'} flex-1 relative z-10`}>
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                to={item.path}
                className={`group flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 ease-out relative ${
                  location.pathname === item.path
                    ? "bg-slate-100 border border-[var(--primary-color)]/60 text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:border hover:border-slate-200"
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-color)] rounded-r"></div>
                )}
                
                <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-[var(--primary-color)]/10'
                    : 'group-hover:bg-slate-100'
                }`}>
                  <span className={`material-symbols-outlined ${sidebarCollapsed ? 'text-xl' : 'text-lg'} ${
                    location.pathname === item.path ? 'text-[var(--primary-color)]' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>{item.icon}</span>
                </div>
                
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm transition-all duration-300 whitespace-nowrap">{item.label}</span>
                )}
                
                {location.pathname === item.path && !sidebarCollapsed && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-[var(--primary-color)] rounded-full shadow-lg shadow-emerald-300/70"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  />
                )}
                
                {sidebarCollapsed && location.pathname === item.path && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[var(--primary-color)] rounded-full shadow-lg shadow-emerald-300/70"></div>
                )}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-white text-slate-900 px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-200 shadow-xl">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-emerald-500/20 rotate-45"></div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <button
              onClick={handleLogout}
              className={`w-full group flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 ease-out relative text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border hover:border-red-200`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-300 group-hover:bg-red-50`}>
                <span className={`material-symbols-outlined ${sidebarCollapsed ? 'text-xl' : 'text-lg'} text-slate-500 group-hover:text-red-500`}>logout</span>
              </div>
              {!sidebarCollapsed && (
                <span className="font-medium transition-all duration-300 whitespace-nowrap">Logout</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-white text-slate-900 px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-red-200 shadow-xl">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-red-500/20 rotate-45"></div>
                </div>
              )}
            </button>
          </motion.div>
        </nav>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>

        {/* Company Card */}
        <div className={`mt-auto ${sidebarCollapsed ? 'pt-4' : 'pt-6'} relative z-10`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${sidebarCollapsed ? 'p-3' : 'p-4'} rounded-xl bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all duration-300 group cursor-pointer`}
            title={sidebarCollapsed ? 'KADFORCE SERVICES - Security Provider' : ''}
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative">
                <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 flex items-center justify-center text-white font-bold ${sidebarCollapsed ? 'text-sm' : 'text-base'} shadow-lg shadow-emerald-300/40`}>
                  KS
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a0a] animate-pulse shadow-lg shadow-emerald-400/50"></div>
              </div>
              
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-semibold truncate group-hover:text-[var(--primary-color)] transition-colors">
                    KADFORCE SERVICES
                  </p>
                  <p className="text-slate-500 text-sm truncate font-medium">
                    Security Provider
                  </p>
                </div>
              )}
              
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-emerald-500/20 shadow-xl">
                  <div className="font-semibold">KADFORCE SERVICES</div>
                  <div className="text-xs text-white/60">Security Provider</div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-emerald-500/20 rotate-45"></div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 animate-slide-in-right transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : ''
      }`}>
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="services" element={<MyServices />} />
            <Route path="services/:id/edit" element={<EditService />} />
            <Route path="employees" element={<Employees />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="booking-management" element={<BookingManagement />} />
            <Route path="add-service" element={<AddService />} />
            <Route path="kyc" element={<KYCUpload />} />
            <Route path="account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
