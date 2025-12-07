import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [assignedCount, setAssignedCount] = useState(0)
  const [roleCounts, setRoleCounts] = useState({})
  const [locationCounts, setLocationCounts] = useState({})
  const [recentAssignments, setRecentAssignments] = useState([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        setError("")
        // Assigned employees for this host
        const { data: emps, error: empErr } = await supabase
          .from('employees')
          .select('id, role, location')
          .eq('host_id', user.id)
          .eq('status', 'Assigned')
        if (empErr) throw empErr
        setAssignedCount(emps?.length || 0)
        const rc = {}
        const lc = {}
        ;(emps || []).forEach(e => {
          rc[e.role] = (rc[e.role] || 0) + 1
          if (e.location) lc[e.location] = (lc[e.location] || 0) + 1
        })
        setRoleCounts(rc)
        setLocationCounts(lc)

        // Recent assignments (last 10) from guard_assignments
        const { data: gas } = await supabase
          .from('guard_assignments')
          .select('guard_id, booking_id, assigned_at, status')
          .order('assigned_at', { ascending: false })
          .limit(10)

        if (gas && gas.length) {
          const guardIds = Array.from(new Set(gas.map(g => g.guard_id).filter(Boolean)))
          const bookingIds = Array.from(new Set(gas.map(g => g.booking_id).filter(Boolean)))

          const [{ data: e2 }, { data: b2 }] = await Promise.all([
            supabase.from('employees').select('id, name, role, phone').in('id', guardIds).eq('host_id', user.id),
            supabase.from('bookings').select('id, user_id, service_type, date, location').in('id', bookingIds).eq('provider_id', user.id)
          ])
          const byEmp = Object.fromEntries((e2 || []).map(x => [x.id, x]))
          const byBook = Object.fromEntries((b2 || []).map(x => [x.id, x]))
          const rows = gas.map(g => ({
            assignedAt: g.assigned_at,
            employee: byEmp[g.guard_id] || null,
            booking: byBook[g.booking_id] || null,
            status: g.status
          }))
          setRecentAssignments(rows)
        } else {
          setRecentAssignments([])
        }
      } catch (e) {
        setError(e.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [user?.id])

  const roleEntries = useMemo(() => Object.entries(roleCounts), [roleCounts])
  const locationEntries = useMemo(() => Object.entries(locationCounts), [locationCounts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
            Analytics
          </h1>
          <p className="text-slate-600 text-base md:text-lg">Insights into your employee assignments and performance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 shadow-lg">{error}</div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-lg hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">group</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Assigned Employees</p>
              <p className="text-4xl font-extrabold text-slate-900">{assignedCount}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-200/80 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">badge</span>
                </div>
              </div>
              <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">By Role</p>
              {roleEntries.length === 0 ? (
                <p className="text-slate-400 text-sm">No data</p>
              ) : (
                <div className="space-y-2">
                  {roleEntries.map(([role, cnt]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">{role}</span>
                      <span className="font-bold text-slate-900 text-lg">{cnt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-sky-50/50 border border-sky-200/80 shadow-lg hover:shadow-2xl hover:shadow-sky-200/30 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100/50 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">location_on</span>
                </div>
              </div>
              <p className="text-sky-600 text-xs font-semibold uppercase tracking-wider mb-2">By Location</p>
              {locationEntries.length === 0 ? (
                <p className="text-slate-400 text-sm">No data</p>
              ) : (
                <div className="space-y-2">
                  {locationEntries.map(([loc, cnt]) => (
                    <div key={loc} className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium truncate">{loc}</span>
                      <span className="font-bold text-slate-900 text-lg">{cnt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border border-slate-200 shadow-lg p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <span className="material-symbols-outlined text-white text-lg">pie_chart</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Role Distribution</h2>
            </div>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl mb-2 block">pie_chart</span>
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 shadow-lg p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <span className="material-symbols-outlined text-white text-lg">bar_chart</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Employee Count by Location</h2>
            </div>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl mb-2 block">bar_chart</span>
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 shadow-lg p-6 lg:col-span-2 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
                <span className="material-symbols-outlined text-white text-lg">show_chart</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Assignment Activity (7 days)</h2>
            </div>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl mb-2 block">show_chart</span>
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 shadow-lg p-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <span className="material-symbols-outlined text-white text-lg">history</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Recent Assignments</h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading assignments…</p>
            </div>
          ) : recentAssignments.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-slate-500">No recent assignments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700">Assigned At</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Employee</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Booking</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssignments.map((r, i) => (
                    <motion.tr 
                      key={i} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-700 font-medium">{r.assignedAt ? new Date(r.assignedAt).toLocaleString() : '—'}</td>
                      <td className="px-6 py-4 text-slate-900 font-semibold">{r.employee?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">{r.employee?.role || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{r.booking ? `#${String(r.booking.id).slice(0,8)} (${r.booking.service_type || r.booking.serviceType || ''})` : '—'}</td>
                      <td className="px-6 py-4 text-slate-700">{r.booking?.location || '—'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics


