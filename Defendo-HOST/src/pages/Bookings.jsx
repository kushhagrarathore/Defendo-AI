import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db, supabase } from '../lib/supabase'
import GlassCard from '../components/ui/GlassCard'
import PrimaryButton from '../components/ui/PrimaryButton'

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#111714] border border-[#29382f] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#29382f]">
          <h3 className="text-lg font-semibold">Booking #{booking.id}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#1a241e]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Service</p>
              <p className="font-medium">{booking.service_type}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Status</p>
              <p className="font-medium capitalize">{booking.status}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Date & Time</p>
              <p className="font-medium">{booking.date ? new Date(booking.date).toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Location</p>
              <p className="font-medium">{(() => {
                if (!booking.location) return '—'
                if (typeof booking.location === 'string') return booking.location || '—'
                const obj = booking.location || {}
                return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
              })()}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Started</p>
              <p className="font-medium">{booking.start_time ? new Date(booking.start_time).toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Ended</p>
              <p className="font-medium">{booking.end_time ? new Date(booking.end_time).toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Price</p>
              <p className="font-medium">₹{Number(booking.price || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Payment</p>
              <p className="font-medium capitalize">{booking.payment_status || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Notes</p>
            <p className="whitespace-pre-wrap bg-[#0b100e] border border-[#29382f] rounded-xl p-4">{booking.user_notes || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Bookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Accent badge styles
  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'confirmed') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    if (s === 'completed') return 'bg-sky-500/15 text-sky-400 border-sky-500/30'
    if (s === 'pending') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (s === 'cancelled') return 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    return 'bg-white/5 text-white/70 border-white/10'
  }

  const getPaymentBadgeClass = (payment) => {
    const p = (payment || '').toLowerCase()
    if (p === 'paid') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    if (p === 'pending') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (p === 'failed') return 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    return 'bg-white/5 text-white/70 border-white/10'
  }

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      setError(null)
      const { data, error } = await db.getHostBookings(user.id)
      if (error) setError(error.message)
      let rows = data || []
      // Enrich with user full_name from profiles
      const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)))
      if (userIds.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds)
        if (!pErr && profiles) {
          const map = new Map(profiles.map(p => [p.id, p.full_name]))
          rows = rows.map(r => ({ ...r, user_name: map.get(r.user_id) || 'Customer' }))
        }
      }
      setBookings(rows)
      setLoading(false)
    }
    load()
  }, [user?.id])

  const filtered = useMemo(() => {
    return (bookings || []).filter(b => {
      const locationText = typeof b.location === 'string'
        ? b.location
        : (b.location && (b.location.address || [b.location.city, b.location.state].filter(Boolean).join(', '))) || ''
      const matchesQuery = query
        ? String(b.id).includes(query)
          || (b.service_type || '').toLowerCase().includes(query.toLowerCase())
          || (b.user_name || '').toLowerCase().includes(query.toLowerCase())
          || locationText.toLowerCase().includes(query.toLowerCase())
        : true
      const matchesStatus = statusFilter === 'all' ? true : (b.status || '').toLowerCase() === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [bookings, query, statusFilter])

  const shortId = (id) => id ? `#${String(id).slice(-6)}` : '—'

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id))
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1200)
    } catch (_) {}
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Bookings</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/400 text-sm">search</span>
            <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, service, location..."
            className="bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20"
          />
          </div>
          {/* Filter chips */}
          {['pending','confirmed','completed','cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${statusFilter === s ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)]/40 text-[var(--primary-color)]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">
                {s === 'pending' ? 'hourglass_top' : s === 'confirmed' ? 'event_available' : s === 'completed' ? 'check_circle' : 'cancel'}
              </span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <GlassCard className="overflow-visible">
        {loading ? (
          <div className="p-6 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-slate-500">No bookings found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {filtered.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_60px_rgba(15,23,42,0.16)] transition-all">
                {/* Card header */}
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--primary-color)]">shield_person</span>
                    <div>
                      <div className="font-semibold capitalize leading-tight text-slate-900">{b.service_type || '—'}</div>
                      <button
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
                        title="Click to copy full ID"
                        onClick={() => copyId(b.id)}
                      >
                        {shortId(b.id)}{copiedId === b.id ? ' • Copied' : ''}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                      <div className="text-sm text-slate-500">Price</div>
                      <div className="text-lg font-bold text-slate-900">₹{Number(b.price || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                      <span className="truncate text-slate-800" title={b.user_name || ''}>{b.user_name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">schedule</span>
                      <span className="text-slate-700">{b.date ? new Date(b.date).toLocaleString() : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">play_arrow</span>
                      <span className="text-slate-700">{b.start_time ? new Date(b.start_time).toLocaleString() : 'Not started'}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">stop_circle</span>
                      <span className="text-slate-700">{b.end_time ? new Date(b.end_time).toLocaleString() : 'Not ended'}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2 min-w-0">
                      <span className="material-symbols-outlined text-slate-400 text-base">location_on</span>
                      <span className="truncate text-slate-700" title={(() => {
                        if (!b.location) return '—'
                        if (typeof b.location === 'string') return b.location || '—'
                        const obj = b.location || {}
                        return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                      })()}>{(() => {
                        if (!b.location) return '—'
                        if (typeof b.location === 'string') return b.location || '—'
                        const obj = b.location || {}
                        return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                      })()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs capitalize ${getStatusBadgeClass(b.status)}`}>
                      <span className="material-symbols-outlined text-sm">
                        {(() => {
                          const s = (b.status || '').toLowerCase()
                          if (s === 'pending') return 'hourglass_top'
                          if (s === 'confirmed') return 'event_available'
                          if (s === 'completed') return 'check_circle'
                          if (s === 'cancelled') return 'cancel'
                          return 'info'
                        })()}
                      </span>
                      {b.status || '—'}
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs capitalize ${getPaymentBadgeClass(b.payment_status)}`}>
                      <span className="material-symbols-outlined text-sm">
                        {(() => {
                          const p = (b.payment_status || '').toLowerCase()
                          if (p === 'paid') return 'verified'
                          if (p === 'pending') return 'schedule'
                          if (p === 'failed') return 'error'
                          return 'payments'
                        })()}
                      </span>
                      {b.payment_status || '—'}
                    </span>

                    <div className="ml-auto">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/40 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 transition-colors text-sm" onClick={() => setSelected(b)}>
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default Bookings



