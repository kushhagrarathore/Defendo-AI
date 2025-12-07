import { motion } from 'framer-motion'
import { useState } from 'react'

const AboutUs = () => {
  const [activeFounder, setActiveFounder] = useState(0)

  const founders = [
    {
      name: "Kushagra Rathore",
      role: "Co-Founder & CEO",
      image: "/founders/kushagra.jpg", // Place file at public/founders/kushagra.jpg
      bio: "Aspiring entrepreneur with a vision to revolutionize security services through technology. Passionate about creating innovative solutions that bridge the gap between traditional security and modern digital platforms.",
      expertise: ["Strategic Planning", "Business Development", "Technology Innovation", "Team Leadership"],
      social: {
        linkedin: "#",
        twitter: "#",
        email: "kushagra@defendo.com"
      }
    },
    {
      name: "Atharva Gour",
      role: "Co-Founder",
      image: "/founders/atharva.jpg", // Place file at public/founders/atharva.jpg
      bio: "Tech-savvy entrepreneur dedicated to building scalable and secure platforms. Combines technical expertise with business acumen to deliver cutting-edge solutions in the security industry.",
      expertise: ["Full-Stack Development", "System Architecture", "Cloud Infrastructure", "Product Engineering"],
      social: {
        linkedin: "#",
        twitter: "#",
        email: "atharva@defendo.com"
      }
    }
  ]

  const companyStats = [
    { label: "Years of Vision", value: "2+", icon: "visibility" },
    { label: "Services Offered", value: "3+", icon: "security" },
    { label: "Cities Covered", value: "5+", icon: "location_on" },
    { label: "Happy Clients", value: "100+", icon: "people" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/15 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-[var(--primary-color)] to-slate-900 bg-clip-text text-transparent">
              About Defendo
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing security services through innovation, technology, and unwavering commitment to safety
            </p>
          </motion.div>

          {/* Company Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {companyStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white/80 backdrop-blur border border-slate-200 rounded-2xl py-6 shadow-[0_12px_40px_rgba(15,23,42,0.10)]"
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 bg-[var(--primary-color)]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                    {stat.icon}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[var(--primary-color)] mb-2">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                  flag
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To provide comprehensive, technology-driven security solutions that ensure peace of mind for businesses and individuals. We strive to make professional security services accessible, reliable, and efficient through our innovative platform.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                  visibility
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To become the leading security services platform in India, setting new standards for safety, reliability, and customer satisfaction. We envision a future where security solutions are seamlessly integrated with cutting-edge technology.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 bg-slate-50/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Meet Our Founders</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Two aspiring entrepreneurs from Indore, Madhya Pradesh, India, united by a shared vision to transform the security industry
            </p>
          </motion.div>

          {/* Founder Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-2xl p-8 border cursor-pointer transition-all duration-300 ${
                  activeFounder === index
                    ? 'border-[var(--primary-color)] shadow-[0_20px_60px_rgba(15,23,42,0.15)]'
                    : 'border-slate-200 hover:shadow-[0_18px_55px_rgba(15,23,42,0.12)]'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                onClick={() => setActiveFounder(index)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center mb-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-[var(--primary-color)]/30 to-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
    {founder.image ? (
      <img loading="lazy" src={founder.image} alt={founder.name} className="w-full h-full object-cover" />
    ) : (
      <span className="material-symbols-outlined text-[var(--primary-color)] text-4xl">person</span>
    )}
  </div>
                  <h3 className="text-2xl font-bold mb-1 text-slate-900">{founder.name}</h3>
                  <p className="text-[var(--primary-color)] font-medium">{founder.role}</p>
</div>
              </motion.div>
            ))}
          </div>

          {/* Location Info */}
          <motion.div
            className="bg-gradient-to-r from-[var(--primary-color)]/10 to-white rounded-2xl p-8 text-center border border-slate-200 shadow-[0_18px_55px_rgba(15,23,42,0.12)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                location_on
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">Based in Indore</h3>
            <p className="text-slate-600 text-lg">
              Proudly operating from the heart of Madhya Pradesh, India
            </p>
            <p className="text-slate-500 mt-2">
              Bringing innovative security solutions to businesses across the region and beyond
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Our Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "security",
                title: "Security First",
                description: "We prioritize safety and security in every solution we provide, ensuring peace of mind for our clients."
              },
              {
                icon: "innovation",
                title: "Innovation",
                description: "We constantly evolve and adapt, leveraging cutting-edge technology to stay ahead of security challenges."
              },
              {
                icon: "handshake",
                title: "Trust & Reliability",
                description: "We build lasting relationships through transparency, reliability, and consistent service excellence."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-[0_18px_55px_rgba(15,23,42,0.12)]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-[var(--primary-color)]/15 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                    {value.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[var(--primary-color)]/15 to-sky-100/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Ready to Work Together?</h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing the security industry. Whether you're a client or a service provider, we'd love to connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="px-8 py-4 bg-[var(--primary-color)] text-[#0f172a] rounded-full font-semibold hover:bg-emerald-400 transition-colors shadow-md hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
              <motion.button
                className="px-8 py-4 border border-slate-300 text-slate-800 rounded-full font-semibold hover:bg-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs










