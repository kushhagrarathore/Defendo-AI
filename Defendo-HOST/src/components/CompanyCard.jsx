import React from 'react'

export default function CompanyCard({ company, onSelect, onToggleVerified, processingId }) {
  const isProcessing = processingId === company.companyId
  const verified = !!company.host_profiles?.verified

  return (
    <div
      onClick={onSelect}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg hover:bg-white/10 hover:border-[var(--primary-color)]/30 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-teal-400 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white">business</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-[var(--primary-color)] transition-colors">
              {company.companyName}
            </h3>
            <p className="text-white/60 text-sm">{company.hostName}</p>
            <p className="text-white/40 text-xs">{company.email}</p>
          </div>
        </div>

        {/* Verified Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleVerified(company.companyId, !verified)
          }}
          disabled={isProcessing}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
            verified
              ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
              : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-pressed={verified}
          aria-label={verified ? 'Set Unverified' : 'Set Verified'}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-sm">{verified ? 'verified' : 'block'}</span>
          )}
          <span className="text-sm font-medium">{verified ? 'Verified' : 'Unverified'}</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Total Documents:</span>
          <span className="text-white font-semibold">{company.totalDocuments}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Pending:</span>
          <span className="text-yellow-400 font-semibold">{company.pendingDocuments}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Submitted:</span>
          <span className="text-blue-400 font-semibold">{company.submittedDocuments}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Click to view documents</span>
          <span className="material-symbols-outlined text-white/40 group-hover:text-[var(--primary-color)] transition-colors">
            arrow_forward
          </span>
        </div>
      </div>
    </div>
  )
}


















