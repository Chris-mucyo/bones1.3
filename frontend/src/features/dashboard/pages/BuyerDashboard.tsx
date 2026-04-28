import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
<<<<<<< HEAD
import { useTheme } from '../../../shared/components/ThemeProvider';
=======
>>>>>>> main
import { useNavigate } from 'react-router-dom';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
  unreadMessages?: number;
  unreadNotifications?: number;
}

export default function BuyerDashboard() {
<<<<<<< HEAD
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);

  const surface = isDark ? 'bg-neutral-950 border border-white/10 text-white' : 'bg-white border border-black/10 text-black';
  const soft = isDark ? 'bg-white/5 border-white/10' : 'bg-black/[0.03] border-black/10';
  const muted = isDark ? 'text-white/60' : 'text-black/60';
  const chip = isDark ? 'bg-white/10 text-white/80' : 'bg-black/10 text-black';

=======
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);

>>>>>>> main
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
<<<<<<< HEAD
      .catch(err => {
        if (!axios.isCancel(err)) setUser(null);
      });
    return () => controller.abort();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: 'Total spent', value: 'RWF 1,248,000', note: 'Last 30 days' },
      { label: 'Active orders', value: '4', note: '2 arriving this week' },
      { label: 'Wishlist items', value: '19', note: '8 on discount' },
      { label: 'Saved this month', value: 'RWF 87,400', note: 'vs avg market price' },
    ],
    [],
  );

  const orders = useMemo(
    () => [
      { id: '#SH-2194', item: 'Sony WH-1000XM5', seller: 'Kigali Tech Hub', amount: 'RWF 420,000', status: 'In transit', eta: 'Arrives tomorrow' },
      { id: '#SH-2188', item: 'Nike Air Max 270', seller: 'Urban Kicks', amount: 'RWF 185,000', status: 'Packed', eta: 'Arrives in 2 days' },
      { id: '#SH-2171', item: 'Kitchen Blender 700W', seller: 'Home Essentials', amount: 'RWF 92,000', status: 'Delivered', eta: 'Delivered 2 days ago' },
    ],
    [],
  );

  const recommended = useMemo(
    () => [
      { name: 'MacBook Air M2 13"', price: 'RWF 1,450,000', reason: 'Based on your recent tech views' },
      { name: 'Gaming Chair Pro', price: 'RWF 265,000', reason: 'Popular with similar buyers' },
      { name: 'Smart Watch Series 9', price: 'RWF 390,000', reason: 'Price dropped by 12%' },
    ],
    [],
  );

  const activities = useMemo(
    () => [
      'Price alert triggered for Smart TV 55"',
      'Order #SH-2194 moved to In transit',
      'You saved Wireless Earbuds Pro',
      'Coupon BUYMORE12 expires in 2 days',
    ],
    [],
  );

  const socialInfluence = useMemo(
    () => [
      { label: 'Community followers', value: user ? `${Math.max(1200, user.name?.length * 940).toLocaleString()}` : '1,200' },
      { label: 'Monthly reach', value: user ? `${Math.max(18000, user.name?.length * 8200).toLocaleString()}` : '18,000' },
      { label: 'Content engagement', value: user ? `${(6 + (user.name?.length % 4)).toFixed(1)}%` : '6.0%' },
    ],
    [user],
  );

  const profileName = user?.name ?? 'Buyer';
  const profileInitial = profileName?.charAt(0).toUpperCase() ?? '';

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl p-5 md:p-7 ${surface}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Buyer Dashboard</h1>
              <p className={`mt-1 text-sm md:text-base ${muted}`}>
                Track orders, manage wishlist, discover offers, and shop smarter.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>Logged in as {profileName}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>Role: {user?.role ?? 'buyer'}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>Dashboard: /buyer/dashboard</span>
=======
      .catch(err => { if (!axios.isCancel(err)) setUser(null); });
    return () => controller.abort();
  }, []);

  const summaryCards = useMemo(() => [
    { label: 'Total spent',      value: 'RWF 1,248,000', note: 'Last 30 days',          trend: '+12.5%' },
    { label: 'Active orders',    value: '4',             note: '2 arriving this week',  trend: null },
    { label: 'Wishlist items',   value: '19',            note: '8 on discount',          trend: null },
    { label: 'Saved this month', value: 'RWF 87,400',   note: 'vs avg market price',    trend: '+8.2%' },
  ], []);

  const orders = useMemo(() => [
    { id: '#SH-2194', item: 'Sony WH-1000XM5',   seller: 'Kigali Tech Hub',  amount: 'RWF 420,000', status: 'In transit', eta: 'Arrives tomorrow' },
    { id: '#SH-2188', item: 'Nike Air Max 270',   seller: 'Urban Kicks',      amount: 'RWF 185,000', status: 'Packed',     eta: 'Arrives in 2 days' },
    { id: '#SH-2171', item: 'Kitchen Blender 700W', seller: 'Home Essentials', amount: 'RWF 92,000', status: 'Delivered',  eta: 'Delivered 2 days ago' },
  ], []);

  const recommended = useMemo(() => [
    { name: 'MacBook Air M2 13"',  price: 'RWF 1,450,000', reason: 'Based on your recent tech views' },
    { name: 'Gaming Chair Pro',    price: 'RWF 265,000',   reason: 'Popular with similar buyers' },
    { name: 'Smart Watch Series 9', price: 'RWF 390,000',  reason: 'Price dropped by 12%' },
  ], []);

  const activities = useMemo(() => [
    'Price alert triggered for Smart TV 55"',
    'Order #SH-2194 moved to In transit',
    'You saved Wireless Earbuds Pro',
    'Coupon BUYMORE12 expires in 2 days',
  ], []);

  const socialInfluence = useMemo(() => [
    { label: 'Community followers', value: user ? `${Math.max(1200, user.name?.length * 940).toLocaleString()}` : '1,200' },
    { label: 'Monthly reach',       value: user ? `${Math.max(18000, user.name?.length * 8200).toLocaleString()}` : '18,000' },
    { label: 'Content engagement',  value: user ? `${(6 + (user.name?.length % 4)).toFixed(1)}%` : '6.0%' },
  ], [user]);

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
>>>>>>> main
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/listings')}
<<<<<<< HEAD
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
=======
                className="auth-btn"
                style={{ width: 'auto', padding: '10px 20px' }}
