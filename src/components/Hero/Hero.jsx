import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      {/* Noise texture overlay */}
      <div className={styles.noise} />

      {/* Grid lines decoration */}
      <div className={styles.grid} />

      <div className={`container ${styles.content}`}>
        <p className={`section-label fade-up d1`}>Consultoría Tecnológica</p>

        <h1 className={`${styles.title} fade-up d2`}>
          SOLUCIONES<br />
          <span className={styles.outline}>TECNOLÓGICAS</span><br />
          INTELIGENTES
        </h1>

        <p className={`${styles.sub} fade-up d3`}>
          Diseñamos e implementamos soluciones digitales para el manejo,<br />
          control y seguridad de la información de tu organización.
        </p>

        <div className={`${styles.actions} fade-up d4`}>
          <a href="#services" className={styles.btnPrimary}>Ver Servicios</a>
          <a href="#about"    className={styles.btnGhost}>Quiénes Somos</a>
        </div>
      </div>

      {/* Large decorative text */}
      <div className={styles.bigText} aria-hidden="true">REMOTE TECH</div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span />
        <p>Scroll</p>
      </div>
    </section>
  )
}
