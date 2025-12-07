import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import Services from './Services'
import MyBookings from './MyBookings'

const UserPortal = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/user-login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#111714]/90 backdrop-blur-md border-b border-[#29382f] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/user-portal" className="flex items-center gap-3">
              <BrandLogo text="Defendo" imgClassName="h-10 w-auto" textClassName="text-xl font-bold text-white" />
              <span className="text-sm uppercase tracking-wider text-white/60 hidden sm:inline">User Portal</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/user-portal"
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/user-portal')
                    ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">home</span>
                  <span>Services</span>
                </span>
              </Link>
              <Link
                to="/user-portal/bookings"
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/user-portal/bookings')
                    ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>My Bookings</span>
                </span>
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-white/60">
                  {user?.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 space-y-2"
              >
                <Link
                  to="/user-portal"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive('/user-portal')
                      ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">home</span>
                    <span>Services</span>
                  </span>
                </Link>
                <Link
                  to="/user-portal/bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive('/user-portal/bookings')
                      ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span>My Bookings</span>
                  </span>
                </Link>
                <div className="pt-2 border-t border-white/10">
                  <div className="px-4 py-2 text-sm text-white/60">{user?.email}</div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <Routes>
            <Route index element={<Services />} />
            <Route path="bookings" element={<MyBookings />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default UserPortal

