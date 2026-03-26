import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const isDark = theme === 'dark';
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
      <FilterChips
        categories={categories}
        active={activeCategory}
        onChange={handleCategoryChange}
        isDark={isDark}
      />

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ ...headingStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            Featured Listings
          </h2>
          <button style={seeAllStyle} onClick={() => navigate('/listings?badge=featured')}>
            See all →
          </button>
        </div>
        <FeaturedRow isDark={isDark} />
      </div>

      <div style={sectionStyle(0)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={headingStyle}>Listings Near You</h2>
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
        <ListingGrid category={activeCategory} search={search} isDark={isDark} />
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
    </AppLayout>
  );
}