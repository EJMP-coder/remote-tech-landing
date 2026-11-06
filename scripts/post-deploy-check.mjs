#!/usr/bin/env node
/**
 * Remote Tech — Verificación post-deploy (smoke test + auditoría SEO técnica)
 *
 * Uso:
 *   node scripts/post-deploy-check.mjs https://remotetech.cc   → sitio en producción (completo)
 *   node scripts/post-deploy-check.mjs dist                    → solo auditoría SEO del build local
 *
 * Sin dependencias (Node ≥ 18). Sale con código 1 si hay algún fallo.
 */
import fs from 'node:fs'
import path from 'node:path'
import tls from 'node:tls'

const target = process.argv[2] || 'https://remotetech.cc'
const LOCAL = !/^https?:\/\//.test(target)
const results = []
const UA = 'RemoteTech-PostDeployCheck/1.0'

const C = { ok: '\x1b[32m✓\x1b[0m', fail: '\x1b[31m✗\x1b[0m', warn: '\x1b[33m!\x1b[0m' }
function check(group, name, pass, detail = '', level = 'fail') {
  const status = pass ? 'ok' : level
  results.push({ group, name, status, detail })
  console.log(`  ${C[status]} ${name}${detail ? ` — ${detail}` : ''}`)
}
const section = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`)

async function req(url, opts = {}) {
  const res = await fetch(url, {
    redirect: 'manual',
    ...opts,
    headers: { 'User-Agent': UA, 'Accept-Encoding': 'gzip, br', ...(opts.headers || {}) },
  })
  const body = opts.method === 'HEAD' ? '' : await res.text()
  return { status: res.status, headers: res.headers, body, url }
}

async function followRedirects(url, max = 6) {
  const chain = []
  let current = url
  for (let i = 0; i < max; i++) {
    const r = await req(current)
    chain.push(`${r.status} ${current}`)
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) {
      current = new URL(r.headers.get('location'), current).href
      if (chain.some((c) => c.endsWith(` ${current}`))) return { chain, final: current, loop: true, status: r.status }
      continue
    }
    return { chain, final: current, loop: false, status: r.status, hops: i }
  }
  return { chain, final: current, loop: true }
}

/* ═══ Utilidades HTML (regex: el HTML es nuestro y predecible) ═══ */
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'i')) || [])[1]
const metas = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0])
const meta = (html, key, val) => metas(html).find((t) => (attr(t, key) || '').toLowerCase() === val.toLowerCase())
const metaContent = (html, key, val) => { const t = meta(html, key, val); return t ? attr(t, 'content') : undefined }
const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/* ═══ Auditoría SEO (común a local y remoto) ═══ */
async function seoAudit(html, base) {
  section('SEO · Meta etiquetas')
  const title = decode((html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '')
  check('SEO', '<title> presente', !!title, `${title.length} caracteres`)
  check('SEO', 'Longitud de <title> ≤ 65', title.length > 0 && title.length <= 65, `${title.length}`, 'warn')
  const desc = decode(metaContent(html, 'name', 'description') || '')
  check('SEO', 'meta description presente', !!desc, `${desc.length} caracteres`)
  check('SEO', 'meta description 70–160 caracteres', desc.length >= 70 && desc.length <= 160, `${desc.length}`, 'warn')
  check('SEO', '<html lang> definido', /<html[^>]*\slang="[a-z-]+"/i.test(html))
  check('SEO', 'meta viewport', !!meta(html, 'name', 'viewport'))
  const robots = metaContent(html, 'name', 'robots') || ''
  check('SEO', 'meta robots sin noindex/nofollow', !/noindex|nofollow/i.test(robots), robots || '(ausente)')

  section('SEO · Canonical')
  const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map((m) => attr(m[0], 'href'))
  const expected = new URL('/', base).href
  check('SEO', 'Exactamente 1 canonical', canonicals.length === 1, `${canonicals.length} encontrados`)
  check('SEO', 'Canonical = dominio final HTTPS', canonicals[0] === expected, `${canonicals[0]} (esperado ${expected})`)

  section('SEO · Open Graph / Twitter')
  for (const p of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:site_name', 'og:locale']) {
    check('SEO', p, !!metaContent(html, 'property', p))
  }
  check('SEO', 'og:url = canonical', metaContent(html, 'property', 'og:url') === canonicals[0])
  for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    check('SEO', n, !!metaContent(html, 'name', n))
  }
  const ogImage = metaContent(html, 'property', 'og:image')
  check('SEO', 'og:image absoluta con HTTPS', /^https:\/\//.test(ogImage || ''), ogImage)
  if (!LOCAL && ogImage) {
    const r = await req(ogImage, { method: 'HEAD' })
    check('SEO', 'og:image accesible', r.status === 200, `HTTP ${r.status} ${r.headers.get('content-type') || ''}`)
  }

  section('SEO · Estructura de contenido')
  const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]))
  const h1 = headings.filter((h) => h === 1).length
  check('SEO', 'Exactamente un <h1>', h1 === 1, `${h1} encontrados`)
  const skips = headings.filter((h, i) => i > 0 && h > headings[i - 1] + 1)
  check('SEO', 'Jerarquía H1→H2→H3 sin saltos', skips.length === 0,
    `${headings.filter((h) => h === 2).length}×H2, ${headings.filter((h) => h === 3).length}×H3`)
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const noAlt = imgs.filter((t) => attr(t, 'alt') === undefined)
  check('SEO', 'Todas las <img> con atributo alt', noAlt.length === 0, `${imgs.length} imágenes, ${noAlt.length} sin alt`)
  const svgsUnlabeled = [...html.matchAll(/<svg\b[^>]*>/gi)].map((m) => m[0])
    .filter((t) => !/aria-hidden="true"|role="img"|aria-label=/.test(t))
  check('SEO', 'SVG decorativos con aria-hidden / SVG informativos con role="img"', svgsUnlabeled.length === 0,
    `${svgsUnlabeled.length} sin etiquetar`, 'warn')
  check('SEO', 'Contenido prerenderizado (indexable sin JS)', /<div id="root"><[^/]/.test(html))

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))]
  const broken = anchors.filter((a) => !ids.has(a))
  check('Funcional', 'Enlaces internos (#ancla) con destino existente', broken.length === 0,
    broken.length ? `rotos: ${broken.join(', ')}` : `${anchors.length} anclas OK`)

  const mixed = [...html.matchAll(/(?:src|href|content)="(http:\/\/[^"]+)"/gi)].map((m) => m[1])
  check('SEO', 'Sin contenido mixto (http://)', mixed.length === 0, mixed.slice(0, 3).join(', '))

  section('SEO · Datos estructurados')
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  check('SEO', 'JSON-LD presente', ld.length > 0)
  for (const [, json] of ld) {
    try { JSON.parse(json); check('SEO', 'JSON-LD sintácticamente válido', true) }
    catch (e) { check('SEO', 'JSON-LD sintácticamente válido', false, e.message) }
  }
}

function auditRobots(txt, base) {
  section('SEO · robots.txt')
  check('SEO', 'Contiene User-agent', /^User-agent:/mi.test(txt))
  check('SEO', 'No bloquea todo el sitio', !/^Disallow:\s*\/\s*$/mi.test(txt))
  check('SEO', 'Declara Sitemap absoluto', txt.includes(`Sitemap: ${new URL('/sitemap.xml', base).href}`))
  const bad = txt.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#') &&
    !/^(User-agent|Allow|Disallow|Sitemap|Crawl-delay):/i.test(l.trim()))
  check('SEO', 'Sintaxis válida', bad.length === 0, bad.join(' | '))
}

function auditSitemap(xml, base) {
  section('SEO · sitemap.xml')
  check('SEO', 'XML con <urlset> válido', /<urlset[^>]*sitemaps\.org\/schemas\/sitemap\/0\.9/.test(xml))
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  check('SEO', 'Contiene URLs', locs.length > 0, `${locs.length} URL(s)`)
  const origin = new URL(base).origin
  check('SEO', 'Todas las URLs en el dominio final HTTPS', locs.every((l) => l.startsWith(origin + '/')))
  return locs
}

/* ═══ MODO LOCAL ═══ */
if (LOCAL) {
  const dir = path.resolve(target)
  const base = 'https://remotetech.cc/'
  console.log(`Auditoría SEO del build local: ${dir}`)
  await seoAudit(fs.readFileSync(path.join(dir, 'index.html'), 'utf-8'), base)
  auditRobots(fs.readFileSync(path.join(dir, 'robots.txt'), 'utf-8'), base)
  auditSitemap(fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf-8'), base)
  finish()
}

/* ═══ MODO PRODUCCIÓN ═══ */
const base = new URL(target).origin + '/'
const host = new URL(base).host
console.log(`Verificación post-deploy de ${base}`)

section('Infraestructura · SSL / DNS / Redirecciones')
try {
  const cert = await new Promise((resolve, reject) => {
    const s = tls.connect(443, host, { servername: host }, () => { resolve(s.getPeerCertificate()); s.end() })
    s.on('error', reject)
  })
  const days = Math.round((new Date(cert.valid_to) - Date.now()) / 864e5)
  const sans = cert.subjectaltname || ''
  check('Infra', 'Certificado TLS válido', days > 0, `expira en ${days} días`)
  check('Infra', 'Certificado cubre www', sans.includes(`DNS:www.${host}`), sans, 'warn')
} catch (e) {
  check('Infra', 'Certificado TLS válido', false, e.message)
}

const redirects = [
  [`http://${host}/`, base, 'HTTP → HTTPS'],
  [`http://www.${host}/`, base, 'http://www → https sin www'],
  [`https://www.${host}/`, base, 'https://www → sin www'],
  [`${base}index.html`, base, '/index.html → /'],
]
for (const [from, to, label] of redirects) {
  try {
    const r = await followRedirects(from)
    const pass = !r.loop && r.final === to && r.status === 200 && r.hops <= 2
    check('Infra', `${label} (301, sin bucles)`, pass, r.chain.join(' → '))
    if (r.chain.length > 1) check('Infra', `${label} usa 301 permanente`, r.chain[0].startsWith('301'), r.chain[0], 'warn')
  } catch (e) {
    check('Infra', label, false, e.message, label.includes('www') ? 'warn' : 'fail')
  }
}

