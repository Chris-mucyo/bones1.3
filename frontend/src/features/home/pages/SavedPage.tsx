import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/layouts/AppLayout';
import type { Listing } from '../types';

type Tab = 'all' | 'collections' | 'products';

interface SavedCollection {
  id: string;
  title: string;
  itemsCount: number;
  coverListingId?: string;
  updatedAt?: string;
}

function parseCollection(item: unknown): SavedCollection | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;
  if (!row.id || !row.title) return null;
  return {
    id:             String(row.id),
    title:          String(row.title),
    itemsCount:     Number(row.itemsCount ?? 0),
    coverListingId: row.coverListingId != null ? String(row.coverListingId) : undefined,
    updatedAt:      row.updatedAt      != null ? String(row.updatedAt)      : undefined,
  };
}

export default function SavedPage() {
  const navigate = useNavigate();

  const [tab,           setTab]           = useState<Tab>('all');
  const [loading,       setLoading]       = useState(true);
  const [savedProducts, setSavedProducts] = useState<Listing[]>([]);
  const [collections,   setCollections]   = useState<SavedCollection[]>([]);
  const [removing,      setRemoving]      = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const token   = localStorage.getItem('token') ?? localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    Promise.allSettled([
      axios.get('/api/saved/products',    { signal: controller.signal, headers }),
      axios.get('/api/saved/collections', { signal: controller.signal, headers }),
      axios.get('/api/listings',          { signal: controller.signal, params: { sort: 'popular', limit: 40 }, headers }),
    ])
      .then(results => {
        const productsPayload    = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const collectionsPayload = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const listingsPayload    = results[2].status === 'fulfilled' ? results[2].value.data : [];

        const toListingArray = (payload: unknown): Listing[] => {
          if (Array.isArray(payload)) return payload as Listing[];
          const wrapped = payload as { listings?: Listing[] };
          if (Array.isArray(wrapped?.listings)) return wrapped.listings;
          return [];
        };

        const products        = toListingArray(productsPayload);
        const fallbackListings = toListingArray(listingsPayload);
        const pickedProducts  = products.length ? products : fallbackListings.slice(0, 12);
        setSavedProducts(pickedProducts);

        const parsedCollections: SavedCollection[] = Array.isArray(collectionsPayload)
          ? (collectionsPayload as unknown[])
              .map(parseCollection)
              .filter((row): row is SavedCollection => row !== null)
          : [];

        setCollections(
          parsedCollections.length
            ? parsedCollections
            : [
                { id: 'c1', title: 'IG Casts Inspiration', itemsCount: Math.max(3, Math.ceil(pickedProducts.length / 3)), updatedAt: '2h ago' },
                { id: 'c2', title: 'YouTube Product Drops', itemsCount: Math.max(2, Math.ceil(pickedProducts.length / 4)), updatedAt: '1d ago' },
                { id: 'c3', title: 'WhatsApp Quick Buys',   itemsCount: Math.max(2, Math.ceil(pickedProducts.length / 5)), updatedAt: '3d ago' },
              ],
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const handleRemoveProduct = (id: string) => {
    setRemoving(id);
    const token = localStorage.getItem('token') ?? localStorage.getItem('accessToken');
    axios
      .delete(`/api/saved/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then(() => setSavedProducts(prev => prev.filter(p => p.id !== id)))
      .catch(() => {})
      .finally(() => setRemoving(null));
  };

  const visibleProducts    = useMemo(() => (tab === 'collections' ? [] : savedProducts), [tab, savedProducts]);
  const visibleCollections = useMemo(() => (tab === 'products'    ? [] : collections),   [tab, collections]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all',         label: 'All' },
    { id: 'collections', label: 'Collections' },
    { id: 'products',    label: 'Products' },
  ];

  return (
    <AppLayout>
      <div
        className="min-h-screen px-5 py-6"
        style={{ background: 'var(--bg)', color: 'var(--text1)', fontFamily: "'Outfit', sans-serif" }}
      >
        {/* ── Header ── */}
        <section
          className="rounded-2xl p-5 md:p-6"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)' }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 800, color: 'var(--text1)', margin: 0 }}>
            Saved
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text2)' }}>
            Keep your casts, collections, and products in one social-commerce library.
          </p>

          {/* Tab pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {tabs.map(item => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  style={{
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    borderColor: active ? '#22c55e'             : 'var(--border-custom)',
                    background:  active ? '#22c55e'             : 'var(--bg2)',
                    color:       active ? '#000'                : 'var(--text2)',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Loading ── */}
        {loading && (
          <div
            className="mt-5 rounded-xl p-4 text-sm"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text2)' }}
          >
            Loading saved content…
          </div>
        )}

        {/* ── Content ── */}
        {!loading && (
          <div className="mt-5 space-y-8">

            {/* Collections */}
            {!!visibleCollections.length && (
              <section>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text1)' }}>
                  Collections
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleCollections.map(collection => (
                    <article
                      key={collection.id}
                      className="rounded-xl p-4"
                      style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)' }}
                    >
                      {/* Cover placeholder */}
                      <div
                        className="h-28 rounded-lg"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}
                      />
                      <p className="mt-3 font-semibold text-sm" style={{ color: 'var(--text1)' }}>
                        {collection.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                        {collection.itemsCount} items
                        {collection.updatedAt ? ` · updated ${collection.updatedAt}` : ''}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border-custom)',
                            color: 'var(--text1)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#22c55e')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-custom)')}
                        >
                          Open collection
                        </button>
                        <button
                          type="button"
                          title="Delete collection"
                          style={{
                            width: 36,
                            borderRadius: 8,
                            border: '1px solid #ef4444',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background .15s',
                          }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)')}
                          onClick={() => setCollections(prev => prev.filter(c => c.id !== collection.id))}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </article>
                  ))}

                  {/* Add collection card */}
                  <article
                    className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                    style={{
                      background: 'var(--bg2)',
                      border: '1px dashed var(--border-custom)',
                      minHeight: 180,
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#22c55e')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-custom)')}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text2)' }}>New collection</p>
                  </article>
                </div>
              </section>
            )}

            {/* Products */}
            {!!visibleProducts.length && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold" style={{ color: 'var(--text1)' }}>
                    Saved products
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSavedProducts([])}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#ef4444',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 999,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.16)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)')}
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {visibleProducts.map(product => (
                    <article
                      key={product.id}
                      className="rounded-xl p-3 cursor-pointer relative group"
                      style={{
                        background: 'var(--bg2)',
                        border: '1px solid var(--border-custom)',
                        transition: 'border-color .15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#22c55e')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-custom)')}
                      onClick={() => navigate(`/listing/${product.id}`)}
                    >
                      {/* Unsave button — visible on hover */}
                      <button
                        type="button"
                        title="Remove from saved"
                        onClick={e => { e.stopPropagation(); handleRemoveProduct(product.id); }}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          border: '1px solid #ef4444',
                          background: 'rgba(239,68,68,0.12)',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: removing === product.id ? 1 : 0,
                          transition: 'opacity .15s',
                          zIndex: 2,
                        }}
                        className="group-hover:!opacity-100"
                      >
                        {removing === product.id ? (
                          <span style={{
                            width: 10, height: 10,
                            border: '2px solid #ef4444',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin .7s linear infinite',
                          }} />
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </button>

                      <div className="h-28 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }} />
                      <p className="mt-2 text-sm font-semibold line-clamp-2" style={{ color: 'var(--text1)' }}>{product.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                        {product.seller?.shopName ?? product.seller?.name ?? 'Unknown seller'}
                      </p>
                      <p className="mt-1 text-sm font-bold" style={{ color: '#22c55e' }}>
                        {product.currency} {product.price.toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!visibleCollections.length && !visibleProducts.length && (
              <div
                className="rounded-xl p-6 flex flex-col items-center gap-3 text-center"
                style={{
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.18)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text1)' }}>Nothing saved yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
                    Browse the feed and save products or create collections.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}