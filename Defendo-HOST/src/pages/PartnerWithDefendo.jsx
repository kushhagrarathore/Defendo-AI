import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

const benefits = [
  {
    title: 'Guaranteed Business Leads',
    desc: 'Receive 10–50 qualified bookings every month from gated communities, corporates, and events.',
    icon: 'radar',
  },
  {
    title: 'Higher Revenue',
    desc: 'Agencies earn 30–60% more with automated bookings and premium clients.',
    icon: 'trending_up',
  },
  {
    title: 'Zero Marketing Cost',
    desc: 'We handle demand generation so you can focus on guard deployment and operations.',
    icon: 'campaign',
  },
  {
    title: 'Smart Scheduling & Attendance',
    desc: 'Track shifts, guard location, and attendance in real time via the Defendo dashboard.',
    icon: 'schedule',
  },
  {
    title: 'Instant Payments',
    desc: 'Automated invoicing and monthly payouts with complete transparency.',
    icon: 'payments',
  },
  {
    title: 'Verified Profile Boost',
    desc: 'Get highlighted among top-rated agencies in your city to win more tenders.',
    icon: 'workspace_premium',
  },
]

const calculator = [
  { guards: 10, revenue: '₹2,00,000' },
  { guards: 20, revenue: '₹4,00,000' },
  { guards: 50, revenue: '₹10,00,000' },
]

const steps = [
  'Register Agency – Upload documents & service portfolio.',
  'Get Verified – Compliance & background checks handled by Defendo.',
  'Receive Bookings – High-paying corporate, residential & event leads.',
  'Assign Guards – Manage shifts, attendance & rosters in the app.',
  'Earn Monthly – Automated billing + transparent payouts.',
]

const partnerTypes = [
  { label: 'Security Agencies', icon: 'apartment' },
  { label: 'Individual Guards', icon: 'security' },
  { label: 'Drone Surveillance', icon: 'airport_shuttle' },
  { label: 'Event Security', icon: 'diversity_3' },
  { label: 'Bouncer Agencies', icon: 'shield_person' },
  { label: 'Patrol Car Companies', icon: 'local_police' },
]

const testimonials = [
  {
    quote: 'Defendo increased our monthly bookings by 50% in just three months.',
    name: 'Apex Shield Security, Mumbai',
  },
  {
    quote: 'Digital attendance reduced guard absenteeism by 40% and delighted our clients.',
    name: 'SecureLine Ops, Bengaluru',
  },
]

const landingHowItWorks = [
  { icon: 'person_add', title: 'Create your profile', desc: 'Showcase your services, pricing, compliance, and guard capacity in minutes.' },
  { icon: 'calendar_month', title: 'Accept bookings', desc: 'Receive instant alerts, confirm shifts, and sync rosters with your supervisors.' },
  { icon: 'shield', title: 'Deliver securely', desc: 'Deploy vetted guards, track attendance, and delight clients with transparency.' }
]