section('Funcional · Página principal y recursos')
const home = await req(base)
check('Funcional', 'GET / → 200', home.status === 200, `HTTP ${home.status}`)
check('Funcional', 'Content-Type text/html UTF-8', /text\/html.*utf-8/i.test(home.headers.get('content-type') || ''))
check('Funcional', 'Compresión gzip/brotli activa', /gzip|br/.test(home.headers.get('content-encoding') || ''),
  home.headers.get('content-encoding') || 'sin compresión', 'warn')
check('Funcional', 'HTML sin caché agresiva', /no-cache/.test(home.headers.get('cache-control') || ''),
  home.headers.get('cache-control') || '', 'warn')

const assets = [...home.body.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
check('Funcional', 'Bundles JS/CSS referenciados', assets.length >= 2, `${assets.length} encontrados`)
for (const a of assets) {
  const r = await req(new URL(a, base).href, { method: 'HEAD' })
  check('Funcional', `Asset ${a}`, r.status === 200, `HTTP ${r.status}`)
  check('Funcional', `  caché inmutable`, /immutable/.test(r.headers.get('cache-control') || ''),
    r.headers.get('cache-control') || '', 'warn')
}
for (const f of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'site.webmanifest', 'og-image.png', 'logo.svg', '404.css']) {
  const r = await req(base + f, { method: 'HEAD' })
  check('Funcional', `/${f}`, r.status === 200, `HTTP ${r.status}`)
}

