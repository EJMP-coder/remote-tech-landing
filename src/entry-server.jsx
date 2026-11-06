import { renderToString } from 'react-dom/server'
import App from './App.jsx'

/**
 * Renderiza la landing a HTML estático en tiempo de build (prerender).
 * Así buscadores y redes sociales reciben todo el contenido sin ejecutar JS.
 */
export function render() {
  return renderToString(<App />)
}
