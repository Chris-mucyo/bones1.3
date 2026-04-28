import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider';
import SignupScene from '../components/SignupScene';
import SignupWizard from '../components/SignupWizard';

export default function SignupPage() {
  const { theme, toggle } = useTheme();

  const t = {
    pageBg:       'linear-gradient(130deg, var(--bg), var(--bg2))',
    leftBg:       'linear-gradient(160deg, var(--bg2), var(--bg), var(--bg2))',
    gridLine:     'rgba(34,197,94,0.08)',
    orb1:         'rgba(34,197,94,0.1)',
    orb2:         'rgba(34,197,94,0.08)',
    headline:     'var(--text1)',
    subtext:      'var(--text2)',
    badgeBorder:  'var(--border2)',
    badgeBg:      'var(--bg2)',
    rightBg:      'var(--bg)',
    rightBorder:  'var(--border-custom)',
    accentLine:   'var(--link)',
    logoText:     'var(--text1)',
    toggleBg:     'var(--bg2)',
    toggleBorder: 'var(--border-custom)',
    toggleColor:  'var(--link)',
  };

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ background: t.pageBg }}
      data-theme={theme}
    >

      {/* ══════════ LEFT — animated scene ══════════ */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-[0_0_52%] relative overflow-hidden transition-all duration-300"
        style={{ background: t.leftBg }}
      >
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        {/* Orbs */}
        <div className="absolute -top-20 -right-15 w-[320px] h-80 rounded-full blur-[70px] pointer-events-none transition-all duration-300"
          style={{ background: t.orb1, animation: 'orb 9s ease-in-out infinite' }} />
        <div className="absolute -bottom-15 -left-12.5 w-65 h-65 rounded-full blur-[70px] pointer-events-none transition-all duration-300"
          style={{ background: t.orb2, animation: 'orb 7s ease-in-out infinite reverse' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-5"
          style={{ animation: 'leftSlide 0.7s cubic-bezier(.22,1,.36,1) both' }}>

          <div className="text-center mb-6">
            <h2 className="font-bold leading-tight mb-2 transition-colors duration-300"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px,2.2vw,28px)', color: t.headline }}>
              Join the Commerce<br />Revolution 🚀
            </h2>
            <p className="text-[13px] leading-relaxed transition-colors duration-300" style={{ color: t.subtext }}>
              Connect with thousands of buyers,<br />sellers & wholesalers worldwide.
            </p>
          </div>

          <SignupScene isDark={theme === 'dark'} />

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {['3.4K Active Sellers', '12K+ Buyers', '50+ Countries'].map((label, i) => (
              <div key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-green-500 transition-all duration-300"
                style={{ border: `1px solid ${t.badgeBorder}`, background: t.badgeBg }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
                  style={{ animation: 'blink 1.4s ease-in-out infinite', animationDelay: `${i * 0.5}s` }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT — wizard ══════════ */}
      <div
        className="flex flex-col items-center justify-center flex-1 lg:flex-[0_0_48%] overflow-y-auto relative px-6 py-8 transition-colors duration-300"
        style={{ background: t.rightBg, borderLeft: `1px solid ${t.rightBorder}` }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.75 pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent,#22c55e,transparent)`, opacity: theme === 'dark' ? 0.4 : 0.7 }} />

        {/* ── Top bar: logo + theme toggle ── */}
        <div className="flex items-center justify-between w-full max-w-100 mb-6"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) both' }}>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-green-500 flex items-center justify-center shrink-0">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: t.logoText }}
              className="transition-colors duration-300">
              Shop<span style={{ color: '#22c55e' }}>Hub</span>
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: t.toggleBg, borderColor: t.toggleBorder, color: t.toggleColor }}
          >
            {theme === 'dark'
              ? <><Sun  size={14} /><span className="text-[11px] font-semibold hidden sm:inline">Light</span></>
              : <><Moon size={14} /><span className="text-[11px] font-semibold hidden sm:inline">Dark</span></>
            }
          </button>
        </div>

        <SignupWizard isDark={theme === 'dark'} />
      </div>

    </div>
  );
}
