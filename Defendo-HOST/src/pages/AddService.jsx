import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../lib/supabase"
import { uploadServiceImages, updateServiceImages } from "../utils/imageUpload"
import ImageUpload from "../components/ImageUpload"
import PrimaryButton from "../components/ui/PrimaryButton"
import GlassCard from "../components/ui/GlassCard"

const AddService = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service_type: "",
    price_per_hour: "",
    currency: "INR",
    state: "",
    city: "",
    specializations: "",
    equipment_included: "",
    is_active: true
  })
  const [selectedImages, setSelectedImages] = useState([])

  const serviceTypes = [
    { value: "guards", label: "Guards" },
    { value: "drones", label: "Drones" },
    { value: "studios", label: "Studios" },
    { value: "agencies", label: "Agencies" }
  ]

  const currencies = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" }
  ]

  // Indian States and Cities
  const indianStates = [
    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
    { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
    { value: "Assam", label: "Assam" },
    { value: "Bihar", label: "Bihar" },
    { value: "Chhattisgarh", label: "Chhattisgarh" },
    { value: "Goa", label: "Goa" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Haryana", label: "Haryana" },
    { value: "Himachal Pradesh", label: "Himachal Pradesh" },
    { value: "Jharkhand", label: "Jharkhand" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kerala", label: "Kerala" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Manipur", label: "Manipur" },
    { value: "Meghalaya", label: "Meghalaya" },
    { value: "Mizoram", label: "Mizoram" },
    { value: "Nagaland", label: "Nagaland" },
    { value: "Odisha", label: "Odisha" },
    { value: "Punjab", label: "Punjab" },
    { value: "Rajasthan", label: "Rajasthan" },
    { value: "Sikkim", label: "Sikkim" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Telangana", label: "Telangana" },
    { value: "Tripura", label: "Tripura" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Uttarakhand", label: "Uttarakhand" },
    { value: "West Bengal", label: "West Bengal" },
    { value: "Delhi", label: "Delhi" },
    { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
    { value: "Ladakh", label: "Ladakh" },
    { value: "Puducherry", label: "Puducherry" },
    { value: "Chandigarh", label: "Chandigarh" },
    { value: "Andaman and Nicobar Islands", label: "Andaman and Nicobar Islands" },
    { value: "Dadra and Nagar Haveli and Daman and Diu", label: "Dadra and Nagar Haveli and Daman and Diu" },
    { value: "Lakshadweep", label: "Lakshadweep" }
  ]

  const indianCities = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kadapa", "Anantapur", "Chittoor", "Rajahmundry"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Dibrugarh", "Tinsukia", "Jorhat", "Sibsagar", "North Lakhimpur", "Bongaigaon"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Durg", "Raigarh", "Ambikapur", "Mahasamund", "Bastar"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Mormugao", "Bicholim", "Sanguem", "Canacona", "Pernem"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Nadiad", "Morbi"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Kullu", "Manali", "Chamba", "Baddi", "Una"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Malappuram", "Kannur", "Kasaragod", "Alappuzha"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati", "Tamenglong", "Chandel", "Ukhrul", "Kakching", "Jiribam"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Williamnagar", "Nongpoh", "Mairang", "Khliehriat", "Resubelpara"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Lawngtlai", "Mamit", "Saitual", "Hnahthial"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Phek", "Zunheboto", "Kiphire", "Longleng"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala", "Pathankot", "Moga"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bharatpur", "Alwar", "Bhilwara", "Ganganagar"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Singtam", "Rangpo", "Jorethang", "Pakyong", "Ravangla", "Lachen"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukkudi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
    "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Ambassa", "Kailashahar", "Belonia", "Khowai", "Teliamura", "Sabroom", "Amarpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Ghaziabad", "Moradabad", "Aligarh"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Kashipur", "Rudrapur", "Haldwani", "Rishikesh", "Ramnagar", "Pithoragarh", "Srinagar"],
    "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"],
    "Delhi": ["New Delhi", "Central Delhi", "East Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur", "Punch", "Rajauri", "Doda"],
    "Ladakh": ["Leh", "Kargil", "Drass", "Nubra", "Zanskar", "Changthang", "Suru", "Sham", "Nubra Valley", "Hemis"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Chandigarh": ["Chandigarh"],
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Hut Bay", "Car Nicobar", "Nancowry", "Katchal", "Teressa", "Campbell Bay"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
    "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Kadmat", "Kalpeni", "Kiltan", "Minicoy", "Chetlat", "Bitra"]
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset city when state changes
      ...(name === "state" && { city: "" })
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Parse specializations and equipment as arrays
      const specializations = formData.specializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      const equipment_included = formData.equipment_included
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      const serviceData = {
        service_name: formData.name,
        description: formData.description,
        service_type: formData.service_type,
        price_per_hour: parseFloat(formData.price_per_hour),
        currency: formData.currency,
        state: formData.state,
        city: formData.city,
        specializations: specializations,
        equipment_included: equipment_included,
        is_active: formData.is_active
      }

      console.log("Adding service:", serviceData)

      const { data, error } = await db.addHostService(user.id, serviceData)

      if (error) {
        console.error("Error adding service:", error)
        setError(error.message)
        return
      }

      console.log("Service added successfully:", data)
      
      // Upload images if any were selected
      if (selectedImages.length > 0) {
        try {
          console.log("Uploading images...")
          const uploadedUrls = await uploadServiceImages(data[0].id, user.id, selectedImages)
          console.log("Images uploaded:", uploadedUrls)
          
          // Update service with image URLs
          await updateServiceImages(data[0].id, uploadedUrls)
          console.log("Service updated with images")
        } catch (imageError) {
          console.error("Error uploading images:", imageError)
          // Don't fail the entire operation if image upload fails
          setError(`Service created but image upload failed: ${imageError.message}`)
        }
      }
      
      navigate('/dashboard/services')
      
    } catch (err) {
      console.error("Exception adding service:", err)
      setError(err.message || 'Failed to add service')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
          <h1 className="text-4xl font-bold gradient-text animate-slide-in-left">Add New Service</h1>
          <p className="text-white/70 mt-2 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            Create a new security service offering
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm animate-slide-in-top">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <GlassCard className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Service Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
              placeholder="e.g., Event Security, Bodyguard Protection"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-white">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 resize-none"
              placeholder="Describe your service in detail, including what clients can expect..."
              required
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <label htmlFor="service_type" className="block text-sm font-medium text-white">
              Service Type *
            </label>
            <select
              id="service_type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
              required
            >
              <option value="">Select service type</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Price and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price_per_hour" className="block text-sm font-medium text-white">
                Price per Hour *
              </label>
              <input
                type="number"
                id="price_per_hour"
                name="price_per_hour"
                value={formData.price_per_hour}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
                placeholder="50.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="block text-sm font-medium text-white">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>{currency.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* State and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-medium text-white">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
                required
              >
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-white">
                City *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select City</option>
                {formData.state && indianCities[formData.state]?.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-2">
            <label htmlFor="specializations" className="block text-sm font-medium text-white">
              Specializations
            </label>
            <input
              type="text"
              id="specializations"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
              placeholder="e.g., Crowd Control, Access Control, Emergency Response (comma-separated)"
            />
            <p className="text-xs text-white/60">Separate multiple specializations with commas</p>
          </div>

          {/* Equipment Included */}
          <div className="space-y-2">
            <label htmlFor="equipment_included" className="block text-sm font-medium text-white">
              Equipment Included
            </label>
            <input
              type="text"
              id="equipment_included"
              name="equipment_included"
              value={formData.equipment_included}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1a241e] border border-[#29382f] rounded-lg text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300"
              placeholder="e.g., Radio Communication, First Aid Kit, Flashlight (comma-separated)"
            />
            <p className="text-xs text-white/60">Separate multiple equipment items with commas</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Service Images
            </label>
            <ImageUpload
              images={selectedImages}
              onImagesChange={setSelectedImages}
              maxImages={5}
              disabled={isLoading}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-[var(--primary-color)] bg-[#1a241e] border-[#29382f] rounded focus:ring-[var(--primary-color)] focus:ring-2"
            />
            <label htmlFor="is_active" className="text-sm text-white">
              Service is currently available for booking
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <PrimaryButton type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#111714] border-t-transparent rounded-full animate-spin"></div>
                  Adding Service...
                </div>
              ) : (
                'Add Service'
              )}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => navigate('/dashboard/services')}
              className="flex-1 bg-[#29382f] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#3a4a3f] transition-all duration-300 ripple"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

export default AddService
