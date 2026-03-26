import { ReactNode } from 'react';
import { useTheme } from '../components/ThemeProvider';
import CommerceScene from '../../features/auth/components/CommerceScene';

/*
  TO USE YOUR OWN BACKGROUND IMAGE:
  import bgImage from '../../assets/your-image.jpg';
  then pass: <AuthLayout bgImage={bgImage}>
*/

interface AuthLayoutProps {
  children: ReactNode;
  bgImage?: string;
}

const DEFAULT_BG = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=85&auto=format&fit=crop';

export default function AuthLayout({ children, bgImage }: AuthLayoutProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" data-theme={theme}>

      {/* LEFT PANEL */}
      <div
        className="w-full lg:w-[52%] min-h-[340px] lg:min-h-screen relative overflow-hidden flex flex-col"
        style={{ backgroundImage: `url(${bgImage || DEFAULT_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div
          className="absolute inset-0 z-0 transition-all duration-300"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(155deg, rgba(5,15,8,0.93) 0%, rgba(10,25,14,0.80) 60%, rgba(14,83,45,0.45) 100%)'
              : 'linear-gradient(155deg, rgba(10,80,30,0.88) 0%, rgba(14,120,50,0.70) 60%, rgba(20,160,70,0.35) 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12">

          {/* ShopHub Logo */}
          <div className="auth-anim-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" width="180" height="52" fill="none">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#22C55E" floodOpacity="0.18"/>
                </filter>
              </defs>
              <path d="M16 44 Q16 28 32 28 L80 28 Q96 28 96 44" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" fill="none" filter="url(#shadow)"/>
              <line x1="12" y1="44" x2="100" y2="44" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round"/>
              <rect x="46" y="60" width="20" height="28" rx="3" stroke="#22C55E" strokeWidth="2.8" fill="none"/>
              <rect x="20" y="54" width="18" height="14" rx="2.5" stroke="#22C55E" strokeWidth="2.5" fill="none"/>
              <rect x="74" y="54" width="18" height="14" rx="2.5" stroke="#22C55E" strokeWidth="2.5" fill="none"/>
              <line x1="10" y1="88" x2="102" y2="88" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
              <circle cx="88" cy="30" r="2.2" fill="#22C55E" opacity="0.4"/>
              <circle cx="95" cy="30" r="2.2" fill="#22C55E" opacity="0.4"/>
              <circle cx="88" cy="23" r="2.2" fill="#22C55E" opacity="0.4"/>
              <circle cx="95" cy="23" r="2.2" fill="#22C55E" opacity="0.4"/>
              <line x1="112" y1="34" x2="112" y2="86" stroke="#22C55E" strokeWidth="1" opacity="0.2"/>
              <text x="122" y="72" fontFamily="'Raleway','Trebuchet MS',sans-serif" fontSize="46" fontWeight="600" letterSpacing="-0.5" fill="#22C55E">Shop</text>
              <text x="272" y="72" fontFamily="'Raleway','Trebuchet MS',sans-serif" fontSize="46" fontWeight="300" letterSpacing="1" fill="#22C55E" opacity="0.88">Hub</text>
              <text x="122" y="92" fontFamily="'Raleway','Trebuchet MS',sans-serif" fontSize="10.5" fontWeight="400" letterSpacing="4.5" fill="#22C55E" opacity="0.5">MARKETPLACE</text>
            </svg>
          </div>

          {/* Animated scene */}
          <div className="flex items-center justify-center py-6 lg:py-0 lg:flex-1">
            <CommerceScene />
          </div>

          <p className="text-white/30 text-xs tracking-widest uppercase font-medium">
            Connecting buyers · sellers · wholesalers
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 relative min-h-screen transition-colors duration-300"
        style={{ background: theme === 'dark' ? '#111a13' : '#ffffff' }}
      >
        <button
          onClick={toggle}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:border-green-500 hover:text-green-500"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        {children}
      </div>

    </div>
  );
}
