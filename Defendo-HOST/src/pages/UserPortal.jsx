import { useState, useEffect } from "react"
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"
import BrandLogo from "../components/BrandLogo"
import UserLayout from "../components/UserLayout"
import UserDashboard from "./UserDashboard"
import UserBookings from "./UserBookings"
import UserAccount from "./UserAccount"
import CompanyServices from "./CompanyServices"

// Golden Yellow accent color
const GOLDEN_YELLOW = "#DAA520"
const SOFT_GREY = "#F7F7F7"
const BLACK_TEXT = "#1A1A1A"

// Service categories with icons
const serviceCategories = [
  { id: "night-guard", name: "Night Guard", icon: "🌙" },
  { id: "day-guard", name: "Day Guard", icon: "🌤️" },
  { id: "male-guard", name: "Male Guard", icon: "👨‍💼" },
  { id: "female-guard", name: "Female Guard", icon: "👩‍💼" },
  { id: "bouncer", name: "Bouncer", icon: "🛡️" },
  { id: "event-security", name: "Event Security", icon: "🎪" },
  { id: "emergency-response", name: "Emergency Response", icon: "🚨" },
  { id: "corporate-security", name: "Corporate Security", icon: "🏢" },
  { id: "industrial-security", name: "Industrial Security", icon: "🏭" },
  { id: "personal-bodyguard", name: "Personal Bodyguard", icon: "🤵" },
]

