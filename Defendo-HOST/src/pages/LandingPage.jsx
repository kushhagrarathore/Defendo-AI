import { useEffect, useState, useRef } from 'react'
import { motion, useAnimation, useInView, MotionConfig, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

const Typewriter = ({ text }) => {
  return (
    <div className="overflow-hidden">
      <motion.span
        className="inline-block whitespace-nowrap"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
        style={{ borderRight: '2px solid var(--primary-color)' }}
      >
        {text}
      </motion.span>
    </div>
  )
}

const FadeInOnView = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay, duration: 0.6, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

// Reusable animation variants for consistency and performance
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.15, 
      when: 'beforeChildren',
      delayChildren: 0.1
    }
  }
}

const cardHover = {
  whileHover: { 
    y: -8, 
    scale: 1.02,
    rotateX: 5,
    rotateY: 5,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

const buttonHover = {
  whileHover: { 
    scale: 1.05,
    boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)',
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.95 }
}

const pulseGlow = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 0.8, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

// Smooth scroll utility
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.5 })

  useEffect(() => {
    if (isInView) {
      let startTime = null
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {count}{suffix}
    </motion.span>
  )
}

// Floating SOS Widget
const SOSWidget = () => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <motion.button
        className="relative w-16 h-16 bg-red-500 rounded-full shadow-2xl flex items-center justify-center text-white font-bold text-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        {...pulseGlow}
      >
        <span className="material-symbols-outlined">emergency</span>
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.button>
    </motion.div>
  )
}

