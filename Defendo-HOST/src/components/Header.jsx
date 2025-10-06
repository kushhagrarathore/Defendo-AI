import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#29382f] bg-[#111714]/80 px-10 py-4 backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-4 text-white">
        <svg className="h-8 w-8 text-[var(--primary-color)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
        </svg>
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-white">Defendo Host</h2>
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        <Link to="/about" className="text-sm font-medium text-white/70 transition-colors hover:text-white">About Us</Link>
        <a className="text-sm font-medium text-white/70 transition-colors hover:text-white" href="#how-it-works">How It Works</a>
        <a className="text-sm font-medium text-white/70 transition-colors hover:text-white" href="#services">Services</a>
        <a className="text-sm font-medium text-white/70 transition-colors hover:text-white" href="#testimonials">Testimonials</a>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/signup" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[var(--primary-color)] text-[#111714] text-sm font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105">
          <span className="truncate">Become a Provider</span>
        </Link>
        <Link to="/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#29382f] text-white text-sm font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105">
          <span className="truncate">Login</span>
        </Link>
      </div>
    </header>
  )
}

export default Header
