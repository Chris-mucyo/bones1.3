import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useNavigate } from 'react-router-dom';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => { if (!axios.isCancel(err)) setUser(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const stats = useMemo(() => [
    { label: 'Revenue (30d)',       value: 'RWF 4,860,000', note: '+18.4% vs last month',         trend: '+18.4%' },
    { label: 'Orders',             value: '173',           note: '32 pending fulfillment',        trend: null },
    { label: 'Conversion rate',    value: '7.9%',          note: 'From product page visits',      trend: '+1.2%' },
    { label: 'Average order value', value: 'RWF 62,400',  note: 'Across all channels',            trend: null },
  ], []);

  const topListings = useMemo(() => [
    { name: 'Wireless Earbuds Pro',  views: '18,240', saves: '1,302', sales: '327', status: 'Top performer' },
    { name: 'Portable Ring Light',   views: '11,010', saves: '880',   sales: '221', status: 'Growing' },
    { name: 'Minimal Desk Lamp',     views: '8,944',  saves: '640',   sales: '149', status: 'Needs promo' },
  ], []);

  const socialSignals = useMemo(() => [
    { label: 'Followers reached',     value: '63,200',    note: 'Across linked social channels' },
    { label: 'Video-to-product CTR',  value: '3.8%',      note: 'Clicks from content to listing' },
    { label: 'Creator collabs',       value: '6 active',  note: '2 pending campaign approvals' },
  ], []);

  const orderPipeline = [
    { stage: 'New',        count: 14  },
    { stage: 'Packed',     count: 9   },
    { stage: 'In transit', count: 23  },
    { stage: 'Delivered',  count: 127 },
  ];

  const statusBadgeStyle = (status: string) => {
    const map: Record<string, string> = {
      'Top performer': 'color-mix(in oklch, var(--primary) 25%, transparent)',
      'Growing':       'color-mix(in oklch, var(--secondary) 60%, transparent)',
      'Needs promo':   'color-mix(in oklch, var(--accent) 80%, transparent)',
    };
    return map[status] ?? 'var(--muted)';
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg)', color: 'var(--foreground)', fontFamily: 'Outfit, sans-serif' }}>

        {/* ── Header ── */}
        <section
          className="rounded-2xl p-5 md:p-7"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>
                Seller Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Manage listings, monitor conversions, and scale your social-commerce sales.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  loading ? 'Loading seller profile…' : `Seller: ${user?.name ?? 'Unknown'}`,
                  `Role: ${user?.role ?? 'seller'}`,
                ].map(label => (
                  <span
                    key={label}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate('/listings/new')} className="auth-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                Add listing
              </button>
              <button type="button" onClick={() => navigate('/chat')} className="auth-social" style={{ width: 'auto', padding: '10px 20px' }}>
                Open buyer chats
              </button>
            </div>
          </div>
        </section>

        {/* ── KPI Cards ── */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((item, i) => (
            <article
              key={item.label}
              className="rounded-xl p-5"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
              }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{item.value}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.note}</p>
                {item.trend && (
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: 'color-mix(in oklch, var(--primary) 20%, transparent)', color: 'var(--link)' }}>
                    {item.trend}
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* ── Main Grid ── */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">

            {/* Top listings */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Top listing performance</h2>
                <button type="button" onClick={() => navigate('/explore')} className="text-sm font-medium hover:opacity-80" style={{ color: 'var(--link)' }}>
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {topListings.map(item => (
                  <div key={item.name} className="rounded-xl p-4" style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{item.name}</p>
                      <span
                        className="self-start text-xs rounded-full px-2.5 py-1 font-medium"
                        style={{ background: statusBadgeStyle(item.status), border: '1px solid var(--border)', color: 'var(--accent-foreground)' }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        { label: 'Views', val: item.views },
                        { label: 'Saves', val: item.saves },
                        { label: 'Sales', val: item.sales },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Social influence */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Social influence signals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {socialSignals.map(item => (
                  <div key={item.label} className="rounded-lg p-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                    <p className="text-lg font-bold mt-1" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{item.note}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* ── Sidebar ── */}
          <aside className="xl:col-span-4 space-y-6">

            {/* Order pipeline */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Order pipeline</h2>
              <div className="space-y-2">
                {orderPipeline.map(step => (
                  <div
                    key={step.stage}
                    className="rounded-lg p-3 flex items-center justify-between"
                    style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--accent-foreground)' }}>{step.stage}</span>
                    <span
                      className="text-sm font-bold rounded-full px-2.5 py-0.5"
                      style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                    >
                      {step.count}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Quick actions */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Quick actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Create campaign listing',  path: '/listings/new' },
                  { label: 'Reply to buyer messages',  path: '/chat' },
                  { label: 'Edit seller profile',      path: '/account' },
                ].map(action => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ring)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}