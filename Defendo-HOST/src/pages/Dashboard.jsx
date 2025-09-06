import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import DashboardHome from "./DashboardHome"
import MyServices from "./MyServices"
import AddService from "./AddService"
import Account from "./Account"

const Dashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, hostProfile, signOut } = useAuth()
  
  const sidebarItems = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/dashboard/services", label: "My Services", icon: "security" },
    { path: "/dashboard/add-service", label: "Add Service", icon: "add" },
    { path: "/dashboard/account", label: "Account", icon: "person" }
  ]

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

  return (
    <div className="bg-[#111714] text-white min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a241e] border-r border-[#29382f] p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-xl font-bold">Defendo Host</h2>
        </div>
        
        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-[var(--primary-color)] text-[#111714]"
                  : "text-white/70 hover:text-white hover:bg-[#29382f]"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-[#29382f]">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#29382f] transition-colors mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] flex items-center justify-center text-white font-bold text-sm">
              {getHostInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {getHostDisplayName()}
              </p>
              <p className="text-white/60 text-sm truncate">
                Security Provider
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-[#29382f] transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="services" element={<MyServices />} />
          <Route path="add-service" element={<AddService />} />
          <Route path="account" element={<Account />} />
        </Routes>
      </div>
    </div>
  )
}

export default Dashboard
