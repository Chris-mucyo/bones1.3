import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../components/ThemeProvider';

interface Props { children: React.ReactNode; }

interface CurrentUser {
  id:        string;
  name:      string;
  avatar?:   string;
  role:      'buyer' | 'seller' | 'Wholesaler' | 'admin';
  unreadMessages:      number;
  unreadNotifications: number;
}

type NavItem = {
  href:    string;
  icon:    (active: boolean) => React.ReactNode;
  label:   string;
  badge?:  number;
  roles?:  Array<'buyer' | 'seller' | 'Wholesaler' | 'admin'>;
};

export default function AppLayout({ children }: Props) {
  const { theme }    = useTheme();
  const location     = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser]           = useState<CurrentUser | null>(null);

  const isDark     = theme === 'dark';
  const activePath = location.pathname;

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => { if (!axios.isCancel(err)) setUser(null); });
    return () => controller.abort();
  }, []);

  const t = {
    topbarBg:  isDark ? 'rgba(0,0,0,0.92)'      : 'rgba(248,248,248,0.95)',
    border:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    sidebarBg: isDark ? '#080808'                : '#efefef',
    bg:        isDark ? '#000'                   : '#f5f5f5',
    text1:     isDark ? '#fff'                   : '#0f0f0f',
    text2:     isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
    hover:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    green:     '#22c55e',
    greenDim:  isDark ? 'rgba(34,197,94,0.1)'    : 'rgba(34,197,94,0.08)',
    badgeBg:   '#ef4444',
  };

  const stroke = (active: boolean) => active ? t.green : t.text2;

  const mkIcon = (d: string | React.ReactNode, active: boolean, extra?: React.ReactNode) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {typeof d === 'string' ? <path d={d} /> : d}
      {extra}
    </svg>
  );

  const ALL_NAV: NavItem[] = [
    {
      href: '/home', label: 'Home',
      icon: a => mkIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, a),
    },
    {
      href: '/explore', label: 'Explore',
      icon: a => mkIcon(<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>, a),
    },
    {
      href: '/chat', label: 'Messages', badge: user?.unreadMessages,
      icon: a => mkIcon('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', a),
    },
    {
      href: '/saved', label: 'Saved',
      icon: a => mkIcon('M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z', a),
    },
    {
      href: '/shop', label: 'My Shop', roles: ['seller', 'admin'],
      icon: a => mkIcon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', a),
    },
    {
      href: '/listings/new', label: 'Post Listing', roles: ['seller', 'admin'],
      icon: a => mkIcon(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>, a),
    },
    {
      href: '/analytics', label: 'Analytics', roles: ['seller', 'admin'],
      icon: a => mkIcon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>, a),
    },
    {
      href: '/trending', label: 'Trending',
      icon: a => mkIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>, a),
    },
    {
      href: '/top-sellers', label: 'Top Sellers',
      icon: a => mkIcon(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>, a),
    },
    {
      href: '/near-me', label: 'Near Me',
      icon: a => mkIcon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>, a),
    },
    {
      href: '/account', label: 'Account',
      icon: a => mkIcon(<><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></>, a),
    },
    {
      href: '/settings', label: 'Settings',
      icon: a => mkIcon(<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 105.93 19.07"/></>, a),
    },
    {
      href: '/help', label: 'Help',
      icon: a => mkIcon(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, a),
    },
  ];

  const visibleNav = ALL_NAV.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const mainNav     = visibleNav.filter(i => ['/home','/explore','/chat','/saved'].includes(i.href));
  const sellNav     = visibleNav.filter(i => ['/shop','/listings/new','/analytics'].includes(i.href));
  const discoverNav = visibleNav.filter(i => ['/trending','/top-sellers','/near-me'].includes(i.href));
  const accountNav  = visibleNav.filter(i => ['/account','/settings','/help'].includes(i.href));

  const SidebarItem = ({ href, icon, label, badge }: NavItem) => {
    const isActive = activePath === href || (href !== '/home' && activePath.startsWith(href));
    return (
      <a href={href} style={{
        display: 'flex', alignItems: 'center', gap: 11,
        padding: collapsed ? '10px 0' : '9px 11px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10, cursor: 'pointer', textDecoration: 'none',
        color: isActive ? t.green : t.text2,
        background: isActive ? t.greenDim : 'transparent',
        transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden',
        fontSize: 13, fontWeight: isActive ? 600 : 500,
        fontFamily: "'DM Sans', sans-serif", position: 'relative',
      }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = t.hover; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {isActive && !collapsed && (
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: t.green }} />
        )}
        <span style={{ flexShrink: 0, display: 'flex', opacity: isActive ? 1 : 0.7 }}>{icon(isActive)}</span>
        {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: t.green, color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontFamily: "'DM Sans', sans-serif" }}>
            {badge}
          </span>
        )}
      </a>
    );
  };

  const Divider = () => (
    <div style={{ height: 1, background: t.border, margin: collapsed ? '8px 12px' : '8px 10px' }} />
  );

  const SectionLabel = ({ label }: { label: string }) => !collapsed ? (
    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.22)', padding: '10px 11px 4px', fontFamily: "'DM Sans', sans-serif" }}>
      {label}
    </div>
  ) : null;

  const TopbarIconBtn = ({ href, badge, children: icon }: { href?: string; badge?: number; children: React.ReactNode }) => {
    const style: React.CSSProperties = {
      width: 36, height: 36, borderRadius: '50%', border: 'none',
      background: 'transparent', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: t.text2,
      position: 'relative', textDecoration: 'none', flexShrink: 0, transition: 'background .15s',
    };
    const inner = (
      <>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 14, height: 14, borderRadius: 99, background: t.badgeBg, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: `1.5px solid ${isDark ? '#000' : '#f5f5f5'}`, fontFamily: "'DM Sans', sans-serif" }}>
            {badge}
          </span>
        )}
      </>
    );
    return href
      ? <a href={href} style={style} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.hover} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>{inner}</a>
      : <button style={style} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = t.hover} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>{inner}</button>;
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56, display: 'flex', alignItems: 'center', padding: '0 14px', background: t.topbarBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.border}`, gap: 10 }}>
        <button onClick={() => setCollapsed(c => !c)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text2, flexShrink: 0, transition: 'background .15s, border-color .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.hover; (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = t.border; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2={collapsed ? "15" : "21"} y2="12"/>
            <line x1="3" y1="18" x2={collapsed ? "18" : "21"} y2="18"/>
          </svg>
        </button>

        <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="../src/assets/shophub-logo.svg" alt="ShopHub" style={{ height: 28 }} />
        </a>

        <div style={{ flex: 1, maxWidth: 420, margin: '0 auto', position: 'relative' }}>
          <a href="/explore" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${t.border}`, borderRadius: 10, textDecoration: 'none', cursor: 'pointer', transition: 'border-color .15s, background .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.green; (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.border; (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.text2} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ fontSize: 13, color: t.text2, fontFamily: "'DM Sans', sans-serif" }}>Search products, categories...</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontFamily: "'DM Sans', sans-serif", border: `1px solid ${t.border}`, borderRadius: 5, padding: '1px 5px', letterSpacing: '0.02em' }}>⌘K</span>
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
          <TopbarIconBtn badge={user?.unreadNotifications}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </TopbarIconBtn>
          <TopbarIconBtn href="/chat" badge={user?.unreadMessages}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </TopbarIconBtn>

          {user && (
            <a href="/account" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px 4px 4px', borderRadius: 20, border: `1px solid ${t.border}`, textDecoration: 'none', marginLeft: 4, transition: 'border-color .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = t.green}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = t.border}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {/* {user.name.charAt(0).toUpperCase()} */}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text1, fontFamily: "'DM Sans', sans-serif", maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {/* {user.name.split(' ')[0]} */}
              </span>
            </a>
          )}
        </div>
      </header>

      <nav style={{ position: 'fixed', left: 0, top: 56, bottom: 0, zIndex: 50, width: collapsed ? 60 : 218, background: t.sidebarBg, borderRight: `1px solid ${t.border}`, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 32px', transition: 'width .25s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding: '4px 8px' }}>
          {mainNav.map(item => <SidebarItem key={item.href} {...item} />)}
        </div>

        {sellNav.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '0 8px' }}>
              <SectionLabel label="Sell" />
              {sellNav.map(item => <SidebarItem key={item.href} {...item} />)}
            </div>
          </>
        )}

        <Divider />
        <div style={{ padding: '0 8px' }}>
          <SectionLabel label="Discover" />
          {discoverNav.map(item => <SidebarItem key={item.href} {...item} />)}
        </div>

        <Divider />
        <div style={{ padding: '0 8px' }}>
          {accountNav.map(item => <SidebarItem key={item.href} {...item} />)}
        </div>

        {!collapsed && user?.role === 'buyer' && (
          <div style={{ margin: '20px 8px 0', padding: '14px', borderRadius: 12, background: isDark ? 'rgba(34,197,94,0.07)' : 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: t.green, fontFamily: "'DM Sans', sans-serif", margin: '0 0 4px' }}>Start selling today</p>
            <p style={{ fontSize: 11, color: t.text2, fontFamily: "'DM Sans', sans-serif", margin: '0 0 10px', lineHeight: 1.5 }}>Reach thousands of buyers in Rwanda.</p>
            <a href="/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#000', background: t.green, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Post Free →</a>
          </div>
        )}
      </nav>

      <main style={{ marginLeft: collapsed ? 60 : 218, paddingTop: 56, minHeight: '100vh', transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)' }}>
        {children}
      </main>
    </div>
  );
}