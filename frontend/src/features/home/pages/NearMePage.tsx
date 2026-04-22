import { useState } from 'react';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import ListingGrid from '../components/ListingGrid';

export default function NearMePage() {
  const { theme } = useTheme();
  const [locationDenied, setLocationDenied] = useState(false);
  const [requesting, setRequesting]         = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationDenied(true); return; }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => { setRequesting(false); setLocationDenied(false); },
      ()  => { setRequesting(false); setLocationDenied(true); },
    );
  };

  const chips = [
    { label: 'Local discovery' },
    { label: 'Nearby sellers' },
    { label: 'Quick fulfillment' },
  ];

  return (
    <AppLayout>
      <div
        className="min-h-screen px-5 py-6"
        style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}
      >
        {/* ── Header ── */}
        <section
          className="rounded-2xl p-5 md:p-6"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
                Near Me
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Products and sellers around your location, optimised for faster delivery and local trust.
              </p>

              {/* Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map(chip => (
                  <span
                    key={chip.label}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: 'color-mix(in oklch, var(--primary) 15%, transparent)',
                      color: 'var(--foreground)',
                      border: '1px solid color-mix(in oklch, var(--primary) 30%, transparent)',
                    }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Location CTA */}
            <button
              type="button"
              onClick={requestLocation}
              disabled={requesting}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 10,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                cursor: requesting ? 'not-allowed' : 'pointer',
                opacity: requesting ? 0.7 : 1,
                fontFamily: 'var(--font-sans)',
                transition: 'border-color .15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => !requesting && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
            >
              {requesting
                ? <span style={{ width: 14, height: 14, border: '2px solid var(--muted-foreground)', borderTopColor: 'var(--foreground)', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" style={{ filter: 'brightness(0.8)' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                )
              }
              {requesting ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        </section>

        {/* ── Destructive: location denied banner ── */}
        {locationDenied && (
          <div
            className="mt-4 rounded-xl p-4 flex items-start gap-3"
            style={{
              background: 'color-mix(in oklch, var(--destructive) 8%, var(--card))',
              border: '1px solid color-mix(in oklch, var(--destructive) 35%, transparent)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={{ flex: 1 }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>Location access denied</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                We can't detect nearby sellers. Please enable location in your browser settings, or browse the full catalogue below.
              </p>
            </div>
            {/* Dismiss */}
            <button
              type="button"
              onClick={() => setLocationDenied(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--destructive)',
                padding: 2,
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Listings ── */}
        <div className="mt-5">
          <ListingGrid
            category="All"
            search=""
            sort="popular"
            loaderStyle="ecommerce"
            isDark={theme === 'dark'}
          />
        </div>
      </div>
    </AppLayout>
  );
}