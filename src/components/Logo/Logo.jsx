import { useId } from 'react'

/**
 * Logo oficial Remote Tech (monograma "RT" serif atravesado por una banda
 * con el nombre). Versión vectorial minimalista adaptada a la paleta web:
 * letras en blanco frío/plata y banda con el gradiente azul → cyan.
 *
 * Props:
 *  - showText: muestra "REMOTE TECH" dentro de la banda (default: true)
 *  - className / title
 */
export default function Logo({ showText = true, className, title = 'Remote Tech C.A.' }) {
  const uid = useId().replace(/:/g, '')
  const silver = `rt-silver-${uid}`
  const band = `rt-band-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 122 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={silver} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#E3EEFC" />
          <stop offset="1" stopColor="#9FB4D3" />
        </linearGradient>
        <linearGradient id={band} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0066FF" />
          <stop offset="1" stopColor="#00D4FF" />
        </linearGradient>
      </defs>

      {/* Monograma RT */}
      <g fill={`url(#${silver})`}>
        {/* R */}
        <path
          fillRule="evenodd"
          d="M12 4H43C52 4 58 10 58 18.5C58 27 52 33 43 33H29V56.5H37V60H12V56.5H20V7.5H12Z
             M29 8.5V28.5H42C48 28.5 51.5 24.5 51.5 18.5C51.5 12.5 48 8.5 42 8.5Z"
        />
        <path d="M40 33H47.5L62 56.5H66V60H50V56.5H54Z" />
        {/* T */}
        <path d="M66 4H110V14H106.5V9.5H92.5V56.5H100V60H76V56.5H83.5V9.5H69.5V14H66Z" />
      </g>

      {/* Banda */}
      <rect
        x="1" y="29" width="120" height="14" rx="1.5"
        fill={`url(#${band})`}
        stroke="#020B18" strokeWidth="2" paintOrder="stroke"
      />
      {showText && (
        <text
          x="62.2" y="36.4"
          textAnchor="middle" dominantBaseline="central"
          fontFamily="'DM Sans', 'Segoe UI', Arial, sans-serif"
          fontWeight="500" fontSize="8.4" letterSpacing="2.4"
          fill="#020B18"
        >
          REMOTE TECH
        </text>
      )}
    </svg>
  )
}
