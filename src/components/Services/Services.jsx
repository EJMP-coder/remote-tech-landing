import styles from './Services.module.css'

const services = [
  {
    number: '01',
    title: 'Consultoría TI',
    desc: 'Asesoramos en la planificación y ejecución de estrategias tecnológicas alineadas a los objetivos de tu negocio.',
    tags: ['Estrategia', 'Arquitectura', 'Roadmap'],
  },
  {
    number: '02',
    title: 'Desarrollo de Software',
    desc: 'Creamos aplicaciones web, móviles y sistemas a medida con las mejores prácticas de ingeniería.',
    tags: ['React', 'Node.js', 'APIs REST'],
  },
  {
    number: '03',
    title: 'Automatización',
    desc: 'Diseñamos flujos automatizados que reducen el trabajo manual y aceleran tus procesos operativos.',
    tags: ['RPA', 'Workflows', 'Integración'],
  },
  {
    number: '04',
    title: 'Seguridad de Datos',
    desc: 'Protegemos tu información con soluciones de ciberseguridad, auditorías y gestión de riesgos.',
    tags: ['Ciberseguridad', 'Compliance', 'Auditoría'],
  },
  {
    number: '05',
    title: 'Transformación Digital',
    desc: 'Acompañamos a tu organización en el proceso completo de adopción y madurez digital.',
    tags: ['Cultura', 'Procesos', 'Tecnología'],
  },
  {
    number: '06',
    title: 'Integraciones & APIs',
    desc: 'Conectamos tus sistemas y plataformas para crear ecosistemas de datos fluidos y eficientes.',
    tags: ['REST', 'GraphQL', 'Webhooks'],
  },
]

export default function Services() {
  return (
    <section id="services" className={styles.services}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">02 — Servicios</p>
          <h2 className={styles.heading}>
            QUÉ<br />
            <span className={styles.outline}>OFRECEMOS</span>
          </h2>
          <p className={styles.sub}>
            Soluciones tecnológicas de extremo a extremo para hacer tu
            mundo digital más rápido, seguro y eficiente.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((s) => (
            <div key={s.number} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.num}>{s.number}</span>
                <h3 className={styles.cardTitle}>{s.title}</h3>
              </div>
              <p className={styles.cardDesc}>{s.desc}</p>
              <div className={styles.tags}>
                {s.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
