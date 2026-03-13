import styles from './Technology.module.css'

const techs = [
  { icon: '◈', label: 'Inteligencia Artificial', desc: 'LLMs, ML, automatización cognitiva' },
  { icon: '○', label: 'Cloud Computing',         desc: 'AWS, GCP, Azure, arquitecturas escalables' },
  { icon: '◎', label: 'Ciberseguridad',          desc: 'Zero trust, encriptación, compliance' },
  { icon: '◇', label: 'Integraciones API',       desc: 'REST, GraphQL, microservicios' },
  { icon: '◉', label: 'Automatización',           desc: 'RPA, pipelines, procesos sin código' },
  { icon: '▣', label: 'Desarrollo Web',           desc: 'React, Node.js, stack moderno' },
]

const marqueeItems = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'OpenAI', 'TensorFlow', 'Terraform', 'Redis']

export default function Technology() {
  return (
    <section id="technology" className={styles.tech}>
      <div className="container">
        <p className="section-label">04 — Tecnología</p>
        <h2 className={styles.heading}>
          STACK<br />
          <span className={styles.outline}>TECNOLÓGICO</span>
        </h2>
      </div>

      {/* Marquee */}
      <div className={styles.marqueeWrap} aria-hidden="true">
        <div className={styles.marquee}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className={styles.marqueeItem}>
              {item} <span className={styles.dot}>●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {techs.map((t) => (
            <div key={t.label} className={styles.card}>
              <span className={styles.icon}>{t.icon}</span>
              <h3 className={styles.cardTitle}>{t.label}</h3>
              <p className={styles.cardDesc}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
