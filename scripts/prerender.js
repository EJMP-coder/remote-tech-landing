/**
 * Prerender post-build: inyecta el HTML renderizado de <App /> dentro de
 * dist/index.html para que el contenido sea indexable sin JavaScript.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root      = process.cwd()
const distDir   = path.join(root, 'dist')
const ssrDir    = path.join(root, 'dist-ssr')
const indexPath = path.join(distDir, 'index.html')
const marker    = '<div id="root"></div>'

const template = fs.readFileSync(indexPath, 'utf-8')
if (!template.includes(marker)) {
  console.error(`✗ No se encontró ${marker} en dist/index.html`)
  process.exit(1)
}

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const appHtml = render()

fs.writeFileSync(indexPath, template.replace(marker, `<div id="root">${appHtml}</div>`))
fs.rmSync(ssrDir, { recursive: true, force: true })

console.log(`✓ Prerender completado (${(appHtml.length / 1024).toFixed(1)} KB de HTML)`)
