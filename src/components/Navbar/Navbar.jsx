import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const links = [
  { label: 'Inicio',         href: '#hero' },
  { label: 'Quiénes Somos',  href: '#about' },
  { label: 'Servicios',      href: '#services' },
  { label: 'Valores',        href: '#values' },
  { label: 'Tecnología',     href: '#technology' },
  { label: 'Chatbot',        href: '#chatbot' },
  { label: 'Contacto',       href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#hero" className={styles.logo} onClick={close}>
          REMOTE<span>TECH</span>
        </a>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          {links.map(l => (
            <a key={l.href} href={l.href} className={styles.link} onClick={close}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className={styles.cta} onClick={close}>
            Contáctanos
          </a>
        </nav>

        <button
          className={`${styles.burger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menú"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
