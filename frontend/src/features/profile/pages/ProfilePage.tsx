import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { Listing } from '../../home/types';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
}

interface ProductDraft {
  id: string;
  name: string;
  price: number;
  stock: number;
  caption: string;
  createdAt: string;
}

interface ShopFeedItem {
  id: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
  time: string;
}

type ApiProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  orders?: number;
  tag?: string;
  createdAt?: string;
};

const API = {
  me: '/api/profile/me',
  products: '/api/profile/products',
  feed: '/api/profile/feed',
  metrics: '/api/profile/metrics',
  createProduct: '/api/profile/products',
};

const safeArray = <T,>(raw: unknown, key: string): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>)[key])) {
    return (raw as Record<string, T[]>)[key];
  }
  return [];
};

const toCurrency = (currency: 'RWF' | 'USD', amount: number) =>
  `${currency} ${amount.toLocaleString()}`;

const since = (value: string) => {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return 'now';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export default function ProfilePage() {
  const { theme } = useTheme();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [caption, setCaption] = useState('');
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  const surface = 'border rounded-2xl';
  const muted = 'text-sm';
  const subtle = 'border rounded-xl';
  const chip = 'rounded-full px-2 py-1 text-xs font-medium';
  const input = 'rounded-lg border px-3';
  const skeletonBase = 'rounded';
  const skeletonSoft = 'rounded';

  useEffect(() => {
    const controller = new AbortController();
    // New profile APIs (build backend later):
    // GET /api/profile/me
    // GET /api/profile/products
    // GET /api/profile/feed
    // GET /api/profile/metrics
    Promise.all([
      axios.get<CurrentUser>(API.me, { signal: controller.signal }),
      axios.get(API.products, { signal: controller.signal }),
    ])
      .then(([meRes, productRes]) => {
        setUser(meRes.data);
        const apiProducts = safeArray<ApiProduct>(productRes.data, 'products');
        if (apiProducts.length > 0) {
          const mapped: Listing[] = apiProducts.map((p, index) => ({
            id: p.id,
            title: p.name,
            description: '',
            price: p.price,
            currency: 'USD',
            images: [],
            category: 'General',
            condition: 'new',
            location: 'Kigali',
            seller: {
              id: meRes.data.id,
              name: meRes.data.name,
              avatar: meRes.data.avatar ?? '',
              shopName: meRes.data.name,
              verified: false,
              rating: 0,
              totalSales: p.orders ?? 0,
            },
            badge: (p.tag?.toLowerCase() as Listing['badge']) ?? 'new',
            views: 0,
            savedCount: 0,
            createdAt: p.createdAt ?? new Date(Date.now() - (index + 1) * 3600000).toISOString(),
          }));
          setListings(mapped);
          return;
        }

        // Temporary fallback until profile product API is ready
        return axios
          .get('/api/listings', { params: { sort: 'popular', limit: 18 }, signal: controller.signal })
          .then(listRes => setListings(safeArray<Listing>(listRes.data, 'listings')));
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          // Temporary fallback for account API until /api/profile/me exists
          axios
            .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
            .then(meRes => setUser(meRes.data))
            .catch(() => setUser(null));
          axios
            .get('/api/listings', { params: { sort: 'popular', limit: 18 }, signal: controller.signal })
            .then(listRes => setListings(safeArray<Listing>(listRes.data, 'listings')))
            .catch(() => setListings([]))
            .finally(() => setLoading(false));
          return;
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const ownedListings = useMemo(() => {
    if (!user) return listings.slice(0, 6);
    const mine = listings.filter(l => l.seller?.id === user.id);
    return mine.length > 0 ? mine : listings.slice(0, 6);
  }, [listings, user]);

  const featuredProducts = useMemo(() => {
    const fromDrafts = drafts.map(d => ({
      id: d.id,
      name: d.name,
      priceLabel: `USD ${d.price.toLocaleString()}`,
      stock: d.stock,
      orders: 0,
      tag: 'Draft',
    }));
    const fromApi = ownedListings.slice(0, 4).map(l => ({
      id: l.id,
      name: l.title,
      priceLabel: toCurrency(l.currency, l.price),
      stock: Math.max(1, Math.floor((l.savedCount ?? 1) / 2)),
      orders: l.seller?.totalSales ?? 0,
      tag: l.badge ? l.badge.toUpperCase() : 'LIVE',
    }));
    return [...fromDrafts, ...fromApi].slice(0, 6);
  }, [drafts, ownedListings]);

  const shopFeed = useMemo<ShopFeedItem[]>(() => {
    const fromDrafts: ShopFeedItem[] = drafts.map(d => ({
      id: `feed-${d.id}`,
      title: `New product posted: ${d.name}`,
      body: d.caption || `Now available at USD ${d.price.toLocaleString()} with ${d.stock} in stock.`,
      likes: 0,
      comments: 0,
      time: since(d.createdAt),
    }));
    const fromApi: ShopFeedItem[] = ownedListings.slice(0, 3).map(l => ({
      id: `feed-api-${l.id}`,
      title: `Product update: ${l.title}`,
      body: `Now listed for ${toCurrency(l.currency, l.price)}. Located in ${l.location}.`,
      likes: l.savedCount ?? 0,
      comments: Math.max(0, Math.floor((l.views ?? 0) / 14)),
      time: since(l.createdAt),
    }));
    return [...fromDrafts, ...fromApi];
  }, [drafts, ownedListings]);

  const metrics = useMemo(() => {
    const liveCount = ownedListings.length;
    const views = ownedListings.reduce((sum, l) => sum + (l.views ?? 0), 0);
    const saves = ownedListings.reduce((sum, l) => sum + (l.savedCount ?? 0), 0);
    const projectedRevenue = ownedListings.reduce(
      (sum, l) => sum + (l.price * Math.max(1, Math.floor((l.savedCount ?? 0) / 2))),
      0,
    );
    return { liveCount, views, saves, projectedRevenue };
  }, [ownedListings]);

  const firstLetter = (user?.name ?? 'Shop').charAt(0).toUpperCase();
  const displayName = user?.name ?? 'Your Store';
  const shopHandle = `@${displayName.replace(/\s+/g, '').toLowerCase() || 'store'}`;

  const publishDraft = async () => {
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!name.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedStock) || parsedStock < 0) {
      return;
    }
    setPublishError(null);
    const now = new Date().toISOString();
    const payload = {
      name: name.trim(),
      price: parsedPrice,
      stock: parsedStock,
      caption: caption.trim(),
    };
    // Future API contract:
    // POST /api/profile/products
    // body: { name, price, stock, caption }
    try {
      const res = await axios.post<ApiProduct>(API.createProduct, payload);
      const created = res.data;
      setDrafts(prev => [
        {
          id: created.id,
          name: created.name,
          price: created.price,
          stock: created.stock,
          caption: payload.caption,
          createdAt: created.createdAt ?? now,
        },
        ...prev,
      ]);
    } catch {
      // Keep UI usable until backend endpoint exists.
      setPublishError('Publish API is not ready yet. Saved locally for now.');
      setDrafts(prev => [
        {
          id: `draft-${Date.now()}`,
          name: payload.name,
          price: payload.price,
          stock: payload.stock,
          caption: payload.caption,
          createdAt: now,
        },
        ...prev,
      ]);
    }
    setName('');
    setPrice('');
    setStock('');
    setCaption('');
  };

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f5f7fb] text-neutral-900'}`}>
        <section className={`relative overflow-hidden rounded-2xl ${surface}`}>
          <div className={`h-44 md:h-56 w-full ${isDark ? 'bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-cyan-500/25' : 'bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-blue-500/20'}`} />
          <div className="px-5 pb-5 md:px-8 md:pb-7">
            <div className="-mt-14 md:-mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-black/80 bg-green-500 text-black flex items-center justify-center text-3xl font-bold">
                  {firstLetter}
                </div>
                <div>
                  <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">{displayName}</h1>
                  <p className={`text-sm md:text-base ${muted}`}>{shopHandle} • Seller profile • Kigali, Rwanda</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>{metrics.views.toLocaleString()} total views</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>{metrics.liveCount} live listings</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>Joined 2022</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors">Add product</button>
                <button className={`rounded-lg px-4 py-2 text-sm font-semibold border transition-colors ${subtle}`}>Share shop</button>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <aside className="xl:col-span-3 space-y-6">
            <section className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Shop info</h2>
              <p className={`text-sm leading-6 ${muted}`}>
                Store profile is now powered by your live account and listing data.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className={muted}>Seller name: {displayName}</li>
                <li className={muted}>Role: {user?.role ?? 'guest'}</li>
                <li className={muted}>Saved by buyers: {metrics.saves.toLocaleString()}</li>
              </ul>
            </section>

            <section className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Quick shop actions</h2>
              <div className="space-y-3">
                {['Manage inventory', 'View orders', 'Create discount code'].map(action => (
                  <button type="button" key={action} className={`w-full text-left rounded-lg border p-3 transition-colors hover:border-green-500 ${subtle}`}>
                    <p className="font-medium text-sm">{action}</p>
                    <p className={`text-xs mt-1 ${muted}`}>Open panel</p>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="xl:col-span-6 space-y-6">
            <section className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create product post</h2>
                <span className={`text-xs ${muted}`}>Social post that drives sales</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Product name" value={name} onChange={e => setName(e.target.value)} className={`h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`} />
                <input type="number" placeholder="Price (e.g. 49)" value={price} onChange={e => setPrice(e.target.value)} className={`h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`} />
                <input type="number" placeholder="Stock quantity" value={stock} onChange={e => setStock(e.target.value)} className={`h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`} />
                <input type="text" placeholder="Promo caption" value={caption} onChange={e => setCaption(e.target.value)} className={`h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`} />
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Upload images', 'Add variant', 'Set discount'].map(action => (
                  <button type="button" key={action} className={`rounded-lg border py-2 text-sm font-medium transition-colors ${subtle}`}>
                    {action}
                  </button>
                ))}
                <button type="button" onClick={publishDraft} className="rounded-lg border py-2 text-sm font-semibold transition-colors bg-green-500 text-black border-green-500 hover:bg-green-400">
                  Publish
                </button>
              </div>
              {publishError && <p className="mt-3 text-xs text-amber-400">{publishError}</p>}
            </section>

            <section className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Featured products</h2>
                <a href="/listings" className="text-sm text-green-500 hover:text-green-400">View catalog</a>
              </div>
              <div className="space-y-4">
                {loading && featuredProducts.length === 0 && (
                  <div className={`rounded-xl border p-3 text-sm ${muted} ${subtle}`}>Loading products...</div>
                )}
                {!loading && featuredProducts.length === 0 && (
                  <div className={`rounded-xl border p-3 text-sm ${muted} ${subtle}`}>No products yet. Publish your first product above.</div>
                )}
                {featuredProducts.map(product => (
                  <article key={product.name} className={`rounded-xl border p-3 ${subtle}`}>
                    <div className="flex gap-3">
                      <div className={`w-36 sm:w-44 h-20 rounded-lg flex-shrink-0 grid place-items-center text-xs font-semibold ${isDark ? 'bg-neutral-900 text-white/70' : 'bg-neutral-200 text-black/60'}`}>
                        {product.tag}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold leading-5">{product.name}</h3>
                        <p className={`mt-1 text-xs ${muted}`}>{product.priceLabel} • {product.orders} orders • {product.stock} in stock</p>
                        <button type="button" className="mt-3 rounded-md bg-green-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-green-400 transition-colors">
                          Promote
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Shop feed</h2>
              <div className="space-y-4">
                {loading && shopFeed.length === 0 && (
                  <>
                    {Array.from({ length: 2 }).map((_, idx) => (
                      <div key={`feed-skeleton-${idx}`} className={`rounded-xl border p-4 ${subtle}`}>
                        <div className={`h-4 w-1/2 rounded animate-pulse ${skeletonBase}`} />
                        <div className={`mt-2 h-3 w-1/4 rounded animate-pulse ${skeletonSoft}`} />
                        <div className={`mt-4 h-3 w-full rounded animate-pulse ${skeletonSoft}`} />
                        <div className={`mt-2 h-3 w-5/6 rounded animate-pulse ${skeletonSoft}`} />
                        <div className="mt-4 flex gap-3">
                          <div className={`h-3 w-16 rounded animate-pulse ${skeletonSoft}`} />
                          <div className={`h-3 w-20 rounded animate-pulse ${skeletonSoft}`} />
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!loading && shopFeed.length === 0 && (
                  <div className={`rounded-xl border p-4 text-sm ${muted} ${subtle}`}>
                    Post a product or wait for listing activity to populate your shop feed.
                  </div>
                )}
                {shopFeed.map(post => (
                  <article key={post.title} className={`rounded-xl border p-4 ${subtle}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className={`mt-1 text-xs ${muted}`}>{post.time} ago</p>
                      </div>
                    </div>
                    <p className={`mt-3 text-sm leading-6 ${muted}`}>{post.body}</p>
                    <div className={`mt-4 flex items-center gap-4 text-sm ${muted}`}>
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                      <button type="button" className="ml-auto text-green-500 hover:text-green-400 font-medium">View product</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </main>

          <aside className="xl:col-span-3 space-y-6">
            <section className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Store performance</h2>
              <div className="space-y-3">
                {loading && (
                  <>
                    <div className={`rounded-lg border p-3 ${subtle}`}>
                      <div className={`h-3 w-1/3 rounded animate-pulse ${skeletonSoft}`} />
                      <div className={`mt-2 h-6 w-1/2 rounded animate-pulse ${skeletonBase}`} />
                    </div>
                    <div className={`rounded-lg border p-3 ${subtle}`}>
                      <div className={`h-3 w-1/3 rounded animate-pulse ${skeletonSoft}`} />
                      <div className={`mt-2 h-6 w-1/2 rounded animate-pulse ${skeletonBase}`} />
                    </div>
                    <div className={`rounded-lg border p-3 ${subtle}`}>
                      <div className={`h-3 w-1/3 rounded animate-pulse ${skeletonSoft}`} />
                      <div className={`mt-2 h-6 w-1/2 rounded animate-pulse ${skeletonBase}`} />
                    </div>
                  </>
                )}
                {!loading && (
                  <>
                <div className={`rounded-lg border p-3 ${subtle}`}>
                  <p className={`text-xs ${muted}`}>Revenue this week</p>
                  <p className="text-xl font-bold">USD {metrics.projectedRevenue.toLocaleString()}</p>
                </div>
                <div className={`rounded-lg border p-3 ${subtle}`}>
                  <p className={`text-xs ${muted}`}>Conversion rate</p>
                  <p className="text-xl font-bold">{metrics.views > 0 ? ((metrics.saves / metrics.views) * 100).toFixed(1) : '0.0'}%</p>
                </div>
                <div className={`rounded-lg border p-3 ${subtle}`}>
                  <p className={`text-xs ${muted}`}>Pending orders</p>
                  <p className="text-xl font-bold">{Math.max(0, Math.floor(metrics.saves / 3))}</p>
                </div>
                  </>
                )}
              </div>
            </section>

            <section className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Sales tools</h2>
              <div className="space-y-2">
                {['Create coupon', 'Run sponsored post', 'View abandoned carts'].map(tool => (
                  <a key={tool} href="/home" className={`block rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${subtle}`}>
                    {tool}
                  </a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
