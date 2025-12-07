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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6">Analytics</h1>
        {error && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <div className="text-slate-500 text-sm mb-1">Assigned Employees</div>
            <div className="text-4xl font-bold text-slate-900">{assignedCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <div className="text-slate-500 text-sm mb-3">Assigned by Role</div>
            {roleEntries.length === 0 ? (
              <div className="text-slate-500">No data</div>
            ) : (
              <ul className="space-y-1 text-slate-900">
                {roleEntries.map(([role, cnt]) => (
                  <li key={role} className="flex justify-between"><span>{role}</span><span className="font-semibold">{cnt}</span></li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
            <div className="text-slate-500 text-sm mb-3">Assigned by Location</div>
            {locationEntries.length === 0 ? (
              <div className="text-slate-500">No data</div>
            ) : (
              <ul className="space-y-1 text-slate-900">
                {locationEntries.map(([loc, cnt]) => (
                  <li key={loc} className="flex justify-between"><span>{loc}</span><span className="font-semibold">{cnt}</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-slate-200 shadow-sm p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">Role Distribution</h2>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">Pie Chart Placeholder</div>
          </div>
          <div className="rounded-2xl border border-slate-200 shadow-sm p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">Employee Count by Location</h2>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">Bar Chart Placeholder</div>
          </div>
          <div className="rounded-2xl border border-slate-200 shadow-sm p-4 lg:col-span-2 bg-white">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">Assignment Activity (7 days)</h2>
            <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">Line Chart Placeholder</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 shadow-sm p-4 bg-white">
          <h2 className="text-lg font-semibold mb-3 text-slate-900">Recent Assignments</h2>
          {loading ? (
            <div className="text-slate-500 p-4">Loading…</div>
          ) : recentAssignments.length === 0 ? (
            <div className="text-slate-500 p-4">No recent assignments</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
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
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-700">{r.assignedAt ? new Date(r.assignedAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{r.employee?.name || '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{r.employee?.role || '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{r.booking ? `#${String(r.booking.id).slice(0,8)} (${r.booking.service_type || r.booking.serviceType || ''})` : '—'}</td>
                      <td className="px-4 py-2 text-slate-700">{r.booking?.location || '—'}</td>
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


