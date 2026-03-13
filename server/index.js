import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import OpenAI from 'openai'

config()

const app  = express()
const port = process.env.PORT || 3001

/* ── Validate env ────────────────────────────────────── */
if (!process.env.OPENAI_API_KEY) {
  console.error('❌  OPENAI_API_KEY no está definida en .env')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/* ── Middleware ──────────────────────────────────────── */
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))

const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minuto
  max: 20,               // máx 20 requests por IP/min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta en un momento.' },
})
app.use('/api', limiter)

/* ── System prompt ───────────────────────────────────── */
const SYSTEM_PROMPT = `Eres el asistente virtual de Remote Tech C.A., una consultora tecnológica venezolana especializada en manejo, control y seguridad de datos.

Responde SIEMPRE en español, de forma profesional pero cercana y amigable.

Información de la empresa:
- Fundada por Erick Medina, Founder & CEO con +20 años en el sector Telco
- Con sede en Caracas, Venezuela
- Contacto: erick.erc@gmail.com | +584141357471

Servicios: Consultoría TI, Desarrollo de Software, Automatización, Integraciones de APIs, Seguridad de Datos, Transformación Digital, Ciberseguridad, Prevención de Fraudes, Análisis de Riesgos.

Valores: Propósito, Colaboración, Entrega, Seguridad, Equilibrio y Pasión (filosofía "Extra Mile & Smile").

Si preguntan por precios, proyectos específicos o quieren contratar, invítalos a contactar directamente por WhatsApp (+584141357471) o email.

Mantén respuestas concisas (máximo 3 párrafos). Sé útil, no repitas información innecesariamente.`

/* ── /api/chat ───────────────────────────────────────── */
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body

  // Validación
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'El campo "messages" es requerido.' })
  }
  if (messages.length > 40) {
    return res.status(400).json({ error: 'Historial demasiado largo.' })
  }

  // Sanitizar: solo roles válidos y contenido string
  const clean = messages
    .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...clean,
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content ?? 'No pude generar una respuesta.'
    res.json({ reply })
  } catch (err) {
    console.error('OpenAI error:', err.message)
    const status = err.status ?? 500
    res.status(status).json({ error: 'Error al comunicarse con el asistente de IA.' })
  }
})

/* ── Health check ────────────────────────────────────── */
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

/* ── Start ───────────────────────────────────────────── */
app.listen(port, () => {
  console.log(`✅  Backend corriendo en http://localhost:${port}`)
})
