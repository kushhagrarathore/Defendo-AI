import { useState } from "react"

const AuthDemo = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0b] via-[#111714] to-[#0a0f0b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a241e]/80 backdrop-blur-xl border border-[#29382f]/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[#2a5a3a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary-color)]/25 animate-float">
              <span className="material-symbols-outlined text-[#111714] text-2xl">
                {isLogin ? "security" : "person_add"}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? "Welcome Back" : "Join Defendo Host"}
            </h2>
            <p className="text-gray-400">
              {isLogin 
                ? "Sign in to your account to continue" 
                : "Create your account and start securing your services today."
              }
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                  mail
                </span>
              </div>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm input-field" 
                placeholder="user@example.com" 
                type="email"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                  lock
                </span>
              </div>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm input-field" 
                placeholder="••••••••" 
                type="password"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors duration-300">
                    apartment
                  </span>
                </div>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-[#111714]/50 border border-[#3d5245] rounded-xl text-white placeholder-gray-500 focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 backdrop-blur-sm input-field" 
                  placeholder="Company Name" 
                  type="text"
                />
              </div>
            )}
          </div>

          <button 
            className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl text-sm font-bold text-[#111714] bg-gradient-to-r from-[var(--primary-color)] to-[#2a5a3a] hover:shadow-lg hover:shadow-[var(--primary-color)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-300 btn-hover mt-6"
          >
            <div className="flex items-center gap-3">
              <span>{isLogin ? "Log In" : "Create Account"}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
            </div>
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--primary-color)] hover:text-opacity-80 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthDemo

