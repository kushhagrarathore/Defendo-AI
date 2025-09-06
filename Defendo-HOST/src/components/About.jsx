const About = () => {
  return (
    <section className="py-20" id="about">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
        <div className="text-white">
          <h2 className="mb-4 text-4xl font-bold leading-tight tracking-[-0.015em]">About Defendo Host</h2>
          <p className="text-lg text-white/80">
            Defendo Host is a leading platform connecting security providers with clients in need of reliable security services. We offer a seamless experience for providers to list their services, manage their profiles, and connect with a broader client base.
          </p>
        </div>
        <div className="h-80 w-full overflow-hidden rounded-2xl shadow-2xl">
          <div className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-110" style={{backgroundImage: "url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuC_4kLsY_CwL1mKYqhcObtb1Y1twQsUG8WMW6icFvnt0eZbw0EOUUBCyB_ctWbu23ozwFB6B0GoCAvVZVj14qaruNTZA-ZklIMZ44Emv55tgI45jCuzcutUAcWbGa-nc85mcNffsv2CRw5G7WbyBQUBzDnTg_90Tb-HZqmXXxX53qVTk9iNHQQ3Eiw18KHhHZgbwLsYTc8GwZVtR_FtNxcXtJAMm8CXfJIz_k92LG5JSYN-nJssq8uJ8MjeGLIELnavSK0EQexV34th\")"}}></div>
        </div>
      </div>
    </section>
  )
}

export default About
