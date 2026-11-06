import styles from './Footer.module.css'
import Logo from '../Logo/Logo'

export default function Footer() {

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo className={styles.logoMark} />
          <p className={styles.tagline}>Manejo · Control · Seguridad de Datos</p>
        </div>
        <nav className={styles.nav} aria-label="Navegación del pie de página">
          {['#about', '#services', '#values', '#technology', '#contact'].map((href, i) => {
            const labels = ['Quiénes Somos', 'Servicios', 'Valores', 'Tecnología', 'Contacto']
            return <a key={href} href={href} className={styles.link}>{labels[i]}</a>
          })}
        </nav>
        <p className={styles.copy} suppressHydrationWarning>2024 Remote Tech C.A. — Caracas, Venezuela</p>
      </div>
    </footer>
  )
}
