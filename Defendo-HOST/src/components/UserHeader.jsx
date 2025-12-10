import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "./BrandLogo"

const UserHeader = () => {
  const { user } = useAuth()

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/book" className="flex items-center">
            <BrandLogo 
              text="Defendo" 
              imgClassName="h-10 w-auto" 
              textClassName="text-xl font-semibold text-[#1A1A1A]" 
            />
          </Link>

          {/* Center: Empty (clean aesthetic) */}
          <div className="flex-1"></div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications Icon */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[#1A1A1A] text-2xl">
                notifications
              </span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#DAA520] rounded-full"></span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default UserHeader




















