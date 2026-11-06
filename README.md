# Remote Tech C.A. — Landing Page

Landing page profesional de Remote Tech C.A. · **https://remotetech.cc**

**Stack:** React 18 + Vite · CSS Modules · PHP (formulario de contacto) · Hosting Spaceship

**Paleta:** Navy `#020B18` · Azul eléctrico `#0066FF` · Cyan `#00D4FF`

---

## Requisitos

- Node.js 18+ (solo para desarrollar y compilar)
- Hosting con PHP 7.4+ (Spaceship Web Hosting / cPanel) para el formulario

---

## Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:5173
```

> El formulario de contacto usa `contact.php`, que solo funciona en un servidor
> con PHP (Spaceship). En `npm run dev` el resto de la web funciona igual.

---

## Build de producción

```bash
npm run build
```

Genera la carpeta **`dist/`** con la web **prerenderizada** (el HTML ya contiene
todo el contenido → mejor SEO y carga más rápida). Incluye:

| Archivo | Función |
|---|---|
| `index.html` | Página prerenderizada con SEO completo (meta, Open Graph, Schema.org) |
| `assets/` | JS/CSS con hash (caché de 1 año) |
| `contact.php` | Envía el formulario a **info@remotetech.cc** |
| `.htaccess` | HTTPS, sin www, cabeceras de seguridad, caché, compresión |
| `robots.txt` / `sitemap.xml` | Indexación en buscadores |
| `favicon.svg`, `*.png`, `site.webmanifest` | Iconos y tarjeta para redes sociales |
| `404.html` | Página de error personalizada |

Para probar el build localmente: `npm run preview`.

---

## Publicar en Spaceship

1. `npm run build`
2. En Spaceship → **Hosting → cPanel → Administrador de archivos**, abre `public_html/`.
3. Sube **todo el contenido** de `dist/` (no la carpeta en sí).
   - Activa *"Mostrar archivos ocultos"* para verificar que `.htaccess` se subió.
4. En cPanel → **SSL/TLS Status**, confirma que `remotetech.cc` tiene certificado activo
   (AutoSSL). El `.htaccess` fuerza `https://remotetech.cc`.
5. Crea el buzón **info@remotetech.cc** (Spacemail o Email del hosting) si aún no existe.
6. Verifica en la zona DNS que existan los registros **SPF** y **DKIM** del hosting
   (mejora la entrega y evita que los mensajes del formulario lleguen a spam).
7. Prueba el formulario desde https://remotetech.cc/#contact.

### Después de publicar (SEO)

- Registra el sitio en **Google Search Console** y envía `https://remotetech.cc/sitemap.xml`.
- Haz lo mismo en **Bing Webmaster Tools**.
- Valida los datos estructurados en https://search.google.com/test/rich-results
- Comprueba la tarjeta social en https://www.opengraph.xyz/

---

## Estructura del proyecto

```
remote-tech/
├── public/                  ← se copia tal cual a dist/
│   ├── .htaccess
│   ├── contact.php          ← Envío de formulario (PHP mail)
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   ├── 404.html / 404.css
│   └── favicon.svg, og-image.png, icon-*.png
├── scripts/
│   └── prerender.js         ← Inserta el HTML renderizado en dist/index.html
├── src/
│   ├── components/
│   │   ├── Navbar/  Hero/  About/  Services/
│   │   ├── Values/  Technology/  Contact/  Footer/
│   ├── styles/global.css    ← Variables de color y tipografía
│   ├── App.jsx
│   ├── main.jsx             ← Hidratación en cliente
│   └── entry-server.jsx     ← Render para el prerender
├── index.html               ← SEO: meta, Open Graph, Schema.org
├── vite.config.js
└── package.json
```

---

## Personalización

| Qué cambiar | Dónde |
|---|---|
| Colores / tipografía | `src/styles/global.css` (variables CSS) |
| Email que recibe el formulario | `public/contact.php` → `TO_EMAIL` |
| Email mostrado en la web | `src/components/Contact/Contact.jsx` → `EMAIL` |
| Límite de envíos por IP | `public/contact.php` → `RATE_LIMIT_MAX` |
| Servicios | `src/components/Services/Services.jsx` |
| Tecnologías | `src/components/Technology/Technology.jsx` |
| Textos SEO | `index.html` |

---

## Seguridad implementada

- ✅ Sin claves ni API keys en el proyecto
- ✅ Formulario: solo POST, solo desde `remotetech.cc`, honeypot anti-bots,
  límite de 5 envíos/hora por IP, validación estricta y protección contra
  inyección de cabeceras de correo
- ✅ Cabeceras: CSP estricta, HSTS, X-Frame-Options, nosniff, Referrer-Policy,
  Permissions-Policy
- ✅ HTTPS forzado y dominio canónico sin `www`
- ✅ Bloqueo de archivos ocultos/sensibles y listado de directorios desactivado
- ✅ Sin sourcemaps en producción

---

## Contacto

Remote Tech C.A. · Caracas, Venezuela
📧 info@remotetech.cc
