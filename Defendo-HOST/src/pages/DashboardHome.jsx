import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import StatsCard from "../components/dashboard/StatsCard"
import ChartsSection from "../components/dashboard/ChartsSection"
import NotificationsPanel from "../components/dashboard/NotificationsPanel"
import BookingTimeline from "../components/dashboard/BookingTimeline"
import GuardTracker from "../components/dashboard/GuardTracker"

const DashboardHome = () => {
  const { user, hostProfile, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    recentBookings: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rlsIssue, setRlsIssue] = useState(false)
  const [rlsCount, setRlsCount] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Debug current auth state
  useEffect(() => {
    if (user) {
      console.log('DashboardHome - Current user:', user.id)
      console.log('DashboardHome - Host profile:', hostProfile)
    }
  }, [user, hostProfile])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || authLoading) {
        console.log('DashboardHome - Waiting for auth...', { user: !!user, authLoading })
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('DashboardHome - Fetching data for user:', user.id)

        // Test auth state first
        const { data: { session } } = await supabase.auth.getSession()
        console.log('DashboardHome - Current session:', !!session)

        // Fetch metrics in parallel
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const [
          { data: totalBookingsData, error: totalBookingsError },
          { data: activeBookingsData, error: activeBookingsError },
          { data: completedBookingsData, error: completedBookingsError },
          { data: revenueData, error: revenueError },
          { data: recentBookingsData, error: recentBookingsError }
        ] = await Promise.all([
          supabase.from('bookings').select('id').eq('provider_id', user.id),
          supabase.from('bookings').select('id').eq('provider_id', user.id).in('status', ['pending','confirmed']),
          supabase.from('bookings').select('id').eq('provider_id', user.id).eq('status','completed'),
          supabase.from('bookings').select('price, payment_status')
            .eq('provider_id', user.id)
            .gte('created_at', startOfMonth.toISOString())
            .eq('status','completed')
            .eq('payment_status','paid'),
          supabase.from('bookings').select('id, service_type, status, created_at, price, host_id:provider_id')
            .eq('provider_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
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

        setDashboardData({
          totalBookings,
          activeBookings,
          completedBookings,
          monthlyRevenue,
          recentBookings: recentBookingsData || []
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
    }

    fetchDashboardData()
  }, [user, authLoading])

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/70">Loading dashboard...</span>
        </div>
      </div>
    )
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
    <div className="relative">
      {/* Animated Background */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <span className="material-symbols-outlined text-[20rem] text-white">shield</span>
      </motion.div>

      {/* Header */}
      <motion.div 
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Welcome Back, {getHostDisplayName()}!
            </h1>
            <p className="text-white/70">Here's what's happening with your security services today.</p>
          </div>
          
          {/* Notifications Button */}
          <motion.button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="material-symbols-outlined text-white">notifications</span>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>
        </div>

        {rlsIssue && (
          <motion.div 
            className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Access to bookings is restricted by database policies (RLS). Use the button below to verify visibility for your account.
            <div className="mt-2">
              <button
                onClick={async () => {
                  const { count, error } = await supabase
                    .from('bookings')
                    .select('id', { count: 'exact', head: true })
                    .eq('provider_id', user.id)
                  setRlsCount(error ? null : (typeof count === 'number' ? count : 0))
                }}
                className="px-3 py-2 rounded-md bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200"
              >
                Run RLS test for provider_id = {user?.id?.slice(0,8)}…
              </button>
              {rlsCount !== null && (
                <span className="ml-3">Visible bookings: {rlsCount}</span>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Enhanced Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            growth={stat.growth}
            growthType={stat.growthType}
            index={index}
            isCurrency={stat.isCurrency}
          />
        ))}
      </motion.div>

      {/* Charts Section */}
      <ChartsSection data={dashboardData.recentBookings} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Booking Timeline */}
        <div className="lg:col-span-2">
          <BookingTimeline bookings={dashboardData.recentBookings} />
        </div>

        {/* Guard Tracker */}
        <div>
          <GuardTracker />
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary-color)] rounded-full shadow-2xl flex items-center justify-center z-30"
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 0 30px rgba(74,222,128,0.4)'
        }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -4, 0],
          boxShadow: [
            '0 8px 30px rgba(74,222,128,0.3)',
            '0 12px 40px rgba(74,222,128,0.4)',
            '0 8px 30px rgba(74,222,128,0.3)'
          ]
        }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <span className="material-symbols-outlined text-[#111714] text-xl">add</span>
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