// Service Selection Component (Screen 1 & 2)
const ServiceSelection = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [providers, setProviders] = useState([])
  const [topCompanies, setTopCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    location: "",
    priceRange: [0, 10000],
    guardType: "",
    minRating: 0,
    experience: [0, 20],
  })

  // Handle search query from URL
  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setSearchQuery(search)
      // If there's a search query, fetch all providers and filter by search
      fetchAllProviders(search)
    }
  }, [searchParams])

  // Fetch all providers on initial load (when no category selected and no search)
  useEffect(() => {
    if (!selectedCategory && !searchQuery) {
      fetchAllProvidersInitial()
      fetchTopCompanies()
    }
  }, [])

  // Fetch providers when category is selected
  useEffect(() => {
    if (selectedCategory && !searchQuery) {
      fetchProviders()
    }
  }, [selectedCategory, filters])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      // Build base query
      let query = supabase
        .from("host_services")
        .select("*")
        .eq("is_active", true)

      // Filter by service type/category
      if (selectedCategory) {
        const serviceTypeMap = {
          "night-guard": "guards",
          "day-guard": "guards",
          "male-guard": "guards",
          "female-guard": "guards",
          "bouncer": "guards",
          "event-security": "agencies",
          "emergency-response": "agencies",
          "corporate-security": "agencies",
          "industrial-security": "agencies",
          "personal-bodyguard": "agencies",
        }
        const serviceType = serviceTypeMap[selectedCategory.id] || "guards"
        query = query.eq("service_type", serviceType)
      }

      // Filter by location
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`)
      }

      const { data: servicesData, error: servicesError } = await query

      if (servicesError) {
        console.error("Error fetching providers:", servicesError)
        setProviders([])
        return
      }

      if (!servicesData || servicesData.length === 0) {
        setProviders([])
        return
      }

      // Get unique provider/host IDs
      const providerIds = [...new Set(
        servicesData
          .map(s => s.provider_id)
          .filter(Boolean)
      )]
      
      // Fetch host profiles separately
      let profilesData = []
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("host_profiles")
          .select("id, company_name, full_name, rating, phone, address, avatar_url, logo_path")
          .in("id", providerIds)
        
        if (!profilesError && profiles) {
          profilesData = profiles
        }
      }
      
      // Merge profiles with services
      let filtered = servicesData.map(service => {
        const hostId = service.provider_id
        const profile = profilesData.find(p => p.id === hostId) || null
        return {
          ...service,
          host_profiles: profile
        }
      })
      
      // Price filter
      if (filters.priceRange[1] < 10000) {
        filtered = filtered.filter(
          (p) =>
            (p.price_per_hour || 0) >= filters.priceRange[0] &&
            (p.price_per_hour || 0) <= filters.priceRange[1]
        )
      }

      // Rating filter
      if (filters.minRating > 0) {
        filtered = filtered.filter(
          (p) => (p.host_profiles?.rating || 0) >= filters.minRating
        )
      }

      setProviders(filtered)
    } catch (error) {
      console.error("Error fetching providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProvidersInitial = async () => {
    setLoading(true)
    try {
      // Fetch services without join (more reliable)
      const { data: servicesData, error: servicesError } = await supabase
        .from("host_services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50)
      
      if (servicesError) {
        console.error("Error fetching services:", servicesError)
        setProviders([])
        return
      }
      
      if (!servicesData || servicesData.length === 0) {
        console.log("No active services found")
        setProviders([])
        return
      }
      
      // Get unique provider/host IDs
      const providerIds = [...new Set(
        servicesData
          .map(s => s.provider_id)
          .filter(Boolean)
      )]
      
      // Fetch host profiles separately
      let profilesData = []
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("host_profiles")
          .select("id, company_name, full_name, rating, phone, address, avatar_url, logo_path")
          .in("id", providerIds)
        
        if (!profilesError && profiles) {
          profilesData = profiles
        }
      }
      
      // Merge profiles with services
      const merged = servicesData.map(service => {
        const hostId = service.provider_id
        const profile = profilesData.find(p => p.id === hostId) || null
        return {
          ...service,
          host_profiles: profile
        }
      })
      
      console.log(`✅ Fetched ${merged.length} services with profiles`)
      setProviders(merged)
    } catch (error) {
      console.error("Error fetching providers:", error)
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProviders = async (searchTerm) => {
    setLoading(true)
    try {
      // Fetch all active services
      const { data: servicesData, error: servicesError } = await supabase
        .from("host_services")
        .select("*")
        .eq("is_active", true)
      
      if (servicesError) {
        console.error("Error fetching providers for search:", servicesError)
        setProviders([])
        return
      }
      
      if (!servicesData || servicesData.length === 0) {
        setProviders([])
        return
      }
      
      // Get unique provider/host IDs
      const providerIds = [...new Set(
        servicesData
          .map(s => s.provider_id)
          .filter(Boolean)
      )]
      
      // Fetch host profiles separately
      let profilesData = []
      if (providerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("host_profiles")
          .select("id, company_name, full_name, rating, phone, address, avatar_url, logo_path")
          .in("id", providerIds)
        
        if (!profilesError && profiles) {
          profilesData = profiles
        }
      }
      
      // Merge profiles with services
      const merged = servicesData.map(service => {
        const hostId = service.provider_id
        const profile = profilesData.find(p => p.id === hostId) || null
        return {
          ...service,
          host_profiles: profile
        }
      })
      
      // Apply search filter
      let filtered = merged.filter((service) => {
        const searchLower = searchTerm.toLowerCase()
        const companyName = service.host_profiles?.company_name?.toLowerCase() || ""
        const fullName = service.host_profiles?.full_name?.toLowerCase() || ""
        const serviceName = service.service_name?.toLowerCase() || ""
        const description = service.description?.toLowerCase() || ""
        const city = service.city?.toLowerCase() || service.host_profiles?.city?.toLowerCase() || ""
        const state = service.state?.toLowerCase() || service.host_profiles?.state?.toLowerCase() || ""
        const serviceType = service.service_type?.toLowerCase() || ""
        const subCategory = service.sub_category?.toLowerCase() || ""
        const specializations = (service.specializations || []).join(" ").toLowerCase()

        return (
          companyName.includes(searchLower) ||
          fullName.includes(searchLower) ||
          serviceName.includes(searchLower) ||
          description.includes(searchLower) ||
          city.includes(searchLower) ||
          state.includes(searchLower) ||
          serviceType.includes(searchLower) ||
          subCategory.includes(searchLower) ||
          specializations.includes(searchLower)
        )
      })

      // Auto-select a category if search matches
      const matchedCategory = serviceCategories.find((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (matchedCategory) {
        setSelectedCategory(matchedCategory)
      }
      
      setProviders(filtered)
    } catch (error) {
      console.error("Error fetching providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearchQuery("") // Clear search when selecting category
    setSearchParams({}) // Clear URL search params
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setProviders([])
    setSearchQuery("")
    setSearchParams({}) // Clear URL search params
  }

  const fetchTopCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const { data: services, error: servicesError } = await supabase
        .from("host_services")
        .select("id, provider_id, service_name, description, price, location, images")
        .eq("is_active", true)
      if (servicesError) {
        console.error("Error fetching services:", servicesError)
        setTopCompanies([])
        return
      }
      console.log("Fetched services:", services)

      const hostIds = [...new Set((services || []).map(s => s.provider_id))]
      if (hostIds.length === 0) {
        setTopCompanies([])
        return
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("host_profiles")
        .select("id, company_name, full_name, rating, phone, address, avatar_url, logo_path")
        .in("id", hostIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        setTopCompanies([])
        return
      }

      console.log("Fetched profiles:", profiles)

      // Simple merge: attach first service image/price to profile for display
      const merged = (profiles || []).map(profile => {
        const svc = (services || []).find(s => s.provider_id === profile.id) || {}
        return {
          ...profile,
          sampleImage: Array.isArray(svc.images) && svc.images.length > 0 ? svc.images[0] : null,
          samplePrice: svc.price_per_hour || svc.price || null,
          sampleService: svc.service_name || null,
        }
      })

      setTopCompanies(merged)
    } catch (error) {
      console.error("Error fetching top companies:", error)
      setTopCompanies([])
    } finally {
      setLoadingCompanies(false)
    }
  }

  const handleViewDetails = (provider) => {
    // Navigate to the company services page so users can see all categories and pricing
    const providerId = provider?.provider_id || provider?.host_profiles?.id
    if (!providerId) {
      console.warn("No provider ID found for View Details action", provider)
      return
    }

    navigate(`/user-portal/company/${providerId}`)
  }

  // SCREEN 1: Category Selection or Search Results
  if (!selectedCategory) {
    // Show search results if there's a search query
    if (searchQuery) {
      return (
        <UserLayout>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
              Search Results
            </h1>
            <p className="text-gray-600">
              {loading ? (
                "Searching..."
              ) : providers.length > 0 ? (
                <>
                  Found {providers.length} {providers.length === 1 ? "service" : "services"} for "{searchQuery}"
                </>
              ) : (
                <>
                  No services found for "{searchQuery}"
                </>
              )}
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : providers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
                >
                  {/* Service Image or Logo */}
                  {provider.images && provider.images.length > 0 ? (
                    <img
                      src={provider.images[0]}
                      alt={provider.service_name || "Service"}
                      className="w-full h-32 rounded-xl object-cover mb-4"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
                      {provider.host_profiles?.company_name?.[0]?.toUpperCase() || provider.service_name?.[0]?.toUpperCase() || "G"}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1" style={{ color: BLACK_TEXT }}>
                      {provider.service_name || provider.host_profiles?.company_name || provider.host_profiles?.full_name || "Security Service"}
                    </h3>
                    {provider.host_profiles?.company_name && provider.service_name && (
                      <p className="text-xs text-gray-500 mb-2">by {provider.host_profiles.company_name}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>
                        {provider.city || provider.host_profiles?.city || "City"}, {provider.state || provider.host_profiles?.state || "State"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                      <span className="text-sm font-semibold">
                        {Number(provider.rating ?? provider.host_profiles?.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">({provider.total_bookings || 0})</span>
                    </div>
                    {provider.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {provider.description}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-2xl font-bold mb-1" style={{ color: GOLDEN_YELLOW }}>
                      ₹{provider.price_per_hour || provider.price || 0}
                      <span className="text-sm font-normal text-gray-600">
                        {provider.price_per_hour ? "/hour" : provider.price ? "/service" : ""}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(provider)}
                    className="w-full py-2.5 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                    style={{ backgroundColor: GOLDEN_YELLOW }}
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK_TEXT }}>
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try searching with different keywords or browse by category
              </p>
              <button
                onClick={handleBackToCategories}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                style={{ backgroundColor: GOLDEN_YELLOW }}
              >
                Browse Categories
              </button>
            </div>
          )}
        </UserLayout>
      )
    }

    // Show category selection if no search or no results
    return (
      <UserLayout>
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: BLACK_TEXT }}>
              Book a Security Guard
            </h1>
            <p className="text-lg text-gray-600">Choose from trusted professionals</p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {serviceCategories.map((category) => {
              const isSelected = selectedCategory?.id === category.id
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-8 bg-white rounded-3xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-yellow-400 shadow-xl"
                      : "border-transparent hover:border-yellow-400 shadow-sm hover:shadow-xl"
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(218, 165, 32, 0.2)"
                      : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-lg font-semibold" style={{ color: BLACK_TEXT }}>
                    {category.name}
                  </h3>
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity"
                    style={{ backgroundColor: GOLDEN_YELLOW }}
                  />
                </motion.button>
              )
            })}
          </div>

          {/* Top Companies Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
                  Top Companies
                </h2>
                <p className="text-gray-600">
                  {loadingCompanies ? "Loading..." : `Showing ${topCompanies.length} ${topCompanies.length === 1 ? "company" : "companies"}`}
                </p>
              </div>
            </div>

            {loadingCompanies ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : topCompanies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topCompanies.map((company) => (
                  <motion.div
                    key={company.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onClick={() => {
                      // Navigate to company services page
                      navigate(`/user-portal/company/${company.id}`)
                    }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    {/* Company Logo */}
                    {company.logo_path ? (
                      <img
                        src={company.logo_path}
                        alt={company.company_name || company.full_name}
                        className="w-16 h-16 rounded-xl object-cover mb-4 mx-auto"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto ${company.logo_path ? "hidden" : ""}`}
                    >
                      {(company.company_name || company.full_name || "C")[0].toUpperCase()}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-1" style={{ color: BLACK_TEXT }}>
                        {company.company_name || company.full_name || "Company"}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                        <span className="text-sm font-semibold">
                          {Number(company.avgRating ?? company.rating ?? 0).toFixed(1)}
                        </span>
                      </div>

                      {company.verified && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mb-2">
                          Verified
                        </span>
                      )}

                      <div className="text-xs text-gray-600 space-y-1 mt-2">
                        {company.totalServices > 0 && (
                          <p>{company.totalServices} {company.totalServices === 1 ? "service" : "services"}</p>
                        )}
                        {company.totalBookings > 0 && (
                          <p>{company.totalBookings} bookings</p>
                        )}
                        {(company.city || company.state) && (
                          <p className="flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {company.city || ""} {company.state ? (company.city ? ", " : "") + company.state : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <p className="text-gray-600">No companies available at the moment</p>
              </div>
            )}
          </div>

          {/* All Available Services Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
                  All Available Services
                </h2>
                <p className="text-gray-600">
                  {loading ? "Loading..." : `Showing ${providers.length} ${providers.length === 1 ? "service" : "services"}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : providers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <motion.div
                    key={provider.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
                  >
                    {/* Service Image or Logo */}
                    {provider.images && provider.images.length > 0 ? (
                      <img
                        src={provider.images[0]}
                        alt={provider.service_name || "Service"}
                        className="w-full h-32 rounded-xl object-cover mb-4"
                        onError={(e) => {
                          e.target.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mb-4">
                        {provider.host_profiles?.company_name?.[0]?.toUpperCase() || provider.service_name?.[0]?.toUpperCase() || "G"}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-bold mb-1" style={{ color: BLACK_TEXT }}>
                        {provider.service_name || provider.host_profiles?.company_name || provider.host_profiles?.full_name || "Security Service"}
                      </h3>
                      {provider.host_profiles?.company_name && provider.service_name && (
                        <p className="text-xs text-gray-500 mb-2">by {provider.host_profiles.company_name}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span>
                          {provider.city || provider.host_profiles?.city || "City"}, {provider.state || provider.host_profiles?.state || "State"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                        <span className="text-sm font-semibold">
                          {Number(provider.rating ?? provider.host_profiles?.rating ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">({provider.total_bookings || 0})</span>
                      </div>
                      {provider.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                          {provider.description}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-2xl font-bold mb-1" style={{ color: GOLDEN_YELLOW }}>
                        ₹{provider.price_per_hour || provider.price || 0}
                        <span className="text-sm font-normal text-gray-600">
                          {provider.price_per_hour ? "/hour" : provider.price ? "/service" : ""}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(provider)}
                      className="w-full py-2.5 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
                      style={{ backgroundColor: GOLDEN_YELLOW }}
                    >
                      View Details
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK_TEXT }}>
                  No services available
                </h3>
                <p className="text-gray-600">
                  Check back later for new services
                </p>
              </div>
            )}
          </div>
      </UserLayout>
    )
  }

  // SCREEN 2: Provider Listing
  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleBackToCategories}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Categories</span>
        </button>
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
            {selectedCategory.name} Providers
          </h1>
          <p className="text-gray-600">
            Showing {providers.length} {providers.length === 1 ? "service" : "services"} available near you
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 h-fit sticky top-24">
            <h2 className="text-lg font-semibold mb-6" style={{ color: BLACK_TEXT }}>
              Filters
            </h2>

            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City or area"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)],
                      })
                    }
                    className="flex-1"
                    style={{ accentColor: GOLDEN_YELLOW }}
                  />
                </div>
              </div>

              {/* Guard Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guard Type</label>
                <div className="space-y-2">
                  {["Male", "Female", "Armed", "Unarmed"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="guardType"
                        value={type.toLowerCase()}
                        checked={filters.guardType === type.toLowerCase()}
                        onChange={(e) => setFilters({ ...filters, guardType: e.target.value })}
                        className="w-4 h-4"
                        style={{ accentColor: GOLDEN_YELLOW }}
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
                  style={{ backgroundColor: SOFT_GREY }}
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4★ and above</option>
                  <option value={4.5}>4.5★ and above</option>
                  <option value={4.8}>4.8★ and above</option>
                </select>
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
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      experience: [filters.experience[0], parseInt(e.target.value)],
                    })
                  }
                  className="w-full"
                  style={{ accentColor: GOLDEN_YELLOW }}
                />
              </div>

              {/* Reset Filters */}
              <button
                onClick={() =>
                  setFilters({
                    location: "",
                    priceRange: [0, 10000],
                    guardType: "",
                    minRating: 0,
                    experience: [0, 20],
                  })
                }
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Right Section - Provider Cards */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No providers found matching your criteria.</p>
                <button
                  onClick={() =>
                    setFilters({
                      location: "",
                      priceRange: [0, 10000],
                      guardType: "",
                      minRating: 0,
                      experience: [0, 20],
                    })
                  }
                  className="mt-4 px-6 py-2 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300"
                >
                  <div className="flex gap-6">
                    {/* Company Logo/Image */}
                    {provider.images && provider.images.length > 0 ? (
                      <img
                        src={provider.images[0]}
                        alt={provider.service_name || "Service"}
                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = "none"
                          e.target.nextSibling.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 ${provider.images && provider.images.length > 0 ? "hidden" : ""}`}
                    >
                      {provider.host_profiles?.company_name?.[0]?.toUpperCase() || provider.service_name?.[0]?.toUpperCase() || "G"}
                    </div>

                    {/* Provider Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1" style={{ color: BLACK_TEXT }}>
                            {provider.service_name || provider.host_profiles?.company_name || provider.host_profiles?.full_name || "Security Provider"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            <span>
                              {provider.city || provider.host_profiles?.city || "City"}, {provider.state || provider.host_profiles?.state || "State"}
                            </span>
                          </div>
                          {provider.host_profiles?.company_name && (
                            <p className="text-sm text-gray-500 mt-1">
                              by {provider.host_profiles.company_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold mb-1" style={{ color: GOLDEN_YELLOW }}>
                            ₹{provider.price_per_hour || provider.price || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.price_per_hour || provider.price ? `per ${provider.price_per_hour ? "hour" : "service"}` : "Contact for pricing"}
                          </div>
                        </div>
                      </div>

                      {/* Rating & Tags */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-400">star</span>
                          <span className="font-semibold">
                            {Number(provider.rating ?? provider.host_profiles?.rating ?? 0).toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">({provider.total_bookings || 0} bookings)</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {provider.host_profiles?.verified && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Verified
                            </span>
                          )}
                          {(() => {
                            // Parse sub_category JSON and display subcategory labels
                            try {
                              if (provider.sub_category) {
                                const subcats = typeof provider.sub_category === 'string' 
                                  ? JSON.parse(provider.sub_category) 
                                  : provider.sub_category
                                if (subcats && typeof subcats === 'object') {
                                  const subcatKeys = Object.keys(subcats).slice(0, 2) // Show max 2 subcategories
                                  return subcatKeys.map((key, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                      {subcats[key]?.label || key}
                                    </span>
                                  ))
                                }
                              }
                            } catch (e) {
                              // If parsing fails, don't show anything
                            }
                            return null
                          })()}
                          {provider.specializations && provider.specializations.length > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {provider.specializations[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {provider.description || "Professional security services with verified guards and 24/7 support."}
                      </p>

                      {/* Specializations & Equipment */}
                      {(provider.specializations && provider.specializations.length > 0) || (provider.equipment_included && provider.equipment_included.length > 0) ? (
                        <div className="mb-4 space-y-2">
                          {provider.specializations && provider.specializations.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-gray-500">Specializations:</span>
                              {provider.specializations.slice(0, 3).map((spec, idx) => (
                                <span key={idx} className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-700">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                          {provider.equipment_included && provider.equipment_included.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-gray-500">Equipment:</span>
                              {provider.equipment_included.slice(0, 2).map((eq, idx) => (
                                <span key={idx} className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-700">
                                  {eq}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Availability */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span>Available: {provider.availability_schedule ? "Flexible" : "24/7"}</span>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(provider)}
                        className="px-6 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: GOLDEN_YELLOW }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

// Main UserPortal Component with Routing
const UserPortal = () => {
  return (
    <Routes>
      <Route index element={<ServiceSelection />} />
      <Route path="bookings" element={<UserBookings />} />
      <Route path="dashboard" element={<UserDashboard />} />
      <Route path="account" element={<UserAccount />} />
      <Route path="services" element={<ServiceSelection />} />
      <Route path="company/:companyId" element={<CompanyServices />} />
      <Route path="*" element={<ServiceSelection />} />
    </Routes>
  )
}

export default UserPortal
