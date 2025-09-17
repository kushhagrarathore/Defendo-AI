const Account = () => {
  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8">Account Settings</h1>
      
      <div className="max-w-2xl space-y-8">
        {/* Company Profile */}
        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold mb-6">Company Profile</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="SecureGuard Solutions"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="contact@secureguard.com"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Company Description
              </label>
              <textarea
                rows={4}
                defaultValue="Professional security services with over 10 years of experience in protecting people and properties."
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold mb-6">Company Logo</h2>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-md border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white/50 text-3xl">
                image
              </span>
            </div>
            
            <div>
              <button className="bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-[#2a5a3a] text-[#111714] px-6 py-3 rounded-full font-bold shadow-[0_10px_30px_rgba(74,222,128,0.25)] hover:shadow-[0_18px_40px_rgba(74,222,128,0.35)] transition-all">
                Upload Logo
              </button>
              <p className="text-white/70 text-sm mt-2">
                Recommended size: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-xl font-bold mb-6">Security Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#111714] border border-[#29382f] rounded-lg text-white focus:border-[var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-gradient-to-r from-[var(--primary-color)] via-emerald-400 to-[#2a5a3a] text-[#111714] px-8 py-3 rounded-full font-bold shadow-[0_10px_30px_rgba(74,222,128,0.25)] hover:shadow-[0_18px_40px_rgba(74,222,128,0.35)] transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
