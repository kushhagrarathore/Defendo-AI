import Header from "../components/Header"
import Hero from "../components/Hero"
import About from "../components/About"
import HowItWorks from "../components/HowItWorks"
import Services from "../components/Services"
import Testimonials from "../components/Testimonials"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col dark group/design-root overflow-x-hidden bg-[#111714]">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <HowItWorks />
        <Services />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default Home