section('Funcional · Errores y archivos protegidos')
const nf = await req(`${base}ruta-que-no-existe-${Date.now()}`)
check('Funcional', 'URL inexistente → 404 real (no soft-404)', nf.status === 404, `HTTP ${nf.status}`)
check('Funcional', 'Página 404 personalizada', /404/.test(nf.body) && nf.body.length > 300)
for (const f of ['.htaccess', '.env', '.env.deploy', '.git/config', 'package.json', 'README.md']) {
  const r = await req(base + f, { method: 'HEAD' })
  check('Seguridad', `/${f} no accesible`, r.status === 403 || r.status === 404, `HTTP ${r.status}`)
}

section('Seguridad · Cabeceras HTTP')
const h = home.headers
const csp = h.get('content-security-policy') || ''
check('Seguridad', 'Strict-Transport-Security', !!h.get('strict-transport-security'))
check('Seguridad', 'Content-Security-Policy', !!csp)
check('Seguridad', 'CSP permite FormSubmit (connect-src)', /connect-src[^;]*formsubmit\.co/.test(csp))
check('Seguridad', 'CSP permite Google Fonts', /fonts\.googleapis\.com/.test(csp) && /fonts\.gstatic\.com/.test(csp))
check('Seguridad', 'X-Content-Type-Options: nosniff', h.get('x-content-type-options') === 'nosniff')
check('Seguridad', 'X-Frame-Options', !!h.get('x-frame-options'))
check('Seguridad', 'Referrer-Policy', !!h.get('referrer-policy'))
check('Seguridad', 'Sin X-Powered-By', !h.get('x-powered-by'), h.get('x-powered-by') || '', 'warn')

