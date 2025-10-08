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
          { data: completedBookingsData, error: completedBookingsError },
          { data: revenueData, error: revenueError },
          { data: recentBookingsData, error: recentBookingsError },
          analyticsRes
        ] = await Promise.all([
          supabase.from('bookings').select('id').eq('provider_id', user.id),
          supabase.from('bookings').select('id').eq('provider_id', user.id).in('status', ['pending','confirmed']),
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

        if (totalBookingsError || activeBookingsError || completedBookingsError || revenueError || recentBookingsError) {
          const errs = [totalBookingsError, activeBookingsError, completedBookingsError, revenueError, recentBookingsError]
          if (errs.some(e => e && (e.code === 'PGRST301' || e.status === 403))) setRlsIssue(true)
        }

        // Calculate stats
        const totalBookings = totalBookingsData?.length || 0
        const activeBookings = activeBookingsData?.length || 0
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
          completedBookings,
          monthlyRevenue,
          recentBookings: recentBookingsData || [],
          monthlyPaidBookings,
          analytics: monthlyAnalytics
        })

        console.log('Dashboard data loaded:', {
          totalBookings,
          activeBookings,
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

  // Realtime: listen for new bookings for this host and push a notification
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
        }
      )
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch (_) {}
    }
  }, [user?.id])

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
    <div className="min-h-screen bg-[#0C0F13] text-[#C5C6C7] relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-[#00AFFF] to-[#1FFF87] rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-[#1FFF87] to-[#00AFFF] rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className="relative z-10 p-8">
        {/* Header Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-[#00AFFF] bg-clip-text text-transparent mb-4">
                Welcome Back, {getHostDisplayName()}
              </h1>
              <p className="text-[#C5C6C7] text-lg">Here's what's happening with your security services today.</p>
            </div>
            
            {/* Notifications Button */}
            <motion.button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-4 rounded-2xl bg-white/5 border border-[#00AFFF]/20 hover:bg-white/10 hover:border-[#00AFFF]/40 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="material-symbols-outlined text-[#00AFFF] text-xl">notifications</span>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-[#1FFF87] rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.button>
          </div>

          {rlsIssue && (
            <motion.div 
              className="mt-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm backdrop-blur-sm"
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
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#1FFF87]/10 to-[#00AFFF]/10 border border-[#1FFF87]/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-700 rounded-xl">
              <span className="material-symbols-outlined text-slate-200 text-xl">verified</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Account Verified</h3>
              <p className="text-[#C5C6C7] text-sm">Your security services are active and ready for bookings</p>
            </div>
          </div>
        </motion.div>
        
        {/* Enhanced Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#00AFFF]/20 backdrop-blur-xl hover:border-[#00AFFF]/40 transition-all duration-300 hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-700 rounded-xl">
                    <span className="material-symbols-outlined text-slate-200 text-xl">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[#C5C6C7] text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1FFF87] text-sm font-medium">+{stat.growth}%</span>
                  <span className="text-[#C5C6C7] text-xs">vs last month</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-700 rounded-xl">
              <span className="material-symbols-outlined text-slate-200 text-lg">analytics</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Analytics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Bookings Chart */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#00AFFF]/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Monthly Bookings</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-[#C5C6C7] text-center">
                  <span className="material-symbols-outlined text-6xl mb-4 block">show_chart</span>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Revenue Trends Chart */}
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#1FFF87]/20 backdrop-blur-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-[#C5C6C7] text-center">
                  <span className="material-symbols-outlined text-6xl mb-4 block">trending_up</span>
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Booking Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#00AFFF]/20 backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700 rounded-xl">
                  <span className="material-symbols-outlined text-slate-200 text-lg">schedule</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Booking Timeline</h3>
              </div>
              <div className="space-y-4">
                {(dashboardData.recentBookings || []).slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-3 h-3 bg-[#1FFF87] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium capitalize">{booking.service_type || 'Service'}</p>
                      <p className="text-[#C5C6C7] text-sm">{booking.status}</p>
                    </div>
                    <div className="text-[#C5C6C7] text-sm">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </motion.div>
                ))}
                {(!dashboardData.recentBookings || dashboardData.recentBookings.length === 0) && (
                  <div className="text-center py-8 text-[#C5C6C7]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">event_available</span>
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Guard Status Panel */}
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#1FFF87]/20 backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700 rounded-xl">
                  <span className="material-symbols-outlined text-slate-200 text-lg">security</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Guard Status</h3>
              </div>
              <div className="space-y-4">
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
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00AFFF] to-[#1FFF87] rounded-full flex items-center justify-center text-black font-bold">
                      {guard.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{guard.name}</p>
                      <p className="text-[#C5C6C7] text-sm capitalize">{guard.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        guard.status === 'on-duty' ? 'bg-[#1FFF87]' : 
                        guard.status === 'online' ? 'bg-[#00AFFF]' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-[#C5C6C7] text-xs">{guard.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Live Map View Button */}
            <motion.button
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-[#00AFFF]/10 to-[#1FFF87]/10 border border-[#00AFFF]/20 backdrop-blur-sm hover:border-[#00AFFF]/40 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-slate-200 text-xl">map</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">Live Map View</h3>
                  <p className="text-[#C5C6C7] text-sm">Track guard locations in real-time</p>
                </div>
              </div>
            </motion.button>

            {/* This Month Summary */}
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 border border-[#00AFFF]/20 backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700 rounded-xl">
                  <span className="material-symbols-outlined text-slate-200 text-lg">calendar_month</span>
                </div>
                <h3 className="text-xl font-semibold text-white">This Month</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="text-[#C5C6C7] text-sm">Paid bookings</div>
                  <div className="font-semibold text-white">{(dashboardData.monthlyPaidBookings || []).length}</div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="text-[#C5C6C7] text-sm">Revenue</div>
                  <div className="font-semibold text-[#1FFF87]">{formatCurrency(dashboardData.monthlyRevenue || 0)}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#00AFFF] to-[#1FFF87] rounded-2xl shadow-2xl flex items-center justify-center z-30 backdrop-blur-sm border border-[#00AFFF]/20"
          whileHover={{ 
            scale: 1.1,
            boxShadow: '0 0 30px rgba(0,175,255,0.4)'
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -4, 0],
            boxShadow: [
              '0 8px 30px rgba(0,175,255,0.3)',
              '0 12px 40px rgba(0,175,255,0.4)',
              '0 8px 30px rgba(0,175,255,0.3)'
            ]
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <span className="material-symbols-outlined text-black text-xl">add</span>
        </motion.button>

        {/* Notifications Panel */}
        <NotificationsPanel 
          isOpen={notificationsOpen} 
          onClose={() => setNotificationsOpen(false)} 
        />
    </div>
  )
}

export default DashboardHome
