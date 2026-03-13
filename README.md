# Remote Tech C.A. — Landing Page

Landing page profesional con chatbot IA para Remote Tech C.A.

**Stack:** React 18 + Vite · Node.js + Express · OpenAI GPT-4o-mini · Vercel

---

## Requisitos previos

- Node.js 18+ instalado
- Cuenta en [OpenAI Platform](https://platform.openai.com) con API Key
- Cuenta en [GitHub](https://github.com) y [Vercel](https://vercel.com) para deploy

---

## Instalación y ejecución local (Linux)

### 1. Clonar / entrar al proyecto

```bash
cd remote-tech-landing
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Configurar el backend

```bash
cd server
npm install

# Copiar el archivo de variables de entorno
cp .env.example .env

# Editar .env y poner tu API Key real
nano .env
```

El archivo `.env` debe quedar así:

```env
OPENAI_API_KEY=sk-tu-api-key-real-aqui
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 4. Ejecutar en desarrollo (2 terminales)

**Terminal 1 — Frontend:**
```bash
# Desde la raíz del proyecto
npm run dev
# → http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd server
npm run dev
# → http://localhost:3001
```

### 5. Verificar que todo funciona

- Abre http://localhost:5173
- Ve a la sección **Chatbot** y escribe un mensaje
- Debes recibir respuesta del asistente IA

---

## Estructura del proyecto

```
remote-tech-landing/
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.module.css
│   │   ├── Hero/
│   │   ├── About/
│   │   ├── Services/
│   │   ├── Values/
│   │   ├── Technology/
│   │   ├── Chatbot/         ← Conectado a OpenAI
│   │   ├── Contact/
│   │   └── Footer/
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── index.js             ← API Express + OpenAI
│   ├── package.json
│   └── .env.example
├── index.html
├── vite.config.js           ← Proxy /api → localhost:3001
├── vercel.json
└── package.json
```

---

## Build para producción

```bash
# Desde la raíz
npm run build
# Genera la carpeta /dist lista para deploy
```

---

## Deploy en Vercel

### Paso 1 — Subir a GitHub

```bash
git init
git add .
git commit -m "feat: landing Remote Tech C.A."
git remote add origin https://github.com/tu-usuario/remote-tech-landing.git
git push -u origin main
```

### Paso 2 — Conectar con Vercel

1. Entra a [vercel.com](https://vercel.com) → **New Project**
2. Importa tu repositorio de GitHub
3. Vercel detecta automáticamente el proyecto Vite

### Paso 3 — Variables de entorno en Vercel

En el panel de Vercel → **Settings → Environment Variables**, agrega:

| Variable          | Valor                     |
|-------------------|---------------------------|
| `OPENAI_API_KEY`  | `sk-tu-api-key-real-aqui` |
| `FRONTEND_URL`    | `https://tu-dominio.vercel.app` |

### Paso 4 — Deploy

Vercel desplegará automáticamente.  
El chatbot funcionará en producción usando el backend serverless configurado en `vercel.json`.

---

## Personalización

| Qué cambiar              | Dónde                                  |
|--------------------------|----------------------------------------|
| Teléfono WhatsApp        | `src/components/Contact/Contact.jsx`   |
| Email de contacto        | `src/components/Contact/Contact.jsx`   |
| Colores / tipografía     | `src/styles/global.css` (variables CSS)|
| Personalidad del chatbot | `server/index.js` → `SYSTEM_PROMPT`    |
| Servicios                | `src/components/Services/Services.jsx` |
| Tecnologías              | `src/components/Technology/Technology.jsx` |

---

## Seguridad implementada

- ✅ API Key de OpenAI solo en el backend (nunca expuesta al cliente)
- ✅ Rate limiting: máximo 20 requests/minuto por IP
- ✅ Sanitización y límite de longitud en mensajes
- ✅ CORS configurado por dominio
- ✅ `.env` en `.gitignore` (nunca sube a Git)
- ✅ Historial de chat limitado a 40 mensajes

---

## Contacto

Remote Tech C.A. · Caracas, Venezuela  
📱 +58 414 135 7471  
📧 erick.erc@gmail.com
