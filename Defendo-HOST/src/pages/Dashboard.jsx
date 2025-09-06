import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import DashboardHome from "./DashboardHome"
import MyServices from "./MyServices"
import AddService from "./AddService"
import Account from "./Account"

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, hostProfile, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const sidebarItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard", color: "from-blue-500 to-cyan-500" },
    { path: "/dashboard/services", label: "My Services", icon: "security", color: "from-green-500 to-emerald-500" },
    { path: "/dashboard/add-service", label: "Add Service", icon: "add", color: "from-purple-500 to-pink-500" },
    { path: "/dashboard/account", label: "Account", icon: "person", color: "from-orange-500 to-red-500" }
  ]

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
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
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1a241e] border-r border-[#29382f] p-6 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[var(--primary-color)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-8 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="relative">
            <svg className="h-8 w-8 text-[var(--primary-color)] animate-bounce" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold gradient-text animate-slide-in-left">Defendo Host</h2>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-6 right-4 p-2 rounded-lg bg-[#29382f] hover:bg-[#3a4a3f] transition-all duration-200 ripple"
        >
          <span className="material-symbols-outlined text-sm">
            {sidebarCollapsed ? 'menu' : 'close'}
          </span>
        </button>
        
        {/* Navigation */}
        <nav className="space-y-2 flex-1 relative z-10">
          {sidebarItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-out card-animate ripple stagger-item ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] shadow-lg shadow-[var(--primary-color)]/25"
                  : "text-white/70 hover:text-white hover:bg-[#29382f] hover:shadow-lg"
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'bg-white/20' 
                  : 'group-hover:bg-white/10'
              }`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
              </div>
              {!sidebarCollapsed && (
                <span className="font-medium transition-all duration-300">{item.label}</span>
              )}
              {location.pathname === item.path && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-[#29382f] relative z-10">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#29382f] transition-all duration-300 card-animate group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] flex items-center justify-center text-white font-bold text-sm animate-scale-in">
                {getHostInitials()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#1a241e] animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate group-hover:text-[var(--primary-color)] transition-colors">
                  {getHostDisplayName()}
                </p>
                <p className="text-white/60 text-sm truncate">
                  Security Provider
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-[#29382f] transition-all duration-300 card-animate ripple group"
          >
            <span className="material-symbols-outlined group-hover:animate-bounce">logout</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 animate-slide-in-right">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="services" element={<MyServices />} />
            <Route path="add-service" element={<AddService />} />
            <Route path="account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
