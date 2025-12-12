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
  const [selectedBooking, setSelectedBooking] = useState(null)

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
          assigned_employee:assigned_employee_id (
            id,
            name,
            role,
            phone,
            photo_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error

      let rows = data || []

      // Enrich with guard details if missing
      const guardIds = Array.from(
        new Set(
          rows
            .map((b) => b.assigned_employee_id)
            .filter(Boolean)
        )
      )

      let guardMap = new Map()
      if (guardIds.length > 0) {
        const { data: guards, error: gErr } = await supabase
          .from("employees")
          .select("id, name, role, phone, photo_url")
          .in("id", guardIds)
        if (!gErr && guards) {
          guardMap = new Map(guards.map((g) => [g.id, g]))
        }
      }

      // Enrich with provider/company names
      const providerIds = Array.from(
        new Set(
          rows
            .map((b) => b.provider_id)
            .filter(Boolean)
        )
      )

      let providerMap = new Map()
      if (providerIds.length > 0) {
        const { data: providers, error: pErr } = await supabase
          .from("host_profiles")
          .select("id, company_name, full_name")
          .in("id", providerIds)
        if (!pErr && providers) {
          providerMap = new Map(
            providers.map((p) => [
              p.id,
              p.company_name || p.full_name || "Provider"
            ])
          )
        }
      }

      rows = rows.map((b) => ({
        ...b,
        assigned_employee: b.assigned_employee || guardMap.get(b.assigned_employee_id) || null,
        provider_name:
          b.host_profiles?.company_name ||
          b.host_profiles?.full_name ||
          providerMap.get(b.provider_id) ||
          "Provider",
      }))

      setBookings(rows)
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
      case "in_progress":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
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
      case "in_progress":
        return "running_with_errors"
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
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const DetailModal = ({ booking, onClose }) => {
    if (!booking) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Booking #{String(booking.id).slice(0, 8).toUpperCase()}
              </p>
              <h3 className="text-xl font-bold text-slate-900">
                {booking.service_type
                  ? booking.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                  : "Security Service"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Company</p>
                <p className="text-slate-900 font-semibold">
                  {booking.host_profiles?.company_name ||
                    booking.host_profiles?.full_name ||
                    booking.provider_name ||
                    "Provider"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full border text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
                  <span className="material-symbols-outlined text-sm">{getStatusIcon(booking.status)}</span>
                  {booking.status || "—"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Date</p>
                <p className="text-slate-900 font-semibold">{formatDate(booking.date || booking.booking_date)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Time</p>
                <p className="text-slate-900 font-semibold">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                <p className="text-slate-900 font-semibold">
                  {(() => {
                    if (!booking.location) return "Location not specified"
                    if (typeof booking.location === "string") return booking.location
                    const obj = booking.location || {}
                    return obj.address || [obj.city, obj.state].filter(Boolean).join(", ") || "Location not specified"
                  })()}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Price</p>
                <p className="text-2xl font-extrabold text-slate-900">₹{Number(booking.price || 0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-500">
                  {booking.duration_hours ? `${booking.duration_hours} hours` : "Service"}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase">Payment</p>
                <p className="text-slate-900 font-semibold capitalize">{booking.payment_status || "—"}</p>
              </div>
            </div>

            {booking.otp_code && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Service OTP</p>
                <p className="text-2xl font-extrabold text-amber-800">{booking.otp_code}</p>
                <p className="text-xs text-amber-700/80">Share this with the guard to start the service.</p>
              </div>
            )}

            {(booking.assigned_employee || booking.assigned_employee_id) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  {(booking.assigned_employee?.name || "G")?.[0]?.toUpperCase() || "G"}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Guard Assigned</p>
                  <p className="text-sm text-emerald-900 font-semibold">
                    {booking.assigned_employee?.name || "Guard assigned"}
                  </p>
                  <p className="text-xs text-emerald-700/80">
                    {booking.assigned_employee?.role || "Guard"}
                    {booking.assigned_employee?.phone ? ` · ${booking.assigned_employee.phone}` : ""}
                  </p>
                </div>
              </div>
            )}

            {booking.user_notes && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{booking.user_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-100 to-white border border-amber-200 shadow-sm">
            <span className="material-symbols-outlined text-amber-600">event_available</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">My Bookings</h1>
              <p className="text-sm text-slate-600">Track your services, guards, OTP, and status in one view.</p>
            </div>
          </div>
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
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-200 shadow-lg transition-all"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-400/70 via-orange-300/60 to-yellow-300/60" />
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
                        <span className="font-semibold text-slate-800">
                          {booking.host_profiles?.company_name ||
                            booking.host_profiles?.full_name ||
                            booking.provider_name ||
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
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Notes: </span>
                          {booking.user_notes}
                        </p>
                      </div>
                    )}

                    {booking.otp_code && (
                      <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                        <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Service OTP</p>
                        <p className="text-2xl font-extrabold text-amber-800">{booking.otp_code}</p>
                        <p className="text-xs text-amber-700/80">Share this with the guard to start the service.</p>
                      </div>
                    )}

                    {(booking.assigned_employee || booking.assigned_employee_id) && (
                      <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3 shadow-[0_6px_18px_rgba(16,185,129,0.15)]">
                        <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                          {(booking.assigned_employee?.name || "G")?.[0]?.toUpperCase() || "G"}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Guard Assigned</p>
                          <p className="text-sm text-emerald-900 font-semibold">
                            {booking.assigned_employee?.name || "Guard assigned"}
                          </p>
                          <p className="text-xs text-emerald-700/80">
                            {booking.assigned_employee?.role || "Guard"}
                            {booking.assigned_employee?.phone ? ` · ${booking.assigned_employee.phone}` : ""}
                          </p>
                        </div>
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
                        onClick={() => setSelectedBooking(booking)}
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
      <DetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </UserLayout>
  )
}

export default UserBookings



