import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { Listing } from '../types';

type RoleFilter = 'all' | 'buyer' | 'seller' | 'Wholesaler';
type ViewerRole = 'buyer' | 'seller' | 'Wholesaler' | 'unknown';

interface RankedEntity {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'Wholesaler';
  verified: boolean;
  totalSales: number;
  avgRating: number;
  productsCount: number;
  trendingProducts: number;
  influenceScore: number;
}

function getToken(): string | null {
  return localStorage.getItem('token') ?? localStorage.getItem('accessToken');
}

function parseRoleFromToken(token: string | null): ViewerRole {
  if (!token) return 'all';
  try {
    const base64 = token.split('.')[1];
    if (!base64) return 'all';
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { role?: string };
    if (payload.role === 'buyer' || payload.role === 'seller' || payload.role === 'Wholesaler') return payload.role;
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function parseUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { id?: string; sub?: string; userId?: string };
    return payload.id ?? payload.sub ?? payload.userId ?? null;
  } catch {
    return null;
  }
}

function normalizeTopEntities(payload: unknown): RankedEntity[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map(item => {
      const row = item as Partial<RankedEntity>;
      if (!row.id || !row.name || !row.role) return null;
      return {
        id: String(row.id),
        name: String(row.name),
        role: row.role,
        verified: Boolean(row.verified),
        totalSales: Number(row.totalSales ?? 0),
        avgRating: Number(row.avgRating ?? 0),
        productsCount: Number(row.productsCount ?? 0),
        trendingProducts: Number(row.trendingProducts ?? 0),
        influenceScore: Number(row.influenceScore ?? 0),
      } as RankedEntity;
    })
    .filter((row): row is RankedEntity => Boolean(row));
}

export default function TopSellersPage() {
  const { theme } = useTheme();
  const viewerRole = parseRoleFromToken(getToken());
  const viewerId = parseUserIdFromToken(getToken());
  const [rows, setRows] = useState<RankedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    Promise.allSettled([
      axios.get('/api/top-sellers', {
        signal: controller.signal,
        params: { includeVerified: true, includeTrending: true },
        headers,
      }),
      axios.get('/api/listings', {
        signal: controller.signal,
        params: { sort: 'popular', limit: 120 },
        headers,
      }),
    ])
      .then(results => {
        const apiTop = results[0].status === 'fulfilled' ? normalizeTopEntities(results[0].value.data) : [];
        if (apiTop.length) {
          setRows(apiTop);
          return;
        }

        const listingsPayload = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const rawListings: Listing[] = Array.isArray(listingsPayload)
          ? listingsPayload
          : Array.isArray((listingsPayload as { listings?: Listing[] }).listings)
          ? ((listingsPayload as { listings: Listing[] }).listings)
          : [];

        const grouped = new Map<string, RankedEntity>();
        rawListings.forEach(listing => {
          const seller = listing.seller;
          if (!seller?.id) return;
          const existing = grouped.get(seller.id) ?? {
            id: seller.id,
            name: seller.shopName || seller.name,
            role: seller.verified && (seller.totalSales ?? 0) > 1000 ? 'Wholesaler' : 'seller',
            verified: Boolean(seller.verified),
            totalSales: seller.totalSales ?? 0,
            avgRating: seller.rating ?? 0,
            productsCount: 0,
            trendingProducts: 0,
            influenceScore: 0,
          };

          existing.productsCount += 1;
          const isTrendingProduct = listing.badge === 'hot' || listing.badge === 'featured' || listing.views > 3000;
          if (isTrendingProduct) existing.trendingProducts += 1;

          const saleSignal = (seller.totalSales ?? 0) * 0.18;
          const viewSignal = listing.views * 0.42;
          const saveSignal = listing.savedCount * 0.35;
          const trendSignal = (isTrendingProduct ? 1 : 0) * 220;
          const verifiedBonus = seller.verified ? 180 : 0;
          existing.influenceScore += saleSignal + viewSignal + saveSignal + trendSignal + verifiedBonus;

          grouped.set(seller.id, existing);
        });

        const derived = [...grouped.values()]
          .map(row => ({
            ...row,
            influenceScore: Math.round(row.influenceScore),
          }))
          .sort((a, b) => b.influenceScore - a.influenceScore);

        setRows(derived);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const withoutSelf = rows.filter(r => !viewerId || r.id !== viewerId);
    if (viewerRole === 'buyer') return withoutSelf.filter(r => r.role === 'seller');
    if (viewerRole === 'seller' || viewerRole === 'Wholesaler') {
      return withoutSelf.filter(r => r.role === 'seller' || r.role === 'Wholesaler');
    }
    return withoutSelf;
  }, [rows, viewerRole, viewerId]);

  const surface = '';
  const soft = '';
  const muted = '';
  const chip = '';

  return (
    <AppLayout>
      <div className="min-h-screen px-5 py-6" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl p-5 md:p-6" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}>
          <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Top Sellers & Wholesalers</h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text2)' }}>
            Verified seller and wholesaler leaderboard with trending product influence.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>Verified profiles prioritized</span>
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>Trending products included</span>
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>
              {viewerRole === 'buyer'
                ? 'Buyer view: sellers only'
                : viewerRole === 'seller'
                ? 'Seller view: sellers + wholesalers'
                : viewerRole === 'Wholesaler'
                ? 'Wholesaler view: wholesalers + sellers'
                : 'Marketplace view'}
            </span>
          </div>
        </section>

        <section className="mt-5 space-y-3">
          {loading && (
            <div className="rounded-xl border p-4 text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)', color: 'var(--text2)' }}>Loading leaderboard...</div>
          )}

          {!loading && !filtered.length && (
            <div className="rounded-xl border p-4 text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)', color: 'var(--text2)' }}>
              No ranked profiles available for this role yet.
            </div>
          )}

          {!loading &&
            filtered.map((row, idx) => (
              <article key={row.id} className="rounded-xl border p-4" style={{ background: 'var(--bg)', borderColor: 'var(--border-custom)' }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold">
                        {row.name}{' '}
                        {row.verified && (
                          <span className="ml-1 text-xs rounded-full bg-green-500 px-2 py-0.5 text-black font-bold">
                            Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-500">Influence score: {row.influenceScore.toLocaleString()}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="rounded-lg border p-2.5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text2)' }}>Sales</p>
                    <p className="text-sm font-semibold">{row.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text2)' }}>Products</p>
                    <p className="text-sm font-semibold">{row.productsCount}</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text2)' }}>Trending products</p>
                    <p className="text-sm font-semibold">{row.trendingProducts}</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text2)' }}>Rating</p>
                    <p className="text-sm font-semibold">{row.avgRating ? row.avgRating.toFixed(1) : '-'}</p>
                  </div>
                  <div className="rounded-lg border p-2.5" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--text2)' }}>Trust tier</p>
                    <p className="text-sm font-semibold">{row.verified ? 'High' : 'Standard'}</p>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </AppLayout>
  );
}
