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

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      setError(null)
      const { data, error } = await db.getHostBookings(user.id)
      if (error) setError(error.message)
      setBookings(data || [])
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
          || locationText.toLowerCase().includes(query.toLowerCase())
        : true
      const matchesStatus = statusFilter === 'all' ? true : (b.status || '').toLowerCase() === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [bookings, query, statusFilter])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Bookings</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">search</span>
            <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, service, location..."
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[var(--primary-color)]"
          />
          </div>
          {/* Filter chips */}
          {['pending','confirmed','completed','cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${statusFilter === s ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)]/40 text-[var(--primary-color)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
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
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[var(--primary-color)]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="grid grid-cols-8 px-4 py-3 text-white/60 text-sm border-b border-[#29382f] bg-white/5">
          <div>ID</div>
          <div>Service</div>
          <div>Date/Time</div>
          <div>Location</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Price</div>
          <div></div>
        </div>
        {loading ? (
          <div className="p-6 text-white/60">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-white/60">No bookings found.</div>
        ) : (
          <div className="divide-y divide-[#29382f]">
            {filtered.map((b, i) => (
              <div key={b.id} className={`grid grid-cols-8 px-4 py-3 items-center hover:bg-[#1a241e] ${i % 2 === 0 ? 'bg-white/0' : 'bg-white/5'}`}>
                <div>#{b.id}</div>
                <div className="capitalize">{b.service_type || '—'}</div>
                <div>{b.date ? new Date(b.date).toLocaleString() : '—'}</div>
                <div>{(() => {
                  if (!b.location) return '—'
                  if (typeof b.location === 'string') return b.location || '—'
                  const obj = b.location || {}
                  return obj.address || [obj.city, obj.state].filter(Boolean).join(', ') || '—'
                })()}</div>
                <div className="capitalize flex items-center gap-2">
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
                </div>
                <div className="capitalize flex items-center gap-2">
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
                </div>
                <div>₹{Number(b.price || 0).toLocaleString('en-IN')}</div>
                <div className="text-right">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--primary-color)]/15 border border-[var(--primary-color)]/30 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/25 transition-colors text-sm" onClick={() => setSelected(b)}>
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    View
                  </button>
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



