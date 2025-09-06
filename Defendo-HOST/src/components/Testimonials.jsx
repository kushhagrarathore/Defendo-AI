const Testimonials = () => {
  const testimonials = [
    {
      text: "Defendo Host has been instrumental in growing my security business. The platform is user-friendly and connects me with high-quality clients.",
      name: "Sarah M.",
      role: "Security Provider"
    },
    {
      text: "I have found Defendo Host to be an excellent resource for finding security providers. The listings are detailed and the platform is easy to navigate.",
      name: "David L.",
      role: "Client"
    },
    {
      text: "The support from Defendo Host has been exceptional. They are always responsive and helpful, making it easy to manage my services.",
      name: "Emily R.",
      role: "Security Provider"
    }
  ]

  return (
    <section className="bg-[#1a241e] py-20" id="testimonials">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold leading-tight tracking-[-0.015em] text-white">What Our Users Say</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex flex-col rounded-xl bg-[#111714] p-6 shadow-lg">
              <p className="mb-4 text-white/80">"{testimonial.text}"</p>
              <div className="mt-auto flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-gray-600"></div>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
