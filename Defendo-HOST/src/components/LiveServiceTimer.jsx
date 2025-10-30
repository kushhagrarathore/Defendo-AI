import { useEffect, useState } from "react"
import { db } from "../lib/supabase"

function LiveServiceTimer({ bookingId, startTime, durationHours, onComplete }) {
  const [elapsed, setElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!startTime || isCompleted) return

    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(startTime)
      const diff = (now - start) / 1000 // seconds
      setElapsed(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isCompleted])

  useEffect(() => {
    if (!startTime || !durationHours || isCompleted) return

    const totalSeconds = durationHours * 3600
    if (elapsed >= totalSeconds) {
      setIsCompleted(true)
      // Auto-complete service
      const completeService = async () => {
        try {
          await db.completeService(bookingId)
          if (onComplete) onComplete()
        } catch (error) {
          console.error('Failed to complete service:', error)
        }
      }
      completeService()
    }
  }, [elapsed, durationHours, bookingId, startTime, isCompleted, onComplete])

  if (!startTime || isCompleted) {
    return (
      <div className="text-lg font-semibold text-gray-400">
        {isCompleted ? '✅ Service Completed' : '⏳ Not Started'}
      </div>
    )
  }

  const remaining = Math.max(durationHours * 3600 - elapsed, 0)
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = Math.floor(remaining % 60)

  return (
    <div className="text-lg font-semibold text-green-600">
      ⏱️ {hours}h {minutes}m {seconds}s remaining
    </div>
  )
}

export default LiveServiceTimer







