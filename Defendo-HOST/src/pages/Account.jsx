const Account = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="max-w-2xl space-y-8">
        {/* Company Profile */}
        <div className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
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
        <div className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
          <h2 className="text-xl font-bold mb-6">Company Logo</h2>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#111714] border-2 border-dashed border-[#29382f] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white/50 text-3xl">
                image
              </span>
            </div>
            
            <div>
              <button className="bg-[var(--primary-color)] text-[#111714] px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
                Upload Logo
              </button>
              <p className="text-white/70 text-sm mt-2">
                Recommended size: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#1a241e] rounded-xl p-6 border border-[#29382f]">
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
          <button className="bg-[var(--primary-color)] text-[#111714] px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account
