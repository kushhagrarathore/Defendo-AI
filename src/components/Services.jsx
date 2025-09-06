const Services = () => {
  const serviceTypes = [
    {
      name: "Guards",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ4_zaVqAP1ddkJocdXxuuOlgB_IkLlZtT8d5kHCCXUyPs87Ptox2K78J5n1b2JW8HoBVQa9Ie-pI-_uuFRPX_frNFVYjBdFDsxCwjRgFkAdC6HtHLcxhlD2z1JJLlgDfs5d_FtYWQpInuJ8G3tqaF-9tm3hDTNHPQP6KehYI7bwcjt5tO_hsGDgtIG4VAdzr6Xt0EDtu8H94p4AzX4RhZQ6VW7EBySymri_bMPrCzg6B7AU1IIH07v_8EJPOrntpEfDk1hYk4V-dF"
    },
    {
      name: "Bodyguards",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTxShnww10lzPKo8-I2BHBzez1PefQ6PRCZcPZ2Jajl41D8brWRd2xhJNfbXwMMOUjA9UfamNtiqWlfpzzeGUScm69fI38rdpsmsEKwcbX5mb-Aoi2ravGxG6-KLWgPqSbioEI-93vadj_87Gr7AM3hQZUsyRhLwdZxLaQ6ETSlUs1C49yptiS7LLuI0Eq5DM6qYWEavS4c1c9qld6sOSdbSMXfBiiHWZfB6WyND_JvwAHjryQ8JqqCDykIlXm6oIDCTeLu8mL1Kse"
    },
    {
      name: "Event Security",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJqRvoGFeOkZOhUDli9cIgEaDKyfbOmaKLpaLMZ4TujXxw9LX5OPvbqIAuoTmX0MTDHEKX-dtlGAWkwOT6EIfuCtecgW-v5iLf0v0gjrT2s-ZmDoR3rx0E63Xm80m1c0J1EXQFcfQ6eV-yxC-MhavOZGbn-3TcNUPrfRi-ryuRbUfFM3BYEnEGEDyUbbvPNc0BRU-MujOm8R7OalGkRfAHDFjmy86ubTz5nD5cs59tZ4iZRj-Wnp82_cvhYD4ZBhy6KpJpfNHaHhGZ"
    },
    {
      name: "Patrols",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVPMqTOGsAjJM6peMRf4KYC2XQjfHghUNGlO3_Hlkm9xRXY8x2XXYtMY4G4-JrdZA5FuYkFUhz_k-RkZ6sUcajsdtoTHmbgLAjVyd8Mc1xKoIrkpZNSe9usvqpHzO5Q5GgWgLCAi3UT9YXGYrlXJ_lJrKiNGu4Z9Ipi2DJ8ADU7K8wh1x-Or_Vfya8q-Hv0narlGTTOiJzvz_k4iBsYmWcm98QC8ILCPdeZY5cAByUytBR39Hyk-ctn9ctJjXv-H-kS66RFy_44CGA"
    }
  ]

  return (
    <section className="py-20" id="services">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold leading-tight tracking-[-0.015em] text-white">Services Offered</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {serviceTypes.map((service, index) => (
            <div key={index} className="group flex flex-col overflow-hidden rounded-xl bg-[#1a241e] shadow-lg transition-transform hover:-translate-y-2">
              <div className="h-56 w-full overflow-hidden">
                <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url("${service.image}")`}}></div>
              </div>
              <p className="p-4 text-center text-lg font-bold text-white">{service.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
