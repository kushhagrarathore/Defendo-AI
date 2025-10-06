import { motion } from "framer-motion"

const advisors = [
  {
    name: "Aarav Sharma",
    role: "Ex-IPS, Security Strategy Advisor",
    bio: "Over 20 years in law enforcement and private security transformation.",
    photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop",
    linkedin: "#"
  },
  {
    name: "Neha Kapoor",
    role: "Operations & Compliance Advisor",
    bio: "Scaled ops and RLS compliance for multiple gov-tech platforms.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
    linkedin: "#"
  },
  {
    name: "Rahul Verma",
    role: "AI Systems Advisor",
    bio: "Built AI-first field-force products with real-time analytics.",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop",
    linkedin: "#"
  },
  {
    name: "Priya Nair",
    role: "Risk & Policy Advisor",
    bio: "Expert in security risk frameworks and policy governance.",
    photo: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1200&auto=format&fit=crop",
    linkedin: "#"
  }
]

const AdvisoryBoard = () => {
  return (
    <div className="bg-[#111714] text-white min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Advisory Board</h1>
          <p className="text-white/70 mt-2">Leaders guiding Defendo on security, compliance, and AI-first execution.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advisors.map((a, idx) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-md hover:border-white/20 transition"
            >
              <div className="aspect-[3/2] overflow-hidden">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-xl font-bold">{a.name}</h3>
                <p className="text-[var(--primary-color)] font-medium">{a.role}</p>
                <p className="text-white/70 text-sm">{a.bio}</p>
                <div className="pt-2">
                  <a href={a.linkedin} className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
                    <span className="material-symbols-outlined text-base">link</span>
                    View Profile
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-[#0f1512] border border-[#1f2a24] rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Join Our Advisory Network</h2>
          <p className="text-white/70 text-sm">If you’re an expert in security operations, risk, or AI for public safety and want to contribute, write to us at <span className="text-white">advisors@defendo.ai</span>.</p>
        </div>
      </div>
    </div>
  )
}

export default AdvisoryBoard
