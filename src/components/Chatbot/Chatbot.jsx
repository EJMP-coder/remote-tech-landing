import { useState, useRef, useEffect } from 'react'
import styles from './Chatbot.module.css'

const SYSTEM_PROMPT = `Eres el asistente virtual de Remote Tech C.A., una consultora tecnológica venezolana especializada en manejo, control y seguridad de datos. 
Responde siempre en español, de forma profesional pero cercana.
Puedes ayudar con: información sobre servicios, consultas técnicas generales, transformación digital, ciberseguridad, desarrollo de software y automatización.
Si te preguntan por precios o proyectos específicos, invita al usuario a contactar directamente por WhatsApp o email.
Mantén respuestas concisas (máximo 3 párrafos).`

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de Remote Tech C.A. ¿En qué puedo ayudarte hoy? Puedo orientarte sobre nuestros servicios de consultoría, seguridad de datos, automatización y más.',
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError('No se pudo conectar con el asistente. Verifica que el servidor esté activo.')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <section id="chatbot" className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          {/* Left info */}
          <div className={styles.info}>
            <p className="section-label">05 — Asistente IA</p>
            <h2 className={styles.heading}>
              HABLA<br />
              CON<br />
              <span className={styles.outline}>NUESTRA</span><br />
              IA
            </h2>
            <p className={styles.sub}>
              Nuestro asistente con inteligencia artificial puede responder tus
              preguntas sobre servicios, tecnología y transformación digital las
              24 horas del día.
            </p>
            <div className={styles.badge}>
              <span className={styles.dot} />
              Powered by OpenAI GPT
            </div>
          </div>

          {/* Chat window */}
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <div className={styles.avatar}>RT</div>
              <div>
                <p className={styles.botName}>Remote Tech AI</p>
                <p className={styles.botStatus}>
                  <span className={styles.statusDot} /> En línea
                </p>
              </div>
            </div>

            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.bot}`}
                >
                  {msg.content}
                </div>
              ))}

              {loading && (
                <div className={`${styles.bubble} ${styles.bot}`}>
                  <span className={styles.typing}>
                    <span /><span /><span />
                  </span>
                </div>
              )}

              {error && (
                <div className={styles.errorMsg}>{error}</div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className={styles.inputRow}>
              <textarea
                ref={inputRef}
                className={styles.textarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribe tu consulta..."
                rows={1}
                disabled={loading}
              />
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
