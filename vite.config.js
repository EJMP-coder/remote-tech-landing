import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function contactDevPlugin() {
  const handleContact = (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
      res.end()
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ ok: false, error: 'Método no permitido.' }))
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let params = {}
      try {
        const contentType = req.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
          params = JSON.parse(body)
        } else {
          params = Object.fromEntries(new URLSearchParams(body).entries())
        }
      } catch {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ ok: false, error: 'Datos no válidos.' }))
        return
      }

      const { name = '', email = '', message = '', website = '' } = params
      const cleanName = String(name).trim()
      const cleanEmail = String(email).trim()
      const cleanMessage = String(message).trim()
      const honeypot = String(website).trim()

      res.setHeader('Content-Type', 'application/json; charset=utf-8')

      // Anti-bot honeypot
      if (honeypot !== '') {
        res.statusCode = 200
        res.end(JSON.stringify({ ok: true }))
        return
      }

      if (!cleanName || !cleanEmail || !cleanMessage) {
        res.statusCode = 422
        res.end(JSON.stringify({ ok: false, error: 'Por favor completa todos los campos.' }))
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!emailRegex.test(cleanEmail)) {
        res.statusCode = 422
        res.end(JSON.stringify({ ok: false, error: 'Por favor ingresa un email válido.' }))
        return
      }

      console.log('\n📩 [RemoteTech Dev] Procesando envío de correo corporativo...')
      console.log(`   👤 Nombre:  ${cleanName}`)
      console.log(`   📧 Email:   ${cleanEmail}`)
      console.log(`   💬 Mensaje: ${cleanMessage.replace(/\n/g, ' ')}`)

      // Reenvío al servicio para enviar correo real a info@remotetech.cc
      fetch('https://formsubmit.co/ajax/info@remotetech.cc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/',
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          message: cleanMessage,
          _subject: `Nuevo contacto desde remotetech.cc — ${cleanName}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
        .then(async (fsRes) => {
          const fsData = await fsRes.json().catch(() => ({}))
          console.log(`   🚀 Envío real a info@remotetech.cc (status ${fsRes.status}):`, fsData)
          res.statusCode = 200
          res.end(
            JSON.stringify({
              ok: true,
              message: '¡Mensaje enviado con éxito a info@remotetech.cc!',
            })
          )
        })
        .catch((err) => {
          console.error('   ❌ Error reenviando correo:', err.message)
          res.statusCode = 200
          res.end(
            JSON.stringify({
              ok: true,
              message: 'Mensaje procesado.',
            })
          )
        })
    })
  }

  const middleware = (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url === '/contact.php') {
      handleContact(req, res)
    } else {
      next()
    }
  }

  return {
    name: 'contact-form-dev',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), contactDevPlugin()],
  build: {
    sourcemap: false,
    cssCodeSplit: false,
  },
})

