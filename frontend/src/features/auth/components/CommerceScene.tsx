export default function CommerceScene() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full max-w-[480px]"
      style={{ maxHeight: 360 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="240" cy="330" rx="200" ry="18" fill="rgba(34,197,94,0.08)" />

      {/* BUYER */}
      <g style={{ animation: 'float 3.8s ease-in-out infinite', transformOrigin: '120px 280px' }}>
        <ellipse cx="120" cy="295" rx="22" ry="10" fill="rgba(34,197,94,0.15)" />
        <rect x="104" y="245" width="32" height="48" rx="8" fill="#166534" />
        <circle cx="120" cy="232" r="18" fill="#fde68a" />
        <circle cx="114" cy="230" r="2.5" fill="#1f2937" />
        <circle cx="126" cy="230" r="2.5" fill="#1f2937" />
        <path d="M114 237 Q120 242 126 237" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M102 228 Q103 212 120 210 Q137 212 138 228" fill="#92400e" />
        <line x1="104" y1="258" x2="90" y2="272" stroke="#166634" strokeWidth="6" strokeLinecap="round" />
        <line x1="136" y1="258" x2="150" y2="272" stroke="#166634" strokeWidth="6" strokeLinecap="round" />
        <line x1="112" y1="293" x2="108" y2="318" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
        <line x1="128" y1="293" x2="132" y2="318" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="107" cy="320" rx="9" ry="4" fill="#0f172a" />
        <ellipse cx="133" cy="320" rx="9" ry="4" fill="#0f172a" />
        <rect x="96" y="196" width="48" height="18" rx="9" fill="#22c55e" />
        <text x="120" y="209" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#fff">BUYER</text>
      </g>

      {/* SELLER */}
      <g style={{ animation: 'bob 3.2s ease-in-out infinite', transformOrigin: '240px 270px' }}>
        <ellipse cx="240" cy="318" rx="28" ry="11" fill="rgba(34,197,94,0.12)" />
        <rect x="221" y="238" width="38" height="55" rx="9" fill="#15803d" />
        <circle cx="240" cy="224" r="20" fill="#fed7aa" />
        <circle cx="233" cy="222" r="2.8" fill="#1f2937" />
        <circle cx="247" cy="222" r="2.8" fill="#1f2937" />
        <path d="M230 217 Q233 215 236 217" stroke="#78350f" strokeWidth="1.5" fill="none" />
        <path d="M244 217 Q247 215 250 217" stroke="#78350f" strokeWidth="1.5" fill="none" />
        <path d="M233 230 Q240 236 247 230" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M220 222 Q222 202 240 200 Q258 202 260 222" fill="#1c1917" />
        <rect x="234" y="243" width="12" height="20" rx="3" fill="#22c55e" />
        <circle cx="240" cy="249" r="3" fill="#fff" />
        <line x1="221" y1="250" x2="200" y2="234" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
        <line x1="259" y1="250" x2="280" y2="234" stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
        <circle cx="198" cy="232" r="6" fill="#fed7aa" />
        <circle cx="282" cy="232" r="6" fill="#fed7aa" />
        <line x1="232" y1="293" x2="228" y2="318" stroke="#14532d" strokeWidth="8" strokeLinecap="round" />
        <line x1="248" y1="293" x2="252" y2="318" stroke="#14532d" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="226" cy="321" rx="11" ry="5" fill="#111827" />
        <ellipse cx="254" cy="321" rx="11" ry="5" fill="#111827" />
        <rect x="214" y="185" width="52" height="18" rx="9" fill="#22c55e" />
        <text x="240" y="198" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#fff">SELLER</text>
      </g>

      {/* WHOLESALER */}
      <g style={{ animation: 'floatB 4.5s ease-in-out infinite', animationDelay: '0.8s', transformOrigin: '360px 285px' }}>
        <ellipse cx="360" cy="318" rx="22" ry="9" fill="rgba(34,197,94,0.1)" />
        <rect x="344" y="248" width="32" height="46" rx="8" fill="#1e3a2f" />
        <path d="M360 248 L350 260 L360 265 L370 260 Z" fill="#22c55e" opacity="0.7" />
        <circle cx="360" cy="234" r="18" fill="#fcd9bd" />
        <circle cx="354" cy="232" r="2.5" fill="#1f2937" />
        <circle cx="366" cy="232" r="2.5" fill="#1f2937" />
        <rect x="350" y="228" width="10" height="7" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2" />
        <rect x="362" y="228" width="10" height="7" rx="3" fill="none" stroke="#6b7280" strokeWidth="1.2" />
        <line x1="360" y1="231" x2="362" y2="231" stroke="#6b7280" strokeWidth="1" />
        <path d="M342 228 Q344 215 360 213 Q376 215 378 228" fill="#374151" />
        <line x1="344" y1="260" x2="330" y2="276" stroke="#1e3a2f" strokeWidth="6" strokeLinecap="round" />
        <line x1="376" y1="260" x2="390" y2="270" stroke="#1e3a2f" strokeWidth="6" strokeLinecap="round" />
        <line x1="352" y1="294" x2="348" y2="318" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
        <line x1="368" y1="294" x2="372" y2="318" stroke="#111827" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="346" cy="320" rx="10" ry="4" fill="#0f172a" />
        <ellipse cx="374" cy="320" rx="10" ry="4" fill="#0f172a" />
        <rect x="326" y="196" width="68" height="18" rx="9" fill="#22c55e" />
        <text x="360" y="209" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="700" fill="#fff">WHOLESALER</text>
      </g>

      {/* CART */}
      <g style={{ animation: 'cartBob 0.9s ease-in-out infinite', transformOrigin: '178px 300px' }}>
        <path d="M162 284 L168 308 L194 308 L200 284 Z" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
        <line x1="158" y1="284" x2="162" y2="284" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <line x1="158" y1="280" x2="160" y2="284" stroke="#22c55e" strokeWidth="2" />
        <circle cx="172" cy="312" r="3.5" fill="#22c55e" />
        <circle cx="190" cy="312" r="3.5" fill="#22c55e" />
        <rect x="169" y="290" width="8" height="10" rx="2" fill="#86efac" />
        <rect x="180" y="288" width="9" height="12" rx="2" fill="#4ade80" />
      </g>

      {/* CHAT BUBBLES */}
      <g style={{ animation: 'slideMsg 5s ease-in-out infinite', transformOrigin: '185px 195px' }}>
        <rect x="140" y="183" width="90" height="26" rx="12" fill="#22c55e" />
        <path d="M148 209 L140 218 L158 209 Z" fill="#22c55e" />
        <text x="185" y="200" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="600" fill="#fff">Need 50 units 📦</text>
      </g>
      <g style={{ animation: 'slideMsgR 5s ease-in-out infinite', animationDelay: '1.2s', transformOrigin: '185px 168px' }}>
        <rect x="130" y="156" width="110" height="26" rx="12" fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth="1" />
        <path d="M232 182 L240 192 L222 182 Z" fill="rgba(34,197,94,0.2)" />
        <text x="185" y="173" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="500" fill="#22c55e">In stock! ✓ Check it</text>
      </g>
      <g style={{ animation: 'slideMsgR 5s ease-in-out infinite', animationDelay: '3.5s', transformOrigin: '305px 185px' }}>
        <rect x="252" y="174" width="106" height="26" rx="12" fill="#22c55e" />
        <path d="M330 200 L340 210 L320 200 Z" fill="#22c55e" />
        <text x="305" y="191" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9.5" fontWeight="600" fill="#fff">MOQ 100 @ $4.20</text>
      </g>
      <g style={{ animation: 'slideMsg 5s ease-in-out infinite', animationDelay: '2.5s', transformOrigin: '305px 158px' }}>
        <rect x="255" y="148" width="100" height="24" rx="11" fill="rgba(34,197,94,0.18)" stroke="#22c55e" strokeWidth="1" />
        <path d="M270 172 L260 182 L280 172 Z" fill="rgba(34,197,94,0.18)" />
        <text x="305" y="164" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="9" fontWeight="500" fill="#22c55e">Deal! Sending PO 🤝</text>
      </g>

      {/* ORDER CARD */}
      <g style={{ animation: 'appear 4s ease-in-out infinite', transformOrigin: '240px 80px' }}>
        <rect x="188" y="55" width="104" height="54" rx="10" fill="rgba(20,50,30,0.92)" stroke="#22c55e" strokeWidth="1" />
        <text x="240" y="74" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="600" fill="rgba(34,197,94,0.6)" letterSpacing="1">ORDER PLACED</text>
        <text x="240" y="90" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="16" fontWeight="700" fill="#22c55e">$4,200</text>
        <text x="240" y="103" textAnchor="middle" fontFamily="Outfit,sans-serif" fontSize="8" fill="rgba(255,255,255,0.4)">1000 units · ref #TL-8821</text>
      </g>

      {/* STAT PILLS */}
      <g style={{ animation: 'appear 4s ease-in-out infinite', animationDelay: '2s' }}>
        <rect x="22" y="140" width="76" height="32" rx="10" fill="rgba(20,50,30,0.9)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
        <circle cx="35" cy="156" r="5" fill="#22c55e" />
        <text x="44" y="152" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#22c55e">MATCH</text>
        <text x="44" y="163" fontFamily="Outfit,sans-serif" fontSize="8" fill="rgba(255,255,255,0.5)">Found 12</text>
      </g>
      <g style={{ animation: 'appear 4s ease-in-out infinite' }}>
        <rect x="382" y="140" width="78" height="32" rx="10" fill="rgba(20,50,30,0.9)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
        <circle cx="395" cy="156" r="5" fill="#22c55e" />
        <text x="404" y="152" fontFamily="Outfit,sans-serif" fontSize="8" fontWeight="700" fill="#22c55e">ACTIVE</text>
        <text x="404" y="163" fontFamily="Outfit,sans-serif" fontSize="8" fill="rgba(255,255,255,0.5)">3.4K sellers</text>
      </g>

      {/* CONNECTION LINES */}
      <line x1="152" y1="260" x2="210" y2="260" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
      <line x1="270" y1="260" x2="332" y2="260" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
      <circle cx="181" cy="260" r="3" fill="#22c55e" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
      <circle cx="301" cy="260" r="3" fill="#22c55e" style={{ animation: 'blink 1.4s ease-in-out infinite', animationDelay: '0.7s' }} />
    </svg>
  );
}