// Background Icons Component
const BackgroundIcons = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -100])
  const y2 = useTransform(scrollY, [0, 1000], [0, -150])
  const y3 = useTransform(scrollY, [0, 1000], [0, -200])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-20 left-10 text-white/5"
        style={{ y: y1 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <span className="material-symbols-outlined text-6xl">shield</span>
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-white/5"
        style={{ y: y2 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        <span className="material-symbols-outlined text-8xl">lock</span>
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-white/5"
        style={{ y: y3 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <span className="material-symbols-outlined text-5xl">security</span>
      </motion.div>
    </div>
  )
}

const LandingPage = () => {
  const TestimonialsCarousel = () => {
    const items = [
      { 
        quote: 'Defendo Host made it easy to manage bookings and grow my clientele.', 
        name: 'Akhil, Guard',
        avatar: '👨‍💼'
      },
      { 
        quote: 'The platform connects me with serious clients. Highly recommended.', 
        name: 'Priya, Drone Ops',
        avatar: '👩‍✈️'
      },
      { 
        quote: 'Simple, modern, and trustworthy. Bookings are smooth.', 
        name: 'Ravi, Agency',
        avatar: '👨‍💻'
      }
    ]
    const [index, setIndex] = useState(0)
    useEffect(() => {
      const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000)
      return () => clearInterval(t)
    }, [])
    
    return (
      <div className="relative">
        <div className="relative h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="p-8 rounded-2xl bg-[#1a241e] border border-[#29382f] text-center"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <motion.div
                className="text-4xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              >
                {items[index].avatar}
              </motion.div>
              <p className="text-white/80 text-lg italic">"{items[index].quote}"</p>
              <div className="mt-6 text-white/60 font-semibold">— {items[index].name}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {items.map((_, i) => (
            <motion.button 
              key={i} 
              onClick={() => setIndex(i)} 
              aria-label={`Go to slide ${i+1}`}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === i 
                  ? 'bg-[var(--primary-color)] w-8 shadow-lg shadow-[var(--primary-color)]/50' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    )
  }
  const [activeSection, setActiveSection] = useState('features')

  useEffect(() => {
    const sections = ['about us','features','services','testimonials']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: 'easeOut' }}>
    <div className="bg-[#111714] text-white min-h-screen relative" style={{ perspective: '1000px' }}>
      {/* Background Icons */}
      <BackgroundIcons />
      
      {/* Floating SOS Widget */}
      <SOSWidget />
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#111714]/70 backdrop-blur border-b border-[#29382f] shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--primary-color)]">shield_lock</span>
            <span className="font-bold">Defendo Host</span>
          </div>
          <div className="flex items-center gap-6">
            {['About Us','Features','Services','Testimonials'].map((label, i) => {
              const id = label.toLowerCase()
              const isActive = activeSection === id
              
              // All navigation items now scroll to sections
              
              return (
              <motion.a 
                key={label}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(id)
                }}
                className={`relative px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ 
                  scale: 1.05,
                  color: '#fff'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {label}
                <motion.span 
                  className="absolute -bottom-1 left-1/2 h-0.5 bg-[var(--primary-color)] rounded-full"
                  initial={false}
                  animate={{ 
                    width: isActive ? '80%' : '0%',
                    x: '-50%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </motion.a>
              )
            })}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="text-white/80 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Login
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/admin-login" className="flex items-center gap-2 text-white/60 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10 hover:border-white/20">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                <span className="text-sm">Admin</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/10 to-blue-500/10"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Pulsing Shield Background */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <span className="material-symbols-outlined text-[20rem]">shield</span>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-6"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Typewriter text="Secure More, Stress Less" />
          </motion.h1>
          <motion.p 
            className="text-white/70 max-w-2xl mb-10 text-lg"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            Grow your security services business with a modern platform for bookings, management, and trust.
          </motion.p>
          <motion.div 
            className="flex gap-4"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <motion.div {...buttonHover}>
              <Link to="/signup" className="bg-[var(--primary-color)] text-[#111714] px-8 py-4 rounded-full font-semibold text-lg shadow-lg">
                Become a Provider
              </Link>
            </motion.div>
            <motion.div 
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 30px rgba(59,130,246,0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login" className="bg-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg">
                Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* How It Works */}
      <motion.section
        id="features"
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>
        <motion.div className="grid md:grid-cols-3 gap-8" variants={containerStagger}>
          {[
            { icon: 'person_add', title: 'Create your profile', desc: 'Showcase your services, pricing, and availability.' },
            { icon: 'calendar_month', title: 'Accept bookings', desc: 'Get notified and manage bookings in one place.' },
            { icon: 'shield', title: 'Deliver securely', desc: 'Delight customers with reliable security services.' }
          ].map((s, i) => (
            <motion.div 
              key={s.title} 
              variants={fadeUpVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateX: 8,
                rotateY: 8,
                transition: { duration: 0.3, ease: 'easeOut' }
              }}
              className="perspective-1000"
            >
              <div className="p-8 rounded-2xl bg-[#1a241e] border border-[#29382f] hover:border-[var(--primary-color)]/30 transition-colors duration-300 shadow-lg hover:shadow-2xl hover:shadow-[var(--primary-color)]/10">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className="h-12 w-12 rounded-full bg-[var(--primary-color)]/15 text-[var(--primary-color)] flex items-center justify-center font-bold text-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {i + 1}
                  </motion.div>
                  <motion.span 
                    className="material-symbols-outlined text-4xl text-[var(--primary-color)]"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {s.icon}
                  </motion.span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="text-white/70 text-lg leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Services */}
      <motion.section
        id="services"
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2 className="text-3xl font-bold mb-10">Services</h2>
        <motion.div className="grid md:grid-cols-4 gap-8" variants={containerStagger}>
          {[
            { label: 'Guards', icon: 'security', color: 'from-green-500 to-emerald-600' },
            { label: 'Drones', icon: 'flight', color: 'from-blue-500 to-cyan-600' },
            { label: 'Agencies', icon: 'business', color: 'from-orange-500 to-red-600' }
          ].map((service, i) => (
            <motion.div 
              key={service.label} 
              variants={scaleInVariants}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="p-8 rounded-2xl bg-[#1a241e] border border-[#29382f] hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden">
                {/* Hover Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--primary-color)]/5 flex items-center justify-center mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="material-symbols-outlined text-3xl text-[var(--primary-color)]">
                      {service.icon}
                    </span>
                  </motion.div>
                  
                  <h4 className="text-2xl font-bold mb-4">{service.label}</h4>
                  <p className="text-white/70 text-lg mb-6 leading-relaxed">
                    Professional {service.label.toLowerCase()} services vetted and verified.
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/login" 
                      className="inline-flex items-center rounded-full bg-[var(--primary-color)] text-[#111714] px-6 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Book Now
                      <motion.span 
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* About Us */}
      <motion.section
        id="about us"
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div 
          className="text-center mb-16"
          variants={fadeUpVariants}
        >
          <h2 className="text-4xl font-bold mb-4">About Defendo</h2>
          <p className="text-white/70 text-xl max-w-3xl mx-auto">
            Revolutionizing security services through innovation, technology, and unwavering commitment to safety
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={containerStagger}
        >
          <motion.div
            variants={fadeUpVariants}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
          >
            <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                flag
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-white/80 leading-relaxed">
              To provide comprehensive, technology-driven security solutions that ensure peace of mind for businesses and individuals. We strive to make professional security services accessible, reliable, and efficient through our innovative platform.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUpVariants}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
          >
            <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                visibility
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-white/80 leading-relaxed">
              To become the leading security services platform in India, setting new standards for safety, reliability, and customer satisfaction. We envision a future where security solutions are seamlessly integrated with cutting-edge technology.
            </p>
          </motion.div>
        </motion.div>

        {/* Founders Section */}
        <motion.div 
          className="text-center mb-12"
          variants={fadeUpVariants}
        >
          <h3 className="text-3xl font-bold mb-4">Meet Our Founders</h3>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Two aspiring entrepreneurs from Indore, Madhya Pradesh, India, united by a shared vision to transform the security industry
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-12"
          variants={containerStagger}
        >
          {[
            {
              name: "Kushagra Rathore",
              role: "Co-Founder & CEO",
              bio: "Aspiring entrepreneur with a vision to revolutionize security services through technology. Passionate about creating innovative solutions that bridge the gap between traditional security and modern digital platforms.",
              expertise: ["Strategic Planning", "Business Development", "Technology Innovation", "Team Leadership"]
            },
            {
              name: "Atharva Gour",
              role: "Co-Founder & CTO",
              bio: "Tech-savvy entrepreneur dedicated to building scalable and secure platforms. Combines technical expertise with business acumen to deliver cutting-edge solutions in the security industry.",
              expertise: ["Full-Stack Development", "System Architecture", "Cloud Infrastructure", "Product Engineering"]
            }
          ].map((founder, index) => (
            <motion.div
              key={founder.name}
              variants={scaleInVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)]/30 to-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[var(--primary-color)] text-3xl">
                    person
                  </span>
                </div>
                <h4 className="text-xl font-bold mb-2">{founder.name}</h4>
                <p className="text-[var(--primary-color)] font-medium">{founder.role}</p>
              </div>

              <p className="text-white/80 text-center mb-6 leading-relaxed">
                {founder.bio}
              </p>

              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 text-center">Expertise</h5>
                <div className="flex flex-wrap justify-center gap-2">
                  {founder.expertise.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Location Info */}
        <motion.div
          variants={fadeUpVariants}
          className="bg-gradient-to-r from-[var(--primary-color)]/10 to-white/5 rounded-2xl p-8 text-center border border-white/10"
        >
          <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
              location_on
            </span>
          </div>
          <h4 className="text-2xl font-bold mb-2">Based in Indore</h4>
          <p className="text-white/80 text-lg">
            Proudly operating from the heart of Madhya Pradesh, India
          </p>
          <p className="text-white/60 mt-2">
            Bringing innovative security solutions to businesses across the region and beyond
          </p>
        </motion.div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        id="testimonials"
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2 className="text-3xl font-bold mb-10">What Providers Say</h2>
        <TestimonialsCarousel />
      </motion.section>

      {/* Our Impact Stats */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div 
          className="text-center mb-16"
          variants={fadeUpVariants}
        >
          <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-white/70 text-xl">Trusted by security professionals nationwide</p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerStagger}
        >
          {[
            { number: 500, suffix: '+', label: 'Guards', icon: 'security' },
            { number: 200, suffix: '+', label: 'Companies', icon: 'business' },
            { number: 24, suffix: '/7', label: 'Response', icon: 'schedule' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={scaleInVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="text-center p-8 rounded-2xl bg-[#1a241e] border border-[#29382f] hover:border-[var(--primary-color)]/30 transition-colors duration-300"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-[var(--primary-color)]/15 flex items-center justify-center mx-auto mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <span className="material-symbols-outlined text-3xl text-[var(--primary-color)]">
                  {stat.icon}
                </span>
              </motion.div>
              <div className="text-5xl font-bold text-[var(--primary-color)] mb-2">
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              </div>
              <div className="text-xl text-white/80 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        className="max-w-7xl mx-auto px-6 pb-24"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="rounded-3xl bg-gradient-to-br from-[var(--primary-color)]/10 to-blue-500/10 border border-[#29382f] p-12 text-center relative overflow-hidden">
          {/* Animated Background Elements */}
          <motion.div
            className="absolute top-4 right-4 text-white/5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="material-symbols-outlined text-6xl">shield</span>
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4 text-white/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <span className="material-symbols-outlined text-4xl">lock</span>
          </motion.div>
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure More, Stress Less?</h3>
            <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">
              Join as a provider or explore services tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.div {...buttonHover}>
                <Link 
                  to="/signup" 
                  className="rounded-full bg-[var(--primary-color)] text-[#111714] px-8 py-4 font-semibold text-lg shadow-lg"
                >
                  Join as Provider
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(59,130,246,0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login" 
                  className="rounded-full bg-blue-500 text-white px-8 py-4 font-semibold text-lg shadow-lg"
                >
                  Explore Services
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
    </MotionConfig>
  )
}

export default LandingPage



