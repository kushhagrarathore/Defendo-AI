import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import UserLayout from "../components/UserLayout"

const GOLDEN_YELLOW = "#DAA520"
const BLACK_TEXT = "#1A1A1A"

const UserDashboard = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user?.id])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all bookings for stats
      const { data: allBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, status, price, payment_status")
        .eq("user_id", user.id)

      if (bookingsError) throw bookingsError

      // Calculate stats
      const totalBookings = allBookings?.length || 0
      const pendingBookings = allBookings?.filter((b) => b.status === "pending").length || 0
      const completedBookings = allBookings?.filter((b) => b.status === "completed").length || 0
      const totalSpent =
        allBookings
          ?.filter((b) => b.payment_status === "paid")
          .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0) || 0

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        totalSpent,
      })

      // Fetch recent bookings
      const { data: recent, error: recentError } = await supabase
        .from("bookings")
        .select(`
          id,
          service_type,
          status,
          date,
          price,
          location,
          host_profiles(company_name, full_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentError) throw recentError
      setRecentBookings(recent || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: "event",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      icon: "hourglass_empty",
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      icon: "check_circle",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Spent",
      value: `₹${stats.totalSpent.toLocaleString("en-IN")}`,
      icon: "payments",
      color: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
            Welcome back, {profile?.full_name || "User"}!
          </h1>
          <p className="text-gray-600">Here's an overview of your security service bookings</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-2xl">{stat.icon}</span>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: BLACK_TEXT }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-8"
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: BLACK_TEXT }}>
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/user-portal/services"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
              >
                <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                  add
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Book Service</div>
                <div className="text-xs text-gray-500">Find security guards</div>
              </div>
            </Link>

            <Link
              to="/user-portal/bookings"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
              >
                <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                  event
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">My Bookings</div>
                <div className="text-xs text-gray-500">View all bookings</div>
              </div>
            </Link>

            <Link
              to="/user-portal/account"
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
              >
                <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                  settings
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Account</div>
                <div className="text-xs text-gray-500">Manage settings</div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: BLACK_TEXT }}>
              Recent Bookings
            </h2>
            <Link
              to="/user-portal/bookings"
              className="text-sm font-medium"
              style={{ color: GOLDEN_YELLOW }}
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div
                className="w-6 h-6 border-3 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${GOLDEN_YELLOW} transparent transparent transparent` }}
              ></div>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
              <p>No bookings yet. Start by booking a service!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${GOLDEN_YELLOW}15` }}
                    >
                      <span className="material-symbols-outlined" style={{ color: GOLDEN_YELLOW }}>
                        security
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {booking.service_type
                          ? booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                          : "Security Service"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.host_profiles?.company_name || booking.host_profiles?.full_name || "Provider"} •{" "}
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: GOLDEN_YELLOW }}>
                      ₹{booking.price || 0}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </UserLayout>
  )
}

export default UserDashboard