section('Funcional · Endpoint de contacto (/contact.php) — sin enviar correos reales')
const form = (o) => new URLSearchParams(o).toString()
const post = (body, origin = base.slice(0, -1)) => req(`${base}contact.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', Origin: origin },
  body,
})
let r = await req(`${base}contact.php`, { headers: { Accept: 'application/json' } })
check('Funcional', 'GET → 405 (solo POST)', r.status === 405, `HTTP ${r.status}`)
check('Funcional', 'PHP ejecutándose (responde JSON, no código fuente)', !r.body.includes('<?php') && /^\s*\{/.test(r.body),
  r.body.slice(0, 80))
r = await post(form({ name: 'QA', email: 'qa@example.com', message: 'test' }), 'https://sitio-malicioso.example')
check('Seguridad', 'Origen externo → 403', r.status === 403, `HTTP ${r.status}`)
r = await post(form({ name: '', email: '', message: '' }))
check('Funcional', 'Campos vacíos → 422 + mensaje', r.status === 422 && /completa/i.test(r.body), `HTTP ${r.status} ${r.body}`)
r = await post(form({ name: 'QA', email: 'no-es-email', message: 'test' }))
check('Funcional', 'Email inválido → 422', r.status === 422, `HTTP ${r.status}`)
r = await post(form({ name: 'QA', email: 'qa@example.com', message: 'test', website: 'bot' }))
check('Funcional', 'Honeypot (bot) → 200 silencioso, sin correo', r.status === 200 && /"ok":true/.test(r.body), `HTTP ${r.status}`)
r = await req(`${base}contact.php`, { method: 'OPTIONS', headers: { Origin: base.slice(0, -1) } })
check('Funcional', 'Preflight CORS → 204', r.status === 204, `HTTP ${r.status}`)

const fs1 = await req('https://formsubmit.co/', { method: 'HEAD' }).catch(() => ({ status: 0 }))
check('Funcional', 'FormSubmit (servicio primario) alcanzable', fs1.status > 0 && fs1.status < 500, `HTTP ${fs1.status}`, 'warn')

/* SEO sobre el HTML real servido */
await seoAudit(home.body, base)

const robotsRes = await req(`${base}robots.txt`)
check('SEO', 'robots.txt → 200 text/plain', robotsRes.status === 200 && /text\/plain/.test(robotsRes.headers.get('content-type') || ''),
  `HTTP ${robotsRes.status} ${robotsRes.headers.get('content-type')}`)
auditRobots(robotsRes.body, base)

const smRes = await req(`${base}sitemap.xml`)
check('SEO', 'sitemap.xml → 200 XML', smRes.status === 200 && /xml/.test(smRes.headers.get('content-type') || ''),
  `HTTP ${smRes.status} ${smRes.headers.get('content-type')}`)
for (const loc of auditSitemap(smRes.body, base)) {
  const lr = await req(loc, { method: 'HEAD' })
  check('SEO', `URL del sitemap responde 200 sin redirección: ${loc}`, lr.status === 200, `HTTP ${lr.status}`)
}

const xRobots = home.headers.get('x-robots-tag') || ''
check('SEO', 'Sin X-Robots-Tag: noindex en la home', !/noindex/i.test(xRobots), xRobots || '(ausente)')

finish()

function finish() {
  const fails = results.filter((r) => r.status === 'fail')
  const warns = results.filter((r) => r.status === 'warn')
  console.log(`\n\x1b[1mResultado:\x1b[0m ${results.length - fails.length - warns.length} OK · ${warns.length} avisos · ${fails.length} fallos`)
  if (fails.length) {
    console.log('\nFallos:')
    fails.forEach((f) => console.log(`  ${C.fail} [${f.group}] ${f.name}${f.detail ? ` — ${f.detail}` : ''}`))
  }
  process.exit(fails.length ? 1 : 0)
}
