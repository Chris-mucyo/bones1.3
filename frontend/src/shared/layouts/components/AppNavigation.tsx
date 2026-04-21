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
  user,
  viewport,
  onToggleCollapse,
}: AppNavigationProps) {
  // Use CSS variables from globals.css for colors
  const stroke = (active: boolean) => (active ? 'var(--link)' : 'var(--text2)');

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
          gap: 15,
          padding: collapsed ? '10px 0' : '9px 11px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 'var(--radius)',
          cursor: 'pointer',
          textDecoration: 'none',
          color: isActive ? 'var(--text1)' : 'var(--text2)',
          background: isActive ? 'var(--sidebar-primary)' : 'transparent',
          transition: 'all .15s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          fontFamily: 'var(--font-sans)', 
          position: 'relative',
        }}
        className="hover:bg-[var(--sidebar-primary-foreground)]"
      >
        {isActive && !collapsed && (
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: 'var(--link)' }} />
        )}
        <span style={{ flexShrink: 0, display: 'flex', opacity: isActive ? 1 : 0.7 }}>{icon(isActive)}</span>
        {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: 'var(--link)', color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontFamily: 'var(--font-sans)' }}>
            {badge}
          </span>
        )}
      </a>
    );
  };

  const Divider = () => <div style={{ height: 1, background: 'var(--divider)', margin: collapsed ? '8px 12px' : '8px 10px' }} />;
  
  const SectionLabel = ({ label }: { label: string }) =>
    !collapsed ? (
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.6px', textTransform: 'uppercase', color: 'var(--text3)', padding: '10px 11px 4px', fontFamily: 'var(--font-sans)' }}>
        {label}
      </div>
    ) : null;

  return (
    <>
      <nav style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50, width: collapsed ? 72 : 236, background: 'var(--sidebar)', borderRight: `1px solid var(--sidebar-border)`, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0 32px', transition: 'width .25s cubic-bezier(.4,0,.2,1)', display: viewport === 'mobile' ? 'none' : 'block' }} className="scrollbar-none">
        <div style={{ padding: '4px 8px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onToggleCollapse}
            className="hover:bg-[var(--sidebar-accent)]"
            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid var(--sidebar-border)`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sidebar-foreground)', flexShrink: 0, transition: 'background .15s, border-color .15s' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2={collapsed ? '15' : '21'} y2="12" />
              <line x1="3" y1="18" x2={collapsed ? '18' : '21'} y2="18" />
            </svg>
          </button>
          {!collapsed && (
            <a href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', minWidth: 0 }}>
              <img src="../src/assets/shophub-logo.svg" alt="ShopHub" style={{ height: 34, maxWidth: 132, objectFit: 'contain' }} />
            </a>
          )}
        </div>

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
          <div style={{ margin: '20px 8px 0', padding: '14px', borderRadius: 12, background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--link)', fontFamily: 'var(--font-sans)', margin: '0 0 4px' }}>Start selling today</p>
            <p style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-sans)', margin: '0 0 10px', lineHeight: 1.5 }}>Reach thousands of buyers in Rwanda.</p>
            <a href="/listings/new" className="auth-btn" style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8, width: 'auto', display: 'inline-flex' }}>
              Post Free →
            </a>
          </div>
        )}
      </nav>

      {viewport === 'mobile' && (
        <nav
          style={{
            position: 'fixed', left: 10, right: 10, bottom: 10, zIndex: 120, borderRadius: 16, border: `1px solid var(--border)`, background: 'var(--background)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', padding: '8px 6px', display: 'grid', gridTemplateColumns: `repeat(${mobileBottomNav.length}, minmax(0, 1fr))`, gap: 4,
          }}
          className="shadow-lg"
        >
          {mobileBottomNav.map(item => {
            const isActive = activePath === item.href || (item.href !== '/home' && activePath.startsWith(item.href));
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  borderRadius: 12, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 4px', minHeight: 46, color: isActive ? 'var(--link)' : 'var(--text2)', background: isActive ? 'var(--input-bg)' : 'transparent', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-sans)', position: 'relative',
                }}
              >
                <span style={{ display: 'flex', opacity: isActive ? 1 : 0.82 }}>{item.icon(isActive)}</span>
                <span style={{ lineHeight: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: '22%', minWidth: 14, height: 14, borderRadius: 99, background: 'var(--link)', color: '#000', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: `1px solid var(--bg)` }}>
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