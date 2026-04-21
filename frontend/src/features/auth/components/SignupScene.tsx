interface Props { isDark?: boolean; }

export default function SignupScene({ isDark = true }: Props) {
  return (
    <svg
      viewBox="0 0 480 370"
      style={{ width: '100%', maxHeight: 310 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <ellipse cx="240" cy="338" rx="210" ry="16" fill="rgba(34,197,94,0.06)" />

      {/* ── BUYER — dancing left ── */}
      <g style={{ animation: 'dance1 1.8s ease-in-out infinite', transformOrigin: '120px 290px' }}>
        <ellipse cx="120" cy="300" rx="22" ry="8" fill="rgba(34,197,94,0.12)" />
        {/* legs */}
        <g style={{ animation: 'legSwing 0.9s ease-in-out infinite', transformOrigin: '116px 285px' }}>
          <line x1="112" y1="285" x2="106" y2="318" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
        </g>
        <g style={{ animation: 'legSwing2 0.9s ease-in-out infinite', transformOrigin: '124px 285px' }}>
          <line x1="128" y1="285" x2="134" y2="318" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
        </g>
        <ellipse cx="105" cy="320" rx="8" ry="4" fill="#0f172a" />
        <ellipse cx="135" cy="320" rx="8" ry="4" fill="#0f172a" />
        {/* body */}
        <rect x="104" y="245" width="32" height="42" rx="8" fill="#166534" />
        {/* arm waving */}
        <g style={{ animation: 'wave 0.9s ease-in-out infinite', transformOrigin: '104px 258px' }}>
          <line x1="104" y1="258" x2="84" y2="240" stroke="#166634" strokeWidth="6" strokeLinecap="round" />
          <circle cx="84" cy="240" r="5" fill="#fde68a" />
        </g>
        {/* arm with phone */}
        <g style={{ animation: 'phonePulse 1.2s ease-in-out infinite', transformOrigin: '136px 258px' }}>
          <line x1="136" y1="258" x2="154" y2="248" stroke="#166634" strokeWidth="6" strokeLinecap="round" />
          <rect x="150" y="240" width="14" height="20" rx="3" fill="#1e293b" stroke="#22c55e" strokeWidth="1.5" />
          <rect x="152" y="243" width="10" height="12" rx="1" fill="#22c55e" opacity="0.6" />
        </g>
        {/* head */}
        <circle cx="120" cy="232" r="18" fill="#fde68a" />
        <circle cx="113" cy="229" r="2.5" fill="#1f2937" />
        <circle cx="127" cy="229" r="2.5" fill="#1f2937" />
        <circle cx="114" cy="228" r="1" fill="#fff" opacity="0.6" />
        <circle cx="128" cy="228" r="1" fill="#fff" opacity="0.6" />
        <path d="M114 237 Q120 243 126 237" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M102 228 Q103 211 120 209 Q137 211 138 228" fill="#92400e" />
        {/* badge */}
        <rect x="96" y="194" width="48" height="17" rx="8" fill="#22c55e" />
        <text x="120" y="206" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8.5" fontWeight="700" fill="#fff">BUYER</text>
      </g>

      {/* ── SELLER — bobbing center ── */}
      <g style={{ animation: 'bob 2.4s ease-in-out infinite', transformOrigin: '240px 270px' }}>
        <ellipse cx="240" cy="320" rx="26" ry="10" fill="rgba(34,197,94,0.1)" />
        <line x1="232" y1="290" x2="228" y2="320" stroke="#14532d" strokeWidth="8" strokeLinecap="round" />
        <line x1="248" y1="290" x2="252" y2="320" stroke="#14532d" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="226" cy="323" rx="11" ry="5" fill="#111827" />
        <ellipse cx="254" cy="323" rx="11" ry="5" fill="#111827" />
        <rect x="221" y="238" width="38" height="55" rx="9" fill="#15803d" />
        <rect x="234" y="242" width="12" height="18" rx="3" fill="#22c55e" />
        <circle cx="240" cy="248" r="3" fill="#fff" />
        <line x1="221" y1="250" x2="196" y2="238" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
        <line x1="259" y1="250" x2="284" y2="238" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
        {/* money hand */}
        <g style={{ animation: 'moneyBounce 1.4s ease-in-out infinite', transformOrigin: '196px 232px' }}>
          <circle cx="196" cy="232" r="6" fill="#fde68a" />
          <text x="196" y="236" textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="700">$</text>
        </g>
        <circle cx="284" cy="232" r="6" fill="#fde68a" />
        {/* head */}
        <circle cx="240" cy="224" r="20" fill="#fed7aa" />
        <circle cx="233" cy="221" r="2.8" fill="#1f2937" />
        <circle cx="247" cy="221" r="2.8" fill="#1f2937" />
        <circle cx="234" cy="220" r="1.1" fill="#fff" opacity="0.6" />
        <circle cx="248" cy="220" r="1.1" fill="#fff" opacity="0.6" />
        <path d="M230 217 Q233 215 236 217" stroke="#78350f" strokeWidth="1.5" fill="none" />
        <path d="M244 217 Q247 215 250 217" stroke="#78350f" strokeWidth="1.5" fill="none" />
        <path d="M233 230 Q240 236 247 230" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M220 222 Q222 202 240 200 Q258 202 260 222" fill="#1c1917" />
        <rect x="214" y="183" width="52" height="17" rx="8" fill="#22c55e" />
        <text x="240" y="195" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8.5" fontWeight="700" fill="#fff">SELLER</text>
      </g>

      {/* ── WHOLESALER — dancing right ── */}
      <g style={{ animation: 'dance2 2.1s ease-in-out infinite', transformOrigin: '360px 285px' }}>
        <ellipse cx="360" cy="320" rx="22" ry="8" fill="rgba(34,197,94,0.1)" />
        <g style={{ animation: 'legSwing2 1s ease-in-out infinite', transformOrigin: '354px 285px' }}>
          <line x1="352" y1="285" x2="346" y2="318" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
        </g>
        <g style={{ animation: 'legSwing 1s ease-in-out infinite', transformOrigin: '366px 285px' }}>
          <line x1="368" y1="285" x2="374" y2="318" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
        </g>
        <ellipse cx="344" cy="321" rx="10" ry="4" fill="#0f172a" />
        <ellipse cx="376" cy="321" rx="10" ry="4" fill="#0f172a" />
        <rect x="344" y="246" width="32" height="42" rx="8" fill="#1e3a2f" />
        <path d="M360 246 L350 258 L360 263 L370 258 Z" fill="#22c55e" opacity="0.7" />
        <g style={{ animation: 'wave 1s ease-in-out infinite reverse', transformOrigin: '344px 260px' }}>
          <line x1="344" y1="260" x2="324" y2="246" stroke="#1e3a2f" strokeWidth="6" strokeLinecap="round" />
          <circle cx="324" cy="246" r="5" fill="#fcd9bd" />
        </g>
        <line x1="376" y1="260" x2="396" y2="272" stroke="#1e3a2f" strokeWidth="6" strokeLinecap="round" />
        {/* head */}
        <circle cx="360" cy="232" r="18" fill="#fcd9bd" />
        <rect x="350" y="227" width="10" height="7" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2" />
        <rect x="362" y="227" width="10" height="7" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2" />
        <line x1="360" y1="230" x2="362" y2="230" stroke="#6b7280" strokeWidth="1" />
        <path d="M352 238 Q360 244 368 238" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M342 226 Q344 213 360 211 Q376 213 378 226" fill="#374151" />
        <rect x="326" y="194" width="68" height="17" rx="8" fill="#22c55e" />
        <text x="360" y="206" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8.5" fontWeight="700" fill="#fff">WHOLESALER</text>
      </g>

      {/* ── CART ── */}
      <g style={{ animation: 'cartBob 0.8s ease-in-out infinite', transformOrigin: '178px 298px' }}>
        <path d="M162 282 L168 308 L194 308 L200 282 Z" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
        <line x1="158" y1="282" x2="162" y2="282" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <line x1="156" y1="278" x2="158" y2="282" stroke="#22c55e" strokeWidth="2" />
        <circle cx="172" cy="312" r="3.5" fill="#22c55e" />
        <circle cx="190" cy="312" r="3.5" fill="#22c55e" />
        <rect x="169" y="288" width="8" height="10" rx="2" fill="#86efac" />
        <rect x="180" y="286" width="9" height="12" rx="2" fill="#4ade80" />
      </g>

      {/* ── CHAT BUBBLES ── */}
      <g style={{ animation: 'slideMsg 5s ease-in-out infinite', transformOrigin: '185px 195px' }}>
        <rect x="138" y="183" width="94" height="26" rx="12" fill="#22c55e" />
        <path d="M148 209 L138 220 L162 209 Z" fill="#22c55e" />
        <text x="185" y="200" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="600" fill="#fff">Need 50 units 📦</text>
      </g>
      <g style={{ animation: 'slideMsgR 5s ease-in-out infinite', animationDelay: '1.2s', transformOrigin: '185px 160px' }}>
        <rect x="128" y="150" width="114" height="26" rx="12" fill="rgba(34,197,94,0.18)" stroke="#22c55e" strokeWidth="1" />
        <path d="M234 176 L244 188 L220 176 Z" fill="rgba(34,197,94,0.18)" />
        <text x="185" y="167" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="500" fill="#22c55e">In stock! ✓ Check it</text>
      </g>
      <g style={{ animation: 'slideMsgR 5s ease-in-out infinite', animationDelay: '3.5s', transformOrigin: '306px 183px' }}>
        <rect x="252" y="172" width="108" height="26" rx="12" fill="#22c55e" />
        <path d="M334 198 L344 210 L322 198 Z" fill="#22c55e" />
        <text x="306" y="189" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="600" fill="#fff">MOQ 100 @ $4.20</text>
      </g>
      <g style={{ animation: 'slideMsg 5s ease-in-out infinite', animationDelay: '2.5s', transformOrigin: '306px 152px' }}>
        <rect x="255" y="142" width="102" height="24" rx="11" fill="rgba(34,197,94,0.18)" stroke="#22c55e" strokeWidth="1" />
        <path d="M270 166 L260 178 L282 166 Z" fill="rgba(34,197,94,0.18)" />
        <text x="306" y="158" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="500" fill="#22c55e">Deal! Sending PO 🤝</text>
      </g>

      {/* ── ORDER CARD ── */}
      <g style={{ animation: 'appear 4s ease-in-out infinite', transformOrigin: '240px 78px' }}>
        <rect x="188" y="52" width="104" height="52" rx="10" fill="rgba(20,50,30,0.95)" stroke="#22c55e" strokeWidth="1" />
        <text x="240" y="70" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="600" fill="rgba(34,197,94,0.6)">ORDER PLACED</text>
        <text x="240" y="87" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="16" fontWeight="700" fill="#22c55e">$4,200</text>
        <text x="240" y="99" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(5,46,22,0.4)"}>1000 units · ref #TL-8821</text>
      </g>

      {/* ── STAT PILLS ── */}
      <g style={{ animation: 'appear 4s ease-in-out infinite', animationDelay: '2s' }}>
        <rect x="18" y="135" width="78" height="32" rx="10" fill="rgba(20,50,30,0.92)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
        <circle cx="32" cy="151" r="5" fill="#22c55e" />
        <text x="41" y="147" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#22c55e">MATCH</text>
        <text x="41" y="159" fontFamily="Outfit,sans-serif" fontSize="8" fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(5,46,22,0.5)"}>Found 12</text>
      </g>
      <g style={{ animation: 'appear 4s ease-in-out infinite' }}>
        <rect x="384" y="135" width="78" height="32" rx="10" fill="rgba(20,50,30,0.92)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
        <circle cx="396" cy="151" r="5" fill="#22c55e" />
        <text x="406" y="147" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#22c55e">ACTIVE</text>
        <text x="406" y="159" fontFamily="Outfit,sans-serif" fontSize="8" fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(5,46,22,0.5)"}>3.4K sellers</text>
      </g>

      {/* ── CONNECTION LINES ── */}
      <line x1="150" y1="262" x2="212" y2="262" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
      <line x1="268" y1="262" x2="332" y2="262" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
      <circle cx="181" cy="262" r="3" fill="#22c55e" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
      <circle cx="300" cy="262" r="3" fill="#22c55e" style={{ animation: 'blink 1.4s ease-in-out infinite', animationDelay: '0.7s' }} />
    </svg>
  );
}
