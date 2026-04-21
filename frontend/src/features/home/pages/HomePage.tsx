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
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [categories, setCategories]         = useState<string[]>(['All']);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<ApiResponse>('/api/categories', { signal: controller.signal })
      .then(res => {
        const raw = res.data;
        const array: Category[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.categories)
          ? raw.categories
          : [];
        setCategories(['All', ...array.map(c => c.name)]);
      })
      .catch(err => { if (!axios.isCancel(err)) setCategories(['All']); });

    return () => controller.abort();
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  const seeAllStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--link)',
    border: '1px solid var(--border2)',
    padding: '6px 12px', borderRadius: 20, textDecoration: 'none',
    background: 'var(--bg2)',
    cursor: 'pointer',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
    color: 'var(--text1)',
  };

  const sectionStyle = (paddingBottom: number): React.CSSProperties => ({
    padding: `24px 20px ${paddingBottom}px`,
  });

  return (
    <AppLayout>
      <div style={{ padding: '18px 20px 0' }}>
        <section
          style={{
            border: '1px solid var(--border-custom)',
            background: 'linear-gradient(130deg, var(--bg), var(--bg2))',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
            <div style={{ minWidth: 220 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text1)', fontSize: 24, margin: 0 }}>Social Commerce Feed</h1>
              <p style={{ margin: '6px 0 0', color: 'var(--text2)', fontSize: 13 }}>
                Discover creator-driven products and trend-backed opportunities.
              </p>
            </div>
            <button
              onClick={() => navigate('/trending')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                borderRadius: 999,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid var(--border2)',
                background: 'var(--bg2)',
                color: 'var(--text1)',
                cursor: 'pointer',
              }}
            >
              <FiTrendingUp size={13} color="var(--link)" />
              Open Trending
            </button>
          </div>

          <div
            style={{
              marginTop: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 12,
              border: `1px solid var(--border-custom)`,
              padding: '9px 12px',
              background: 'var(--bg2)',
            }}
          >
            <FiSearch size={14} color="var(--text3)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, creators, shops..."
              style={{
                flex: 1,
                border: 0,
                outline: 'none',
                background: 'transparent',
                color: 'var(--text1)',
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {[
              { label: 'Featured', href: '/listings?badge=featured' },
              { label: 'Popular', href: '/trending' },
              { label: 'Nearby', href: '/listings?sort=popular' },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.href)}
                style={{
                  border: '1px solid var(--border2)',
                borderRadius: 999,
                background: 'transparent',
                color: 'var(--text2)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '5px 11px',
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <FilterChips
        categories={categories}
        active={activeCategory}
        onChange={handleCategoryChange}
        isDark={theme === 'dark'}
      />

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--link)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            Featured by Creators
          </h2>
          <button style={seeAllStyle} onClick={() => navigate('/listings?badge=featured')}>
            See all →
          </button>
        </div>
        <FeaturedRow isDark={theme === 'dark'} />
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
          >
            See all →
          </button>
        </div>
        <ListingGrid category={activeCategory} search={search} loaderStyle="instagram" isDark={theme === 'dark'} />
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
        <TrendingSection isDark={theme === 'dark'} />
      </div>
    </AppLayout>
  );
}