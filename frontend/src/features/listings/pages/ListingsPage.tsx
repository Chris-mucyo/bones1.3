import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import FilterChips from '../../home/components/FilterChips';
import ListingGrid from '../../home/components/ListingGrid';
import type { Category } from '../../home/types';

interface ApiResponse {
  categories: Category[];
}

export default function ListingsPage() {
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>(['All']);

  const queryCategory = searchParams.get('category') ?? 'All';
  const querySearch = searchParams.get('search') ?? '';
  const queryBadge = searchParams.get('badge') ?? '';
  const querySort = searchParams.get('sort') ?? '';

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
      .catch(err => {
        if (!axios.isCancel(err)) setCategories(['All']);
      });
    return () => controller.abort();
  }, []);

  const heading = useMemo(() => {
    if (queryBadge === 'featured') return 'Featured Listings';
    if (querySort === 'popular') return 'Popular Listings';
    if (queryCategory !== 'All') return `${queryCategory} Listings`;
    return 'All Listings';
  }, [queryBadge, queryCategory, querySort]);

  const loaderStyle = useMemo<'youtube' | 'instagram' | 'ecommerce'>(() => {
    if (querySort === 'popular') return 'youtube';
    if (queryBadge === 'featured' || queryBadge === 'hot') return 'instagram';
    return 'ecommerce';
  }, [querySort, queryBadge]);

  return (
    <AppLayout>
      <FilterChips
        categories={categories}
        active={queryCategory}
        onChange={cat => {
          const next = new URLSearchParams(searchParams);
          if (cat === 'All') next.delete('category');
          else next.set('category', cat);
          setSearchParams(next);
        }}
        isDark={theme === 'dark'}
      />

      <div className="min-h-screen px-5 py-5" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl border p-4 md:p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl font-bold">{heading}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
                Discover social-influence products and high-conversion commerce picks.
              </p>
            </div>
            <input
              value={querySearch}
              onChange={e => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value.trim()) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              placeholder="Search listings..."
              className="w-full md:w-80 rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: 'var(--border-custom)',
                background: 'var(--bg2)',
                color: 'var(--text1)',
              }}
            />
          </div>
        </section>

        <div className="mt-5">
          <ListingGrid
            category={queryCategory}
            search={querySearch}
            badge={queryBadge}
            sort={querySort}
            loaderStyle={loaderStyle}
            isDark={theme === 'dark'}
          />
        </div>
      </div>
    </AppLayout>
  );
}
