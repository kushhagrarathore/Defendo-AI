import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import UserLayout from "../components/UserLayout"

const GOLDEN_YELLOW = "#DAA520"
const BLACK_TEXT = "#1A1A1A"

const UserBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    if (user?.id) {
      fetchBookings()
    }
  }, [user?.id, filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("bookings")
        .select(`
          *,
          host_profiles(
            id,
            company_name,
            full_name,
            phone
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "hourglass_empty"
      case "confirmed":
        return "check_circle"
      case "completed":
        return "done_all"
      case "cancelled":
        return "cancel"
      default:
        return "info"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filterOptions = [
    { value: "all", label: "All Bookings" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
            My Bookings
          </h1>
          <p className="text-gray-600">View and manage all your security service bookings</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === option.value
                  ? "text-white shadow-lg"
                  : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              style={
                filter === option.value
                  ? { backgroundColor: GOLDEN_YELLOW }
                  : {}
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${GOLDEN_YELLOW} transparent transparent transparent` }}
            ></div>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-12"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-4xl">event_busy</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            <a
              href="/user-portal"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: GOLDEN_YELLOW }}
            >
              <span className="material-symbols-outlined">add</span>
              Book a Service
            </a>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        <span className="material-symbols-outlined text-xs align-middle mr-1">
                          {getStatusIcon(booking.status)}
                        </span>
                        {booking.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                      <span className="text-sm text-gray-500">
                        Booking #{String(booking.id).slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2" style={{ color: BLACK_TEXT }}>
                      {booking.service_type
                        ? booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                        : "Security Service"}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">business</span>
                        <span>
                          {booking.host_profiles?.company_name ||
                            booking.host_profiles?.full_name ||
                            "Provider"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">calendar_today</span>
                        <span>{formatDate(booking.date || booking.booking_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span>
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span className="truncate">{booking.location || "Location not specified"}</span>
                      </div>
                    </div>

                    {booking.user_notes && (
                      <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes: </span>
                          {booking.user_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: GOLDEN_YELLOW }}
                      >
                        ₹{booking.price || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.duration_hours ? `${booking.duration_hours} hours` : "Service"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <button className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                      )}
                      <button
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ backgroundColor: GOLDEN_YELLOW }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}

export default UserBookings



