import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
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
      <div className="bg-[#111714] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary-color)] border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-white/20 border-t-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
          </div>
          <h2 className="text-xl font-bold gradient-text animate-pulse">Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111714] text-white min-h-screen flex animate-fade-in-up">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-[#0a0a0a] border-r border-[#1a1a1a] ${sidebarCollapsed ? 'p-3' : 'p-6'} flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden backdrop-blur-xl`}> 
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute ${sidebarCollapsed ? 'top-6 left-3' : 'top-8 left-8'} w-40 h-40 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute ${sidebarCollapsed ? 'bottom-12 right-3' : 'bottom-16 right-8'} w-32 h-32 bg-emerald-300 rounded-full blur-2xl animate-pulse`} style={{animationDelay: '2s'}}></div>
        </div>
        
        {/* Collapsed Sidebar Accent */}
        {sidebarCollapsed && (
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-400 opacity-60"></div>
        )}
        
        {/* Header */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} mb-8 relative z-10`}>
          <div className="relative group">
            <div className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300`}>
              <span className="material-symbols-outlined text-black text-lg font-bold">security</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-emerald-500/20 shadow-xl">
                Defendo
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-emerald-500/20 rotate-45"></div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">Defendo</h2>
              <p className="text-xs text-white/60 font-medium">Security Platform</p>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-emerald-500/20 shadow-lg transition-all duration-200 z-20 group backdrop-blur-sm"
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
              className={`group flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20`}
              title={sidebarCollapsed ? 'Add Service' : ''}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300`}>
                <span className="material-symbols-outlined text-black text-lg font-bold">add</span>
              </div>
              {!sidebarCollapsed && (
                <span className="font-semibold text-emerald-200 group-hover:text-white transition-colors">Add Service</span>
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
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-6"></div>

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
                    ? "bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 text-emerald-200"
                    : "text-white/70 hover:text-white hover:bg-white/5 hover:border hover:border-emerald-500/20"
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-green-500 rounded-r"></div>
                )}
                
                <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/20' 
                    : 'group-hover:bg-emerald-500/10'
                }`}>
                  <span className={`material-symbols-outlined ${sidebarCollapsed ? 'text-xl' : 'text-lg'} ${
                    location.pathname === item.path ? 'text-emerald-300' : 'text-white/80 group-hover:text-emerald-300'
                  }`}>{item.icon}</span>
                </div>
                
                {!sidebarCollapsed && (
                  <span className="font-medium transition-all duration-300 whitespace-nowrap">{item.label}</span>
                )}
                
                {location.pathname === item.path && !sidebarCollapsed && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  />
                )}
                
                {sidebarCollapsed && location.pathname === item.path && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
                )}
                
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-emerald-500/20 shadow-xl">
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
              className={`w-full group flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 ease-out relative text-white/70 hover:text-white hover:bg-red-500/10 hover:border hover:border-red-500/20`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <div className={`${sidebarCollapsed ? 'p-2' : 'p-2'} rounded-lg transition-all duration-300 group-hover:bg-red-500/20`}>
                <span className={`material-symbols-outlined ${sidebarCollapsed ? 'text-xl' : 'text-lg'} text-white/80 group-hover:text-red-300`}>logout</span>
              </div>
              {!sidebarCollapsed && (
                <span className="font-medium transition-all duration-300 whitespace-nowrap">Logout</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-[#0a0a0a] text-white px-3 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-red-500/20 shadow-xl">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0a0a0a] border-l border-t border-red-500/20 rotate-45"></div>
                </div>
              )}
            </button>
          </motion.div>
        </nav>

        {/* Section Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-6"></div>

        {/* Company Card */}
        <div className={`mt-auto ${sidebarCollapsed ? 'pt-4' : 'pt-6'} relative z-10`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${sidebarCollapsed ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border border-emerald-500/20 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer`}
            title={sidebarCollapsed ? 'KADFORCE SERVICES - Security Provider' : ''}
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative">
                <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-black font-bold ${sidebarCollapsed ? 'text-sm' : 'text-base'} shadow-lg shadow-emerald-500/25`}>
                  KS
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a0a] animate-pulse shadow-lg shadow-emerald-400/50"></div>
              </div>
              
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-emerald-300 transition-colors">
                    KADFORCE SERVICES
                  </p>
                  <p className="text-white/60 text-sm truncate font-medium">
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
      <div className={`flex-1 p-8 animate-slide-in-right transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : ''
      }`}>
        <div className="max-w-7xl mx-auto">
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
