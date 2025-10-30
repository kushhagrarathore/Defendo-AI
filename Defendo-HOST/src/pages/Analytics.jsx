import { useEffect, useMemo, useState } from "react"
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
    <div className="min-h-screen bg-[#0C0F13] text-[#C5C6C7]">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-6">Analytics</h1>
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80">
            <div className="text-white/70 text-sm mb-1">Assigned Employees</div>
            <div className="text-4xl font-bold text-white">{assignedCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80">
            <div className="text-white/70 text-sm mb-3">Assigned by Role</div>
            {roleEntries.length === 0 ? (
              <div className="text-white/60">No data</div>
            ) : (
              <ul className="space-y-1 text-white">
                {roleEntries.map(([role, cnt]) => (
                  <li key={role} className="flex justify-between"><span>{role}</span><span className="font-semibold">{cnt}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80">
            <div className="text-white/70 text-sm mb-3">Assigned by Location</div>
            {locationEntries.length === 0 ? (
              <div className="text-white/60">No data</div>
            ) : (
              <ul className="space-y-1 text-white">
                {locationEntries.map(([loc, cnt]) => (
                  <li key={loc} className="flex justify-between"><span>{loc}</span><span className="font-semibold">{cnt}</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Role Distribution</h2>
            <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">Pie Chart Placeholder</div>
          </div>
          <div className="rounded-2xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Employee Count by Location</h2>
            <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">Bar Chart Placeholder</div>
          </div>
          <div className="rounded-2xl border border-white/10 shadow-sm p-4 lg:col-span-2 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Assignment Activity (7 days)</h2>
            <div className="h-64 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">Line Chart Placeholder</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
          <h2 className="text-lg font-semibold mb-3 text-white">Recent Assignments</h2>
          {loading ? (
            <div className="text-white/70 p-4">Loading…</div>
          ) : recentAssignments.length === 0 ? (
            <div className="text-white/60 p-4">No recent assignments</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="px-4 py-2">Assigned At</th>
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Booking</th>
                    <th className="px-4 py-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssignments.map((r, i) => (
                    <tr key={i} className="border-t border-white/10">
                      <td className="px-4 py-2">{r.assignedAt ? new Date(r.assignedAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-2">{r.employee?.name || '—'}</td>
                      <td className="px-4 py-2">{r.employee?.role || '—'}</td>
                      <td className="px-4 py-2">{r.booking ? `#${String(r.booking.id).slice(0,8)} (${r.booking.service_type || r.booking.serviceType || ''})` : '—'}</td>
                      <td className="px-4 py-2">{r.booking?.location || '—'}</td>
                    </tr>
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


