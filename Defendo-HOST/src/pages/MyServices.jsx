import { Link } from "react-router-dom"
import { useState } from "react"

const MyServices = () => {
  const [selectedService, setSelectedService] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const services = [
    {
      id: 1,
      name: "Event Security",
      description: "Professional security services for events and gatherings",
      type: "Event Security",
      price: "$50/hr",
      status: "Active",
      bookings: 15,
      rating: 4.8,
      color: "from-blue-500 to-cyan-500",
      icon: "event"
    },
    {
      id: 2,
      name: "Bodyguard Protection",
      description: "Personal protection services for high-profile individuals",
      type: "Bodyguard",
      price: "$75/hr",
      status: "Active",
      bookings: 8,
      rating: 4.9,
      color: "from-purple-500 to-pink-500",
      icon: "security"
    },
    {
      id: 3,
      name: "Patrol Services",
      description: "Regular patrol and monitoring services for properties",
      type: "Patrol",
      price: "$35/hr",
      status: "Inactive",
      bookings: 3,
      rating: 4.5,
      color: "from-green-500 to-emerald-500",
      icon: "patrol"
    },
    {
      id: 4,
      name: "Drone Surveillance",
      description: "Advanced aerial monitoring and surveillance services",
      type: "Surveillance",
      price: "$60/hr",
      status: "Active",
      bookings: 12,
      rating: 4.7,
      color: "from-orange-500 to-red-500",
      icon: "drone"
    }
  ]

  const handleDelete = async (serviceId) => {
    setIsDeleting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsDeleting(false)
    setSelectedService(null)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text animate-slide-in-left">My Services</h1>
          <p className="text-white/70 mt-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            Manage your security service offerings
          </p>
        </div>
        <Link 
          to="/dashboard/add-service"
          className="group bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] px-6 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 ripple animate-slide-in-right"
        >
          <span className="material-symbols-outlined mr-2 group-hover:rotate-90 transition-transform duration-300">add</span>
          Add New Service
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-xl p-4 border border-[#29382f] card-animate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <span className="material-symbols-outlined text-white">security</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Services</p>
              <p className="text-2xl font-bold text-white">{services.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-xl p-4 border border-[#29382f] card-animate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <span className="material-symbols-outlined text-white">check_circle</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">{services.filter(s => s.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-xl p-4 border border-[#29382f] card-animate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <span className="material-symbols-outlined text-white">event</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{services.reduce((sum, s) => sum + s.bookings, 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-xl p-4 border border-[#29382f] card-animate">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <span className="material-symbols-outlined text-white">star</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Avg Rating</p>
              <p className="text-2xl font-bold text-white">4.7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div 
            key={service.id} 
            className="group relative overflow-hidden bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] card-animate stagger-item hover:shadow-2xl hover:shadow-[var(--primary-color)]/10 transition-all duration-300"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${service.color} shadow-lg`}>
                    <span className="material-symbols-outlined text-white text-xl">{service.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                    {service.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === "Active" 
                      ? "bg-green-500/20 text-green-400 animate-pulse" 
                      : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {service.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                    <span className="text-white text-sm font-medium">{service.rating}</span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-white/70 mb-6 leading-relaxed">{service.description}</p>
              
              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Type:</span>
                  <span className="text-white font-medium">{service.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Price:</span>
                  <span className="text-[var(--primary-color)] font-bold text-lg">{service.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Bookings:</span>
                  <span className="text-white font-medium">{service.bookings}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-white/70 mb-2">
                  <span>Performance</span>
                  <span>{Math.round((service.bookings / 20) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 bg-gradient-to-r ${service.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min((service.bookings / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] text-[#111714] py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[var(--primary-color)]/25 transition-all duration-300 ripple group">
                  <span className="material-symbols-outlined text-sm mr-1 group-hover:rotate-12 transition-transform">edit</span>
                  Edit
                </button>
                <button 
                  onClick={() => setSelectedService(service)}
                  className="flex-1 bg-red-500/20 text-red-400 py-2 px-4 rounded-lg font-medium hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 ripple group"
                >
                  <span className="material-symbols-outlined text-sm mr-1 group-hover:scale-110 transition-transform">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-gradient-to-br from-[#1a241e] to-[#29382f] rounded-2xl p-6 border border-[#29382f] max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-400 text-2xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Service</h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete "{selectedService.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex-1 bg-[#29382f] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#3a4a3f] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedService.id)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 ripple"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyServices
