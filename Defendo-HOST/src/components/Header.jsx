import { Link } from "react-router-dom"
import BrandLogo from "./BrandLogo"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#29382f] bg-[#111714]/80 px-10 py-4 backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-4 text-white">
        <BrandLogo
          text="Defendo Host"
          imgClassName="h-8 w-auto"
          textClassName="text-xl font-bold leading-tight tracking-[-0.015em] text-white"
        />
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
