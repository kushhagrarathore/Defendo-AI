import { motion } from 'framer-motion'
import { useState } from 'react'

const AboutUs = () => {
  const [activeFounder, setActiveFounder] = useState(0)

  const founders = [
    {
      name: "Kushagra Rathore",
      role: "Co-Founder & CEO",
      image: "/api/placeholder/300/300", // Replace with actual image path
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
      role: "Co-Founder & CTO",
      image: "/api/placeholder/300/300", // Replace with actual image path
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
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)]/20 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[var(--primary-color)] to-white bg-clip-text text-transparent">
              About Defendo
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
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
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                    {stat.icon}
                  </span>
                </div>
                <div className="text-3xl font-bold text-[var(--primary-color)] mb-2">{stat.value}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
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
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
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
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed">
                To provide comprehensive, technology-driven security solutions that ensure peace of mind for businesses and individuals. We strive to make professional security services accessible, reliable, and efficient through our innovative platform.
              </p>
            </motion.div>

            <motion.div
              className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10"
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
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                To become the leading security services platform in India, setting new standards for safety, reliability, and customer satisfaction. We envision a future where security solutions are seamlessly integrated with cutting-edge technology.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Meet Our Founders</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Two aspiring entrepreneurs from Indore, Madhya Pradesh, India, united by a shared vision to transform the security industry
            </p>
          </motion.div>

          {/* Founder Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                className={`bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 cursor-pointer transition-all duration-300 ${
                  activeFounder === index ? 'ring-2 ring-[var(--primary-color)] bg-white/10' : 'hover:bg-white/10'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                onClick={() => setActiveFounder(index)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-[var(--primary-color)]/30 to-white/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[var(--primary-color)] text-4xl">
                      person
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
                  <p className="text-[var(--primary-color)] font-medium">{founder.role}</p>
                </div>

                <p className="text-white/80 text-center mb-6 leading-relaxed">
                  {founder.bio}
                </p>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-center">Expertise</h4>
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

                <div className="flex justify-center gap-4">
                  <motion.a
                    href={founder.social.linkedin}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--primary-color)]/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="material-symbols-outlined text-sm">work</span>
                  </motion.a>
                  <motion.a
                    href={founder.social.twitter}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--primary-color)]/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </motion.a>
                  <motion.a
                    href={`mailto:${founder.social.email}`}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[var(--primary-color)]/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Location Info */}
          <motion.div
            className="bg-gradient-to-r from-[var(--primary-color)]/10 to-white/5 rounded-2xl p-8 text-center border border-white/10"
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
            <h3 className="text-2xl font-bold mb-2">Based in Indore</h3>
            <p className="text-white/80 text-lg">
              Proudly operating from the heart of Madhya Pradesh, India
            </p>
            <p className="text-white/60 mt-2">
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
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
                className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-[var(--primary-color)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-[var(--primary-color)] text-2xl">
                    {value.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-white/80 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[var(--primary-color)]/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Work Together?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join us in revolutionizing the security industry. Whether you're a client or a service provider, we'd love to connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="px-8 py-4 bg-[var(--primary-color)] text-white rounded-full font-semibold hover:bg-[var(--primary-color)]/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
              <motion.button
                className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
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









