import { Link } from "react-router-dom"

const MyServices = () => {
  const services = [
    {
      id: 1,
      name: "Event Security",
      description: "Professional security services for events and gatherings",
      type: "Event Security",
      price: "$50/hr",
      status: "Active",
      bookings: 15
    },
    {
      id: 2,
      name: "Bodyguard Protection",
      description: "Personal protection services for high-profile individuals",
      type: "Bodyguard",
      price: "$75/hr",
      status: "Active",
      bookings: 8
    },
    {
      id: 3,
      name: "Patrol Services",
      description: "Regular patrol and monitoring services for properties",
      type: "Patrol",
      price: "$35/hr",
      status: "Inactive",
      bookings: 3
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Link 
          to="/dashboard/add-service"
          className="bg-[var(--primary-color)] text-[#111714] px-6 py-3 rounded-full font-bold hover:bg-opacity-90 transition-colors"
        >
          Add New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{service.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                service.status === "Active" 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-gray-500/20 text-gray-400"
              }`}>
                {service.status}
              </span>
            </div>
            
            <p className="text-white/70 mb-4">{service.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-white/70">Type:</span>
                <span className="text-white">{service.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Price:</span>
                <span className="text-white font-bold">{service.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Bookings:</span>
                <span className="text-white">{service.bookings}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-[var(--primary-color)] text-[#111714] py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                Edit
              </button>
              <button className="flex-1 bg-red-500/20 text-red-400 py-2 px-4 rounded-lg font-medium hover:bg-red-500/30 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyServices
