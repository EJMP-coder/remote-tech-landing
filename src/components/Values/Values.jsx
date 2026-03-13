import styles from './Values.module.css'

const values = [
  {
    id: '01',
    title: 'Propósito',
    sub: 'The Extra Mile',
    desc: 'No nos conformamos con que el proyecto "funcione". Buscamos la optimización, escalabilidad y elegancia. Anticipamos problemas antes de que lleguen a producción.',
  },
  {
    id: '02',
    title: 'Colaboración',
    sub: 'The Smile',
    desc: 'El éxito de uno es el éxito de todos. Confiamos en nuestro equipo para resolver cualquier dificultad. El buen humor es nuestra mejor herramienta de debugging.',
  },
  {
    id: '03',
    title: 'Entrega',
    sub: 'The Extra Mile',
    desc: 'Cumplir con el tiempo estimado y entregar valor real al usuario es nuestra meta. Revisamos, pulimos y refinamos porque nuestro nombre está detrás de cada funcionalidad.',
  },
  {
    id: '04',
    title: 'Seguridad',
    sub: 'The Smile',
    desc: 'Celebramos los errores como fuentes de aprendizaje. Un equipo que sonríe es un equipo que se siente seguro para innovar, preguntar y proponer ideas disruptivas.',
  },
  {
    id: '05',
    title: 'Equilibrio',
    sub: 'Extra Mile & Smile',
    desc: 'Damos el 110% en los retos críticos, pero protegemos nuestro bienestar. Corremos la milla extra porque nos apasiona lo que hacemos, no por obligación.',
  },
]

export default function Values() {
  return (
    <section id="values" className={styles.values}>
      <div className="container">
        <div className={styles.topRow}>
          <div>
            <p className="section-label">03 — Valores</p>
            <h2 className={styles.heading}>
              EXTRA<br />
              <span className={styles.outline}>MILE</span>{' '}
              &amp;<br />
              SMILE
            </h2>
          </div>
          <p className={styles.quote}>
            "No solo construimos software; resolvemos desafíos. No solo
            cumplimos plazos; superamos expectativas."
          </p>
        </div>

        <div className={styles.list}>
          {values.map((v) => (
            <div key={v.id} className={styles.row}>
              <span className={styles.rowNum}>{v.id}</span>
              <div className={styles.rowMain}>
                <h3 className={styles.rowTitle}>{v.title}</h3>
                <span className={styles.rowSub}>{v.sub}</span>
              </div>
              <p className={styles.rowDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
