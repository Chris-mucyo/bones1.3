import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';
import AppLayout from '../../../shared/layouts/AppLayout';
import FilterChips from '../components/FilterChips';
import FeaturedRow from '../components/FeaturedRow';
import ListingGrid from '../components/ListingGrid';
import TrendingSection from '../components/TrendingSection';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { Category } from '../types';

interface ApiResponse { categories: Category[]; }

export default function HomePage() {
  const { theme } = useTheme();
<<<<<<< HEAD
  const isDark = theme === 'dark';
  const navigate = useNavigate();
=======
  const navigate  = useNavigate();
>>>>>>> main

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [categories, setCategories]         = useState<string[]>(['All']);
<<<<<<< HEAD

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<ApiResponse>('/api/categories', { signal: controller.signal })
      .then(res => {
        const raw = res.data;
=======
  const [searchError, setSearchError]       = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<ApiResponse>('/api/categories', { signal: controller.signal })
      .then(res => {
        const raw   = res.data;
>>>>>>> main
        const array: Category[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.categories)
          ? raw.categories
          : [];
        setCategories(['All', ...array.map(c => c.name)]);
      })
      .catch(err => { if (!axios.isCancel(err)) setCategories(['All']); });
<<<<<<< HEAD

    return () => controller.abort();
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  const border = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)';
  const seeAllStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#22c55e',
    border: `1px solid ${border}`,
    padding: '6px 12px', borderRadius: 20, textDecoration: 'none',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    cursor: 'pointer',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
    color: isDark ? '#fff' : '#0f0f0f',
  };

  const sectionStyle = (paddingBottom: number): React.CSSProperties => ({
    padding: `24px 20px ${paddingBottom}px`,
  });

  return (
    <AppLayout>
      <div style={{ padding: '18px 20px 0' }}>
        <section
          style={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            background: isDark ? 'linear-gradient(130deg, rgba(20,20,20,0.95), rgba(34,197,94,0.06))' : 'linear-gradient(130deg, #ffffff, rgba(34,197,94,0.08))',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 14,
=======
    return () => controller.abort();
  }, []);

  // Show destructive ring when search returns no results (driven by a flag from ListingGrid)
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setSearchError(false); // reset; ListingGrid can call back via onEmpty
  };

  const handleCategoryChange = useCallback((cat: string) => setActiveCategory(cat), []);

  /* ── shared styles ── */
  const seeAllBtn: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--primary)',
    filter: 'brightness(0.8)',
    border: '1px solid var(--border)',
    padding: '6px 14px',
    borderRadius: 999,
    background: 'var(--muted)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color .15s',
  };

  const sectionHeading: React.CSSProperties = {
    fontFamily: 'var(--font-serif)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--foreground)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <AppLayout>

      {/* ── Hero / search header ── */}
      <div style={{ padding: '18px 20px 0' }}>
        <section
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
            marginBottom: 14,
            boxShadow: 'var(--shadow-sm)',
>>>>>>> main
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
            <div style={{ minWidth: 220 }}>
<<<<<<< HEAD
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: isDark ? 'rgba(255,255,255)' : 'rgba(0,0,0)', fontSize: 24, margin: 0 }}>Social Commerce Feed</h1>
              <p style={{ margin: '6px 0 0', color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', fontSize: 13 }}>
                Discover creator-driven products and trend-backed opportunities.
              </p>
            </div>
=======
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)', fontSize: 24, margin: 0 }}>
                Social Commerce Feed
              </h1>
              <p style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>
                Discover creator-driven products and trend-backed opportunities.
              </p>
            </div>

>>>>>>> main
            <button
              onClick={() => navigate('/trending')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                borderRadius: 999,
<<<<<<< HEAD
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                border: `1px solid ${border}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                color: isDark ? 'rgba(255,255,255,0.9)' : '#111',
                cursor: 'pointer',
              }}
            >
              <FiTrendingUp size={13} color="#22c55e" />
=======
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
            >
              <FiTrendingUp size={13} color="var(--primary)" style={{ filter: 'brightness(0.8)' }} />
>>>>>>> main
              Open Trending
            </button>
          </div>

<<<<<<< HEAD
=======
          {/* Search bar — destructive ring when no results */}
>>>>>>> main
          <div
            style={{
              marginTop: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
<<<<<<< HEAD
              border: `1px solid ${border}`,
              padding: '9px 12px',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
            }}
          >
            <FiSearch size={14} color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, creators, shops..."
=======
              border: `1px solid ${searchError ? 'var(--destructive)' : 'var(--border)'}`,
              padding: '9px 12px',
              background: searchError
                ? 'color-mix(in oklch, var(--destructive) 6%, var(--card))'
                : 'var(--muted)',
              transition: 'border-color .2s, background .2s',
            }}
          >
            <FiSearch
              size={14}
              color={searchError ? 'var(--destructive)' : 'var(--muted-foreground)'}
              style={{ flexShrink: 0, transition: 'color .2s' }}
            />
            <input
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search products, creators, shops…"
>>>>>>> main
              style={{
                flex: 1,
                border: 0,
                outline: 'none',
                background: 'transparent',
<<<<<<< HEAD
                color: isDark ? '#fff' : '#111',
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {[
              { label: 'Featured', href: '/listings?badge=featured' },
              { label: 'Popular', href: '/trending' },
              { label: 'Nearby', href: '/listings?sort=popular' },
=======
                color: 'var(--foreground)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
              }}
            />
            {/* Destructive: clear search */}
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                title="Clear search"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'color-mix(in oklch, var(--destructive) 15%, transparent)',
                  color: 'var(--destructive)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--destructive) 28%, transparent)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--destructive) 15%, transparent)')}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {[
              { label: 'Featured', href: '/listings?badge=featured' },
              { label: 'Popular',  href: '/trending' },
              { label: 'Nearby',   href: '/listings?sort=popular' },
>>>>>>> main
            ].map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                style={{
<<<<<<< HEAD
                  border: `1px solid ${border}`,
                  borderRadius: 999,
                  background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.72)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '5px 11px',
                  cursor: 'pointer',
=======
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  background: 'transparent',
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'border-color .15s, color .15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--foreground)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
>>>>>>> main
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </section>
      </div>

<<<<<<< HEAD
=======
      {/* ── Category chips ── */}
>>>>>>> main
      <FilterChips
        categories={categories}
        active={activeCategory}
        onChange={handleCategoryChange}
<<<<<<< HEAD
        isDark={isDark}
      />

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            Featured by Creators
          </h2>
          <button style={seeAllStyle} onClick={() => navigate('/listings?badge=featured')}>
            See all →
          </button>
        </div>
        <FeaturedRow isDark={isDark} />
      </div>

      <div style={sectionStyle(0)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={headingStyle}>Shop the Community</h2>
          <button
            style={seeAllStyle}
            onClick={() => navigate(
              activeCategory !== 'All'
                ? `/listings?category=${encodeURIComponent(activeCategory)}`
                : '/listings'
            )}
=======
        isDark={theme === 'dark'}
      />

      {/* ── Featured by Creators ── */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={sectionHeading}>
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
                filter: 'brightness(0.8)',
              }}
            />
            Featured by Creators
          </h2>
          <button
            style={seeAllBtn}
            onClick={() => navigate('/listings?badge=featured')}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
>>>>>>> main
          >
            See all →
          </button>
        </div>
<<<<<<< HEAD
        <ListingGrid category={activeCategory} search={search} loaderStyle="instagram" isDark={isDark} />
      </div>

      <div style={sectionStyle(40)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🇷🇼</span> Trending in Rwanda
          </h2>
          <button style={seeAllStyle} onClick={() => navigate('/listings?sort=popular')}>
            See all →
          </button>
        </div>
        <TrendingSection isDark={isDark} />
      </div>
=======
        <FeaturedRow isDark={theme === 'dark'} />
      </div>

      {/* ── Community listings ── */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={sectionHeading}>Shop the Community</h2>
          <button
            style={seeAllBtn}
            onClick={() => navigate(
              activeCategory !== 'All'
                ? `/listings?category=${encodeURIComponent(activeCategory)}`
                : '/listings',
            )}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
          >
            See all →
          </button>
        </div>
        <ListingGrid
          category={activeCategory}
          search={search}
          loaderStyle="instagram"
          isDark={theme === 'dark'}
        />
      </div>

      {/* ── Trending in Rwanda ── */}
      <div style={{ padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={sectionHeading}>
            <span style={{ fontSize: 18 }}>🇷🇼</span> Trending in Rwanda
          </h2>
          <button
            style={seeAllBtn}
            onClick={() => navigate('/listings?sort=popular')}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
          >
            See all →
          </button>
        </div>
        <TrendingSection isDark={theme === 'dark'} />
      </div>

>>>>>>> main
    </AppLayout>
  );
}