import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { db, supabase } from '../lib/supabase'
import GlassCard from '../components/ui/GlassCard'
import PrimaryButton from '../components/ui/PrimaryButton'

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in px-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Booking #{booking.id}</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-800">
            <div>
              <p className="text-slate-500 text-sm">Service</p>
              <p className="font-semibold capitalize">{booking.service_type || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Status</p>
              <p className="font-semibold capitalize">{booking.status || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Date & Time</p>
              <p className="font-semibold">
                {booking.date ? new Date(booking.date).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Location</p>
              <p className="font-semibold">
                {(() => {
                if (!booking.location) return '—'
                if (typeof booking.location === 'string') return booking.location || '—'
                const obj = booking.location || {}
                return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                })()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Started</p>
              <p className="font-semibold">
                {booking.start_time ? new Date(booking.start_time).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Ended</p>
              <p className="font-semibold">
                {booking.end_time ? new Date(booking.end_time).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Price</p>
              <p className="font-semibold">₹{Number(booking.price || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Payment</p>
              <p className="font-semibold capitalize">{booking.payment_status || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-1">Notes</p>
            <p className="whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800">
              {booking.user_notes || '—'}
            </p>
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
  const [otpInputs, setOtpInputs] = useState({})

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

  useEffect(() => {
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

  const handleStartWithOtp = async (bookingId) => {
    const entered = (otpInputs[bookingId] || '').trim()
    if (entered.length !== 6) {
      alert('Enter the 6-digit OTP')
      return
    }
    const res = await db.startServiceWithOtp(bookingId, entered)
    if (res.ok) {
      alert('✅ Service started')
      setOtpInputs(prev => ({ ...prev, [bookingId]: '' }))
      load()
    } else {
      alert(res?.error?.message || '❌ Incorrect OTP. Please try again.')
    }
  }

  const handleComplete = async (bookingId) => {
    const { error } = await db.completeService(bookingId)
    if (error) {
      alert(error.message || 'Failed to complete service')
    } else {
      alert('✅ Service marked completed')
      load()
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent mb-3">
              Bookings
            </h1>
            <p className="text-slate-600 text-base md:text-lg">Manage and track all your service bookings</p>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200/60">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by ID, service, location, customer..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-slate-50/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 outline-none transition-all bg-white font-medium text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
            {['pending','confirmed','completed','cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  statusFilter === s 
                    ? 'bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white border-transparent shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1.5">
                  {s === 'pending' ? 'hourglass_top' : s === 'confirmed' ? 'event_available' : s === 'completed' ? 'check_circle' : 'cancel'}
                </span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filtered.map((b) => (
              <motion.div 
                key={b.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-lg transition-all duration-300 cursor-pointer"
                whileHover={{ y: -4, scale: 1.01 }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/5 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Status Badge */}
                <div className="absolute top-5 right-5 z-10">
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border ${getStatusBadgeClass(b.status)}`}>
                    {b.status || '—'}
                  </span>
                </div>

                {/* Card header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 rounded-xl shadow-lg">
                        <span className="material-symbols-outlined text-white text-xl">shield_person</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg capitalize text-slate-900">{b.service_type || 'Service'}</div>
                        <button
                    className="text-xs text-slate-500 transition-colors font-medium"
                          title="Click to copy full ID"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyId(b.id)
                          }}
                        >
                          {shortId(b.id)}{copiedId === b.id ? ' • Copied!' : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium mb-1">Total Price</div>
                    <div className="text-2xl font-extrabold text-slate-900">₹{Number(b.price || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 font-medium">Customer</div>
                        <div className="truncate text-slate-900 font-semibold" title={b.user_name || ''}>{b.user_name || 'Customer'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="material-symbols-outlined text-slate-500 text-lg">schedule</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 font-medium">Booking Date</div>
                        <div className="text-slate-900 font-semibold">{b.date ? new Date(b.date).toLocaleDateString() : '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="material-symbols-outlined text-slate-500 text-lg">location_on</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 font-medium">Location</div>
                        <div className="truncate text-slate-900 font-semibold" title={(() => {
                          if (!b.location) return '—'
                          if (typeof b.location === 'string') return b.location || '—'
                          const obj = b.location || {}
                          return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                        })()}>{(() => {
                          if (!b.location) return '—'
                          if (typeof b.location === 'string') return b.location || '—'
                          const obj = b.location || {}
                          return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                        })()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold capitalize ${getPaymentBadgeClass(b.payment_status)}`}>
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

                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      {(b.status === 'pending' || b.status === 'confirmed' || b.status === 'assigned') && (
                        <div className="flex items-center gap-2">
                          <input
                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 w-28 text-sm"
                            placeholder="Enter OTP"
                            value={otpInputs[b.id] || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                              setOtpInputs(prev => ({ ...prev, [b.id]: val }))
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartWithOtp(b.id)
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                          >
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                            Start
                          </button>
                        </div>
                      )}

                      {(b.status === 'in_progress' || b.service_status === 'in_progress' || b.status === 'confirmed') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleComplete(b.id)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                        >
                          <span className="material-symbols-outlined text-sm">stop</span>
                          End
                        </button>
                      )}

                    <button 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white transition-all text-sm font-semibold shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(b)
                      }}
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
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

      <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default Bookings



