import { useState } from "react"
import { db } from "../lib/supabase"
import AutoAssignModal from "../components/AutoAssignModal"

const BookingManagement = () => {
  const [open, setOpen] = useState(false)
  const [activeBooking, setActiveBooking] = useState(null)

  const bookings = [
    { id: 123, user: 'Rahul Sharma', service_type: 'Guard', date: '2025-10-08', location: 'Indore', status: 'pending' },
    { id: 124, user: 'Anita Patel', service_type: 'Bouncer', date: '2025-10-10', location: 'Bhopal', status: 'confirmed' }
  ]

  const [otpMap, setOtpMap] = useState({})
  const [otpInput, setOtpInput] = useState("")

  const handleStartWithOtp = async (bookingId) => {
    if (!otpInput || otpInput.length !== 6) {
      alert("Enter the 6-digit OTP")
      return
    }
    const res = await db.startServiceWithOtp(bookingId, otpInput)
    if (res.ok) {
      alert("✅ OTP Verified. Service Started!")
      setOtpInput("")
    } else {
      alert(res?.error?.message || "❌ Incorrect OTP. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1e3a8a] mb-6">Booking Management</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="px-4 py-3 font-medium">User Name</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{b.user}</td>
                    <td className="px-4 py-3">{b.service_type}</td>
                    <td className="px-4 py-3">{b.date}</td>
                    <td className="px-4 py-3">{b.location}</td>
                    <td className="px-4 py-3 capitalize">{b.status}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => { setActiveBooking(b); setOpen(true) }}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1e3a8a] text-white shadow hover:shadow-md"
                      >
                        <span className="material-symbols-outlined">group_add</span>
                        Assign Employee
                      </button>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          className="px-3 py-2 border rounded-lg w-32"
                          placeholder="Enter OTP"
                          value={otpInput}
                          onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0,6))}
                        />
                        <button
                          onClick={() => handleStartWithOtp(b.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white shadow hover:shadow-md"
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                          Start Service
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AutoAssignModal isOpen={open} onClose={() => setOpen(false)} booking={activeBooking} />
    </div>
  )
}

export default BookingManagement



