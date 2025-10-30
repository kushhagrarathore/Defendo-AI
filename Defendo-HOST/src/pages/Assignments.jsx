import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { supabase, db } from "../lib/supabase"
import LiveServiceTimer from "../components/LiveServiceTimer"

const Assignments = () => {
  const { user } = useAuth()
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookings, setBookings] = useState([])
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [otpInputs, setOtpInputs] = useState({})
  const [generatedOtps, setGeneratedOtps] = useState({})

  useEffect(() => {
    const fetchAvailable = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        setError("")
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, role, phone, photo_url, experience_years, location')
          .eq('host_id', user.id)
          .eq('status', 'Available')
          .order('created_at', { ascending: false })
        if (error) throw error
        const mapped = (data || []).map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          phone: r.phone,
          photo: r.photo_url || "",
          experience: r.experience_years || 0,
          location: r.location || ''
        }))
        setAvailable(mapped)
      } catch (e) {
        setError(e.message || 'Failed to load employees')
      } finally {
        setLoading(false)
      }
    }
    const fetchBookings = async () => {
      if (!user?.id) return
      try {
        // don't block the employees loader UI; separate loading state if needed later
        const { data, error } = await supabase
          .from('bookings')
          .select('id, user_id, service_type, date, location, status, start_time, end_time, service_status, assigned_employee_id, duration_hours')
          .eq('provider_id', user.id)
          .in('status', ['pending', 'assigned', 'in_progress'])
          .order('created_at', { ascending: false })
        if (error) throw error
        const mapped = (data || []).map(b => ({
          id: b.id,
          userId: b.user_id,
          serviceType: b.service_type,
          date: b.date,
          location: b.location,
          status: b.status,
          startTime: b.start_time || null,
          endTime: b.end_time || null,
          serviceStatus: b.service_status || null,
          assignedEmployeeId: b.assigned_employee_id || null,
          durationHours: b.duration_hours || 0
        }))
        setBookings(mapped)
      } catch (_) {}
    }
    fetchAvailable()
    fetchBookings()
  }, [user?.id])

  // Realtime: new bookings notification + refresh
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`assignments_bookings_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `provider_id=eq.${user.id}`
      }, async () => {
        try {
          const { data } = await supabase
            .from('bookings')
            .select('id, user_id, service_type, date, location, status, start_time, end_time, service_status')
            .eq('provider_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            const mapped = (data || []).map(b => ({
            id: b.id,
            userId: b.user_id,
            serviceType: b.service_type,
            date: b.date,
            location: b.location,
            status: b.status,
            startTime: b.start_time || null,
              endTime: b.end_time || null,
            serviceStatus: b.service_status || null
          }))
          setBookings(mapped)
        } catch (_) {}
      })
      .subscribe()
    return () => { try { supabase.removeChannel(channel) } catch (_) {} }
  }, [user?.id])

  const refreshLists = async () => {
    // reuse the fetchers to refresh UI after assignment
    if (!user?.id) return
    try {
      const [empRes, bookRes] = await Promise.all([
        supabase
          .from('employees')
          .select('id, name, role, phone, photo_url, experience_years, location, status')
          .eq('host_id', user.id)
          .eq('status', 'available')
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('id, user_id, service_type, date, location, status')
          .eq('provider_id', user.id)
          .in('status', ['pending','confirmed'])
          .order('created_at', { ascending: false })
      ])
      if (!empRes.error) {
        const mapped = (empRes.data || []).map(r => ({
          id: r.id,
          name: r.name,
          role: r.role,
          phone: r.phone,
          photo: r.photo_url || "",
          experience: r.experience_years || 0,
          location: r.location || ''
        }))
        setAvailable(mapped)
      }
      if (!bookRes.error) {
        const mappedB = (bookRes.data || []).map(b => ({
          id: b.id,
          userId: b.user_id,
          serviceType: b.service_type,
          date: b.date,
          location: b.location,
          status: b.status
        }))
        setBookings(mappedB)
      }
    } catch (_) {}
  }

  const assignEmployeeToBooking = async (employeeId, bookingId) => {
    if (!employeeId || !bookingId) return
    try {
      // 1) Update booking with assigned employee and service status
      const { error: bookingErr } = await supabase
        .from('bookings')
        .update({
          assigned_employee_id: employeeId,
          service_status: 'assigned',
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
      if (bookingErr) throw bookingErr

      // 2) Update employee status to assigned
      const { error: empErr } = await supabase
        .from('employees')
        .update({ status: 'Assigned' })
        .eq('id', employeeId)
      if (empErr) throw empErr

      // 3) Insert assignment record
      const { error: gaErr } = await supabase
        .from('guard_assignments')
        .insert({ guard_id: employeeId, booking_id: bookingId, status: 'active' })
      if (gaErr) throw gaErr

      // 4) Notify the user who created the booking
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, user_id')
        .eq('id', bookingId)
        .single()
      const { data: employee } = await supabase
        .from('employees')
        .select('name, role, phone')
        .eq('id', employeeId)
        .single()
      if (booking?.user_id && employee) {
        await supabase
          .from('notifications')
          .insert({
            user_id: booking.user_id,
            type: 'booking_update',
            title: 'Employee Assigned',
            message: `Employee ${employee.name} has been assigned to your booking.`
          })
      }

      // Refresh lists and clear active booking
      await refreshLists()
      setActiveBookingId(null)
    } catch (e) {
      alert(e.message || 'Assignment failed')
    }
  }

  const handleStartWithOtp = async (bookingId) => {
    const entered = (otpInputs[bookingId] || '').trim()
    if (!entered || entered.length !== 6) {
      alert('Enter the 6-digit OTP')
      return
    }
    const res = await db.startServiceWithOtp(bookingId, entered)
    if (res.ok) {
      alert('✅ OTP Verified. Service Started!')
      setOtpInputs(prev => ({ ...prev, [bookingId]: '' }))
      // refresh the list so start_time/service_status show up
      try {
        const { data } = await supabase
          .from('bookings')
          .select('id, user_id, service_type, date, location, status, start_time, end_time, service_status, assigned_employee_id, duration_hours')
          .eq('provider_id', user.id)
          .in('status', ['pending','assigned','in_progress'])
          .order('created_at', { ascending: false })
        const mapped = (data || []).map(b => ({
          id: b.id,
          userId: b.user_id,
          serviceType: b.service_type,
          date: b.date,
          location: b.location,
          status: b.status,
          startTime: b.start_time || null,
          endTime: b.end_time || null,
          serviceStatus: b.service_status || null,
          assignedEmployeeId: b.assigned_employee_id || null,
          durationHours: b.duration_hours || 0
        }))
        setBookings(mapped)
      } catch (_) {}
    } else {
      alert(res?.error?.message || '❌ Incorrect OTP. Please try again.')
    }
  }

  const generateOtp = async (bookingId) => {
    try {
      const { otp, error } = await db.generateBookingOtp(bookingId)
      if (error) throw error
      setGeneratedOtps(prev => ({ ...prev, [bookingId]: otp }))
      alert(`OTP Generated: ${otp}`)
    } catch (e) {
      alert('Failed to generate OTP: ' + e.message)
    }
  }

  const handleServiceComplete = async (bookingId) => {
    // Refresh bookings when service completes
    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, user_id, service_type, date, location, status, start_time, end_time, service_status, assigned_employee_id, duration_hours')
        .eq('provider_id', user.id)
        .in('status', ['pending','assigned','in_progress','completed'])
        .order('created_at', { ascending: false })
      const mapped = (data || []).map(b => ({
        id: b.id,
        userId: b.user_id,
        serviceType: b.service_type,
        date: b.date,
        location: b.location,
        status: b.status,
        startTime: b.start_time || null,
        endTime: b.end_time || null,
        serviceStatus: b.service_status || null,
        assignedEmployeeId: b.assigned_employee_id || null,
        durationHours: b.duration_hours || 0
      }))
      setBookings(mapped)
    } catch (_) {}
  }

  return (
    <div className="min-h-screen bg-[#0C0F13] text-[#C5C6C7]">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-6">Assignment Board</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Available Employees</h2>
            <div className="min-h-[400px] rounded-xl border border-dashed border-white/10 p-3">
              {loading && <div className="text-white/70 p-4">Loading…</div>}
              {!loading && error && <div className="text-red-400 p-4">{error}</div>}
              {!loading && !error && available.length === 0 && (
                <div className="text-white/60 p-4">No available employees</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {available.map(emp => (
                  <div key={emp.id} className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl ${activeBookingId ? 'ring-1 ring-[#00AFFF]/30' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                      {emp.photo ? (
                        <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-white/60">person</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{emp.name}</div>
                      <div className="text-xs text-white/70">{emp.role} • {emp.experience} yrs{emp.location ? ` • ${emp.location}` : ''}</div>
                    </div>
                    <button onClick={() => {
                      if (!activeBookingId) { alert('Select a booking first: click "Assign Employee" on a booking card.'); return }
                      assignEmployeeToBooking(emp.id, activeBookingId)
                    }} className="px-3 py-1 rounded-xl bg-[#00AFFF] text-black text-sm font-semibold">Assign</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0f0f0f]/80 backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Active Bookings</h2>
            <div className="min-h-[400px] rounded-xl border border-dashed border-white/10 p-3">
              {bookings.length === 0 && (
                <div className="text-white/60 p-4">No active bookings</div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {bookings.map(b => (
                  <div key={b.id} className={`p-3 bg-white/5 border border-white/10 rounded-2xl ${activeBookingId === b.id ? 'ring-2 ring-[#00AFFF]' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">Booking #{String(b.id).slice(0,8)}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{b.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-white/80">
                      <div>Service: <span className="font-medium capitalize">{b.serviceType}</span></div>
                      {b.date && (<div>Date: {new Date(b.date).toLocaleDateString()}</div>)}
                      <div>Location: {b.location}</div>
                      {b.startTime && (<div>Started: {new Date(b.startTime).toLocaleString()}</div>)}
                      {b.endTime && (<div>Ended: {new Date(b.endTime).toLocaleString()}</div>)}
                      {b.assignedEmployeeId && (
                        <div className="text-green-400">✓ Employee Assigned</div>
                      )}
                    </div>
                    
                    {/* Live Timer for in-progress services */}
                    {b.serviceStatus === 'in_progress' && b.startTime && (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <LiveServiceTimer 
                          bookingId={b.id}
                          startTime={b.startTime}
                          durationHours={b.durationHours}
                          onComplete={() => handleServiceComplete(b.id)}
                        />
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      {activeBookingId === b.id ? (
                        <>
                          <span className="text-white/70 text-sm">Now select an employee to assign</span>
                          <button onClick={() => setActiveBookingId(null)} className="px-3 py-1 rounded-xl border border-white/10 text-white/80 text-sm">Cancel</button>
                        </>
                      ) : b.status === 'pending' ? (
                        <button onClick={() => setActiveBookingId(b.id)} className="px-3 py-1 rounded-xl bg-[#00AFFF] text-black text-sm font-semibold">Assign Employee</button>
                      ) : b.status === 'assigned' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => generateOtp(b.id)} 
                            className="px-3 py-1 rounded-xl bg-amber-500 text-black text-sm font-semibold"
                          >
                            Generate OTP
                          </button>
                          {generatedOtps[b.id] && (
                            <span className="text-green-400 text-sm">OTP: {generatedOtps[b.id]}</span>
                          )}
                        </div>
                      ) : null}
                      <button className="px-3 py-1 rounded-xl border border-white/10 text-white/80 text-sm">Details</button>
                    </div>
                    
                    {/* OTP start section for assigned bookings */}
                    {b.status === 'assigned' && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 w-32"
                          placeholder="Enter OTP"
                          value={otpInputs[b.id] || ''}
                          onChange={e => setOtpInputs(prev => ({ ...prev, [b.id]: e.target.value.replace(/\D/g, '').slice(0,6) }))}
                        />
                        <button
                          onClick={() => handleStartWithOtp(b.id)}
                          className="px-3 py-1 rounded-xl bg-emerald-500 text-black text-sm font-semibold"
                        >
                          Start Service
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assignments


