import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase, db } from "../lib/supabase"
import StatsCard from "../components/dashboard/StatsCard"
import ChartsSection from "../components/dashboard/ChartsSection"
import NotificationsPanel from "../components/dashboard/NotificationsPanel"
import BookingTimeline from "../components/dashboard/BookingTimeline"
import GuardTracker from "../components/dashboard/GuardTracker"
import KycStatusCard from "../components/KycStatusCard"
import VerificationBanner from "../components/VerificationBanner"
import { DashboardSkeleton } from "../components/LoadingSkeleton"

const DashboardHome = () => {
  const { user, hostProfile, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeBookings: 0,
    assignedBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    recentBookings: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rlsIssue, setRlsIssue] = useState(false)
  const [rlsCount, setRlsCount] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Debug current auth state
  // Reduced logging for performance
  useEffect(() => {
    if (user && process.env.NODE_ENV === 'development') {
      console.log('Dashboard - User:', user.id, 'Profile loaded:', !!hostProfile)
    }
  }, [user, hostProfile])

  // Memoized fetch function to prevent recreating on every render
  const fetchDashboardData = useCallback(async () => {
    if (!user || authLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard - Waiting for auth...', { user: !!user, authLoading })
      }
      // Avoid getting stuck showing skeleton when auth is still resolving
      setLoading(false)
      return
    }

      try {
        setLoading(true)
        setError(null)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard - Fetching data for user:', user.id)
        }

        // Fetch metrics in parallel
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
          { data: totalBookingsData, error: totalBookingsError },
          { data: activeBookingsData, error: activeBookingsError },
          { data: assignedBookingsData, error: assignedBookingsError },
          { data: completedBookingsData, error: completedBookingsError },
          { data: revenueData, error: revenueError },
          { data: recentBookingsData, error: recentBookingsError },
          analyticsRes
        ] = await Promise.all([
          supabase.from('bookings').select('id').eq('provider_id', user.id),
          supabase.from('bookings').select('id').eq('provider_id', user.id).in('status', ['pending','confirmed']),
          supabase.from('bookings').select('id').eq('provider_id', user.id).eq('status','assigned'),
          supabase.from('bookings').select('id').eq('provider_id', user.id).eq('status','completed'),
          supabase.from('bookings').select('price, payment_status, service_type, status, date, created_at')
            .eq('provider_id', user.id)
            .gte('created_at', startOfMonth.toISOString())
            .eq('status','completed')
            .eq('payment_status','paid'),
          supabase.from('bookings').select('id, service_type, status, created_at, price, host_id:provider_id')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          // monthly analytics
          db.getMonthlyAnalytics(user.id)
        ])

        if (totalBookingsError || activeBookingsError || assignedBookingsError || completedBookingsError || revenueError || recentBookingsError) {
          const errs = [totalBookingsError, activeBookingsError, assignedBookingsError, completedBookingsError, revenueError, recentBookingsError]
          if (errs.some(e => e && (e.code === 'PGRST301' || e.status === 403))) setRlsIssue(true)
        }

        // Calculate stats
        const totalBookings = totalBookingsData?.length || 0
        const activeBookings = activeBookingsData?.length || 0
        const assignedBookings = assignedBookingsData?.length || 0
        const completedBookings = completedBookingsData?.length || 0
        const monthlyRevenue = revenueData?.reduce((sum, booking) => sum + Number(booking.price || 0), 0) || 0
        const monthlyPaidBookings = Array.isArray(revenueData) ? revenueData : []

        // monthly analytics result
        const monthlyAnalytics = (analyticsRes && analyticsRes.data) ? analyticsRes.data : []
        if (process.env.NODE_ENV === 'development') {
          console.log('Analytics points:', monthlyAnalytics)
        }

        setDashboardData({
          totalBookings,
          activeBookings,
          assignedBookings,
          completedBookings,
          monthlyRevenue,
          recentBookings: recentBookingsData || [],
          monthlyPaidBookings,
          analytics: monthlyAnalytics
        })

        console.log('Dashboard data loaded:', {
          totalBookings,
          activeBookings,
          assignedBookings,
          completedBookings,
          monthlyRevenue
        })

    } catch (err) {
      console.error('Dashboard load error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, authLoading])

  // Fetch dashboard data effect
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Realtime: listen for bookings changes for this host and refresh dashboard
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`bookings_inserts_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `provider_id=eq.${user.id}`
        },
        (payload) => {
          const b = payload.new || {}
          const when = b.date ? new Date(b.date).toLocaleString() : 'upcoming'
          const message = `${(b.service_type || 'Service')} booked for ${when}`
          window.dispatchEvent(new CustomEvent('dashboard:new-notification', {
            detail: {
              id: b.id,
              type: 'booking',
              title: 'New Booking Received',
              message,
              time: 'Just now',
              unread: true
            }
          }))
          setNotificationsOpen(true)
          // refresh metrics dynamically for host
          fetchDashboardData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `provider_id=eq.${user.id}`
        },
        () => {
          // refresh on status/price changes (assigned/completed etc.)
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch (_) {}
    }
  }, [user?.id, fetchDashboardData])

  const getHostDisplayName = () => {
    if (hostProfile?.company_name) {
      return hostProfile.company_name
    }
    if (hostProfile?.full_name) {
      return hostProfile.full_name
    }
    return user?.email?.split('@')[0] || 'Host'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-400">error</span>
          <h3 className="text-red-400 font-medium">Dashboard Error</h3>
        </div>
        <p className="text-red-400/80 text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  const stats = [
    { 
      label: "Total Bookings", 
      value: dashboardData.totalBookings, 
      icon: "event",
      growth: 12,
      growthType: "increase"
    },
    { 
      label: "Active Bookings", 
      value: dashboardData.activeBookings, 
      icon: "pending",
      growth: 5,
      growthType: "increase"
    },
    { 
      label: "Assigned", 
      value: dashboardData.assignedBookings, 
      icon: "assignment_turned_in",
      growth: 3,
      growthType: "increase"
    },
    { 
      label: "Completed", 
      value: dashboardData.completedBookings, 
      icon: "check_circle",
      growth: 8,
      growthType: "increase"
    },
    { 
      label: "Monthly Revenue", 
      value: dashboardData.monthlyRevenue, 
      icon: "attach_money",
      growth: 15,
      growthType: "increase",
      isCurrency: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-[var(--primary-color)]/10 to-sky-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-16 left-16 w-72 h-72 bg-gradient-to-br from-sky-200/15 to-emerald-200/25 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
                Welcome Back, {getHostDisplayName()}
              </h1>
              <p className="text-slate-600 text-base md:text-lg">Here's what's happening with your security services today.</p>
            </div>
            
            {/* Notifications Button */}
            <motion.button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-4 rounded-2xl bg-white border border-slate-200 shadow-lg hover:border-[var(--primary-color)]/60 hover:shadow-xl hover:shadow-[var(--primary-color)]/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-[var(--primary-color)] text-xl">notifications</span>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--primary-color)] rounded-full shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {rlsIssue && (
            <motion.div 
              className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Access to bookings is restricted by database policies (RLS). Use the button below to verify visibility for your account.
              <div className="mt-3">
                <button
                  onClick={async () => {
                    const { count, error } = await supabase
                      .from('bookings')
                      .select('id', { count: 'exact', head: true })
                      .eq('provider_id', user.id)
                    setRlsCount(error ? null : (typeof count === 'number' ? count : 0))
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 transition-all duration-300"
                >
                  Run RLS test for provider_id = {user?.id?.slice(0,8)}…
                </button>
                {rlsCount !== null && (
                  <span className="ml-3 text-[#C5C6C7]">Visible bookings: {rlsCount}</span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Verified Account Banner */}
        <motion.div
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[var(--primary-color)]/10 to-sky-100/60 border border-[var(--primary-color)]/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-[var(--primary-color)] text-xl">verified</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Account Verified</h3>
              <p className="text-slate-600 text-sm">Your security services are active and ready for bookings</p>
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6 mb-10"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {stats.map((stat, index) => {
            const colorClasses = [
              { bg: "from-blue-500 to-blue-600", border: "border-blue-200/80", shadow: "shadow-blue-200/30" },
              { bg: "from-emerald-500 to-emerald-600", border: "border-emerald-200/80", shadow: "shadow-emerald-200/30" },
              { bg: "from-sky-500 to-sky-600", border: "border-sky-200/80", shadow: "shadow-sky-200/30" },
              { bg: "from-amber-500 to-amber-600", border: "border-amber-200/80", shadow: "shadow-amber-200/30" },
              { bg: "from-purple-500 to-purple-600", border: "border-purple-200/80", shadow: "shadow-purple-200/30" }
            ]
            const colors = colorClasses[index % colorClasses.length]
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50/50 border ${colors.border} shadow-lg hover:shadow-2xl hover:${colors.shadow} transition-all duration-300 hover:-translate-y-2`}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-4xl font-extrabold text-slate-900 mb-1">
                      {stat.isCurrency ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-emerald-600 text-xs font-bold">+{stat.growth}%</span>
                      <span className="text-slate-400 text-xs">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-4 bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-white text-3xl">{stat.icon}</span>
                </div>
              </div>
            </motion.div>
            )
          })}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <span className="material-symbols-outlined text-white text-xl">analytics</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Analytics Overview</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Bookings Chart */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Monthly Bookings</h3>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-center">
                  <span className="material-symbols-outlined text-6xl mb-4 block">show_chart</span>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Revenue Trends Chart */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-center">
                  <span className="material-symbols-outlined text-6xl mb-4 block">trending_up</span>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Booking Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-white text-lg">schedule</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Recent Bookings</h3>
              </div>
              <div className="space-y-3">
                {(dashboardData.recentBookings || []).slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold capitalize">{booking.service_type || 'Service'}</p>
                      <p className="text-slate-500 text-sm capitalize">{booking.status}</p>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </motion.div>
                ))}
                {(!dashboardData.recentBookings || dashboardData.recentBookings.length === 0) && (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-5xl mb-3 block text-slate-400">event_available</span>
                    <p className="text-slate-500">No recent bookings</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Guard Status Panel */}
            <motion.div
              className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-white text-lg">security</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Guard Status</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "John Smith", status: "on-duty", time: "2h 15m ago" },
                  { name: "Mike Johnson", status: "online", time: "5m ago" },
                  { name: "Sarah Wilson", status: "off-duty", time: "1h 30m ago" }
                ].map((guard, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {guard.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 font-semibold">{guard.name}</p>
                      <p className="text-slate-500 text-sm capitalize">{guard.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        guard.status === 'on-duty' ? 'bg-emerald-500' : 
                        guard.status === 'online' ? 'bg-blue-500' : 'bg-slate-400'
                      } shadow-lg`}></div>
                      <span className="text-slate-500 text-xs">{guard.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Live Map View Button */}
            <motion.button
              className="w-full p-6 rounded-2xl bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:border-[var(--primary-color)]/40 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="material-symbols-outlined text-white text-xl">map</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Live Map View</h3>
                  <p className="text-slate-500 text-sm">Track guard locations in real-time</p>
                </div>
              </div>
            </motion.button>

            {/* This Month Summary */}
            <motion.div
              className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <span className="material-symbols-outlined text-white text-lg">calendar_month</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">This Month</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <div className="text-slate-600 text-sm font-medium">Paid bookings</div>
                  <div className="font-bold text-slate-900 text-lg">{(dashboardData.monthlyPaidBookings || []).length}</div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="text-slate-600 text-sm font-medium">Revenue</div>
                  <div className="font-bold text-[var(--primary-color)] text-lg">{formatCurrency(dashboardData.monthlyRevenue || 0)}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

        {/* Notifications Panel */}
        <NotificationsPanel 
          isOpen={notificationsOpen} 
          onClose={() => setNotificationsOpen(false)} 
        />
    </div>
  )
}

export default DashboardHome
