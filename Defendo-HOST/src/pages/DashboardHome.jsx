import { useAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"

const DashboardHome = () => {
  const { user, hostProfile } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0])
  
  const stats = [
    { label: "Active Services", value: 12, icon: "security", color: "from-blue-500 to-cyan-500", suffix: "" },
    { label: "Total Bookings", value: 48, icon: "event", color: "from-green-500 to-emerald-500", suffix: "" },
    { label: "Monthly Revenue", value: 12450, icon: "attach_money", color: "from-yellow-500 to-orange-500", suffix: "$", prefix: "" },
    { label: "Client Rating", value: 4.8, icon: "star", color: "from-purple-500 to-pink-500", suffix: "/5" }
  ]

  const activities = [
    { 
      icon: "event", 
      title: "New booking for Event Security", 
      time: "2 hours ago", 
      status: "success",
      color: "text-green-400"
    },
    { 
      icon: "person_add", 
      title: "New client registered", 
      time: "5 hours ago", 
      status: "info",
      color: "text-blue-400"
    },
    { 
      icon: "security", 
      title: "Service 'Bodyguard Protection' updated", 
      time: "1 day ago", 
      status: "warning",
      color: "text-yellow-400"
    },
    { 
      icon: "payment", 
      title: "Payment received for Security Guard service", 
      time: "2 days ago", 
      status: "success",
      color: "text-green-400"
    }
  ]

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Animate stats
    const animationTimer = setTimeout(() => {
      setAnimatedStats(stats.map(stat => stat.value))
    }, 500)

    return () => {
      clearInterval(timer)
      clearTimeout(animationTimer)
    }
  }, [])

  const getHostDisplayName = () => {
    if (hostProfile?.company_name) {
      return hostProfile.company_name
    }
    if (hostProfile?.full_name) {
      return hostProfile.full_name
    }
    return user?.email?.split('@')[0] || 'Host'
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/10 to-blue-500/10 rounded-2xl"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text animate-slide-in-left">
                Welcome Back, {getHostDisplayName()}! 👋
              </h1>
              <p className="text-white/70 text-lg animate-slide-in-left" style={{animationDelay: '0.2s'}}>
                Here's what's happening with your security services today.
              </p>
            </div>
            <div className="text-right animate-slide-in-right">
              <div className="text-2xl font-bold text-white">{formatTime(currentTime)}</div>
              <div className="text-white/70">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative overflow-hidden bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] card-animate stagger-item"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <span className="material-symbols-outlined text-white text-2xl">
                    {stat.icon}
                  </span>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div>
                <p className="text-white/70 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">
                  {stat.prefix || ''}
                  {stat.value === 4.8 ? stat.value : Math.floor(animatedStats[index] || 0)}
                  {stat.suffix}
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 w-full bg-white/10 rounded-full h-1">
                <div 
                  className={`h-1 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min((animatedStats[index] || 0) / stat.value * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] card-animate">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <div className="flex items-center gap-2 text-[var(--primary-color)] text-sm">
              <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={index}
                className="group flex items-center gap-4 p-4 bg-[#111714] rounded-xl hover:bg-[#1a241e] transition-all duration-300 card-animate stagger-item"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color.replace('text-', 'from-').replace('-400', '-500')} to-gray-600`}>
                  <span className="material-symbols-outlined text-white text-lg">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium group-hover:text-[var(--primary-color)] transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-white/60 text-sm">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-400' :
                  'bg-blue-400'
                } animate-pulse`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] card-animate">
          <h2 className="text-xl font-bold text-white mb-6">Performance Overview</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">This Month</span>
              <span className="text-[var(--primary-color)] font-bold">+12.5%</span>
            </div>
            
            <div className="h-32 bg-[#111714] rounded-xl p-4 flex items-end gap-2">
              {[65, 80, 45, 90, 75, 95, 85].map((height, index) => (
                <div 
                  key={index}
                  className="flex-1 bg-gradient-to-t from-[var(--primary-color)] to-blue-400 rounded-t-lg animate-pulse"
                  style={{ 
                    height: `${height}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-white/60">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] rounded-full shadow-2xl hover:shadow-[var(--primary-color)]/25 transition-all duration-300 ripple group animate-bounce">
          <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
            add
          </span>
        </button>
      </div>
    </div>
  )
}

export default DashboardHome
