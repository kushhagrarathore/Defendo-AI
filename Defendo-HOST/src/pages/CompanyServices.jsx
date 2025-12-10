import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase, db } from "../lib/supabase"
import UserLayout from "../components/UserLayout"

// Golden Yellow accent color
const GOLDEN_YELLOW = "#DAA520"
const SOFT_GREY = "#F7F7F7"
const BLACK_TEXT = "#1A1A1A"

const CompanyServices = () => {
  const { companyId } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [subcategories, setSubcategories] = useState({}) // Map of service_id -> subcategories array
  const [jsonSubcatImages, setJsonSubcatImages] = useState({}) // service_id -> { subcatKey: [urls] }
  const [bookingService, setBookingService] = useState(null)
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedServiceOption, setSelectedServiceOption] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
    hours: 1,
  })
  const [bookingMessage, setBookingMessage] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId])

  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      // Fetch company profile
      const { data: companyData, error: companyError } = await supabase
        .from("host_profiles")
        .select("id, company_name, full_name, rating, phone, address, avatar_url, logo_path")
        .eq("id", companyId)
        .single()

      if (companyError) {
        console.error("Error fetching company:", companyError)
        return
      }

      setCompany(companyData)

      // Fetch all active services for this company
      let servicesData = null
      let servicesError = null

      const { data: servicesDataLocal, error: servicesErrorLocal } = await supabase
        .from("host_services")
        .select("*")
        .eq("is_active", true)
        .eq("provider_id", companyId)
        .order("created_at", { ascending: false })

      servicesData = servicesDataLocal
      servicesError = servicesErrorLocal

      if (servicesError) {
        console.error("Error fetching services:", servicesError)
        setServices([])
        return
      }

      if (!servicesData || servicesData.length === 0) {
        setServices([])
        return
      }

      setServices(servicesData)

      // Preload JSON subcategory images for pretty cards
      await fetchJsonSubcategoryImages(servicesData)

      // Fetch subcategories for all services
      const serviceIds = servicesData.map(s => s.id)
      if (serviceIds.length > 0) {
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from("host_service_subcategories")
          .select("*")
          .in("service_id", serviceIds)
          .eq("is_active", true)
          .order("display_order", { ascending: true })

        if (!subcategoriesError && subcategoriesData) {
          // Group subcategories by service_id
          const subcategoriesMap = {}
          subcategoriesData.forEach(sub => {
            if (!subcategoriesMap[sub.service_id]) {
              subcategoriesMap[sub.service_id] = []
            }
            subcategoriesMap[sub.service_id].push(sub)
          })
          setSubcategories(subcategoriesMap)
        }
      }
    } catch (error) {
      console.error("Error fetching company data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to parse subcategories JSON consistently
  const parseSubcategories = (subCategoryText) => {
    if (!subCategoryText) return {}
    try {
      const parsed = typeof subCategoryText === 'string' 
        ? JSON.parse(subCategoryText) 
        : subCategoryText
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch (_) {
      return {}
    }
  }

  // Create short-lived signed URLs for any subcategory images stored in Supabase
  const fetchJsonSubcategoryImages = async (servicesList) => {
    const imageMap = {}

    for (const service of servicesList || []) {
      const parsed = parseSubcategories(service.sub_category)
      const subcatKeys = Object.keys(parsed || {})
      if (subcatKeys.length === 0) continue

      imageMap[service.id] = {}

      for (const key of subcatKeys) {
        const subcat = parsed[key]
        const images = Array.isArray(subcat?.images) ? subcat.images : []
        if (images.length === 0) continue

        const signedUrls = []
        for (const imagePath of images) {
          try {
            // If already a URL, keep as-is
            if (typeof imagePath === "string" && (imagePath.startsWith("http://") || imagePath.startsWith("https://"))) {
              signedUrls.push(imagePath)
              continue
            }

            // Otherwise sign the storage path from guard_services bucket
            const { data, error } = await supabase.storage
              .from("guard_services")
              .createSignedUrl(imagePath, 60 * 60 * 24 * 7) // 7 days

            if (error) {
              console.error("Signed URL error:", error)
              continue
            }

            if (data?.signedUrl) {
              signedUrls.push(data.signedUrl)
            }
          } catch (err) {
            console.error("Error signing image", imagePath, err)
          }
        }

        if (signedUrls.length > 0) {
          imageMap[service.id][key] = signedUrls
        }
      }
    }

    setJsonSubcatImages(imageMap)
  }

  const getPriceRange = (serviceId) => {
    // First check if we have subcategories from the database
    if (subcategories[serviceId] && subcategories[serviceId].length > 0) {
      const prices = subcategories[serviceId].map(s => s.price_per_hour)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        currency: subcategories[serviceId][0]?.currency || 'INR'
      }
    }
    
    // Fallback to JSON subcategories
    const service = services.find(s => s.id === serviceId)
    if (service) {
      const subcats = parseSubcategories(service.sub_category)
      if (subcats && Object.keys(subcats).length > 0) {
        const prices = Object.values(subcats)
          .map(s => s.price_per_hour)
          .filter(p => p !== undefined && p !== null)
        
        if (prices.length > 0) {
          return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            currency: Object.values(subcats)[0]?.currency || 'INR'
          }
        }
      }
      
      // Fallback to service price_per_hour
      if (service.price_per_hour) {
        return {
          min: service.price_per_hour,
          max: service.price_per_hour,
          currency: 'INR'
        }
      }
    }
    
    return null
  }

  const getBookingOptions = (service) => {
    const options = []
    const dbSubs = subcategories[service.id] || []
    dbSubs.forEach((sub) => {
      options.push({
        id: `db-${sub.id}`,
        label: sub.subcategory_label || "Service Option",
        price: sub.price_per_hour,
        currency: sub.currency || "INR",
      })
    })

    const jsonSubs = parseSubcategories(service.sub_category)
    Object.entries(jsonSubs).forEach(([key, sub]) => {
      options.push({
        id: `json-${key}`,
        label: sub.label || key,
        price: sub.price_per_hour,
        currency: sub.currency || "INR",
      })
    })

    if (options.length === 0) {
      options.push({
        id: "base",
        label: service.service_name || "Service",
        price: service.price_per_hour || service.price || 0,
        currency: "INR",
      })
    }

    return options
  }

  const openBookingModal = (service) => {
    setBookingService(service)
    setSelectedServiceId(service.id)
    const options = getBookingOptions(service)
    setSelectedServiceOption(options[0]?.id || null)
    setBookingMessage(null)
    setBookingError(null)
    setBookingSuccess(null)
    setBookingForm({
      date: "",
      startTime: "",
      endTime: "",
      location: service.city || company?.city || "",
      notes: "",
      hours: 1,
    })
  }

  const closeBookingModal = () => {
    setBookingService(null)
    setBookingLoading(false)
    setBookingSuccess(null)
  }

  const submitBooking = async () => {
    if (!bookingService || !bookingForm.date) {
      setBookingError("Please select a date.")
      return
    }
    const chosenOption = getBookingOptions(bookingService).find((o) => o.id === selectedServiceOption)
    const hourlyRate = chosenOption?.price ?? bookingService.price_per_hour ?? bookingService.price ?? 0
    const hours = Math.max(1, Number(bookingForm.hours) || 1)
    const totalPrice = hourlyRate * hours
    setBookingLoading(true)
    setBookingError(null)
    setBookingMessage(null)
      setBookingSuccess(null)
    try {
      const providerId = bookingService.provider_id || companyId
      const serviceType = bookingService.service_type || "guards"

        const { data, error } = await db.createBooking({
        providerId,
        serviceType,
        date: bookingForm.date,
        startTime: bookingForm.startTime || null,
        endTime: bookingForm.endTime || null,
        price: totalPrice,
        durationHours: hours,
        userNotes: bookingForm.notes,
        location: bookingForm.location || null,
      })

      if (error) {
        console.error("Booking failed:", error)
        setBookingError(error.message || "Booking failed. Please try again.")
      } else {
          setBookingSuccess({
            hours,
            total: totalPrice,
            optionLabel: chosenOption?.label || bookingService.service_name || "Service",
            bookingId: data?.id || null,
          })
          setBookingMessage("Booking request sent! We’ll notify you once the provider confirms.")
      }
    } catch (err) {
      console.error("Booking exception:", err)
      setBookingError(err.message || "Something went wrong. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </UserLayout>
    )
  }

  if (!company) {
    return (
      <UserLayout>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK_TEXT }}>
            Company not found
          </h3>
          <p className="text-gray-600 mb-6">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/user-portal")}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg"
            style={{ backgroundColor: GOLDEN_YELLOW }}
          >
            Back to Services
          </button>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/user-portal")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Services</span>
        </button>

        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Company Logo */}
            {company.logo_path ? (
              <img
                src={company.logo_path}
                alt={company.company_name || company.full_name}
                className="w-24 h-24 rounded-2xl object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}
            <div 
              className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl ${company.logo_path ? "hidden" : ""}`}
            >
              {(company.company_name || company.full_name || "C")[0].toUpperCase()}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
                    {company.company_name || company.full_name || "Company"}
                  </h1>
                  {(company.city || company.state) && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>
                        {company.city || ""} {company.state ? (company.city ? ", " : "") + company.state : ""}
                      </span>
                    </div>
                  )}
                  {company.address && (
                    <p className="text-sm text-gray-600">{company.address}</p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-yellow-400">star</span>
                      <span className="text-xl font-bold">{company.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  {company.verified && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Services Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: BLACK_TEXT }}>
              Services Offered
            </h2>
            <p className="text-gray-600">
              {services.length} {services.length === 1 ? "service" : "services"} available
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-3xl">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: BLACK_TEXT }}>
                No services available
              </h3>
              <p className="text-gray-600">
                This company hasn't added any services yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {services.map((service) => {
                const priceRange = getPriceRange(service.id)
                const serviceSubcategories = subcategories[service.id] || []
                const jsonSubcategories = parseSubcategories(service.sub_category)

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Service Image */}
                      <div className="md:w-1/4">
                        {service.images && service.images.length > 0 ? (
                          <img
                            src={service.images[0]}
                            alt={service.service_name || "Service"}
                            className="w-full h-48 rounded-xl object-cover cursor-zoom-in"
                            onClick={() => setFullscreenImage(service.images[0])}
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-48 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl ${service.images && service.images.length > 0 ? "hidden" : ""}`}
                        >
                          {service.service_name?.[0]?.toUpperCase() || "S"}
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: BLACK_TEXT }}>
                              {service.service_name || "Security Service"}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {service.description || "Professional security service"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {(service.city || service.state) && (
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-base">location_on</span>
                                  <span>
                                    {service.city || ""} {service.state ? (service.city ? ", " : "") + service.state : ""}
                                  </span>
                                </div>
                              )}
                              {service.rating && (
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                                  <span className="font-semibold">{service.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price Range */}
                          {priceRange && (
                            <div className="text-right">
                              <div className="text-2xl font-bold mb-1" style={{ color: GOLDEN_YELLOW }}>
                                {priceRange.min === priceRange.max ? (
                                  <>₹{priceRange.min}</>
                                ) : (
                                  <>₹{priceRange.min} - ₹{priceRange.max}</>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">per hour</div>
                            </div>
                          )}
                        </div>

                        {/* Subcategories & Pricing */}
                        {(serviceSubcategories.length > 0 || Object.keys(jsonSubcategories).length > 0) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Service Options & Pricing:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Display subcategories from database */}
                              {serviceSubcategories.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900">{sub.subcategory_label}</span>
                                  </div>
                                  <div className="text-lg font-bold" style={{ color: GOLDEN_YELLOW }}>
                                    ₹{sub.price_per_hour}
                                    <span className="text-xs font-normal text-gray-500">/hr</span>
                                  </div>
                                  {sub.description && (
                                    <p className="text-xs text-gray-600 mt-1">{sub.description}</p>
                                  )}
                                </div>
                              ))}

                              {/* Fallback to JSON subcategories if database subcategories not available */}
                              {serviceSubcategories.length === 0 && Object.keys(jsonSubcategories).map((key) => {
                                const subcat = jsonSubcategories[key]
                                const images = jsonSubcatImages[service.id]?.[key] || []
                                return (
                                  <div
                                    key={key}
                                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    {images.length > 0 && (
                                      <div className="mb-2 overflow-hidden rounded-lg">
                                        <img
                                          src={images[0]}
                                          alt={subcat.label || key}
                                          className="w-full h-28 object-cover cursor-zoom-in"
                                          onClick={() => setFullscreenImage(images[0])}
                                          onError={(e) => {
                                            e.target.style.display = "none"
                                          }}
                                        />
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-900">{subcat.label || key}</span>
                                      <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
                                        {subcat.service_type || "Guard"}
                                      </span>
                                    </div>
                                    <div className="text-lg font-bold" style={{ color: GOLDEN_YELLOW }}>
                                      {subcat.currency || 'INR'} {subcat.price_per_hour}
                                      <span className="text-xs font-normal text-gray-500">/hr</span>
                                    </div>
                                    {subcat.description && (
                                      <p className="text-xs text-gray-600 mt-1">{subcat.description}</p>
                                    )}
                                    {images.length > 1 && (
                                      <div className="mt-2 flex gap-2">
                                        {images.slice(1, 4).map((img, idx) => (
                                          <img
                                            key={idx}
                                            src={img}
                                            alt={`${subcat.label || key}-${idx}`}
                                            className="w-12 h-12 object-cover rounded-md border border-gray-200 cursor-zoom-in"
                                            onClick={() => setFullscreenImage(img)}
                                            onError={(e) => {
                                              e.target.style.display = "none"
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Service Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {service.specializations && service.specializations.length > 0 && (
                            service.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {spec}
                              </span>
                            ))
                          )}
                          {service.service_type && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {service.service_type}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() => openBookingModal(service)}
                            className={`px-5 py-2.5 rounded-xl text-white font-semibold hover:shadow-lg transition-all ${selectedServiceId === service.id ? "ring-2 ring-offset-2 ring-yellow-400" : ""}`}
                            style={{ backgroundColor: GOLDEN_YELLOW }}
                          >
                            {selectedServiceId === service.id ? "Selected • Book now" : "Select & Book"}
                          </button>
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            Back to top
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={closeBookingModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {!bookingSuccess ? (
              <>
                <h3 className="text-2xl font-bold mb-1" style={{ color: BLACK_TEXT }}>
                  Book {bookingService.service_name || "Service"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select date and time to request a booking.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service Option</label>
                    <select
                      value={selectedServiceOption || ""}
                      onChange={(e) => setSelectedServiceOption(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                    >
                      {getBookingOptions(bookingService).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} — {opt.currency} {opt.price}/hr
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hours</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={bookingForm.hours}
                      onChange={(e) => setBookingForm({ ...bookingForm, hours: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start Time</label>
                      <input
                        type="time"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">End Time</label>
                      <input
                        type="time"
                        value={bookingForm.endTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      placeholder="Address or city"
                      value={bookingForm.location}
                      onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Any special instructions?"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400"
                    />
                  </div>

                  {bookingError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      {bookingError}
                    </div>
                  )}
                  {bookingMessage && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      {bookingMessage}
                    </div>
                  )}

                  {/* Price Summary */}
                  {(() => {
                    const chosenOption = getBookingOptions(bookingService).find((o) => o.id === selectedServiceOption)
                    const hourlyRate = chosenOption?.price ?? bookingService.price_per_hour ?? bookingService.price ?? 0
                    const hours = Math.max(1, Number(bookingForm.hours) || 1)
                    const total = hourlyRate * hours
                    return (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-gray-800">Price Summary</p>
                          <p className="text-gray-600">
                            {hours} hour{hours > 1 ? "s" : ""} × {hourlyRate}/hr
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: GOLDEN_YELLOW }}>
                            ₹{total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={submitBooking}
                      disabled={bookingLoading}
                      className="flex-1 py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                      style={{ backgroundColor: GOLDEN_YELLOW }}
                    >
                      {bookingLoading ? "Booking..." : "Submit Booking"}
                    </button>
                    <button
                      onClick={closeBookingModal}
                      className="px-4 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-4xl animate-pulse">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold" style={{ color: BLACK_TEXT }}>
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600">
                  {bookingSuccess.optionLabel} · {bookingSuccess.hours} hour{bookingSuccess.hours > 1 ? "s" : ""} · ₹{bookingSuccess.total.toFixed(2)}
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      closeBookingModal()
                      navigate("/user-portal/bookings")
                    }}
                    className="w-full py-3 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                    style={{ backgroundColor: GOLDEN_YELLOW }}
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={closeBookingModal}
                    className="w-full py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2"
            onClick={() => setFullscreenImage(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={fullscreenImage}
            alt="Service preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </UserLayout>
  )
}

export default CompanyServices

