import type { ReactNode } from 'react';

type Role = 'buyer' | 'seller' | 'Wholesaler' | 'admin';

export interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: Role;
  unreadMessages: number;
  unreadNotifications: number;
}

type NavItem = {
  href: string;
  icon: (active: boolean) => ReactNode;
  label: string;
  badge?: number;
  roles?: Role[];
};

export interface NavTheme {
  topbarBg: string;
  border: string;
  sidebarBg: string;
  text1: string;
  text2: string;
  hover: string;
  green: string;
  greenDim: string;
  badgeBg: string;
  searchBg: string;
}

interface AppNavigationProps {
  activePath: string;
  collapsed: boolean;
  isDark: boolean;
  user: CurrentUser | null;
  theme: NavTheme;
  viewport: 'mobile' | 'tablet' | 'desktop';
  onToggleCollapse: () => void;
}

export default function AppNavigation({
  activePath,
  collapsed,
  isDark,
  user,
  theme,
  viewport,
  onToggleCollapse,
}: AppNavigationProps) {
  const showTopNav = activePath.startsWith('/home');
  const stroke = (active: boolean) => (active ? theme.green : theme.text2);

  const mkIcon = (d: string | ReactNode, active: boolean, extra?: ReactNode) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {typeof d === 'string' ? <path d={d} /> : d}
      {extra}
    </svg>
  );

  const allNav: NavItem[] = [
    { href: '/home', label: 'Home', icon: a => mkIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>, a) },
    { href: '/explore', label: 'Explore', icon: a => mkIcon(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>, a) },
    { href: '/chat', label: 'Messages', badge: user?.unreadMessages, icon: a => mkIcon('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', a) },
    { href: '/saved', label: 'Saved', icon: a => mkIcon('M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z', a) },
    { href: '/shop', label: 'My Shop', roles: ['seller', 'admin'], icon: a => mkIcon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', a) },
    { href: '/listings/new', label: 'Post Listing', roles: ['seller', 'admin'], icon: a => mkIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>, a) },
    { href: '/analytics', label: 'Analytics', roles: ['seller', 'admin'], icon: a => mkIcon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>, a) },
    { href: '/trending', label: 'Trending', icon: a => mkIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>, a) },
    { href: '/top-sellers', label: 'Top Sellers', icon: a => mkIcon(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />, a) },
    { href: '/near-me', label: 'Near Me', icon: a => mkIcon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>, a) },
    { href: '/buyer/dashboard', label: 'Dashboard', roles: ['buyer'], icon: a => mkIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>, a) },
    { href: '/account', label: 'Account', icon: a => mkIcon(<><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" /></>, a) },
    { href: '/settings', label: 'Settings', icon: a => mkIcon(<><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93A10 10 0 105.93 19.07" /></>, a) },
    { href: '/help', label: 'Help', icon: a => mkIcon(<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, a) },
  ];

  const visibleNav = allNav.filter(item => !item.roles || (user?.role && item.roles.includes(user.role)));
  const mainNav = visibleNav.filter(i => ['/home', '/explore', '/chat', '/saved'].includes(i.href));
  const sellNav = visibleNav.filter(i => ['/shop', '/listings/new', '/analytics'].includes(i.href));
  const discoverNav = visibleNav.filter(i => ['/trending', '/top-sellers', '/near-me'].includes(i.href));
  const accountNav = visibleNav.filter(i => ['/buyer/dashboard', '/account', '/settings', '/help'].includes(i.href));
  const mobileBottomNav = visibleNav.filter(i => ['/home', '/explore', '/chat', '/saved', '/account'].includes(i.href));
  const SidebarItem = ({ href, icon, label, badge }: NavItem) => {
    const isActive = activePath === href || (href !== '/home' && activePath.startsWith(href));
    return (
      <a
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: collapsed ? '10px 0' : '9px 11px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 10,
          cursor: 'pointer',
          textDecoration: 'none',
          color: isActive ? theme.green : theme.text2,
          background: isActive ? theme.greenDim : 'transparent',
          transition: 'all .15s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          fontFamily: "'DM Sans', sans-serif",
          position: 'relative',
        }}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = theme.hover;
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        {isActive && !collapsed && (
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: theme.green }} />
        )}
        <span style={{ flexShrink: 0, display: 'flex', opacity: isActive ? 1 : 0.7 }}>{icon(isActive)}</span>
        {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: theme.green, color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontFamily: "'DM Sans', sans-serif" }}>
            {badge}
          </span>
        )}
      </a>
    );
  };

  const Divider = () => <div style={{ height: 1, background: theme.border, margin: collapsed ? '8px 12px' : '8px 10px' }} />;
  const SectionLabel = ({ label }: { label: string }) =>
    !collapsed ? (
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)', padding: '10px 11px 4px', fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
    ) : null;

  const TopbarIconBtn = ({ href, badge, children: icon }: { href?: string; badge?: number; children: ReactNode }) => {
    const style: React.CSSProperties = {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.text2,
      position: 'relative',
      textDecoration: 'none',
      flexShrink: 0,
      transition: 'background .15s',
    };
    const inner = (
      <>
        {icon}
        {badge !== undefined && badge > 0 && (
          <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 14, height: 14, borderRadius: 99, background: theme.badgeBg, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: `1.5px solid ${isDark ? '#131516' : '#f6f7f8'}`, fontFamily: "'DM Sans', sans-serif" }}>
            {badge}
          </span>
        )}
      </>
    );
    return href ? (
      <a href={href} style={style} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = theme.hover} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
        {inner}
      </a>
    ) : (
      <button style={style} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = theme.hover} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
        {inner}
      </button>
    );
  };

  return (
    <>
      {showTopNav && (
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 56, display: 'flex', alignItems: 'center', padding: '0 14px', background: theme.topbarBg, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${theme.border}`, gap: 10 }}>
        <button
          onClick={onToggleCollapse}
          style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text2, flexShrink: 0, transition: 'background .15s, border-color .15s' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = theme.hover;
            (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.16)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.borderColor = theme.border;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2={collapsed ? '15' : '21'} y2="12" />
            <line x1="3" y1="18" x2={collapsed ? '18' : '21'} y2="18" />
          </svg>
        </button>

        <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <img src="../src/assets/shophub-logo.svg" alt="ShopHub" style={{ height: 28 }} />
        </a>

        {viewport !== 'mobile' ? (
          <div style={{ flex: 1, maxWidth: 420, margin: '0 auto', position: 'relative' }}>
            <a
              href="/explore"
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', background: theme.searchBg, border: `1px solid ${theme.border}`, borderRadius: 10, textDecoration: 'none', cursor: 'pointer', transition: 'border-color .15s, background .15s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.green;
                (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = theme.border;
                (e.currentTarget as HTMLElement).style.background = theme.searchBg;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.text2} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: 13, color: theme.text2, fontFamily: "'DM Sans', sans-serif" }}>Search products, categories...</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)', fontFamily: "'DM Sans', sans-serif", border: `1px solid ${theme.border}`, borderRadius: 5, padding: '1px 5px', letterSpacing: '0.02em' }}>
                Ctrl+K
              </span>
            </a>
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
          {viewport === 'mobile' && (
            <>
              <TopbarIconBtn href="/explore">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </TopbarIconBtn>
              <TopbarIconBtn href="/settings">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01A1.65 1.65 0 0010 3.09V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </TopbarIconBtn>
            </>
          )}
          <TopbarIconBtn badge={user?.unreadNotifications}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </TopbarIconBtn>
          <TopbarIconBtn href="/chat" badge={user?.unreadMessages}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </TopbarIconBtn>

        </div>
      </header>
      )}

      <nav style={{ position: 'fixed', left: 0, top: showTopNav ? 56 : 0, bottom: 0, zIndex: 50, width: collapsed ? 72 : 236, background: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0 32px', transition: 'width .25s cubic-bezier(.4,0,.2,1)', display: viewport === 'mobile' ? 'none' : 'block' }}>
        <div style={{ padding: '4px 8px' }}>{mainNav.map(item => <SidebarItem key={item.href} {...item} />)}</div>
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
        <div style={{ padding: '0 8px' }}>{accountNav.map(item => <SidebarItem key={item.href} {...item} />)}</div>

        {!collapsed && user?.role === 'buyer' && (
          <div style={{ margin: '20px 8px 0', padding: '14px', borderRadius: 12, background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: theme.green, fontFamily: "'DM Sans', sans-serif", margin: '0 0 4px' }}>Start selling today</p>
            <p style={{ fontSize: 11, color: theme.text2, fontFamily: "'DM Sans', sans-serif", margin: '0 0 10px', lineHeight: 1.5 }}>Reach thousands of buyers in Rwanda.</p>
            <a href="/listings/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#000', background: theme.green, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Post Free →
            </a>
          </div>
        )}
      </nav>

      {viewport === 'mobile' && (
        <nav
          style={{
            position: 'fixed',
            left: 10,
            right: 10,
            bottom: 10,
            zIndex: 120,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            background: theme.topbarBg,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            padding: '8px 6px',
            display: 'grid',
            gridTemplateColumns: `repeat(${mobileBottomNav.length}, minmax(0, 1fr))`,
            gap: 4,
            boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.4)' : '0 10px 24px rgba(0,0,0,0.12)',
          }}
        >
          {mobileBottomNav.map(item => {
            const isActive = activePath === item.href || (item.href !== '/home' && activePath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  borderRadius: 12,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '6px 4px',
                  minHeight: 46,
                  color: isActive ? theme.green : theme.text2,
                  background: isActive ? theme.greenDim : 'transparent',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  position: 'relative',
                }}
              >
                <span style={{ display: 'flex', opacity: isActive ? 1 : 0.82 }}>{item.icon(isActive)}</span>
                <span style={{ lineHeight: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: '22%',
                      minWidth: 14,
                      height: 14,
                      borderRadius: 99,
                      background: theme.badgeBg,
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      border: `1px solid ${isDark ? '#131516' : '#f6f7f8'}`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      )}
    </>
  );
}
