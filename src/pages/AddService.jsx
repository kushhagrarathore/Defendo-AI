import { useState } from "react"

const AddService = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    price: "",
    availability: true
  })

  const serviceTypes = [
    "Guards",
    "Bodyguards", 
    "Event Security",
    "Patrols",
    "Personal Protection",
    "Crowd Control"
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Service data:", formData)
    // Here you would typically send the data to your backend
    alert("Service added successfully!")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Add New Service</h1>
      
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Service Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              placeholder="Enter service name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              placeholder="Describe your service in detail"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
              Service Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              required
            >
              <option value="">Select service type</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
              Price per Hour
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              placeholder="e.g., $50"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="availability"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="h-4 w-4 text-[var(--primary-color)] bg-[#1a241e] border-[#29382f] rounded focus:ring-[var(--primary-color)]"
            />
            <label htmlFor="availability" className="ml-2 block text-sm text-white">
              Service is currently available
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-[var(--primary-color)] text-[#111714] py-3 px-6 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Add Service
            </button>
            <button
              type="button"
              className="flex-1 bg-[#29382f] text-white py-3 px-6 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddService
