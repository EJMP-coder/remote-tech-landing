import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'
import Logo from '../Logo/Logo'

const links = [
  { label: 'Inicio',         href: '#hero' },
  { label: 'Quiénes Somos',  href: '#about' },
  { label: 'Servicios',      href: '#services' },
  { label: 'Valores',        href: '#values' },
  { label: 'Tecnología',     href: '#technology' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setMenuOpen(false)

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#hero" className={styles.logo} onClick={close} aria-label="Remote Tech C.A. — Inicio">
          <Logo className={styles.logoMark} />
        </a>

        <nav
          id="main-nav"
          aria-label="Navegación principal"
          className={`${styles.nav} ${menuOpen ? styles.open : ''}`}
        >
          {links.map(l => (
            <a key={l.href} href={l.href} className={styles.link} onClick={close}>
              {l.label}
            </a>
          ))}
          {/* Único acceso a la sección de contacto desde el menú */}
          <a id="nav-cta-contact" href="#contact" className={styles.cta} onClick={close}>
            Contáctanos
          </a>
        </nav>

        <button
          type="button"
          className={`${styles.burger} ${menuOpen ? styles.active : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menú"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
