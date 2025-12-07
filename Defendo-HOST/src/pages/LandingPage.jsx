import { useEffect, useState, useRef } from 'react'
import { motion, useAnimation, useInView, MotionConfig, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const Typewriter = ({ text, speed = 60 }) => {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    setDisplayText('')
    let index = 0
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index + 1))
      index += 1
      if (index === text.length) {
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className="inline-flex items-center gap-1">
      <motion.span
        key={displayText}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="whitespace-nowrap"
      >
        {displayText}
      </motion.span>
      <motion.span
        className="inline-block w-0.5 h-7 bg-[var(--primary-color)] rounded-full"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
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

const trustBadges = [
  { label: 'Kalyan Tech Parks', tag: 'Enterprise', tone: 'from-blue-100 to-blue-50' },
  { label: 'Skyline Residences', tag: 'Premium Housing', tone: 'from-emerald-100 to-white' },
  { label: 'Nova Events', tag: 'Events', tone: 'from-indigo-100 to-white' },
  { label: 'Northstar Logistics', tag: 'Warehousing', tone: 'from-slate-100 to-white' }
]

const featureHighlights = [
  { icon: 'bolt', title: 'Instant Dispatch', desc: 'Automatically route the closest guards with smart shift automation and SOS escalation.' },
  { icon: 'shield_person', title: 'Verified Workforce', desc: 'Every professional passes multi-layer KYC, background checks and attendance scoring.' },
  { icon: 'cell_merge', title: 'Unified Dashboard', desc: 'Bookings, payouts, rosters and client chat—everything synced across devices.' },
  { icon: 'support_agent', title: '24/7 Support', desc: 'Human concierge + AI monitoring to keep every deployment on track.' }
]

const faqs = [
  { q: 'How quickly can I go live on Defendo?', a: 'Most agencies complete onboarding within 48 hours once documents are submitted. We verify KYC, upload inventory and activate your profile instantly.' },
  { q: 'Do you help with guard attendance?', a: 'Yes. Our mobile check-ins, geofenced shifts, and live alerts ensure you see every guard on duty and receive automated timesheets.' },
  { q: 'What kind of clients book on Defendo?', a: 'From gated communities and tech parks to events, luxury retail and logistics hubs—Defendo distributes leads based on your capacity and ratings.' },
  { q: 'Is there a monthly fee?', a: 'You pay a small commission per fulfilled booking. No hidden retainers; cancel anytime.' }
]

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
        quote: 'Defendo Host made it easy to manage bookings and grow my clientele. The platform is intuitive and the support team is always responsive.', 
        name: 'Akhil Sharma',
        role: 'Security Guard',
        avatar: '👨‍💼',
        rating: 5
      },
      { 
        quote: 'The platform connects me with serious clients. Highly recommended for anyone looking to scale their security business efficiently.', 
        name: 'Priya Patel',
        role: 'Drone Operations',
        avatar: '👩‍✈️',
        rating: 5
      },
      { 
        quote: 'Simple, modern, and trustworthy. Bookings are smooth and payments are always on time. Best decision we made for our agency.', 
        name: 'Ravi Kumar',
        role: 'Security Agency Owner',
        avatar: '👨‍💻',
        rating: 5
      }
    ]
    const [index, setIndex] = useState(0)
    useEffect(() => {
      const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000)
      return () => clearInterval(t)
    }, [])
    
    return (
      <div className="relative max-w-4xl mx-auto">
        <div className="relative h-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.12)] text-center relative overflow-hidden"
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-full blur-3xl opacity-50 -z-0" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-sky-50 to-indigo-50 rounded-full blur-3xl opacity-50 -z-0" />
              
              <div className="relative z-10">
                {/* Quote icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-blue-600">format_quote</span>
                  </div>
                </div>
                
                {/* Rating stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(items[index].rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-yellow-400 text-xl">star</span>
                  ))}
                </div>
                
                {/* Quote text */}
                <p className="text-slate-700 text-lg md:text-xl italic leading-relaxed mb-6 font-medium">
                  "{items[index].quote}"
                </p>
                
                {/* Author info */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-5xl">{items[index].avatar}</div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">{items[index].name}</div>
                    <div className="text-sm text-slate-500">{items[index].role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          {items.map((_, i) => (
            <motion.button 
              key={i} 
              onClick={() => setIndex(i)} 
              aria-label={`Go to slide ${i+1}`}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === i 
                  ? 'bg-blue-600 w-8 shadow-lg shadow-blue-600/50' 
                  : 'bg-slate-300 hover:bg-slate-400 w-3'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    )
  }
  const [activeSection, setActiveSection] = useState('services')
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    const sections = ['services','testimonials']
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900 relative" style={{ perspective: '1000px' }}>
      {/* Background Icons */}
      <BackgroundIcons />
      
      {/* Floating SOS Widget */}
      <SOSWidget />
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandLogo
            text="Defendo"
            className="flex items-center gap-2"
            imgClassName="h-9 w-auto drop-shadow-sm"
            textClassName="font-semibold tracking-tight text-slate-900"
          />
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/about" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
              >
                About Us
              </Link>
            </motion.div>
            {['Services','Testimonials'].map((label) => {
              const id = label.toLowerCase()
              const isActive = activeSection === id
              return (
              <motion.a 
                key={label}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(id)
                }}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                      ? 'text-slate-900 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                  whileHover={{ scale: 1.05 }}
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
              <Link 
                to="/partner" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.35)] hover:from-sky-700 hover:via-blue-700 hover:to-indigo-700 transition-all"
              >
                <span className="material-symbols-outlined text-base">handshake</span>
                Partner with Defendo
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/admin-login" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100/80 transition-colors border border-slate-200 hover:border-slate-300 text-sm font-medium">
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
          className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-white to-sky-100/60"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Pulsing Shield Background */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-100"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
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

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-24 relative z-10 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-center">
          <div>
          <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 leading-tight"
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <Typewriter text="Secure More, Stress Less" />
          </motion.h1>
          <motion.p 
              className="text-slate-600 max-w-2xl mb-8 text-lg"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            Grow your security services business with a modern platform for bookings, management, and trust.
          </motion.p>
          <motion.div 
              className="flex flex-wrap gap-4"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <motion.div 
                whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
                <Link to="/user-login" className="inline-flex items-center gap-3 bg-blue-600 text-white px-7 py-3 rounded-full font-semibold text-sm md:text-base shadow-[0_14px_35px_rgba(37,99,235,0.45)] hover:bg-blue-700">
                  <span className="material-symbols-outlined text-base">login</span>
                  User Login
              </Link>
            </motion.div>
            </motion.div>
          </div>

          {/* Right-side mockup */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-200/60 via-white to-sky-200/60 rounded-[2.5rem] blur-xl opacity-80" />
              <div className="relative rounded-[2rem] bg-white border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.18)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Live bookings</p>
                    <p className="text-sm font-semibold text-slate-900">
                      Guard assignment overview
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-emerald-500 text-xl">
                    shield
                  </span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">Corporate office</p>
                      <p className="text-[11px] text-slate-500">3 guards on duty</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">Warehouse</p>
                      <p className="text-[11px] text-slate-500">Night shift</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] bg-amber-50 text-amber-700">
                      Starts 22:00
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">Residential tower</p>
                      <p className="text-[11px] text-slate-500">Visitor log enabled</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] bg-sky-50 text-sky-700">
                      Smart check-in
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Trust badges */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-10"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">trusted by</p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block hidden" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustBadges.map((badge) => (
            <motion.div
              key={badge.label}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-slate-200 bg-white/70 shadow-[0_12px_30px_rgba(15,23,42,0.07)] p-4 flex flex-col gap-2"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.tone} flex items-center justify-center text-slate-700 font-semibold`}>
                <span className="material-symbols-outlined text-base">verified</span>
              </div>
              <p className="font-semibold text-slate-900">{badge.label}</p>
              <span className="text-xs text-slate-500">{badge.tag}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Feature highlights */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="md:flex md:items-center md:justify-between mb-10 gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-500 mb-3">Platform advantage</p>
            <h2 className="text-3xl font-bold text-slate-900">Why thousands choose Defendo</h2>
          </div>
          <p className="text-sm text-slate-500 max-w-xl">
            Built for security agencies, facility managers, and residents who expect premium execution. Every interaction is monitored, scored, and optimized.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featureHighlights.map((feature) => (
            <motion.div 
              key={feature.title}
              variants={fadeUpVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl material-symbols-outlined">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                </div>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
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
        <h2 className="text-3xl font-bold mb-3 text-slate-900">Services</h2>
        <p className="text-sm text-slate-500 mb-10 max-w-2xl">
          Offer guards, drones, and agency-level protection through one unified platform.
        </p>
        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" variants={containerStagger}>
          {[
            { label: 'Night Guard', blurb: 'Overnight protection for sites and residences.', emoji: '🌙' },
            { label: 'Day Guard', blurb: 'Front-desk and lobby coverage during peak hours.', emoji: '🌤️' },
            { label: 'Event Security', blurb: 'Crowd control and VIP access management.', emoji: '🎪' },
            { label: 'Bouncer', blurb: 'Entry screening for clubs and lounges.', emoji: '🛡️' },
            { label: 'Emergency Response', blurb: 'Rapid response teams for incidents.', emoji: '🚨' },
            { label: 'VIP Escort', blurb: 'High-touch protection for executives.', emoji: '🤵' }
          ].map((service) => (
            <motion.div 
              key={service.label} 
              variants={scaleInVariants}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition-all duration-200">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl mb-4">
                  <span className="text-2xl">{service.emoji}</span>
                </div>
                <h4 className="text-base font-semibold text-slate-900">{service.label}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {service.blurb}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* About content moved to dedicated About page */}

      {/* Operations timeline */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Operations in motion</p>
          <h2 className="text-3xl font-bold text-slate-900">Your security stack, choreographed</h2>
            </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: 'List & verify', desc: 'Upload licenses, team size, coverage zones. Get a curated profile instantly.', icon: 'task_alt' },
            { label: 'Match & book', desc: 'Algorithm routes vetted clients and events that fit your roster.', icon: 'lan' },
            { label: 'Deploy & monitor', desc: 'Live map, attendance pings, and SOS center keep every shift visible.', icon: 'radar' },
            { label: 'Bill & grow', desc: 'Smart payout cycles, analytics, and upsell nudges grow revenue.' , icon: 'monitoring'}
          ].map((step, idx) => (
            <motion.div
              key={step.label}
              variants={scaleInVariants}
              whileHover={{ y: -6 }}
              className="relative p-6 rounded-2xl bg-white border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </div>
                <span className="material-symbols-outlined text-blue-500">{step.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.label}</h3>
              <p className="text-sm text-slate-500">{step.desc}</p>
            </motion.div>
          ))}
          </div>
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
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Testimonials</p>
          <h2 className="text-3xl font-bold mb-3 text-slate-900">What Providers Say</h2>
          <p className="text-sm text-slate-500">Hear from security professionals who trust Defendo</p>
        </div>
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
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Impact & Growth</p>
          <h2 className="text-4xl font-bold mb-3 text-slate-900">Our Impact</h2>
          <p className="text-sm text-slate-500">Trusted by security professionals nationwide</p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerStagger}
        >
          {[
            { number: 500, suffix: '+', label: 'Active Guards', icon: 'security', desc: 'Verified professionals', color: 'from-blue-500 to-blue-600' },
            { number: 200, suffix: '+', label: 'Partner Companies', icon: 'business', desc: 'Trusted organizations', color: 'from-emerald-500 to-emerald-600' },
            { number: 24, suffix: '/7', label: 'Support Hours', icon: 'schedule', desc: 'Always available', color: 'from-indigo-500 to-indigo-600' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={scaleInVariants}
              whileHover={{ 
                scale: 1.03,
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="text-center p-8 rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.12)] hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-all duration-300 relative overflow-hidden group"
            >
              {/* Decorative gradient background */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
              
              <motion.div
                className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="material-symbols-outlined text-3xl text-white">
                  {stat.icon}
                </span>
              </motion.div>
              
              <div className={`text-5xl md:text-6xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                <AnimatedCounter end={stat.number} suffix={stat.suffix} />
              </div>
              
              <div className="text-lg font-semibold text-slate-900 mb-1">{stat.label}</div>
              <div className="text-sm text-slate-500">{stat.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        className="max-w-5xl mx-auto px-6 py-20"
        variants={containerStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Need details?</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently asked questions</h2>
          <p className="text-sm text-slate-500">Everything agencies ask before partnering with us.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={faq.q} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <span className="material-symbols-outlined text-slate-500">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5"
                >
                  {isOpen && <p className="pb-5 text-sm text-slate-600">{faq.a}</p>}
                </motion.div>
              </div>
            )
          })}
        </div>
        <div className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Still have questions?</p>
            <p className="text-sm text-slate-500">Talk to a partner consultant anytime.</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:hello@defendo.in" className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-slate-300 text-slate-700 hover:border-slate-400">
              <span className="material-symbols-outlined text-base">mail</span>
              Email us
            </a>
            <a href="tel:+918000000000" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white">
              <span className="material-symbols-outlined text-base">call</span>
              Call support
            </a>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        className="max-w-7xl mx-auto px-6 pb-24"
        variants={fadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-slate-200 p-10 md:p-12 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          {/* Animated Background Elements */}
          <motion.div
            className="absolute top-4 right-4 text-white/5"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="material-symbols-outlined text-6xl text-emerald-100">shield</span>
          </motion.div>
          <motion.div
            className="absolute bottom-4 left-4 text-white/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <span className="material-symbols-outlined text-4xl text-sky-100">lock</span>
          </motion.div>
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">Ready to Secure More, Stress Less?</h3>
            <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
              Join as a provider or explore services tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.div {...buttonHover}>
                <Link 
                  to="/signup" 
                  className="rounded-full bg-blue-600 text-white px-8 py-3 font-semibold text-sm md:text-base shadow-[0_16px_40px_rgba(37,99,235,0.45)] hover:bg-blue-700 transition-all duration-200"
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
                  to="/user-login" 
                  className="rounded-full bg-blue-600 text-white px-8 py-3 font-semibold text-sm md:text-base shadow-[0_16px_40px_rgba(37,99,235,0.45)] hover:bg-blue-700 transition-all duration-200"
                >
                  Book Services
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



