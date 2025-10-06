import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function VerificationBanner() {
  const { hostProfile } = useAuth()
  const isVerified = !!hostProfile?.verified

  return (
    <motion.div
      className={`rounded-xl border p-5 mb-8 ${
        isVerified
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-yellow-500/10 border-yellow-500/20'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isVerified ? 'bg-green-500/20' : 'bg-yellow-500/20'
          }`}
        >
          <span className={`material-symbols-outlined ${isVerified ? 'text-green-400' : 'text-yellow-300'}`}>
            {isVerified ? 'verified' : 'hourglass_top'}
          </span>
        </div>
        <div>
          <h3 className={`font-semibold ${isVerified ? 'text-green-400' : 'text-yellow-300'}`}>
            {isVerified ? 'Your account is verified' : 'Your documents are under verification'}
          </h3>
          <p className="text-white/70 text-sm mt-1">
            {isVerified
              ? 'You can now add services to start getting bookings.'
              : 'Our team is reviewing your documents. We will notify you once verified.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}













