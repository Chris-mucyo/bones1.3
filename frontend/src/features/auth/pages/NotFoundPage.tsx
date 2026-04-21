import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Dot grid
    const COLS = 28;
    const ROWS = 18;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cw = canvas.width / COLS;
      const ch = canvas.height / ROWS;

      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const x = c * cw;
          const y = r * ch;
          const dx = x - canvas.width  / 2;
          const dy = y - canvas.height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const wave = Math.sin(dist * 0.018 - t * 0.04) * 0.5 + 0.5;
          const opacity = wave * 0.22 + 0.04;
          const radius  = wave * 1.8 + 0.8;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,197,94,${opacity})`;
          ctx.fill();
        }
      }
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">

      {/* Animated dot grid */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow behind 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 select-none"
        style={{ animation: 'fadeUp .7s cubic-bezier(.22,1,.36,1) both' }}>

        {/* ShopHub logo top */}
        <Link to="/home" className="flex items-center gap-2 no-underline mb-16 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="font-display text-base font-bold text-white">
            Shop<span className="text-green-500">Hub</span>
          </span>
        </Link>

        {/* Giant 404 */}
        <div className="relative mb-2">
          <span
            className="font-display font-black text-white leading-none select-none"
            style={{
              fontSize: 'clamp(120px, 22vw, 220px)',
              letterSpacing: '-0.04em',
              WebkitTextStroke: '1px rgba(34,197,94,0.25)',
              textShadow: '0 0 80px rgba(34,197,94,0.15)',
            }}
          >
            404
          </span>

          {/* Glitch line decoration */}
          <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden"
            style={{ mixBlendMode: 'screen' }}>
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent"
              style={{ animation: 'glitchScan 3s ease-in-out infinite' }} />
          </div>
        </div>

        {/* 404 Not Found label */}
        <p
          className="text-xs font-bold tracking-[3px] uppercase text-green-500/60 -mt-3 mb-5"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .1s both' }}
        >
          404 · Not Found
        </p>

        {/* Broken chain icon */}
        <div className="flex items-center gap-3 mb-6"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .15s both' }}>
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              <line x1="8" y1="16" x2="8.01" y2="16" stroke="rgba(239,68,68,0.7)" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* Message */}
        <h1
          className="text-white font-display text-2xl font-bold mb-3"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .2s both' }}
        >
          This listing went missing
        </h1>
        <p
          className="text-white/40 text-sm max-w-xs leading-relaxed mb-10"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .3s both' }}
        >
          The page you're looking for doesn't exist or has been removed.
          Let's get you back to finding what you need.
        </p>

        {/* Actions */}
        <div
          className="flex items-center gap-3"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .4s both' }}
        >
          <Link
            to="/home"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)] no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 text-white/70 hover:text-white font-semibold text-sm transition-all duration-200 no-underline"
          >
            Go back
          </button>
        </div>

        {/* Quick nav pills */}
        <div
          className="flex items-center gap-2 mt-8 flex-wrap justify-center"
          style={{ animation: 'fadeUp .6s cubic-bezier(.22,1,.36,1) .5s both' }}
        >
          <span className="text-[11px] text-white/20 mr-1">Try:</span>
          {['Electronics', 'Fashion', 'Food & Drinks', 'Near Me'].map(cat => (
            <Link
              key={cat}
              to="/home"
              className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/15 text-[11px] font-medium transition-all no-underline"
            >
              {cat}
            </Link>
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #000, transparent)' }} />

      {/* Glitch animation */}
      <style>{`
        @keyframes glitchScan {
          0%, 100% { transform: translateY(-100px); opacity: 0; }
          40% { opacity: 1; }
          60% { transform: translateY(100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
