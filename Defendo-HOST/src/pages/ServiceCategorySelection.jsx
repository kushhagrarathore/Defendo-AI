import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import UserHeader from "../components/UserHeader"

const serviceCategories = [
  { id: "male-guard", title: "Male Guard", image: "/categories card/male gaurd.png", description: "Male security personnel" },
  { id: "female-guard", title: "Female Guard", image: "/categories card/female gaurd.png", description: "Female security personnel" },
  { id: "male-bouncer", title: "Male Bouncer", image: "/categories card/male bouncer.png", description: "Event and venue security (male)" },
  { id: "female-bouncer", title: "Female Bouncer", image: "/categories card/female bouncer.png", description: "Event and venue security (female)" },
  { id: "personal-bodyguard", title: "Personal Body Guard", image: "/categories card/Personal bodygaurd.png", description: "Personal protection services" },
  { id: "gun-man", title: "Gun Man", image: "/categories card/Gunman.png", description: "Armed security personnel" },
  { id: "event-security", title: "Event / Corporate Security", image: "/categories card/event security.png", description: "Events, offices, and corporate spaces" },
  { id: "emergency-response", title: "Emergency Response", image: "/categories card/event security.png", description: "Rapid response security teams" }
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
                relative overflow-hidden cursor-pointer
                bg-white rounded-2xl p-4
                border border-gray-200 transition-all duration-300
                shadow-sm
                ${selectedCategory === category.id 
                  ? 'ring-2 ring-amber-300/60 shadow-md' 
                  : 'hover:shadow-lg'
                }
              `}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Image */}
              <div className="w-full h-[150px] rounded-xl bg-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover"
                    style={{ filter: 'saturate(1.05) brightness(1.02)' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-500">shield_person</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-center text-[#1A1A1A] mb-1">
                {category.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center">
                {category.description}
              </p>

              {/* Selection Indicator */}
              {selectedCategory === category.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#DAA520] flex items-center justify-center shadow-md"
                >
                  <span className="material-symbols-outlined text-white text-xs">
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


























