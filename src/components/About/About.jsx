import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <div className={`container ${styles.grid}`}>
        {/* Left: Who we are */}
        <div className={styles.left}>
          <p className="section-label">01 — Quiénes Somos</p>
          <h2 className={styles.heading}>
            CONSULTORA<br />
            <span className={styles.outline}>TECNOLÓGICA</span><br />
            ESPECIALIZADA
          </h2>
        </div>

        {/* Right: Text + Mission + Vision */}
        <div className={styles.right}>
          <p className={styles.body}>
            Somos una consultora tecnológica especializada en el diseño e
            implementación de soluciones digitales, enfocadas en el{' '}
            <strong>manejo, control y seguridad de la información</strong>.
          </p>
          <p className={styles.body}>
            Apoyamos a organizaciones de diferentes industrias a optimizar sus
            procesos, mejorar su eficiencia operativa y proteger sus datos,
            utilizando tecnologías modernas y metodologías innovadoras.
          </p>

          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Misión</span>
              <p>
                Contribuir al logro de los objetivos de nuestros clientes
                mediante soluciones tecnológicas innovadoras para la gestión,
                control y seguridad de la información, aportando valor a través
                de servicios de alta calidad.
              </p>
            </div>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Visión</span>
              <p>
                Ser reconocidos como empresa líder en consultoría tecnológica
                y gestión segura de datos, convirtiéndonos en aliado estratégico
                para organizaciones que buscan innovación y transformación digital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
