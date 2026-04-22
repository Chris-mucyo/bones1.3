import { useState } from 'react';
import type { ReactNode } from 'react';

export interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
  unreadMessages: number;
  unreadNotifications: number;
}

type NavItem = {
  href: string;
  label: string;
  badge?: number;
  icon: (active: boolean) => ReactNode;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

interface AppNavigationProps {
  activePath: string;
  collapsed: boolean;
  user: CurrentUser | null;
  viewport: 'mobile' | 'tablet' | 'desktop';
  onToggleCollapse: () => void;
}

/* ─────────────────────────────────────────────
   SVG icon factory
───────────────────────────────────────────── */
function Icon({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? 'var(--sidebar-primary)' : 'currentColor'}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, transition: 'stroke .15s' }}
    >
      {children}
    </svg>
  );
}

export default function AppNavigation({
  activePath,
  collapsed,
  user,
  viewport,
  onToggleCollapse,
}: AppNavigationProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const isActive = (href: string) =>
    activePath === href || (href !== '/home' && activePath.startsWith(href));

  /* ── Nav data ── */
  const sections: NavSection[] = [
    {
      items: [
        {
          href: '/home',
          label: 'Home',
          icon: a => (
            <Icon active={a}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </Icon>
          ),
        },
        {
          href: '/explore',
          label: 'Explore',
          icon: a => (
            <Icon active={a}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </Icon>
          ),
        },
        {
          href: '/chat',
          label: 'Messages',
          badge: user?.unreadMessages,
          icon: a => (
            <Icon active={a}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </Icon>
          ),
        },
        {
          href: '/saved',
          label: 'Saved',
          icon: a => (
            <Icon active={a}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </Icon>
          ),
        },
      ],
    },
    {
      label: 'Sell',
      items: [
        {
          href: '/seller/dashboard ',
          label: 'My Shop',
          icon: a => (
            <Icon active={a}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </Icon>
          ),
        },
        {
          href: '/listings/new',
          label: 'Post Listing',
          icon: a => (
            <Icon active={a}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </Icon>
          ),
        },
        {
          href: '/analytics',
          label: 'Analytics',
          icon: a => (
            <Icon active={a}>
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </Icon>
          ),
        },
      ],
    },
    {
      label: 'Discover',
      items: [
        {
          href: '/trending',
          label: 'Trending',
          icon: a => (
            <Icon active={a}>
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </Icon>
          ),
        },
        {
          href: '/top-sellers',
          label: 'Top Sellers',
          icon: a => (
            <Icon active={a}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </Icon>
          ),
        },
        {
          href: '/near-me',
          label: 'Near Me',
          icon: a => (
            <Icon active={a}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </Icon>
          ),
        },
      ],
    },
    {
      items: [
        {
          href: '/buyer/dashboard',
          label: 'Dashboard',
          icon: a => (
            <Icon active={a}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </Icon>
          ),
        },
        {
          href: '/account',
          label: 'Account',
          icon: a => (
            <Icon active={a}>
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </Icon>
          ),
        },
        {
          href: '/settings',
          label: 'Settings',
          icon: a => (
            <Icon active={a}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </Icon>
          ),
        },
        {
          href: '/help',
          label: 'Help',
          icon: a => (
            <Icon active={a}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </Icon>
          ),
        },
      ],
    },
  ];

  const mobileItems = sections
    .flatMap(s => s.items)
    .filter(i => ['/home', '/explore', '/chat', '/saved', '/account'].includes(i.href));

  /* ─────────────────────────────────────────────
     SIDEBAR ITEM
  ───────────────────────────────────────────── */
  const SidebarItem = ({ href, label, badge, icon }: NavItem) => {
    const active  = isActive(href);
    const hovered = hoveredHref === href;

    return (
      <a
        href={href}
        onMouseEnter={() => setHoveredHref(href)}
        onMouseLeave={() => setHoveredHref(null)}
        title={collapsed ? label : undefined}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '9px 0' : '8px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 8,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          fontFamily: 'var(--font-sans)',
          letterSpacing: active ? '0.01em' : '0.025em',
          color: active
            ? 'var(--sidebar-primary)'
            : hovered
            ? 'var(--sidebar-accent-foreground)'
            : 'var(--sidebar-foreground)',
          background: active
            ? 'color-mix(in oklch, var(--sidebar-primary) 12%, transparent)'
            : hovered
            ? 'var(--sidebar-accent)'
            : 'transparent',
          transition: 'background .12s ease, color .12s ease',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Animated left accent bar */}
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2.5,
            height: active ? 18 : 0,
            borderRadius: '0 2px 2px 0',
            background: 'var(--sidebar-primary)',
            transition: 'height .18s cubic-bezier(.4,0,.2,1)',
          }}
        />

        {/* Icon */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            flexShrink: 0,
            opacity: active ? 1 : hovered ? 0.9 : 0.6,
            transition: 'opacity .12s',
          }}
        >
          {icon(active)}
        </span>

        {/* Label */}
        {!collapsed && (
          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
        )}

        {/* Expanded badge */}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span
            style={{
              minWidth: 17,
              height: 17,
              borderRadius: 99,
              background: 'var(--sidebar-primary)',
              color: 'var(--sidebar-primary-foreground)',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              flexShrink: 0,
              letterSpacing: 0,
            }}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {/* Collapsed badge dot */}
        {collapsed && badge !== undefined && badge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 7,
              right: 9,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--sidebar-primary)',
              border: '1.5px solid var(--sidebar)',
            }}
          />
        )}
      </a>
    );
  };

  /* ─────────────────────────────────────────────
     SECTION SEPARATOR
  ───────────────────────────────────────────── */
  const SectionSeparator = ({ label }: { label?: string }) => (
    <div style={{ padding: collapsed ? '0 12px' : '0 2px', margin: '4px 0 2px' }}>
      {!collapsed && label ? (
        <p
          style={{
            margin: '10px 10px 4px',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--sidebar-foreground)',
            opacity: 0.32,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {label}
        </p>
      ) : (
        <div
          style={{
            height: 1,
            background: 'var(--sidebar-border)',
            margin: '6px 8px',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );

  /* ─────────────────────────────────────────────
     USER FOOTER
  ───────────────────────────────────────────── */
  const UserFooter = () => {
    if (!user) return null;
    const initial = user.name?.charAt(0).toUpperCase() ?? '?';

    return (
      <a
        href="/account"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: collapsed ? '10px 0' : '8px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 8,
          textDecoration: 'none',
          transition: 'background .12s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sidebar-accent)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              border: '1.5px solid var(--sidebar-border)',
            }}
          />
        ) : (
          <span
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--sidebar-primary)',
              color: 'var(--sidebar-primary-foreground)',
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontFamily: 'var(--font-sans)', letterSpacing: 0,
            }}
          >
            {initial}
          </span>
        )}
        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              margin: 0, fontSize: 12, fontWeight: 600,
              color: 'var(--sidebar-accent-foreground)',
              fontFamily: 'var(--font-sans)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user.name}
            </p>
            <p style={{
              margin: 0, fontSize: 10,
              color: 'var(--sidebar-foreground)', opacity: 0.5,
              fontFamily: 'var(--font-sans)', textTransform: 'capitalize',
            }}>
              {user.role}
            </p>
          </div>
        )}
      </a>
    );
  };

  /* ─────────────────────────────────────────────
     UPSELL BANNER
  ───────────────────────────────────────────── */
  const UpsellBanner = () => (
    <div
      style={{
        margin: '8px 8px 0',
        padding: '12px 13px',
        borderRadius: 10,
        background: 'color-mix(in oklch, var(--sidebar-primary) 10%, var(--sidebar-accent))',
        border: '1px solid color-mix(in oklch, var(--sidebar-primary) 22%, var(--sidebar-border))',
      }}
    >
      <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 700, color: 'var(--sidebar-primary)', fontFamily: 'var(--font-sans)' }}>
        Start selling today
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 10, color: 'var(--sidebar-foreground)', opacity: 0.65, fontFamily: 'var(--font-sans)', lineHeight: 1.55 }}>
        Reach thousands of buyers in Rwanda.
      </p>
      <a
        href="/listings/new"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 11px', borderRadius: 6,
          background: 'var(--sidebar-primary)',
          color: 'var(--sidebar-primary-foreground)',
          fontSize: 10, fontWeight: 700,
          textDecoration: 'none', fontFamily: 'var(--font-sans)',
          transition: 'opacity .15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.82')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
      >
        Post free
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </div>
  );

  /* ─────────────────────────────────────────────
     DESKTOP / TABLET SIDEBAR
  ───────────────────────────────────────────── */
  if (viewport !== 'mobile') {
    return (
      <nav
        className="scrollbar-none"
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 50,
          width: collapsed ? 60 : 228,
          background: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 16px',
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* ── Logo bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '14px 0' : '12px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--sidebar-border)',
            marginBottom: 6,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 30, height: 30,
              borderRadius: 7,
              border: '1px solid var(--sidebar-border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sidebar-foreground)',
              flexShrink: 0,
              transition: 'background .12s',
              padding: 0,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--sidebar-accent)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2={collapsed ? '14' : '21'} y2="12" />
              <line x1="3" y1="18" x2={collapsed ? '17' : '21'} y2="18" />
            </svg>
          </button>

          {!collapsed && (
            <a href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', minWidth: 0, flex: 1 }}>
              <img
                src="../src/assets/shophub-logo.svg"
                alt="ShopHub"
                style={{ height: 26, maxWidth: 120, objectFit: 'contain' }}
              />
            </a>
          )}
        </div>

        {/* ── Nav sections ── */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          {sections.map((section, si) => (
            <div key={si}>
              {si > 0 && <SectionSeparator label={section.label} />}
              {section.items.map(item => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </div>
          ))}
        </div>

        {/* ── Upsell banner (expanded only) ── */}
        {!collapsed && <UpsellBanner />}

        {/* ── User footer ── */}
        <div
          style={{
            borderTop: '1px solid var(--sidebar-border)',
            margin: '10px 8px 0',
            paddingTop: 6,
          }}
        >
          <UserFooter />
        </div>
      </nav>
    );
  }

  /* ─────────────────────────────────────────────
     MOBILE BOTTOM BAR
  ───────────────────────────────────────────── */
  return (
    <nav
      style={{
        position: 'fixed',
        left: 12, right: 12, bottom: 12,
        zIndex: 120,
        borderRadius: 18,
        border: '1px solid var(--sidebar-border)',
        background: 'var(--sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '6px 4px',
        display: 'grid',
        gridTemplateColumns: `repeat(${mobileItems.length}, 1fr)`,
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {mobileItems.map(item => {
        const active = isActive(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '7px 4px',
              borderRadius: 13,
              textDecoration: 'none',
              background: active
                ? 'color-mix(in oklch, var(--sidebar-primary) 13%, transparent)'
                : 'transparent',
              transition: 'background .12s',
            }}
          >
            {/* Active pill indicator above icon */}
            {active && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 3,
                  borderRadius: 99,
                  background: 'var(--sidebar-primary)',
                }}
              />
            )}

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                opacity: active ? 1 : 0.5,
                transition: 'color .12s, opacity .12s',
                marginTop: active ? 5 : 2,
              }}
            >
              {item.icon(active)}
            </span>

            <span
              style={{
                fontSize: 9.5,
                fontWeight: active ? 700 : 500,
                fontFamily: 'var(--font-sans)',
                color: active ? 'var(--sidebar-primary)' : 'var(--sidebar-foreground)',
                opacity: active ? 1 : 0.5,
                letterSpacing: '0.02em',
                lineHeight: 1,
                transition: 'color .12s, opacity .12s',
              }}
            >
              {item.label}
            </span>

            {/* Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: '16%',
                  minWidth: 14,
                  height: 14,
                  borderRadius: 99,
                  background: 'var(--sidebar-primary)',
                  color: 'var(--sidebar-primary-foreground)',
                  fontSize: 8,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  border: '1.5px solid var(--sidebar)',
                  letterSpacing: 0,
                }}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}