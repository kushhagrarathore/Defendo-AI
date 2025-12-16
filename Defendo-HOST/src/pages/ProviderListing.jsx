import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import UserHeader from "../components/UserHeader"

// Mock provider data
const mockProviders = [
  {
    id: 1,
    name: "Aegis Security Services",
    location: "Mumbai, Maharashtra",
    area: "Andheri West",
    price: "₹2,500",
    priceUnit: "per night",
    rating: 4.9,
    reviews: 320,
    guardTypes: ["Male", "Female"],
    tags: ["Verified", "Govt Certified", "24×7 Support"],
    description: "Professional night guard services with 10+ years of experience",
    logo: "🛡️"
  },
  {
    id: 2,
    name: "Guardian Shield Pvt Ltd",
    location: "Mumbai, Maharashtra",
    area: "Bandra East",
    price: "₹2,200",
    priceUnit: "per night",
    rating: 4.8,
    reviews: 245,
    guardTypes: ["Male"],
    tags: ["Verified", "24×7 Support"],
    description: "Reliable security solutions with trained professionals",
    logo: "🔒"
  },
  {
    id: 3,
    name: "SecureForce India",
    location: "Mumbai, Maharashtra",
    area: "Powai",
    price: "₹2,800",
    priceUnit: "per night",
    rating: 5.0,
    reviews: 189,
    guardTypes: ["Male", "Female", "Armed"],
    tags: ["Verified", "Govt Certified", "24×7 Support", "Premium"],
    description: "Premium security services with armed guards available",
    logo: "⚔️"
  },
  {
    id: 4,
    name: "NightWatch Security",
    location: "Mumbai, Maharashtra",
    area: "Juhu",
    price: "₹2,100",
    priceUnit: "per night",
    rating: 4.7,
    reviews: 156,
    guardTypes: ["Male"],
    tags: ["Verified", "24×7 Support"],
    description: "Affordable night guard services for residential areas",
    logo: "🌙"
  },
  {
    id: 5,
    name: "Elite Protection Services",
    location: "Mumbai, Maharashtra",
    area: "Worli",
    price: "₹3,000",
    priceUnit: "per night",
    rating: 4.9,
    reviews: 278,
    guardTypes: ["Male", "Female", "Armed"],
    tags: ["Verified", "Govt Certified", "24×7 Support", "Premium"],
    description: "Elite security services for high-end properties",
    logo: "👑"
  }
]

const categoryNames = {
  "night-guard": "Night Guard",
  "day-guard": "Day Guard",
  "male-guard": "Male Guard",
  "female-guard": "Female Guard",
  "bouncer": "Bouncer",
  "event-security": "Event Security",
  "emergency-response": "Emergency Response",
  "corporate-security": "Corporate Security",
  "industrial-security": "Industrial Security",
  "personal-bodyguard": "Personal Bodyguard"
}

const ProviderListing = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  
  const [filters, setFilters] = useState({
    location: "",
    priceRange: [500, 5000],
    guardType: [],
    rating: 0,
    experience: [0, 20]
  })

  const categoryName = categoryNames[categoryId] || "Security Guard"

  const filteredProviders = useMemo(() => {
    let filtered = [...mockProviders]

    // Filter by guard type
    if (filters.guardType.length > 0) {
      filtered = filtered.filter(provider =>
        filters.guardType.some(type => provider.guardTypes.includes(type))
      )
    }

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(provider => provider.rating >= filters.rating)
    }

    // Filter by price range
    const minPrice = parseInt(filters.priceRange[0])
    const maxPrice = parseInt(filters.priceRange[1])
    filtered = filtered.filter(provider => {
      const price = parseInt(provider.price.replace(/[₹,]/g, ''))
      return price >= minPrice && price <= maxPrice
    })

    return filtered
  }, [filters])

  const handleGuardTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      guardType: prev.guardType.includes(type)
        ? prev.guardType.filter(t => t !== type)
        : [...prev.guardType, type]
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />
      
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/book")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1A1A1A] mb-4 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Categories</span>
          </button>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
            {categoryName} Providers
          </h1>
          <p className="text-lg text-gray-600">
            Showing {filteredProviders.length} services available near you
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Filters</h2>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="delhi">Delhi</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="pune">Pune</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Guard Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Guard Type
                </label>
                <div className="space-y-2">
                  {["Male", "Female", "Armed", "Unarmed"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.guardType.includes(type)}
                        onChange={() => handleGuardTypeToggle(type)}
                        className="w-4 h-4 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4, 4.5, 4.8].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => setFilters(prev => ({ ...prev, rating }))}
                        className="w-4 h-4 text-[#DAA520] border-gray-300 focus:ring-[#DAA520]"
                      />
                      <span className="text-sm text-gray-700">{rating}+ stars</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === 0}
                      onChange={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                      className="w-4 h-4 text-[#DAA520] border-gray-300 focus:ring-[#DAA520]"
                    />
                    <span className="text-sm text-gray-700">All Ratings</span>
                  </label>
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience: {filters.experience[0]} - {filters.experience[1]} years
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={filters.experience[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    experience: [prev.experience[0], parseInt(e.target.value)]
                  }))}
                  className="w-full"
                />
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => setFilters({
                  location: "",
                  priceRange: [500, 5000],
                  guardType: [],
                  rating: 0,
                  experience: [0, 20]
                })}
                className="w-full py-2 text-sm text-gray-600 hover:text-[#1A1A1A] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Right Section - Provider Cards */}
          <div className="space-y-6">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-[#F7F7F7] flex items-center justify-center text-4xl">
                      {provider.logo}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-[#1A1A1A] mb-1">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          <span className="text-sm">{provider.location} • {provider.area}</span>
                        </div>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#1A1A1A]">
                          {provider.price}
                        </div>
                        <div className="text-sm text-gray-600">{provider.priceUnit}</div>
                      </div>
                    </div>

                    {/* Guard Types */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.guardTypes.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-[#F7F7F7] text-gray-700 rounded-full text-xs font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {provider.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tag === "Premium"
                              ? "bg-[#DAA520]/10 text-[#DAA520]"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-[#DAA520] text-xl">
                            star
                          </span>
                          <span className="font-semibold text-[#1A1A1A] ml-1">
                            {provider.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({provider.reviews} reviews)
                        </span>
                      </div>

                      <button className="px-6 py-2 bg-[#DAA520] text-white rounded-full font-semibold hover:bg-[#c4941a] transition-colors shadow-md hover:shadow-lg">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                  search_off
                </span>
                <p className="text-lg text-gray-600">No providers found matching your filters</p>
                <button
                  onClick={() => setFilters({
                    location: "",
                    priceRange: [500, 5000],
                    guardType: [],
                    rating: 0,
                    experience: [0, 20]
                  })}
                  className="mt-4 text-[#DAA520] hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProviderListing

























