import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>REMOTE<span>TECH</span> C.A.</span>
          <p className={styles.tagline}>Manejo · Control · Seguridad de Datos</p>
        </div>
        <nav className={styles.nav}>
          {['#about','#services','#values','#technology','#chatbot','#contact'].map((href, i) => {
            const labels = ['Quiénes Somos','Servicios','Valores','Tecnología','Chatbot','Contacto']
            return <a key={href} href={href} className={styles.link}>{labels[i]}</a>
          })}
        </nav>
        <p className={styles.copy}>© {year} Remote Tech C.A. — Caracas, Venezuela</p>
      </div>
    </footer>
  )
}
