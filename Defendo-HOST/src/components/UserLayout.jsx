import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "./BrandLogo"

const GOLDEN_YELLOW = "#DAA520"
const SOFT_GREY = "#F7F7F7"

const UserLayout = ({ children }) => {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  const navItems = [
    { path: "/user-portal", label: "Book Service", icon: "add" },
    { path: "/user-portal/bookings", label: "My Bookings", icon: "event" },
  ]

  const accountMenuItems = [
    { path: "/user-portal/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/user-portal/account", label: "Account Settings", icon: "settings" },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to services page with search query
      navigate(`/user-portal?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/user-portal" className="cursor-pointer hover:opacity-80 transition-opacity">
                <BrandLogo
                  text="Defendo"
                  imgClassName="h-8 w-auto"
                  textClassName="text-lg font-semibold"
                  className="flex items-center gap-2"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path === "/user-portal" && location.pathname === "/user-portal")
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "text-gray-900 bg-gray-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ backgroundColor: GOLDEN_YELLOW }}
                          layoutId="activeTab"
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Button */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all text-sm w-64"
                    style={{ backgroundColor: SOFT_GREY }}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    search
                  </span>
                </div>
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:shadow-lg"
                  style={{ backgroundColor: GOLDEN_YELLOW }}
                >
                  Search
                </button>
              </form>
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-600">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                {/* Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname.startsWith("/user-portal/dashboard") || location.pathname.startsWith("/user-portal/account")
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span>Account</span>
                    <span className="material-symbols-outlined text-base">
                      {showAccountDropdown ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {showAccountDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {accountMenuItems.map((item) => {
                          const isActive = location.pathname === item.path
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setShowAccountDropdown(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                isActive
                                  ? "text-gray-900 bg-gray-50"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">{item.icon}</span>
                              <span>{item.label}</span>
                              {isActive && (
                                <div
                                  className="ml-auto w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: GOLDEN_YELLOW }}
                                />
                              )}
                            </Link>
                          )
                        })}
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            setShowAccountDropdown(false)
                            signOut()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">logout</span>
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

export default UserLayout

