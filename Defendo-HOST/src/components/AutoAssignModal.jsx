import { useEffect, useMemo, useState } from "react"
import Modal from "./ui/Modal"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

const AutoAssignModal = ({ isOpen, onClose, booking }) => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({ role: "", location: "", search: "" })
  const [selected, setSelected] = useState({})
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!isOpen || !user?.id) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, role, status, photo_url, experience_years, location')
          .eq('host_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        const mapped = (data || []).map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          status: r.status,
          photo: r.photo_url || "",
          exp: r.experience_years || 0,
          location: r.location || ""
        }))
        setEmployees(mapped)
      } catch (_) {
        // keep UI minimal for now
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [isOpen, user?.id])

  const guards = useMemo(() => {
    return employees.filter(g => {
      const roleOk = !filters.role || g.role === filters.role
      const locOk = !filters.location || (g.location || '').toLowerCase().includes(filters.location.toLowerCase())
      const searchOk = !filters.search || g.name.toLowerCase().includes(filters.search.toLowerCase())
      return roleOk && locOk && searchOk
    })
  }, [employees, filters])

  const toggle = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))

  const autoAssign = () => {
    // placeholder logic: pick first two available
    const picks = guards.filter(g => g.status === 'Available').slice(0, 2)
    const result = picks.map(p => p.name).join(', ')
    alert(`Auto assigned: ${result}`)
    onClose()
  }

  const assignSelected = () => {
    const picks = Object.entries(selected).filter(([, v]) => v).map(([id]) => id)
    alert(`Assigned ${picks.length} guard(s) to Booking #${booking?.id || '—'}`)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Booking Received!" theme="dark">
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <div><span className="font-medium text-white">Booking ID:</span> {booking?.id || '—'}</div>
            <div><span className="font-medium text-white">User:</span> {booking?.user || '—'}</div>
            <div><span className="font-medium text-white">Service:</span> {booking?.service_type || '—'}</div>
            <div><span className="font-medium text-white">Date:</span> {booking?.date || '—'}</div>
            <div><span className="font-medium text-white">Location:</span> {booking?.location || '—'}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/50">search</span>
            <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search guard" className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-[#00AFFF]/20" />
          </div>
          <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#00AFFF]/20">
            <option value="">All Roles</option>
            <option>Guard</option>
            <option>Bouncer</option>
            <option>Bodyguard</option>
          </select>
          <input value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} placeholder="Filter by location" className="px-3 py-2 rounded-xl bg白/5 border border-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-[#00AFFF]/20" />
        </div>

        {/* Guards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-auto pr-1">
          {loading && (
            <div className="col-span-2 text-white/70">Loading…</div>
          )}
          {!loading && guards.map(g => (
            <label key={g.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer">
              <input type="checkbox" checked={!!selected[g.id]} onChange={() => toggle(g.id)} />
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {g.photo ? <img src={g.photo} alt={g.name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-white/60">person</span>}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{g.name}</div>
                <div className="text-xs text-white/70">{g.role} • {g.exp} yrs • {g.location}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'}`}>{g.status}</span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button onClick={autoAssign} className="px-4 py-2 rounded-xl bg-[#00AFFF] text-black shadow hover:shadow-md">Auto Assign Best Match</button>
          <button onClick={assignSelected} className="px-4 py-2 rounded-xl bg-[#16a34a] text-white shadow hover:shadow-md">Assign Selected Guards</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

export default AutoAssignModal


