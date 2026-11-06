import Navbar    from './components/Navbar/Navbar.jsx'
import Hero      from './components/Hero/Hero.jsx'
import About     from './components/About/About.jsx'
import Services  from './components/Services/Services.jsx'
import Values    from './components/Values/Values.jsx'
import Technology from './components/Technology/Technology.jsx'
import Contact   from './components/Contact/Contact.jsx'
import Footer    from './components/Footer/Footer.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Values />
        <Technology />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
