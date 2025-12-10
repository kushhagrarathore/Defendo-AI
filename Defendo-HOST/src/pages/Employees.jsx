import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Modal from "../components/ui/Modal"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

const roleOptions = ["Guard", "Bouncer", "Bodyguard"]
const statusOptions = [
  { label: "Available", value: "Available" },
  { label: "Assigned", value: "Assigned" },
  { label: "Off-duty", value: "Off-duty" }
]

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [filters, setFilters] = useState({ role: "", status: "", search: "" })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", role: "Guard", phone: "", photo: "", status: true })
  const [uploadPreview, setUploadPreview] = useState([])
  const [fileKey, setFileKey] = useState(0)
  const [replaceAll, setReplaceAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch employees for this host (persisted)
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        setError("")
        const { data, error: err } = await supabase
          .from('employees')
          .select('id, name, role, phone, status, photo_url, experience_years, location')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false })
        if (err) throw err
        const mapped = (data || []).map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          phone: r.phone,
          status: r.status,
          photo: r.photo_url || "",
          experience: r.experience_years || 0,
          location: r.location || "",
          assignedTo: "—"
        }))
        setEmployees(mapped)
      } catch (e) {
        setError(e.message || 'Failed to load employees')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [user?.id])

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const roleOk = !filters.role || e.role === filters.role
      const statusOk = !filters.status || e.status === filters.status
      const searchOk = filters.search.trim() === "" || (e.name || "").toLowerCase().includes(filters.search.toLowerCase())
      return roleOk && statusOk && searchOk
    })
  }, [employees, filters])

  const onAddEmployee = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const insertRow = {
        provider_id: user.id,
        name: addForm.name,
        role: addForm.role,
        phone: addForm.phone,
        status: addForm.status ? 'Available' : 'Off-duty',
        photo_url: addForm.photo || null,
        experience_years: null,
        location: null,
      }
      const { data, error: err } = await supabase
        .from('employees')
        .insert(insertRow)
        .select('id, name, role, phone, status, photo_url, experience_years, location')
        .single()
      if (err) throw err
      const newEmp = {
        id: data.id,
        name: data.name,
        role: data.role,
        phone: data.phone,
        status: data.status,
        photo: data.photo_url || "",
        experience: data.experience_years || 0,
        location: data.location || "",
        assignedTo: "—"
      }
      setEmployees(prev => [newEmp, ...prev])
      setShowAddModal(false)
    } catch (e) {
      alert(e.message || 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    try {
      setLoading(true)
      const { error: err } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
        .eq('provider_id', user.id)
      if (err) throw err
      setEmployees(prev => prev.filter(e => e.id !== id))
    } catch (e) {
      alert(e.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const onUploadFile = async (file) => {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    if (ext !== 'csv') {
      alert('Please upload a CSV file for now. Excel support can be added next.')
      return
    }

    const text = await file.text()

    // Basic CSV parser supporting quoted fields and commas in quotes
    const parseCsv = (input) => {
      const rows = []
      let cur = ''
      let row = []
      let inQuotes = false
      for (let i = 0; i < input.length; i++) {
        const c = input[i]
        if (c === '"') {
          if (inQuotes && input[i + 1] === '"') { // escaped quote
            cur += '"'; i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (c === ',' && !inQuotes) {
          row.push(cur); cur = ''
        } else if ((c === '\n' || c === '\r') && !inQuotes) {
          if (cur !== '' || row.length) { row.push(cur); cur = '' }
          if (row.length) { rows.push(row); row = [] }
          // handle \r\n by skipping the next if needed
          if (c === '\r' && input[i + 1] === '\n') i++
        } else {
          cur += c
        }
      }
      if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
      return rows
    }

    const rows = parseCsv(text)
    if (!rows.length) { alert('CSV is empty'); return }
    const header = rows[0].map(h => (h || '').trim().toLowerCase())
    const idx = (name) => header.indexOf(name)
    // Expected columns (case-insensitive): name, role, phone, status, photo url, experience, location
    const m = {
      name: idx('name'),
      role: idx('role'),
      phone: idx('phone'),
      status: idx('status'),
      photo: idx('photo url') !== -1 ? idx('photo url') : idx('photo'),
      experience: idx('experience'),
      location: idx('location')
    }
    if (m.name === -1 || m.role === -1 || m.phone === -1) {
      alert('CSV must include at least: Name, Role, Phone columns')
      return
    }
    const records = rows.slice(1)
      .filter(r => r && r.length)
      .map(r => ({
        name: (r[m.name] || '').trim(),
        role: (r[m.role] || '').trim(),
        phone: (r[m.phone] || '').trim(),
        status: ((r[m.status] || 'available').trim().toLowerCase()) || 'available',
        photo: m.photo !== -1 ? (r[m.photo] || '').trim() : '',
        experience: m.experience !== -1 ? Number((r[m.experience] || '0').trim()) : 0,
        location: m.location !== -1 ? (r[m.location] || '').trim() : ''
      }))
      .filter(r => r.name && r.role && r.phone)

    if (!records.length) {
      alert('No valid rows found in CSV (need Name, Role, Phone)')
      return
    }

    setUploadPreview(records)
  }

  const importEmployees = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const normalizePhone = (p) => (p || '').replace(/[^0-9]/g, '')
      const makeKey = (r) => {
        const phone = normalizePhone(r.phone)
        return phone ? `p:${phone}` : `n:${(r.name || '').trim().toLowerCase()}|${(r.role || '').trim().toLowerCase()}`
      }

      // Build existing keys from current state to avoid duplicates on repeated uploads
      const existingKeys = new Set(
        employees.map(e => {
          const phone = normalizePhone(e.phone)
          return phone ? `p:${phone}` : `n:${(e.name || '').trim().toLowerCase()}|${(e.role || '').trim().toLowerCase()}`
        })
      )

      // De-duplicate preview rows (skip ones already present or repeated within the file)
      const seenInBatch = new Set()
      const filteredPreview = uploadPreview.filter((r) => {
        const k = makeKey(r)
        if (!k) return false
        if (existingKeys.has(k)) return false
        if (seenInBatch.has(k)) return false
        seenInBatch.add(k)
        return true
      })

      const rows = filteredPreview.map(r => ({
        provider_id: user.id,
        name: r.name,
        role: r.role,
        phone: r.phone,
        // reset status to Available on upload per latest requirement
        status: 'Available',
        photo_url: r.photo || null,
        experience_years: Number(r.experience || 0),
        location: r.location || null,
      }))
      if (rows.length === 0) {
        alert('No new employees to import (duplicates skipped).')
        setUploadPreview([])
        setShowUploadModal(false)
        return
      }

      // Optional overwrite: delete previous employees for this host
      if (replaceAll) {
        const { error: delErr } = await supabase
          .from('employees')
          .delete()
          .eq('provider_id', user.id)
        if (delErr) throw delErr
      }

      // Reset local table quickly to avoid visual duplication while importing
      setEmployees([])

      const { data, error: err } = await supabase
        .from('employees')
        .insert(rows)
        .select('id, name, role, phone, status, photo_url, experience_years, location')
      if (err) throw err
      // Fetch the refreshed list for this provider_id to ensure full sync
      const { data: refreshed, error: fetchErr } = await supabase
        .from('employees')
        .select('id, name, role, phone, status, photo_url, experience_years, location')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
      if (fetchErr) throw fetchErr
      const mapped = (refreshed || []).map(d => ({
        id: d.id,
        name: d.name,
        role: d.role,
        phone: d.phone,
        status: d.status,
        photo: d.photo_url || "",
        experience: d.experience_years || 0,
        location: d.location || "",
        assignedTo: "—"
      }))
      setEmployees(mapped)
      setUploadPreview([])
      setShowUploadModal(false)
      const skipped = uploadPreview.length - rows.length
      alert(`Imported ${rows.length} employee(s).${skipped > 0 ? ` Skipped ${skipped} duplicate(s).` : ''}${replaceAll ? ' (Replaced previous dataset).' : ''}`)
    } catch (e) {
      alert(e.message || 'Failed to import')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
                My Employees
              </h1>
              <p className="text-slate-600 text-base md:text-lg">Manage staff, import from CSV/Excel, and assign quickly</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setUploadPreview([]); setFileKey(k => k + 1); setShowUploadModal(true) }} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-lg transition-all font-semibold"
              >
                <span className="material-symbols-outlined">upload</span>
                Upload CSV / Excel
              </button>
              <button 
                onClick={() => setShowAddModal(true)} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <span className="material-symbols-outlined">add</span>
                Add Employee
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/60 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400" 
                  placeholder="Search by name..." 
                  value={filters.search} 
                  onChange={e => setFilters({ ...filters, search: e.target.value })} 
                />
              </div>
              <select 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-white font-medium text-slate-700" 
                value={filters.role} 
                onChange={e => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-white font-medium text-slate-700" 
                value={filters.status} 
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Photo</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Assigned To</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-500">Loading employees…</p>
                    </td>
                  </tr>
                )}
                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No employees found</h3>
                      <p className="text-slate-500">Add your first employee to get started</p>
                    </td>
                  </tr>
                )}
                {filteredEmployees.map(emp => (
                  <motion.tr 
                    key={emp.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 overflow-hidden flex items-center justify-center shadow-lg">
                        {emp.photo ? (
                          <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-white text-xl">person</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">{emp.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        emp.status === 'Available' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : emp.status === 'Assigned' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {emp.status === 'Available' ? '🟢 Available' : emp.status === 'Assigned' ? '🔴 Assigned' : '⚫ Off-duty'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{emp.assignedTo || <span className="text-slate-400">—</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-blue-50 transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-blue-600 text-lg">edit</span>
                        </button>
                        <button onClick={() => onDelete(emp.id)} className="p-2 rounded-xl hover:bg-rose-50 transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-rose-500 text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee" theme="dark">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#00AFFF]/20" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role</label>
                <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#00AFFF]/20" value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                  {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#00AFFF]/20" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Photo URL</label>
                <input className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-[#00AFFF]/20" value={addForm.photo} onChange={e => setAddForm({ ...addForm, photo: e.target.value })} />
              </div>
            </div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">Set as Available</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">Cancel</button>
              <button onClick={onAddEmployee} className="px-4 py-2 rounded-xl bg-[#00AFFF] text-black shadow hover:shadow-md">Add Employee</button>
            </div>
          </div>
        </Modal>

        {/* Upload Modal */}
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload CSV / Excel" theme="dark">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-white/5">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-white">upload</span>
                <p className="text-white/80">Drop your CSV/Excel here or browse</p>
                <input key={fileKey} type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  // reset preview before parsing new file to avoid old rows lingering
                  setUploadPreview([])
                  onUploadFile(f)
                }} className="mt-2" />
                <button className="text-[#00AFFF] underline text-sm mt-2">Download Sample CSV</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={replaceAll} onChange={e => setReplaceAll(e.target.checked)} />
                <span className="text-sm text-white/80">Replace all existing employees with this CSV</span>
              </label>
              {uploadPreview.length > 0 && (
                <span className="text-sm text-white/60">Rows parsed: {uploadPreview.length}</span>
              )}
            </div>
            {uploadPreview.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <h4 className="font-medium text-white">Preview (first {Math.min(5, uploadPreview.length)} rows)</h4>
                  <span className="text-sm text-white/70">Valid: {uploadPreview.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Photo URL</th>
                        <th className="px-4 py-2">Experience</th>
                        <th className="px-4 py-2">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadPreview.slice(0,5).map((r, i) => (
                        <tr key={i} className="border-t border-white/10">
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">{r.role}</td>
                          <td className="px-4 py-2">{r.phone}</td>
                          <td className="px-4 py-2">{r.status}</td>
                          <td className="px-4 py-2 truncate max-w-[200px]">{r.photo || '—'}</td>
                          <td className="px-4 py-2">{r.experience} yrs</td>
                          <td className="px-4 py-2">{r.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setUploadPreview([]); setFileKey(k => k + 1); setShowUploadModal(false) }} className="px-4 py-2 rounded-xl border border白/10 bg-white/5 hover:bg-white/10">Cancel</button>
              <button disabled={uploadPreview.length === 0} onClick={importEmployees} className="px-4 py-2 rounded-xl bg-[#16a34a] text-white shadow disabled:opacity-50">Import Employees</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Employees