>>>>>>> main
              >
                Continue shopping
              </button>
              <button
                type="button"
                onClick={() => navigate('/saved')}
<<<<<<< HEAD
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${soft}`}
=======
                className="auth-social"
                style={{ width: 'auto', padding: '10px 20px' }}
>>>>>>> main
              >
                View wishlist
              </button>
            </div>
          </div>
        </section>

<<<<<<< HEAD
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <article key={card.label} className={`rounded-xl p-4 ${surface}`}>
              <p className={`text-xs uppercase tracking-wide ${muted}`}>{card.label}</p>
              <p className="mt-2 text-xl font-bold">{card.value}</p>
              <p className={`mt-1 text-xs ${muted}`}>{card.note}</p>
=======
        {/* ── KPI Cards ── */}
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
>>>>>>> main
            </article>
          ))}
        </section>

<<<<<<< HEAD
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-green-500 text-black text-xl font-bold flex items-center justify-center">
                  {profileInitial}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Personal buyer profile</h2>
                  <p className={`text-sm mt-1 ${muted}`}>
=======
        {/* ── Main Content ── */}
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
>>>>>>> main
                    {profileName}, your buying preferences and social influence signals are powering smarter recommendations.
                  </p>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {socialInfluence.map(item => (
<<<<<<< HEAD
                      <div key={item.label} className={`rounded-lg border px-3 py-2 ${soft}`}>
                        <p className={`text-xs ${muted}`}>{item.label}</p>
                        <p className="text-sm font-semibold mt-1">{item.value}</p>
=======
                      <div key={item.label} className="rounded-lg p-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--foreground)' }}>{item.value}</p>
>>>>>>> main
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

<<<<<<< HEAD
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent orders</h2>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  Order history
=======
            {/* Recent orders */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Recent orders</h2>
                <button type="button" onClick={() => navigate('/home')} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--link)' }}>
                  Order history →
>>>>>>> main
                </button>
              </div>
              <div className="space-y-3">
                {orders.map(order => (
<<<<<<< HEAD
                  <div key={order.id} className={`rounded-xl border p-4 ${soft}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-semibold">{order.item}</p>
                        <p className={`text-sm ${muted}`}>{order.id} • Sold by {order.seller}</p>
                      </div>
                      <p className="font-bold">{order.amount}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${soft}`}>{order.status}</span>
                      <span className={`text-xs ${muted}`}>{order.eta}</span>
=======
                  <div
                    key={order.id}
                    className="rounded-xl p-4"
                    style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}
                  >
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
>>>>>>> main
                    </div>
                  </div>
                ))}
              </div>
            </article>

<<<<<<< HEAD
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recommended for you</h2>
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  Explore more
=======
            {/* Recommended */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Recommended for you</h2>
                <button type="button" onClick={() => navigate('/explore')} className="text-sm font-medium hover:opacity-80" style={{ color: 'var(--link)' }}>
                  Explore more →
>>>>>>> main
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommended.map(item => (
<<<<<<< HEAD
                  <div key={item.name} className={`rounded-xl border p-4 ${soft}`}>
                    <div className={`h-24 rounded-lg mb-3 ${isDark ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="mt-1 text-base font-bold text-green-500">{item.price}</p>
                    <p className={`mt-1 text-xs ${muted}`}>{item.reason}</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg bg-green-500 py-2 text-xs font-semibold text-black hover:bg-green-400 transition-colors"
                    >
=======
                  <div key={item.name} className="rounded-xl p-4 flex flex-col" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <div className="h-20 rounded-lg mb-3" style={{ background: 'var(--accent)' }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{item.name}</p>
                    <p className="mt-1 text-base font-bold" style={{ color: 'var(--primary)', filter: 'brightness(0.75)' }}>{item.price}</p>
                    <p className="mt-1 text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>{item.reason}</p>
                    <button type="button" className="auth-btn mt-3" style={{ padding: '8px', fontSize: '12px' }}>
>>>>>>> main
                      Add to cart
                    </button>
                  </div>
                ))}
              </div>
            </article>
          </section>

<<<<<<< HEAD
          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Buyer activity</h2>
              <ul className="space-y-2">
                {activities.map(activity => (
                  <li key={activity} className={`rounded-lg border p-3 text-sm ${soft}`}>
=======
          {/* ── Sidebar ── */}
          <aside className="xl:col-span-4 space-y-6">

            {/* Activity feed */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Buyer activity</h2>
              <ul className="space-y-2">
                {activities.map(activity => (
                  <li
                    key={activity}
                    className="rounded-lg p-3 text-sm"
                    style={{ background: 'var(--accent)', border: '1px solid var(--border)', color: 'var(--accent-foreground)' }}
                  >
>>>>>>> main
                    {activity}
                  </li>
                ))}
              </ul>
            </article>

<<<<<<< HEAD
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
              <div className="space-y-2">
                <button type="button" onClick={() => navigate('/saved')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Manage wishlist</button>
                <button type="button" onClick={() => navigate('/chat')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Open messages</button>
                <button type="button" onClick={() => navigate('/explore')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Find deals nearby</button>
=======
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
                    style={{
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ring)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {action.label}
                  </button>
                ))}
>>>>>>> main
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> main
