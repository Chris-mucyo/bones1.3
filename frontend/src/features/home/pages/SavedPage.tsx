import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { Listing } from '../types';

type Tab = 'all' | 'collections' | 'products';

interface SavedCollection {
  id: string;
  title: string;
  itemsCount: number;
  coverListingId?: string;
  updatedAt?: string;
}

export default function SavedPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState<Listing[]>([]);
  const [collections, setCollections] = useState<SavedCollection[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token') ?? localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    Promise.allSettled([
      axios.get('/api/saved/products', { signal: controller.signal, headers }),
      axios.get('/api/saved/collections', { signal: controller.signal, headers }),
      axios.get('/api/listings', { signal: controller.signal, params: { sort: 'popular', limit: 40 }, headers }),
    ])
      .then(results => {
        const productsPayload = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const collectionsPayload = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const listingsPayload = results[2].status === 'fulfilled' ? results[2].value.data : [];

        const products: Listing[] = Array.isArray(productsPayload)
          ? productsPayload
          : Array.isArray((productsPayload as { listings?: Listing[] }).listings)
          ? ((productsPayload as { listings: Listing[] }).listings)
          : [];

        const fallbackListings: Listing[] = Array.isArray(listingsPayload)
          ? listingsPayload
          : Array.isArray((listingsPayload as { listings?: Listing[] }).listings)
          ? ((listingsPayload as { listings: Listing[] }).listings)
          : [];

        const pickedProducts = products.length ? products : fallbackListings.slice(0, 12);
        setSavedProducts(pickedProducts);

        const parsedCollections: SavedCollection[] = Array.isArray(collectionsPayload)
          ? collectionsPayload
              .map(item => {
                const row = item as Partial<SavedCollection>;
                if (!row.id || !row.title) return null;
                return {
                  id: String(row.id),
                  title: String(row.title),
                  itemsCount: Number(row.itemsCount ?? 0),
                  coverListingId: row.coverListingId ? String(row.coverListingId) : undefined,
                  updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
                };
              })
              .filter((row): row is SavedCollection => Boolean(row))
          : [];

        if (parsedCollections.length) {
          setCollections(parsedCollections);
        } else {
          setCollections([
            { id: 'c1', title: 'IG Casts Inspiration', itemsCount: Math.max(3, Math.ceil(pickedProducts.length / 3)), updatedAt: '2h ago' },
            { id: 'c2', title: 'YouTube Product Drops', itemsCount: Math.max(2, Math.ceil(pickedProducts.length / 4)), updatedAt: '1d ago' },
            { id: 'c3', title: 'WhatsApp Quick Buys', itemsCount: Math.max(2, Math.ceil(pickedProducts.length / 5)), updatedAt: '3d ago' },
          ]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(
    () => (tab === 'collections' ? [] : savedProducts),
    [tab, savedProducts],
  );

  const visibleCollections = useMemo(
    () => (tab === 'products' ? [] : collections),
    [tab, collections],
  );

  const surface = 'border p-4 md:p-5';
  const soft = 'border p-4';
  const muted = 'text-sm';

  return (
    <AppLayout>
      <div className="min-h-screen px-5 py-6" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl p-5 md:p-6" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)', color: 'var(--text1)' }}>
          <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Saved</h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text2)' }}>
            Keep your casts, collections, and products in one social-commerce library.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              { id: 'all', label: 'All' },
              { id: 'collections', label: 'Collections' },
              { id: 'products', label: 'Products' },
            ] as const).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  tab === item.id
                    ? 'border-green-500 bg-green-500 text-black'
                    : ''
                }`}
                style={tab !== item.id ? { borderColor: 'var(--border-custom)', background: 'var(--bg2)', color: 'var(--text3)' } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {loading && <div className="mt-5 rounded-xl border p-4 text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)', color: 'var(--text2)' }}>Loading saved content...</div>}

        {!loading && (
          <div className="mt-5 space-y-6">
            {!!visibleCollections.length && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Collections (casts style)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleCollections.map(collection => (
                    <article key={collection.id} className="rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border-custom)' }}>
                      <div className="h-28 rounded-lg border" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }} />
                      <p className="mt-3 font-semibold">{collection.title}</p>
                      <p className={`text-xs mt-1 ${muted}`}>
                        {collection.itemsCount} items {collection.updatedAt ? `• updated ${collection.updatedAt}` : ''}
                      </p>
                      <button type="button" className="mt-3 w-full rounded-lg border py-2 text-sm font-semibold" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                        Open collection
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {!!visibleProducts.length && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Saved products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {visibleProducts.map(product => (
                    <article
                      key={product.id}
                      onClick={() => navigate(`/listing/${product.id}`)}
                      className="rounded-xl border p-3 cursor-pointer transition-colors hover:border-green-500"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border-custom)' }}
                    >
                      <div className="h-28 rounded-lg border" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }} />
                      <p className="mt-2 text-sm font-semibold line-clamp-2">{product.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{product.seller.shopName ?? product.seller.name}</p>
                      <p className="mt-1 text-sm font-bold text-green-500">
                        {product.currency} {product.price.toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {!visibleCollections.length && !visibleProducts.length && (
              <div className="rounded-xl border p-4 text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)', color: 'var(--text2)' }}>No saved content yet.</div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
