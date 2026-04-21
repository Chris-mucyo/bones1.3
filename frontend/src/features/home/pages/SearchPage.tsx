import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import FilterChips from '../components/FilterChips';
import ListingGrid from '../components/ListingGrid';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { Listing, Category } from '../types';

const RECENT_KEY = 'recent_searches';
const MAX_RECENT = 6;

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
  catch { return []; }
}

function saveRecent(term: string) {
  const prev = loadRecent().filter(r => r.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)));
}

interface CatResponse { categories: Category[]; }
interface ListResponse { listings: Listing[]; }

export default function SearchPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [categories, setCategories] = useState<string[]>(['All']);
  const [suggestions, setSuggestions] = useState<Listing[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecent);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CatResponse>('/api/categories', { signal: controller.signal })
      .then(res => {
        const raw = res.data;
        const array: Category[] = Array.isArray(raw) ? raw : Array.isArray(raw.categories) ? raw.categories : [];
        setCategories(['All', ...array.map(c => c.name)]);
      })
      .catch(err => { if (!axios.isCancel(err)) setCategories(['All']); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<ListResponse>('/api/listings', { params: { sort: 'popular', limit: 8 }, signal: controller.signal })
      .then(res => {
        const raw = res.data;
        const array: Listing[] = Array.isArray(raw) ? raw : Array.isArray(raw.listings) ? raw.listings : [];
        setSuggestions(array);
      })
      .catch(err => { if (!axios.isCancel(err)) setSuggestions([]); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => setActiveCategory(cat), []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setInputValue(value);
    setHasSearched(true);
    setIsFocused(false);
    saveRecent(value);
    setRecentSearches(loadRecent());
    inputRef.current?.blur();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value === '') { setSearch(''); setHasSearched(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) handleSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue(''); setSearch(''); setHasSearched(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(p =>
    inputValue.length > 0 ? p.title.toLowerCase().includes(inputValue.toLowerCase()) : true
  );

  const seeAllStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--link)',
    border: '1px solid var(--border2)',
    padding: '6px 12px', borderRadius: 20, textDecoration: 'none',
    background: 'var(--bg2)',
    cursor: 'pointer',
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: 'var(--text1)',
  };

  return (
    <AppLayout>
      <div style={{ padding: '20px 20px 0' }}>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg2)',
            border: `1.5px solid ${isFocused ? 'var(--link)' : 'var(--border-custom)'}`,
            borderRadius: 14, padding: '0 14px', transition: 'border-color 0.2s',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke={isFocused ? 'var(--link)' : 'var(--text3)'}
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: 'stroke 0.2s' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef} type="text" placeholder="Search products, categories..."
              value={inputValue} onChange={handleInputChange}
              onFocus={() => setIsFocused(true)} onKeyDown={handleKeyDown}
              style={{
                flex: 1, height: 48, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 15, fontFamily: "'DM Sans', sans-serif", color: 'var(--text1)', caretColor: 'var(--link)',
              }}
            />
            {inputValue.length > 0 && (
              <button onClick={handleClear} style={{
                background: 'var(--bg)',
                border: '1px solid var(--border-custom)', borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
                color: 'var(--text2)',
                fontSize: 13, fontWeight: 700,
              }}>✕</button>
            )}
          </div>

          {/* Dropdown */}
          {isFocused && (
            <div ref={dropdownRef} style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
              background: 'var(--bg)',
              border: '1px solid var(--border-custom)', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {inputValue.length === 0 && recentSearches.length > 0 && (
                <div style={{ padding: '14px 16px 6px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Recent</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {recentSearches.map(r => (
                      <button key={r} onClick={() => handleSearch(r)} style={{
                        background: 'var(--bg2)', border: '1px solid var(--border-custom)',
                        borderRadius: 20, padding: '5px 12px', fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        color: 'var(--text2)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <span style={{ fontSize: 11, opacity: 0.5 }}>🕐</span> {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: inputValue.length === 0 ? '6px 0 8px' : '10px 0 8px' }}>
                {inputValue.length === 0 && (
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text3)', padding: '0 16px', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Suggested</p>
                )}
                {filteredSuggestions.slice(0, 6).map(item => {
                  const sellerDisplay = item.seller?.shopName ?? item.seller?.name;
                  return <button key={item.id} onClick={() => handleSearch(item.title)} style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: 'var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0,
                    }}>
                      {item.images?.[0]
                        ? <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                        : '📦'}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text1)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{item.category}</p>
                    </div>
                    <svg style={{ marginLeft: 'auto', opacity: 0.3, flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                    </svg>
                  </button>
                })}
                {inputValue.length > 0 && filteredSuggestions.length === 0 && (
                  <p style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text2)', fontFamily: "'DM Sans', sans-serif" }}>
                    No suggestions for "{inputValue}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <FilterChips categories={categories} active={activeCategory} onChange={handleCategoryChange} isDark={theme === 'dark'} />
      </div>

      <div style={{ padding: '24px 20px 40px' }}>
        {!hasSearched ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={headingStyle}>Suggested For You</h2>
              <button style={seeAllStyle} onClick={() => navigate('/listings?sort=popular')}>See all →</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }}>
              {suggestions.map(item => (
                <button key={item.id} onClick={() => handleSearch(item.title)} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border-custom)',
                  borderRadius: 14, padding: '14px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--link)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-custom)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)';
                  }}
                >
                  <span style={{ fontSize: 24 }}>
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8 }} />
                      : '📦'}
                  </span>
                  <p style={{ fontSize: 11, fontWeight: 600, color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', margin: 0, lineHeight: 1.3 }}>
                    {item.title}
                  </p>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={headingStyle}>Browse All</h2>
            </div>
            <ListingGrid category={activeCategory} search="" isDark={theme === 'dark'} />
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)', fontFamily: "'DM Sans', sans-serif" }}>
                Showing results for{' '}
                <span style={{ color: '#22c55e', fontWeight: 600 }}>"{search}"</span>
                {activeCategory !== 'All' && (
                  <> in <span style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)', fontWeight: 600 }}>{activeCategory}</span></>
                )}
              </p>
            </div>
            <ListingGrid category={activeCategory} search={search} isDark={theme === 'dark' } />
          </>
        )}
      </div>
    </AppLayout>
  );
}