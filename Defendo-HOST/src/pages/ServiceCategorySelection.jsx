import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import UserHeader from "../components/UserHeader"

const serviceCategories = [
  {
    id: "night-guard",
    title: "Night Guard",
    icon: "nightlight",
    description: "24/7 night security coverage"
  },
  {
    id: "day-guard",
    title: "Day Guard",
    icon: "wb_sunny",
    description: "Daytime security services"
  },
  {
    id: "male-guard",
    title: "Male Guard",
    icon: "person",
    description: "Male security personnel"
  },
  {
    id: "female-guard",
    title: "Female Guard",
    icon: "person",
    description: "Female security personnel"
  },
  {
    id: "bouncer",
    title: "Bouncer",
    icon: "security",
    description: "Event and venue security"
  },
  {
    id: "event-security",
    title: "Event Security",
    icon: "event",
    description: "Comprehensive event protection"
  },
  {
    id: "emergency-response",
    title: "Emergency Response",
    icon: "emergency",
    description: "Rapid response security teams"
  },
  {
    id: "corporate-security",
    title: "Corporate Security",
    icon: "business",
    description: "Office and corporate protection"
  },
  {
    id: "industrial-security",
    title: "Industrial Security",
    icon: "factory",
    description: "Industrial facility security"
  },
  {
    id: "personal-bodyguard",
    title: "Personal Bodyguard",
    icon: "shield_person",
    description: "Personal protection services"
  }
]

const ServiceCategorySelection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const navigate = useNavigate()

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const handleNext = () => {
    if (selectedCategory) {
      navigate(`/providers/${selectedCategory}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />
      
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Book a Security Guard
          </h1>
          <p className="text-lg text-gray-600">
            Select the type of security service you need
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {serviceCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                relative bg-white rounded-2xl p-6 cursor-pointer
                border-2 transition-all duration-300
                ${selectedCategory === category.id 
                  ? 'border-[#DAA520] shadow-lg shadow-[#DAA520]/20' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center mb-4
                ${selectedCategory === category.id 
                  ? 'bg-[#DAA520]' 
                  : 'bg-[#F7F7F7]'
                }
                transition-colors duration-300
              `}>
                <span className={`
                  material-symbols-outlined text-3xl
                  ${selectedCategory === category.id ? 'text-white' : 'text-[#1A1A1A]'}
                `}>
                  {category.icon}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                {category.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600">
                {category.description}
              </p>

              {/* Selection Indicator */}
              {selectedCategory === category.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#DAA520] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-sm">
                    check
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleNext}
            disabled={!selectedCategory}
            className={`
              px-8 py-4 rounded-full font-semibold text-lg
              transition-all duration-300
              ${selectedCategory
                ? 'bg-[#DAA520] text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            whileHover={selectedCategory ? { scale: 1.05 } : {}}
            whileTap={selectedCategory ? { scale: 0.95 } : {}}
          >
            Next
          </motion.button>
        </div>
      </main>
    </div>
  )
}

export default ServiceCategorySelection




















