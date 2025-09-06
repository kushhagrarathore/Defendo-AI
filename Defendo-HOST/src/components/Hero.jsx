import { Link } from "react-router-dom"

const Hero = () => {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center bg-cover bg-center py-20 text-white" style={{backgroundImage: "linear-gradient(rgba(17, 23, 20, 0.8) 0%, rgba(17, 23, 20, 0.9) 100%), url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuD7z2Kgie4_Z--RyxiqRbSO98ZAxJ_RKH3135aDRVq7WHXX6rrDGFcr_3AusKn2fX4oB_hKh0cc4bMlBJpY9HUuiQucBMpcjfqpbGB16jKOrUkYUn-p3jq1YDJSJh712xRbwmhmebKWOTnaN-D4uhvmic1RQSdE5j8xetr2ksyyZhw5wu1Iw44xy8uFRRIsV18Zs67Qad3FDMhDq_ZPP80TUuHZed65iB7zJ1RRJV-UybGUCH8W0oWS95XM2XQciuyiCT-jE0IULsPn\")"}}>
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="text-5xl font-black leading-tight tracking-[-0.033em] md:text-7xl">Secure More, Stress Less</h1>
        <p className="max-w-2xl text-lg font-normal text-white/80">
          Join Defendo Host and connect with clients seeking top-tier security services. Expand your reach, manage your listings, and grow your business with ease.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[var(--primary-color)] text-base font-bold leading-normal tracking-[0.015em] text-[#111714] transition-transform hover:scale-105">
            <span className="truncate">Become a Security Provider</span>
          </Link>
          <Link to="/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#29382f] text-base font-bold leading-normal tracking-[0.015em] text-white transition-transform hover:scale-105">
            <span className="truncate">Login</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