const PartnerWithDefendo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5ff] via-white to-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <BrandLogo
            text="Partner With Defendo"
            className="flex items-center gap-3 font-semibold tracking-tight"
            imgClassName="h-9 w-auto"
            textClassName="text-slate-900 font-semibold tracking-tight"
          />
          <div className="flex gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full text-sm font-semibold bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-700 transition-colors"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-indigo-50" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-sky-600 uppercase mb-4">
              Grow Faster with Defendo
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900 mb-6">
              Partner With Defendo. Scale Faster. Earn More.
            </h1>
            <p className="text-base lg:text-lg text-slate-600 mb-8">
              Join India’s fastest-growing Security-as-a-Service platform and get instant access to
              thousands of corporate, residential & event security bookings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 text-white font-semibold shadow-[0_15px_35px_rgba(14,116,144,0.35)] hover:bg-sky-700"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                Become a Partner
              </Link>
              <a
                href="mailto:partnerships@defendo.in"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-800 font-semibold hover:bg-white shadow-sm"
              >
                <span className="material-symbols-outlined text-base">call</span>
                Schedule a Call
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
              <div>
                <p className="text-3xl font-bold text-slate-900">1200+</p>
                <p>Corporate & society partners</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">98%</p>
                <p>Avg. booking fill rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">24/7</p>
                <p>Ops & payouts support</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 blur-3xl rounded-full" />
            <div className="relative bg-white rounded-3xl border border-slate-100 shadow-[0_25px_60px_rgba(15,23,42,0.15)] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Live Agency Dashboard</span>
                <span className="material-symbols-outlined text-sky-500">insights</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Monthly Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">312</p>
                  <span className="text-xs text-emerald-500 font-semibold">+28% vs last month</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Guard Attendance</p>
                  <p className="text-2xl font-bold text-slate-900">96%</p>
                  <span className="text-xs text-emerald-500 font-semibold">Real-time synced</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Active Deployments</p>
                <div className="space-y-3">
                  {['Corporate HQ', 'Luxury condo', 'Event arena'].map((site, idx) => (
                    <div key={site} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 font-semibold">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{site}</p>
                          <p className="text-xs text-slate-500">Guards deployed: {idx === 0 ? 12 : idx === 1 ? 8 : 20}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600">
                        On track
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-2">Why Partner With Us</p>
            <h2 className="text-3xl font-bold text-slate-900">Value propositions agencies love</h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500">
            Build predictable revenue, streamline guard operations, and gain national visibility with Defendo’s partner success stack.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              whileHover={{ y: -6, scale: 1.01 }}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
            >
              <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">{benefit.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works cards (moved from landing) */}
      <motion.section
        id="how-it-works"
        className="max-w-6xl mx-auto px-6 pb-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-2">How it works</p>
            <h2 className="text-3xl font-bold text-slate-900">Launch your Defendo profile</h2>
          </div>
          <p className="max-w-lg text-sm text-slate-500">
            The onboarding workflow every partner completes—kept simple and fully digital so you can go live in days, not months.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {landingHowItWorks.map((card, index) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -8, scale: 1.02 }}
              className="p-7 rounded-2xl bg-white border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-transform"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-semibold text-lg">
                  {index + 1}
                </div>
                <span className="material-symbols-outlined text-3xl text-emerald-500">{card.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Calculator */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-300 mb-3">Earnings & Growth</p>
            <h2 className="text-3xl font-bold mb-4">Earn up to ₹2–6 Lakhs per month by partnering with Defendo.</h2>
            <p className="text-sm text-white/70 mb-8">
              Our top partners scale faster because Defendo keeps their booking pipeline full and automates collections.
            </p>
            <div className="space-y-4">
              {calculator.map((item, idx) => (
                <div key={item.guards} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70">Deploy {item.guards} guards</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold">{item.revenue}/month</p>
                      <div className="h-2 rounded-full bg-white/20 flex-1 mx-4">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                          style={{ width: `${(idx + 1) * 30}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4">Growth Metrics</p>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Avg. Revenue Growth', value: '+42%' },
                { label: 'Partner Retention', value: '94%' },
                { label: 'Avg. Lead Quality', value: '4.8/5' },
                { label: 'Cities Covered', value: '30+' },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60 mb-2">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-3">How it works</p>
          <h2 className="text-3xl font-bold text-slate-900">Launch in five easy steps</h2>
        </div>
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-start gap-6 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <p className="text-base text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner types */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-3">Who can partner?</p>
            <h2 className="text-3xl font-bold text-slate-900">Built for every security operator</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTypes.map((partner) => (
              <div key={partner.label} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">{partner.icon}</span>
                </div>
                <span className="font-semibold text-slate-800">{partner.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 mb-2">Partner stories</p>
            <h2 className="text-3xl font-bold text-slate-900">Trusted by agencies nationwide</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_15px_35px_rgba(15,23,42,0.08)]">
              <span className="text-4xl block mb-4 text-sky-500">“</span>
              <p className="text-lg text-slate-700 mb-4">{testimonial.quote}</p>
              <p className="text-sm font-semibold text-slate-500">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-10 md:p-14 text-center shadow-[0_30px_70px_rgba(14,116,144,0.35)]">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Become a Defendo Partner Today</h3>
          <p className="text-sm md:text-base text-white/80 mb-8">Takes less than 2 minutes to apply.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg hover:shadow-xl"
            >
              Apply Now
            </Link>
            <a
              href="mailto:partnerships@defendo.in"
              className="px-8 py-3 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10"
            >
              Talk to Partnerships Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PartnerWithDefendo

