const HowItWorks = () => {
  return (
    <section className="bg-[#1a241e] py-20" id="how-it-works">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold leading-tight tracking-[-0.015em] text-white">How It Works</h2>
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="absolute left-0 top-1/2 hidden h-1 w-full -translate-y-1/2 bg-[#3d5245]/50 md:block"></div>
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#3d5245] bg-[#111714] text-3xl font-bold text-[var(--primary-color)]">
              1
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Sign Up</h3>
            <p className="text-white/80">Create your provider profile in minutes.</p>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#3d5245] bg-[#111714] text-3xl font-bold text-[var(--primary-color)]">
              2
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">List Your Services</h3>
            <p className="text-white/80">Showcase your expertise and service offerings.</p>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#3d5245] bg-[#111714] text-3xl font-bold text-[var(--primary-color)]">
              3
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Get Clients</h3>
            <p className="text-white/80">Connect with clients and grow your business.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
