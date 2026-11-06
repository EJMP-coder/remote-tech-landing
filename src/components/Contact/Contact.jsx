import { useState, useEffect } from 'react'
import styles from './Contact.module.css'

const EMAIL = 'info@remotetech.cc'
const PRIMARY_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL}`
const FALLBACK_ENDPOINT = '/contact.php'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // Envío sin JavaScript: contact.php redirige a /?contacto=enviado|error#contact.
  // Mostramos el resultado y limpiamos el parámetro de la URL (URL canónica limpia).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('contacto')
    if (!status) return
    if (status === 'enviado') setSent(true)
    else setError(`No se pudo enviar el mensaje. Escríbenos directamente a ${EMAIL}.`)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`)
  }, [])

  const sendPrimary = async (payload) => {
    try {
      const res = await fetch(PRIMARY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...payload,
          _subject: `Nuevo contacto desde remotetech.cc — ${payload.name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const data = await res.json().catch(() => ({}))
      return res.ok && (data.success === 'true' || data.success === true || data.ok === true)
    } catch {
      // Error de red, bloqueador de anuncios, CSP… → se usará el fallback
      return false
    }
  }

  const sendFallback = async (payload) => {
    const res = await fetch(FALLBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({ ...payload, website: form.website }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) throw new Error(data.error || 'No se pudo enviar el mensaje.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Por favor ingresa un email válido.')
      return
    }

    // Anti-spam honeypot para bots
    if (form.website.trim() !== '') {
      setSent(true)
      setForm({ name: '', email: '', message: '', website: '' })
      return
    }

    setError(null)
    setSending(true)

    try {
      // 1. FormSubmit (servicio externo)  2. Fallback propio: /contact.php (mail() del hosting)
      const payload = { name, email, message }
      const ok = await sendPrimary(payload)
      if (!ok) await sendFallback(payload)

      setSent(true)
      setForm({ name: '', email: '', message: '', website: '' })
    } catch (err) {
      setError(`${err.message} También puedes escribirnos directamente a ${EMAIL}.`)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className={styles.contact}>
      <div className="container">
        <div className={styles.layout}>
          {/* Left */}
          <div className={styles.left}>
            <p className="section-label">05 — Contacto</p>
            <h2 className={styles.heading}>
              HABLEMOS<br />
              <span className={styles.outline}>PRONTO</span>
            </h2>
            <p className={styles.sub}>
              ¿Listo para transformar digitalmente tu organización? Escríbenos
              y te responderemos a la brevedad.
            </p>

            <div className={styles.channels}>
              <a href={`mailto:${EMAIL}`} className={styles.channelBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                {EMAIL}
              </a>

              <div className={styles.channelInfo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Caracas, Venezuela  2024
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className={styles.right}>
            {sent ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}>✓</span>
                <h3>¡Mensaje enviado!</h3>
                <p>Gracias por escribirnos. Recibimos tu mensaje y te responderemos a la brevedad. ¡Nos vemos pronto!</p>
                <button type="button" className={styles.resetBtn} onClick={() => setSent(false)}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form
                id="contact-form"
                className={styles.form}
                onSubmit={handleSubmit}
                action={FALLBACK_ENDPOINT}
                method="post"
                noValidate
              >
                {/* Honeypot anti-spam: invisible para usuarios reales */}
                <div className={styles.honeypot} aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-name">Nombre</label>
                  <input
                    id="contact-name"
                    className={styles.input}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    className={styles.input}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    maxLength={150}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="contact-message">Mensaje</label>
                  <textarea
                    id="contact-message"
                    className={styles.textarea}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre tu proyecto o consulta..."
                    rows={5}
                    maxLength={5000}
                    required
                  />
                </div>
                {error && <p className={styles.errorMsg} role="alert">{error}</p>}
                <button
                  id="contact-submit"
                  type="submit"
                  className={styles.submitBtn}
                  disabled={sending}
                >
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
