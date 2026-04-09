import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
}

export default function SellerDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => {
        if (!axios.isCancel(err)) setUser(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const surface = isDark ? 'bg-neutral-950 border border-white/10 text-white' : 'bg-white border border-black/10 text-black';
  const soft = isDark ? 'bg-white/5 border-white/10' : 'bg-black/[0.03] border-black/10';
  const muted = isDark ? 'text-white/60' : 'text-black/60';
  const chip = isDark ? 'bg-white/10 text-white/80' : 'bg-black/10 text-black';

  const stats = useMemo(
    () => [
      { label: 'Revenue (30d)', value: 'RWF 4,860,000', note: '+18.4% vs last month' },
      { label: 'Orders', value: '173', note: '32 pending fulfillment' },
      { label: 'Conversion rate', value: '7.9%', note: 'From product page visits' },
      { label: 'Average order value', value: 'RWF 62,400', note: 'Across all channels' },
    ],
    [],
  );

  const topListings = useMemo(
    () => [
      { name: 'Wireless Earbuds Pro', views: '18,240', saves: '1,302', sales: '327', status: 'Top performer' },
      { name: 'Portable Ring Light', views: '11,010', saves: '880', sales: '221', status: 'Growing' },
      { name: 'Minimal Desk Lamp', views: '8,944', saves: '640', sales: '149', status: 'Needs promo' },
    ],
    [],
  );

  const socialSignals = useMemo(
    () => [
      { label: 'Followers reached', value: '63,200', note: 'Across linked social channels' },
      { label: 'Video-to-product CTR', value: '3.8%', note: 'Clicks from content to listing' },
      { label: 'Creator collabs', value: '6 active', note: '2 pending campaign approvals' },
    ],
    [],
  );

  const orderPipeline = [
    { stage: 'New', count: 14 },
    { stage: 'Packed', count: 9 },
    { stage: 'In transit', count: 23 },
    { stage: 'Delivered', count: 127 },
  ];

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl p-5 md:p-7 ${surface}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Seller Dashboard</h1>
              <p className={`mt-1 text-sm md:text-base ${muted}`}>
                Manage listings, monitor conversions, and scale your social-commerce sales.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>
                  {loading ? 'Loading seller profile...' : `Seller: ${user?.name ?? 'Unknown'}`}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>
                  Role: {user?.role ?? 'seller'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/listings/new')}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
              >
                Add listing
              </button>
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${soft}`}
              >
                Open buyer chats
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(item => (
            <article key={item.label} className={`rounded-xl p-4 ${surface}`}>
              <p className={`text-xs uppercase tracking-wide ${muted}`}>{item.label}</p>
              <p className="mt-2 text-xl font-bold">{item.value}</p>
              <p className={`mt-1 text-xs ${muted}`}>{item.note}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Top listing performance</h2>
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  View all listings
                </button>
              </div>
              <div className="space-y-3">
                {topListings.map(item => (
                  <div key={item.name} className={`rounded-xl border p-4 ${soft}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <span className={`text-xs rounded-full border px-2.5 py-1 ${soft}`}>{item.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <p className={`text-xs ${muted}`}>Views</p>
                        <p className="text-sm font-semibold">{item.views}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Saves</p>
                        <p className="text-sm font-semibold">{item.saves}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Sales</p>
                        <p className="text-sm font-semibold">{item.sales}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Social influence signals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {socialSignals.map(item => (
                  <div key={item.label} className={`rounded-lg border p-3 ${soft}`}>
                    <p className={`text-xs ${muted}`}>{item.label}</p>
                    <p className="text-base font-semibold mt-1">{item.value}</p>
                    <p className={`text-xs mt-1 ${muted}`}>{item.note}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Order pipeline</h2>
              <div className="space-y-2">
                {orderPipeline.map(step => (
                  <div key={step.stage} className={`rounded-lg border p-3 flex items-center justify-between ${soft}`}>
                    <span className="text-sm">{step.stage}</span>
                    <span className="text-sm font-semibold">{step.count}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
              <div className="space-y-2">
                <button type="button" onClick={() => navigate('/listings/new')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Create campaign listing</button>
                <button type="button" onClick={() => navigate('/chat')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Reply to buyer messages</button>
                <button type="button" onClick={() => navigate('/account')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Edit seller profile</button>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
