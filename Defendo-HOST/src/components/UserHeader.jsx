import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import BrandLogo from "./BrandLogo"

const STORAGE_KEY = "defendo_user_location"

const UserHeader = () => {
  const { user } = useAuth()
  const [locationText, setLocationText] = useState("Use my location")
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setLocationText(saved)
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await res.json()
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            ""
          const state = data?.address?.state || ""
          const text = [city, state].filter(Boolean).join(", ") || "Detected location"
          setLocationText(text)
          localStorage.setItem(STORAGE_KEY, text)
        } catch (e) {
          console.error("Reverse geocode failed:", e)
          alert("Could not detect your city. Please try again.")
        } finally {
          setDetecting(false)
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        alert("Could not access location. Please allow permission or try again.")
        setDetecting(false)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/book" className="flex items-center">
            <BrandLogo 
              text="Defendo" 
              imgClassName="h-10 w-auto" 
              textClassName="text-xl font-semibold text-[#1A1A1A]" 
            />
          </Link>

          {/* Center: Location banner */}
          <div className="flex-1 flex justify-center px-4">
            <button
              onClick={detectLocation}
              disabled={detecting}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              title="Detect my city and filter services nearby"
            >
              <span className="material-symbols-outlined text-base">my_location</span>
              <span className="max-w-xs truncate text-left">
                {detecting ? "Detecting location..." : locationText}
              </span>
            </button>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Notifications Icon */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-[#1A1A1A] text-2xl">
                notifications
              </span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#DAA520] rounded-full"></span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default UserHeader


























