import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../lib/supabase"
import { uploadServiceImages, updateServiceImages, uploadGuardTypeImages } from "../utils/imageUpload"
import { checkStorageBuckets } from "../utils/debugBuckets"
import ImageUpload from "../components/ImageUpload"
import PrimaryButton from "../components/ui/PrimaryButton"
import GlassCard from "../components/ui/GlassCard"

const AddService = () => {
  const navigate = useNavigate()
  const { user, hostProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    service_type: "",
    state: "",
    city: "",
    specializations: "",
    equipment_included: "",
    is_active: true
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [subcategories, setSubcategories] = useState({})
  const [customSubcategory, setCustomSubcategory] = useState({ name: "", price: "" })

  const serviceTypes = [
    { value: "guards", label: "Guards" },
    { value: "drones", label: "Drones" },
    { value: "agencies", label: "Agencies" }
  ]

  // Subcategory configurations for each service type
  const serviceSubcategories = {
    guards: [
      { value: "security_guard", label: "Security Guard" },
      { value: "security_supervisor", label: "Security Supervisor" },
      { value: "male_bouncer", label: "Male Bouncer" },
      { value: "female_bouncer", label: "Female Bouncer" },
      { value: "other", label: "Other (Custom)" }
    ],
    drones: [
      { value: "surveillance_drone", label: "Surveillance Drone" },
      { value: "patrol_drone", label: "Patrol Drone" },
      { value: "event_monitoring", label: "Event Monitoring" },
      { value: "other", label: "Other (Custom)" }
    ],
    agencies: [
      { value: "security_agency", label: "Security Agency" },
      { value: "investigation_agency", label: "Investigation Agency" },
      { value: "consulting_agency", label: "Security Consulting" },
      { value: "other", label: "Other (Custom)" }
    ]
  }

  // Removed currency support per requirements

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
      ...(name === "state" && { city: "" }),
      // Reset subcategories when service type changes
      ...(name === "service_type" && { subcategories: {} })
    }))
    
    // Reset subcategories when service type changes
    if (name === "service_type") {
      setSubcategories({})
      setCustomSubcategory({ name: "", price: "" })
    }
    
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubcategoryChange = (subcategoryValue, isChecked) => {
    setSubcategories(prev => {
      const updated = { ...prev }
      if (isChecked) {
        updated[subcategoryValue] = { selected: true, availability: "", images: [] }
      } else {
        delete updated[subcategoryValue]
      }
      return updated
    })
  }

  const handleSubcategoryAvailabilityChange = (subcategoryValue, count) => {
    setSubcategories(prev => ({
      ...prev,
      [subcategoryValue]: {
        ...prev[subcategoryValue],
        availability: count
      }
    }))
  }

  const handleSubcategoryImagesChange = (subcategoryValue, files) => {
    setSubcategories(prev => ({
      ...prev,
      [subcategoryValue]: {
        ...prev[subcategoryValue],
        images: files
      }
    }))
  }

  const handleSubcategoryPricingToggle = (subcategoryValue, enabled) => {
    setSubcategories(prev => ({
      ...prev,
      [subcategoryValue]: {
        ...prev[subcategoryValue],
        pricingEnabled: enabled,
        price: enabled ? (prev[subcategoryValue]?.price || '') : ''
      }
    }))
  }

  const handleSubcategoryPriceChange = (subcategoryValue, price) => {
    setSubcategories(prev => ({
      ...prev,
      [subcategoryValue]: {
        ...prev[subcategoryValue],
        price
      }
    }))
  }

  const handleCustomSubcategoryChange = (field, value) => {
    setCustomSubcategory(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!hostProfile?.verified) {
        setError('Your company is not verified yet. Please wait for admin approval before adding services.')
        return
      }

      // Check for duplicate service type
      const { data: existingServices, error: fetchError } = await db.getHostServices(user.id)
      
      if (fetchError) {
        console.error("Error fetching existing services:", fetchError)
        setError('Failed to check existing services. Please try again.')
        return
      }

      // Check if user already has a service of this type
      const duplicateService = existingServices?.find(service => 
        service.service_type === formData.service_type
      )

      if (duplicateService) {
        setError(`You already have a ${formData.service_type} service named "${duplicateService.service_name}". Each service type can only be added once.`)
        return
      }

      // Parse specializations and equipment as arrays
      const specializations = formData.specializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
      
      const equipment_included = formData.equipment_included
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      // Process subcategories (guards: enable + images + availability)
      const processedSubcategories = {}
      Object.entries(subcategories).forEach(([key, value]) => {
        if (value?.selected) {
          const subcategoryLabel = serviceSubcategories[formData.service_type]?.find(sub => sub.value === key)?.label || key
          processedSubcategories[key] = {
            label: subcategoryLabel,
            enabled: true,
            availability: Number(value.availability || 0) || 0,
            images: []
          }
          if (value.pricingEnabled && value.price) {
            processedSubcategories[key].price_per_hour = parseFloat(value.price)
          }
        }
      })

      // Validation: require at least one enabled guard type with availability > 0 for guards
      if (formData.service_type === 'guards') {
        const anyEnabled = Object.values(processedSubcategories).some(s => s.enabled && s.availability > 0)
        if (!anyEnabled) {
          setError('Please enable at least one guard type and set availability > 0.')
          return
        }
      }

      const serviceData = {
        service_name: formData.name,
        description: formData.description,
        service_type: formData.service_type,
        // removed base pricing and currency per requirements
        state: formData.state,
        city: formData.city,
        specializations: specializations,
        equipment_included: equipment_included,
        // Store subcategories pricing in `sub_category` text column as JSON string
        sub_category: JSON.stringify(processedSubcategories),
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
      
      // Upload general service images if any were selected
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

      // If guards: upload per-subcategory images to guard_services, then update sub_category JSON with URLs
      if (formData.service_type === 'guards') {
        console.log('🔍 Guard service detected, processing subcategory images...')
        console.log('📋 Raw subcategories state:', subcategories)
        console.log('📋 Processed subcategories:', processedSubcategories)
        
        const withImages = { ...processedSubcategories }
        let imageUploadCount = 0
        
        for (const [key, val] of Object.entries(subcategories)) {
          console.log(`🔍 Checking subcategory: ${key}`, val)
          
          if (val?.selected && Array.isArray(val.images) && val.images.length > 0) {
            console.log(`📸 Uploading ${val.images.length} images for subcategory: ${key}`)
            
            try {
              const urls = await uploadGuardTypeImages(data[0].id, user.id, key, val.images)
              console.log(`✅ Uploaded images for ${key}:`, urls)
              
              if (withImages[key]) {
                withImages[key].images = urls
                imageUploadCount += urls.length
              }
            } catch (e) {
              console.error(`❌ Guard type image upload failed for ${key}:`, e)
              console.error('❌ Upload error details:', JSON.stringify(e, null, 2))
            }
          } else {
            console.log(`⚠️ Skipping subcategory ${key} - not selected or no images`)
          }
        }
        
        console.log(`📊 Total images uploaded: ${imageUploadCount}`)
        console.log('📋 Final subcategories with images:', JSON.stringify(withImages, null, 2))
        
        // Persist updated sub_category with image URLs
        const { error: updateError } = await db.updateHostService(data[0].id, { sub_category: JSON.stringify(withImages) })
        if (updateError) {
          console.error('❌ Failed to update service with image URLs:', updateError)
        } else {
          console.log('✅ Service updated with image URLs successfully')
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

  const blockedBanner = !hostProfile?.verified

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

      {blockedBanner && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-400">error</span>
            <p className="text-yellow-300 text-sm">Your company is not verified yet. You cannot add services until an admin verifies your account.</p>
          </div>
        </div>
      )}

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
          {/* Disable entire form if unverified */}
          <fieldset disabled={blockedBanner} className={blockedBanner ? 'opacity-60 pointer-events-none' : ''}>
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

          {/* Subcategories */}
          {formData.service_type && serviceSubcategories[formData.service_type] && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">
                Select Subcategories with Pricing *
              </label>
              <div className="space-y-4 bg-[#1a241e] border border-[#29382f] rounded-lg p-4">
                {serviceSubcategories[formData.service_type].map((subcategory) => (
                  <div key={subcategory.value} className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`subcategory_${subcategory.value}`}
                        checked={subcategories[subcategory.value]?.selected || false}
                        onChange={(e) => handleSubcategoryChange(subcategory.value, e.target.checked)}
                        className="w-4 h-4 text-[var(--primary-color)] bg-[#111714] border-[#29382f] rounded focus:ring-[var(--primary-color)] focus:ring-2"
                      />
                      <label htmlFor={`subcategory_${subcategory.value}`} className="text-white text-sm font-medium">
                        {subcategory.label}
                      </label>
                    </div>
                    
                    {/* Guard type card: enable + images + availability + optional hourly pricing */}
                    {subcategories[subcategory.value]?.selected && (
                      <div className="ml-7 space-y-3">
                        {subcategory.value === 'other' && (
                          <input
                            type="text"
                            placeholder="Custom subcategory name"
                            value={customSubcategory.name}
                            onChange={(e) => handleCustomSubcategoryChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-[#111714] border border-[#29382f] rounded text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/20 transition-all duration-300 text-sm"
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Availability count */}
                          <div className="flex items-center gap-2">
                            <label className="text-white/80 text-sm whitespace-nowrap">Availability</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={subcategories[subcategory.value]?.availability || ''}
                              onChange={(e) => handleSubcategoryAvailabilityChange(subcategory.value, e.target.value)}
                              className="flex-1 px-3 py-2 bg-[#111714] border border-[#29382f] rounded text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/20 transition-all duration-300 text-sm"
                            />
                          </div>

                          {/* Image upload per guard type */}
                          <div>
                            <label className="text-white/80 text-sm block mb-1">Images</label>
                            <ImageUpload
                              images={subcategories[subcategory.value]?.images || []}
                              onImagesChange={(files) => handleSubcategoryImagesChange(subcategory.value, files)}
                              maxImages={3}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        {/* Optional hourly pricing toggle */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`pricing_${subcategory.value}`}
                            checked={subcategories[subcategory.value]?.pricingEnabled || false}
                            onChange={(e) => handleSubcategoryPricingToggle(subcategory.value, e.target.checked)}
                            className="w-4 h-4 text-[var(--primary-color)] bg-[#111714] border-[#29382f] rounded focus:ring-[var(--primary-color)] focus:ring-2"
                          />
                          <label htmlFor={`pricing_${subcategory.value}`} className="text-white text-sm">Enable hourly pricing</label>
                          {subcategories[subcategory.value]?.pricingEnabled && (
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-white/80 text-sm">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Price / hour"
                                value={subcategories[subcategory.value]?.price || ''}
                                onChange={(e) => handleSubcategoryPriceChange(subcategory.value, e.target.value)}
                                className="w-32 px-3 py-2 bg-[#111714] border border-[#29382f] rounded text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]/20 transition-all duration-300 text-sm"
                              />
                              <span className="text-white/60 text-sm">/hour</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-[#111714] rounded-lg border border-[#29382f]/50">
                  <p className="text-white/70 text-xs">
                    💡 Select the subcategories you offer and set individual pricing for each. 
                    This allows clients to choose specific services with transparent pricing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Removed base price and currency per requirements */}

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
              Upload the logo of the company
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
          </fieldset>

          {/* Debug Section */}
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-bold mb-2">🔧 Debug Tools</h3>
            <button
              type="button"
              onClick={checkStorageBuckets}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Check Storage Buckets
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <PrimaryButton type="submit" disabled={isLoading || blockedBanner} className="flex-1">
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
