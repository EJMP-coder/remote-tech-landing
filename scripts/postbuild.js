/**
 * Post-build: optimización y verificación del directorio dist/ antes del deploy.
 *  1. Comprime PNG/JPG (sharp, si está instalado) — solo si el resultado pesa menos.
 *  2. Actualiza <lastmod> del sitemap.xml con la fecha del build.
 *  3. Verifica que existan los archivos críticos para producción.
 */
import fs from 'node:fs'
import path from 'node:path'

const dist = path.join(process.cwd(), 'dist')
const kb = (n) => `${(n / 1024).toFixed(1)} KB`

/* ── 1. Imágenes ─────────────────────────────────────────────────────── */
let sharp = null
try {
  sharp = (await import('sharp')).default
} catch {
  console.warn('⚠ sharp no instalado: se omite la compresión de imágenes (npm i -D sharp)')
}

if (sharp) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])
  let saved = 0
  for (const file of walk(dist).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
    const input = fs.readFileSync(file)
    const img = sharp(input)
    const out = /\.png$/i.test(file)
      ? await img.png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toBuffer()
      : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    if (out.length < input.length) {
      fs.writeFileSync(file, out)
      saved += input.length - out.length
    }
  }
  console.log(`✓ Imágenes optimizadas (ahorro: ${kb(saved)})`)
}

/* ── 2. Sitemap ──────────────────────────────────────────────────────── */
const sitemap = path.join(dist, 'sitemap.xml')
if (fs.existsSync(sitemap)) {
  const today = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(sitemap, fs.readFileSync(sitemap, 'utf-8')
    .replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`))
  console.log(`✓ sitemap.xml → lastmod ${today}`)
}

/* ── 3. Verificación ─────────────────────────────────────────────────── */
const required = ['index.html', '.htaccess', '404.html', 'contact.php', 'robots.txt',
  'sitemap.xml', 'favicon.svg', 'site.webmanifest', 'og-image.png']
const missing = required.filter((f) => !fs.existsSync(path.join(dist, f)))
if (missing.length) {
  console.error(`✗ Faltan archivos en dist/: ${missing.join(', ')}`)
  process.exit(1)
}
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8')
if (!/<div id="root"><[^/]/.test(html)) {
  console.error('✗ index.html no contiene el HTML prerenderizado')
  process.exit(1)
}
console.log('✓ dist/ listo para desplegar')
