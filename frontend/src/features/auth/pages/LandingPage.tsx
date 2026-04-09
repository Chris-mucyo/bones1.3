import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { IconType } from 'react-icons';
import { FiSmartphone, FiShoppingBag, FiMonitor, FiDroplet, FiPackage, FiActivity, FiBookOpen, FiBox, FiMessageCircle, FiBarChart2, FiUserPlus, FiDollarSign } from 'react-icons/fi';
import { MdStorefront, MdWarehouse } from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';
import { RiTShirt2Line } from 'react-icons/ri';
import { BiRestaurant } from 'react-icons/bi';
import { GiSofa } from 'react-icons/gi';

// ── Particles canvas ──────────────────────────────────────
function Particles({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 90;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // lines
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,0,0,${(isDark ? 0.18 : 0.12) * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      // dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [isDark]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

// ── Animated counter ──────────────────────────────────────
function Counter({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0;
      const step = to / 70;
      const t = setInterval(() => {
        n += step;
        if (n >= to) { setVal(to); clearInterval(t); } else setVal(Math.floor(n));
      }, 14);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref} className={className}>{val.toLocaleString()}{suffix}</span>;
}

// ── Floating product card ─────────────────────────────────
function FloatingCard({ Icon, name, price, seller, badge, style, isDark }: {
  Icon: IconType; name: string; price: string; seller: string; badge?: string; style?: React.CSSProperties;
  isDark: boolean;
}) {
  return (
    <div className={`absolute rounded-2xl p-3.5 shadow-2xl backdrop-blur-sm w-52 ${isDark ? 'bg-[#0d0d0d] border border-white/9' : 'bg-white border border-black/12'}`}
      style={{ ...style, animation: 'floatCard 5s ease-in-out infinite' }}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center text-xl shrink-0">
          <Icon size={18} className="text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>{name}</p>
          <p className={`text-[10px] truncate ${isDark ? 'text-white/35' : 'text-black/55'}`}>{seller}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-black text-green-500">{price}</span>
        {badge && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Category pill ─────────────────────────────────────────
function CategoryPill({ Icon, name, count, isDark }: { Icon: IconType; name: string; count: string; isDark: boolean }) {
  return (
    <Link to="/login" className="no-underline group">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200 cursor-pointer ${isDark ? 'border-white/8 bg-white/3' : 'border-black/10 bg-black/[0.02]'}`}>
        <span className="text-xl"><Icon size={18} className="text-green-500" /></span>
        <div>
          <p className={`text-[13px] font-semibold group-hover:text-green-400 transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{name}</p>
          <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-black/50'}`}>{count} listings</p>
        </div>
      </div>
    </Link>
  );
}

// ── Feature ───────────────────────────────────────────────
function Feature({ Icon, title, desc, glow, isDark }: { Icon: IconType; title: string; desc: string; glow?: boolean; isDark: boolean }) {
  return (
    <div className={`group relative p-7 rounded-2xl border transition-all duration-300 cursor-default overflow-hidden
      ${glow ? 'border-green-500/25 bg-green-500/4' : isDark ? 'border-white/[0.07] bg-white/2 hover:border-green-500/25 hover:bg-green-500/3' : 'border-black/10 bg-black/[0.02] hover:border-green-500/25 hover:bg-green-500/[0.05]'}`}>
      {glow && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(34,197,94,0.08) 0%, transparent 60%)' }} />}
      <div className="relative">
        <div className="text-3xl mb-4"><Icon size={28} className="text-green-500" /></div>
        <h3 className={`text-[16px] font-bold mb-2.5 ${isDark ? 'text-white' : 'text-black'}`}>{title}</h3>
        <p className={`text-[13px] leading-relaxed ${isDark ? 'text-white/40' : 'text-black/60'}`}>{desc}</p>
      </div>
    </div>
  );
}

// ── Testimonial ───────────────────────────────────────────
function Testimonial({ name, role, text, avatar, verified, isDark }: {
  name: string; role: string; text: string; avatar: string; verified?: boolean;
  isDark: boolean;
}) {
  return (
    <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'border-white/[0.07] bg-white/2 hover:border-white/12' : 'border-black/10 bg-black/[0.02] hover:border-black/20'}`}>
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => <span key={i} className="text-green-500 text-[13px]">★</span>)}
      </div>
      <p className={`text-[14px] leading-relaxed mb-5 ${isDark ? 'text-white/55' : 'text-black/65'}`}>"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black text-black shrink-0"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          {avatar}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>{name}</p>
            {verified && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#22c55e">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            )}
          </div>
          <p className={`text-[11px] ${isDark ? 'text-white/30' : 'text-black/50'}`}>{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const tabs = ['Buyers', 'Sellers', 'Wholesalers'];
  const tabContent = [
    { headline: 'Find anything in Rwanda', sub: 'Browse thousands of listings across electronics, fashion, food, and more. Chat directly with sellers and get the best deal.', cta: 'Start shopping', Icon: FiShoppingBag },
    { headline: 'Grow your business online', sub: 'List products in minutes, reach buyers across the country, and manage your shop with real-time analytics.', cta: 'Open your shop', Icon: MdStorefront },
    { headline: 'Connect with bulk buyers', sub: 'List wholesale products, set minimum orders, and scale your distribution network across Rwanda effortlessly.', cta: 'Join wholesale hub', Icon: MdWarehouse },
  ];

  return (
    <div className={`landing-page ${isDark ? 'landing-dark bg-[#030303] text-white' : 'landing-light bg-[#f7f9fc] text-black'} min-h-screen overflow-x-hidden`} style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Particles isDark={isDark} />

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-14 transition-all duration-300 ${scrolled ? `py-3 backdrop-blur-xl border-b ${isDark ? 'bg-[#030303]/90 border-white/6' : 'bg-[#f7f9fc]/95 border-black/10'}` : 'py-5'}`}
        style={{ zIndex: 100 }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="../src/assets/shophub-logo.svg" className=" w-40" />
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/4 border border-white/[0.07] rounded-full px-1.5 py-1.5">
          {['Features', 'Categories', 'How it works', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className="text-[13px] text-white/50 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/6 transition-all no-underline">
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/login" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors no-underline hidden md:block">
            Sign in
          </Link>
          <Link to="/register"
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-[13px] rounded-full transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] no-underline">
            Get started
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center" style={{ zIndex: 1 }}>

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/25 bg-green-500/[0.07] mb-7"
          style={{ animation: 'fadeUp .6s ease both' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[11px] font-bold text-green-400 tracking-[2px] uppercase">Rwanda's Commerce Platform</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl mx-auto leading-[1.02] font-black tracking-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(44px, 7vw, 84px)', animation: 'fadeUp .6s ease .08s both' }}>
          The marketplace<br />
          <span className="relative inline-block">
            <span className="text-green-500">built for Rwanda</span>
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 400 8" preserveAspectRatio="none">
              <path d="M0 7 Q100 1 200 7 Q300 13 400 7" stroke="#22c55e" strokeWidth="2.5" fill="none" opacity=".5" />
            </svg>
          </span>
        </h1>

        {/* Sub */}
        <p className="max-w-xl mx-auto text-[16px] text-white/45 leading-relaxed mb-10"
          style={{ animation: 'fadeUp .6s ease .16s both' }}>
          Buy, sell, and connect in real time. From street vendors to wholesale distributors —
          ShopHub is where Rwandan commerce happens.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-14" style={{ animation: 'fadeUp .6s ease .24s both' }}>
          <Link to="/register"
            className="group flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold text-[14px] rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] no-underline w-full sm:w-auto justify-center">
            Start for free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <Link to="/home"
            className="flex items-center gap-2 px-7 py-3.5 border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 text-white/65 hover:text-white font-semibold text-[14px] rounded-full transition-all no-underline w-full sm:w-auto justify-center">
            Browse listings
          </Link>
        </div>

        {/* Social proof bar */}
        <div className="flex items-center gap-6 flex-wrap justify-center" style={{ animation: 'fadeUp .6s ease .32s both' }}>
          <div className="flex -space-x-2.5">
            {['A', 'U', 'J', 'M', 'R', 'K'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030303] flex items-center justify-center text-[10px] font-black text-black"
                style={{ background: `hsl(${140 + i * 10},60%,${40 + i * 3}%)` }}>{l}</div>
            ))}
          </div>
          <p className="text-[12px] text-white/35"><span className="text-white font-bold">2,400+</span> active sellers · <span className="text-white font-bold">18,000+</span> listings</p>
          <div className="flex items-center gap-1.5 text-[12px] text-white/35">
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-green-500 text-[10px]">★</span>)}</div>
            <span>4.9 / 5 rating</span>
          </div>
        </div>

        {/* Floating product cards */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          <FloatingCard Icon={FiSmartphone} name="Samsung Galaxy A55" price="RWF 650,000" seller="TechCity Kigali" badge="Verified" isDark={isDark}
            style={{ top: '22%', left: '4%', animationDelay: '0s' }} />
          <FloatingCard Icon={RiTShirt2Line} name="Kitenge Dress Set" price="RWF 45,000" seller="Umuco Fashion" badge="New" isDark={isDark}
            style={{ top: '55%', left: '2%', animationDelay: '1.5s' }} />
          <FloatingCard Icon={FiDroplet} name="Arabica Beans 1kg" price="RWF 12,000" seller="Rwanda Coffee Co." badge="Hot" isDark={isDark}
            style={{ top: '25%', right: '4%', animationDelay: '0.7s' }} />
          <FloatingCard Icon={GiSofa} name="Agaseke Basket Set" price="RWF 35,000" seller="Ikirezi Crafts" isDark={isDark}
            style={{ top: '58%', right: '2%', animationDelay: '2s' }} />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section
        className={`relative py-14 border-y ${isDark ? 'border-white/6' : 'border-black/10'}`}
        style={{
          zIndex: 1,
          background: isDark
            ? 'linear-gradient(180deg, #030303 0%, #060f09 50%, #030303 100%)'
            : 'linear-gradient(180deg, #f7f9fc 0%, #eef7f1 50%, #f7f9fc 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: 18400, s: '+', label: 'Active Listings' },
            { n: 2400, s: '+', label: 'Verified Sellers' },
            { n: 50, s: '+', label: 'Categories' },
            { n: 9200, s: '+', label: 'Daily Chats' },
          ].map(({ n, s, label }) => (
            <div key={label}>
              <p style={{ fontFamily: "'Playfair Display', serif" }} className={`text-4xl md:text-5xl font-black mb-1.5 ${isDark ? 'text-green-500' : 'text-green-700'}`}>
                <Counter to={n} suffix={s} className={isDark ? 'text-green-500' : 'text-green-700'} />
              </p>
              <p className={`text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-black/55'}`}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TABS: Buyer / Seller / Wholesale ─────────────── */}
      <section className="relative py-28 px-6 md:px-14" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-500/50 mb-3">One platform</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for everyone
            </h2>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-1 bg-white/4 border border-white/[0.07] p-1.5 rounded-2xl">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setActiveTab(i)}
                  className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer
                    ${activeTab === i ? 'bg-green-500 text-black shadow-lg shadow-green-500/25' : 'text-white/40 hover:text-white/70'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20" key={activeTab}
            style={{ animation: 'fadeUp .4s ease both' }}>
            <div className="flex-1 max-w-lg">
              <div className="text-5xl mb-6">
                {(() => {
                  const TabIcon = tabContent[activeTab].Icon;
                  return <TabIcon size={44} className="text-green-500" />;
                })()}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-black text-white mb-4">
                {tabContent[activeTab].headline}
              </h3>
              <p className="text-[15px] text-white/45 leading-relaxed mb-8">{tabContent[activeTab].sub}</p>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-[14px] rounded-full transition-all hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] no-underline">
                {tabContent[activeTab].cta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
            {/* Visual */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-72 h-64">
                <div className="absolute inset-0 rounded-3xl border border-green-500/15 bg-green-500/3" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-full flex items-center gap-3 bg-white/4 border border-white/[0.07] rounded-xl p-3"
                      style={{ animation: `fadeUp .4s ease ${i * 100}ms both` }}>
                      <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center text-lg shrink-0">
                        {[FiBox, FiMessageCircle, FiBarChart2].map((Icon, idx) => idx === i ? <Icon key={idx} size={17} className="text-green-500" /> : null)}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-white">{[
                          activeTab === 0 ? '3 new listings nearby' : activeTab === 1 ? '3 new orders today' : '3 bulk inquiries',
                          activeTab === 0 ? 'Price negotiated ✓' : activeTab === 1 ? 'Message from buyer' : 'Distribution request',
                          activeTab === 0 ? 'Delivery confirmed' : activeTab === 1 ? 'Analytics updated' : 'Contract signed',
                        ][i]}</p>
                        <p className="text-[10px] text-white/25">Just now</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section id="categories" className="relative py-24 px-6 md:px-14 border-t border-white/5" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-500/50 mb-2">Shop by category</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-black text-white">
                What are you looking for?
              </h2>
            </div>
            <Link to="/home" className="text-[13px] font-semibold text-green-500 hover:text-green-400 transition-colors no-underline hidden md:block">
              View all categories →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { i: FiSmartphone, n: 'Electronics', c: '4,200' },
              { i: RiTShirt2Line, n: 'Fashion', c: '3,800' },
              { i: BiRestaurant, n: 'Food & Drinks', c: '2,100' },
              { i: GiSofa, n: 'Home & Living', c: '1,900' },
              { i: FiMonitor, n: 'Computers', c: '980' },
              { i: FiDroplet, n: 'Beauty', c: '1,450' },
              { i: FiPackage, n: 'Wholesale', c: '760' },
              { i: FiActivity, n: 'Sports', c: '620' },
              { i: FiActivity, n: 'Health', c: '850' },
              { i: FiBookOpen, n: 'Books', c: '430' },
            ].map(cat => <CategoryPill key={cat.n} Icon={cat.i} name={cat.n} count={cat.c} isDark={isDark} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-6 md:px-14" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-500/50 mb-3">Features</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-black text-white mb-4">
              Commerce, reimagined
            </h2>
            <p className="text-white/35 text-[15px] max-w-lg mx-auto">Everything you need to buy, sell, and grow — designed for the Rwandan market.</p>
          </div>

          {/* Featured large card + 2 small */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Feature glow Icon={FiMessageCircle} title="Real-time Marketplace Chat"
                desc="Don't just browse — negotiate. Message any seller directly from their listing. Discuss prices, ask about condition, arrange delivery — all inside ShopHub's built-in messenger that works like WhatsApp." isDark={isDark} />
            </div>
            <Feature Icon={FiActivity} title="Verified Seller Badges"
              desc="Every seller is ID-verified. Know exactly who you're transacting with before you send a single franc." isDark={isDark} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Feature Icon={IoHomeOutline} title="Near Me Search"
              desc="Find listings close to you — in your sector, district, or province. Local commerce made easy." isDark={isDark} />
            <Feature Icon={FiBarChart2} title="Seller Analytics"
              desc="See views, messages, and conversion data for every listing. Grow your shop with real data." isDark={isDark} />
            <Feature Icon={FiPackage} title="Wholesale Hub"
              desc="Connect bulk buyers with large distributors. Set minimum order quantities and negotiate volume pricing." isDark={isDark} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 px-6 md:px-14 border-t border-white/5" style={{ zIndex: 1, background: 'linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.02) 50%, transparent 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-500/50 mb-3">Process</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl md:text-5xl font-black text-white mb-16">
            Live in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), transparent)' }} />
            {[
              { n: '01', Icon: FiUserPlus, t: 'Create account', d: 'Sign up in 60 seconds. Verify with your national ID to become a trusted seller.' },
              { n: '02', Icon: FiBox, t: 'List your product', d: 'Add photos, set price, choose category. Your listing is live instantly — no approval wait.' },
              { n: '03', Icon: FiDollarSign, t: 'Make the sale', d: 'Buyers message you, you negotiate, you close the deal. Money moves, commerce works.' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center text-3xl">
                    <s.Icon size={28} className="text-green-500" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-green-500/30">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-white mb-2.5">{s.t}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section className="relative py-24 px-6 md:px-14 border-t border-white/5" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-green-500/50 mb-3">Social proof</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-black text-white">
              Sellers love ShopHub
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Testimonial avatar="A" name="Amina Uwase" role="Fashion Seller · Kigali" verified isDark={isDark}
              text="I listed my Kitenge collection and got 3 buyers within the first hour. The chat is incredible — I closed RWF 180,000 in sales on day one." />
            <Testimonial avatar="J" name="Jean-Claude Nkusi" role="Electronics Wholesaler" verified isDark={isDark}
              text="ShopHub's wholesale tier is exactly what I needed. My bulk listings reach serious buyers. Volume has grown 3x since joining." />
            <Testimonial avatar="M" name="Marie Mukamana" role="Coffee Producer · Huye" verified isDark={isDark}
              text="Buyers from Kigali find my coffee now without me doing anything. ShopHub handles the discovery, I just need to grow my crop." />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────── */}
      <section className="relative py-32 px-6 text-center overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.09) 0%, transparent 65%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/25 bg-green-500/[0.07] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-green-400 tracking-[2px] uppercase">Free to join · No credit card</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            Start trading<br /><span className="text-green-500">today.</span>
          </h2>
          <p className="text-white/35 text-[15px] mb-10 max-w-md mx-auto leading-relaxed">
            Join thousands of Rwandan buyers, sellers, and wholesalers. List your first product in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-[15px] rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] no-underline w-full sm:w-auto justify-center">
              Create free account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/home"
              className="flex items-center gap-2 px-8 py-4 border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/5 text-white/55 hover:text-white font-semibold text-[15px] rounded-full transition-all no-underline w-full sm:w-auto justify-center">
              Browse without signing up
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="relative border-t border-white/6 py-12 px-6 md:px-14" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">

               <img src="../src/assets/shophub-logo.svg" className=" w-60" />
              </div>
              <p className="text-[13px] text-white/30 leading-relaxed">Rwanda's commerce platform connecting buyers, sellers, and wholesalers in real time.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-[13px]">
              {[
                { title: 'Platform', links: ['Home', 'Browse Listings', 'Post a Listing', 'Wholesale Hub'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
                { title: 'Support', links: ['Help Center', 'Privacy Policy', 'Terms', 'Contact'] },
              ].map(col => (
                <div key={col.title}>
                  <p className="font-bold text-white/60 mb-3 text-[11px] uppercase tracking-widest">{col.title}</p>
                  <div className="flex flex-col gap-2">
                    {col.links.map(l => (
                      <a key={l} href="#" className="text-white/25 hover:text-white/60 transition-colors no-underline">{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/6 gap-3">
            <p className="text-[12px] text-white/20">© 2025 ShopHub · Made in Rwanda 🇷🇼</p>
            <p className="text-[12px] text-white/20">Buy · Sell · Connect</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp      { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes floatCard   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        .landing-light [class*="text-white"] { color: #000 !important; }
        .landing-light [class*="text-white/"] { color: #000 !important; opacity: 1 !important; }
        .landing-light [class*="border-white"] { border-color: rgba(0,0,0,0.12) !important; }
        .landing-light [class*="bg-white/"] { background-color: rgba(0,0,0,0.03) !important; }
      `}</style>
    </div>
  );
}
