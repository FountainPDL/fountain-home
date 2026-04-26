export function FountainLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="400"
      height="180"
      viewBox="0 0 800 200"
      role="img"
      aria-label="FountainHome logo"
      className={className}
    >
      <defs>
        <linearGradient id="grad1" x1="0" x2="1">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="50%" stopColor="#8A2BE2" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Fountain droplet + ripples */}
      <g transform="translate(80,20)">
        {/* Ripples */}
        <ellipse cx="60" cy="140" rx="46" ry="8" fill="url(#grad1)" opacity="0.12" />
        <ellipse cx="60" cy="150" rx="30" ry="5" fill="url(#grad1)" opacity="0.06" />
        {/* Fountain arcs */}
        <path
          d="M60 120 C 20 80, 20 40, 60 20"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.95"
        />
        <path
          d="M60 120 C 100 80, 100 40, 60 20"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path d="M60 20 C52 32,50 46,60 58 C70 46,68 32,60 20 Z" fill="url(#grad1)" filter="url(#glow)" />
        {/* Subtle inner highlight */}
        <path d="M60 24 C56 34,56 42,60 54 C64 42,64 34,60 24 Z" fill="#FFFFFF" opacity="0.12" />
      </g>
      {/* Wordmark */}
      <g transform="translate(180,120)">
        <text
          x="0"
          y="-18"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="700"
          fontSize="36"
          fill="currentColor"
        >
          Fountain
        </text>
        <text
          x="0"
          y="20"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="600"
          fontSize="28"
          fill="url(#grad1)"
        >
          Home
        </text>
        {/* Futuristic underline accent */}
        <rect x="0" y="30" width="220" height="4" rx="2" fill="url(#grad1)" opacity="0.9" />
      </g>
    </svg>
  )
}
