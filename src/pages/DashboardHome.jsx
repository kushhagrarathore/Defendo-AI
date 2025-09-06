import { useAuth } from "../contexts/AuthContext"

const DashboardHome = () => {
  const { user, hostProfile } = useAuth()
  
  const stats = [
    { label: "Active Services", value: "12", icon: "security" },
    { label: "Total Bookings", value: "48", icon: "event" },
    { label: "Monthly Revenue", value: "$12,450", icon: "attach_money" },
    { label: "Client Rating", value: "4.8/5", icon: "star" }
  ]

  const getHostDisplayName = () => {
    if (hostProfile?.company_name) {
      return hostProfile.company_name
    }
    if (hostProfile?.full_name) {
      return hostProfile.full_name
    }
    return user?.email?.split('@')[0] || 'Host'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome Back, {getHostDisplayName()}!</h1>
      <p className="text-white/70 mb-8">Here's what's happening with your security services today.</p>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <span className="material-symbols-outlined text-[var(--primary-color)] text-3xl">
                {stat.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#111714] rounded-lg">
            <span className="material-symbols-outlined text-[var(--primary-color)]">event</span>
            <div>
              <p className="text-white font-medium">New booking for Event Security</p>
              <p className="text-white/70 text-sm">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#111714] rounded-lg">
            <span className="material-symbols-outlined text-[var(--primary-color)]">person_add</span>
            <div>
              <p className="text-white font-medium">New client registered</p>
              <p className="text-white/70 text-sm">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-[#111714] rounded-lg">
            <span className="material-symbols-outlined text-[var(--primary-color)]">security</span>
            <div>
              <p className="text-white font-medium">Service "Bodyguard Protection" updated</p>
              <p className="text-white/70 text-sm">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
