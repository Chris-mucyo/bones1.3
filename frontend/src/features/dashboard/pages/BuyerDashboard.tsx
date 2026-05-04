import { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
  unreadMessages?: number;
  unreadNotifications?: number;
}

interface SummaryCard {
  label: string;
  value: string;
  note: string;
  trend: string | null;
}

interface Order {
  id: string;
  item: string;
  seller: string;
  amount: string;
  status: string;
  eta: string;
}

interface RecommendedItem {
  name: string;
  price: string;
  reason: string;
}

interface SocialInfluence {
  label: string;
  value: string;
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recommended, setRecommended] = useState<RecommendedItem[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [socialInfluence, setSocialInfluence] = useState<SocialInfluence[]>([]);

  /* ── fetch current user ── */
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>(`${API_BASE}/api/auth/me`, { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => { if (!axios.isCancel(err)) setUser(null); });
    return () => controller.abort();
  }, []);

  /* ── fetch dashboard data ── */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE}/api/buyer/dashboard`, { signal: controller.signal })
      .then(res => {
        const d = res.data;
        if (d.summaryCards)   setSummaryCards(d.summaryCards);
        if (d.orders)         setOrders(d.orders);
        if (d.recommended)    setRecommended(d.recommended);
        if (d.activities)     setActivities(d.activities);
        if (d.socialInfluence) setSocialInfluence(d.socialInfluence);
      })
      .catch(err => {
        if (!axios.isCancel(err)) setError('Failed to load dashboard. Please try again.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const statusColor: Record<string, string> = {
    'In transit': 'color-mix(in oklch, var(--primary) 15%, transparent)',
    'Packed':     'color-mix(in oklch, var(--secondary) 40%, transparent)',
    'Delivered':  'color-mix(in oklch, var(--muted) 80%, transparent)',
  };

  const profileName    = user?.name ?? 'Buyer';
  const profileInitial = profileName.charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg)', color: 'var(--text1)', fontFamily: 'Outfit, sans-serif' }}>

        {/* ── Header ── */}
        <section
          className="rounded-2xl p-5 md:p-7"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>
                Buyer Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Track orders, manage wishlist, discover offers, and shop smarter.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[`Logged in as ${profileName}`, `Role: ${user?.role ?? 'buyer'}`, 'Dashboard: /buyer/dashboard'].map(label => (
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
              <button type="button" onClick={() => navigate('/listings')} className="auth-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                Continue shopping
              </button>
              <button type="button" onClick={() => navigate('/saved')} className="auth-social" style={{ width: 'auto', padding: '10px 20px' }}>
                View wishlist
              </button>
            </div>
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-3" style={{ background: 'color-mix(in oklch, var(--destructive) 10%, var(--card))', border: '1px solid color-mix(in oklch, var(--destructive) 30%, transparent)', color: 'var(--destructive)' }}>
            {error}
            <button onClick={() => window.location.reload()} style={{ marginLeft: 'auto', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--destructive)', fontFamily: 'Outfit, sans-serif' }}>Retry</button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="mt-12 flex justify-center" style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
            Loading dashboard…
          </div>
        )}

        {/* ── KPI Cards ── */}
        {summaryCards.length > 0 && (
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <article
                key={card.label}
                className="rounded-xl p-5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
                }}
              >
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{card.value}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{card.note}</p>
                  {card.trend && (
                    <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: 'color-mix(in oklch, var(--primary) 20%, transparent)', color: 'var(--primary-foreground)', filter: 'brightness(0.6)' }}>
                      {card.trend}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {/* ── Main Content ── */}
        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className="xl:col-span-8 space-y-6">

              {/* Profile card */}
              <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start gap-4">
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {profileInitial}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Personal buyer profile</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {profileName}, your buying preferences and social influence signals are powering smarter recommendations.
                    </p>
                    {socialInfluence.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {socialInfluence.map(item => (
                          <div key={item.label} className="rounded-lg p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {/* Recent orders */}
              {orders.length > 0 && (
                <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Recent orders</h2>
                    <button type="button" onClick={() => navigate('/home')} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--link)' }}>
                      Order history →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="rounded-xl p-4" style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{order.item}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{order.id} · Sold by {order.seller}</p>
                          </div>
                          <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{order.amount}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: statusColor[order.status] ?? 'var(--muted)', border: '1px solid var(--border)', color: 'var(--accent-foreground)' }}
                          >
                            {order.status}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{order.eta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* Recommended */}
              {recommended.length > 0 && (
                <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Recommended for you</h2>
                    <button type="button" onClick={() => navigate('/explore')} className="text-sm font-medium hover:opacity-80" style={{ color: 'var(--link)' }}>
                      Explore more →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {recommended.map(item => (
                      <div key={item.name} className="rounded-xl p-4 flex flex-col" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <div className="h-20 rounded-lg mb-3" style={{ background: 'var(--accent)' }} />
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{item.name}</p>
                        <p className="mt-1 text-base font-bold" style={{ color: 'var(--primary)', filter: 'brightness(0.75)' }}>{item.price}</p>
                        <p className="mt-1 text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>{item.reason}</p>
                        <button type="button" className="auth-btn mt-3" style={{ padding: '8px', fontSize: '12px' }}>
                          Add to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </section>

            {/* ── Sidebar ── */}
            <aside className="xl:col-span-4 space-y-6">

              {/* Activity feed */}
              {activities.length > 0 && (
                <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Buyer activity</h2>
                  <ul className="space-y-2">
                    {activities.map(activity => (
                      <li
                        key={activity}
                        className="rounded-lg p-3 text-sm"
                        style={{ background: 'var(--accent)', border: '1px solid var(--border)', color: 'var(--accent-foreground)' }}
                      >
                        {activity}
                      </li>
                    ))}
                  </ul>
                </article>
              )}

              {/* Quick actions */}
              <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Quick actions</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Manage wishlist',   path: '/saved' },
                    { label: 'Open messages',     path: '/chat' },
                    { label: 'Find deals nearby', path: '/explore' },
                  ].map(action => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:border-primary"
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
        )}
      </div>
    </AppLayout>
  );
}