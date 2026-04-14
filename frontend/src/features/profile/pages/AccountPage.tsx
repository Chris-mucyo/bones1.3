import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';

interface CurrentUser {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
  unreadMessages?: number;
  unreadNotifications?: number;
}


export default function AccountPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    axios
      .get<CurrentUser>('http://localhost:3000/api/v1/users/me', {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        console.log("USER RESPONSE:", res.data);

        const apiUser = res.data;

        const mappedUser: CurrentUser = {
          id: String(apiUser.id),
          fullName: apiUser.fullName, // ✅ FIX
          avatarUrl: apiUser.avatarUrl ?? undefined, // ✅ FIX
          role: apiUser.role, // ✅ FIX (BUYER → buyer)
        };

        setUser(mappedUser);
        setDisplayName(mappedUser.fullName);
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          console.error("FETCH USER ERROR:", err);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const surface = isDark ? 'bg-neutral-950 border border-white/10 text-white' : 'bg-white border border-black/10 text-black';
  const muted = isDark ? 'text-white/60' : 'text-black/60';
  const soft = isDark ? 'bg-white/5 border-white/10' : 'bg-black/[0.03] border-black/10';
  const input = isDark
    ? 'bg-black/40 border-white/15 text-white placeholder:text-white/35'
    : 'bg-white border-black/15 text-black placeholder:text-black/40';

  const insights = useMemo(
    () => [
      { label: 'Role', value: user?.role ?? 'Guest' },
      { label: 'Unread messages', value: String(user?.unreadMessages ?? 0) },
      { label: 'Unread notifications', value: String(user?.unreadNotifications ?? 0) },
    ],
    [user],
  );

  const securityItems = [
    'Password last updated 28 days ago',
    'Two-factor authentication not enabled',
    'Login activity: 3 active sessions',
  ];

  const influenceStats = useMemo(
    () => [
      { label: 'Followers', value: user ? Math.max(1400, user.fullName?.length * 880).toLocaleString() : '1,400', note: 'Cross-platform audience' },
      { label: 'Monthly reach', value: user ? Math.max(24000, user.fullName?.length * 7900).toLocaleString() : '24,000', note: 'Content impressions' },
      { label: 'Engagement', value: user ? `${(5.4 + (user.fullName?.length % 3)).toFixed(1)}%` : '5.4%', note: 'Likes, saves, comments' },
      { label: 'CTR to shop', value: user ? `${(2.3 + (user.fullName?.length % 2) * 0.7).toFixed(1)}%` : '2.3%', note: 'Traffic to product pages' },
    ],
    [user],
  );

  const commerceStats = useMemo(
    () => [
      { label: 'Attributed sales', value: 'RWF 2,480,000', note: 'From social traffic' },
      { label: 'Top converting content', value: 'Short video reviews', note: '13.2% conversion' },
      { label: 'Avg order value', value: 'RWF 84,000', note: 'Based on last 30 days' },
    ],
    [],
  );

  const campaigns = [
    'Back-to-school bundle (active)',
    'Weekend flash sale collaboration',
    'Creator affiliate spotlight',
  ];

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl overflow-hidden ${surface}`}>
          <div className={`h-32 md:h-40 w-full ${isDark ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-cyan-500/20' : 'bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-blue-500/20'}`} />
          <div className="p-5 md:p-7">
            <div className="-mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-black/80 bg-green-500 text-black text-2xl font-bold grid place-items-center">
                  {(user?.fullName ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Account Profile</h1>
                  <p className={`text-sm md:text-base ${muted}`}>
                    Personal profile, preferences, and security settings.
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${soft}`}>
                {loading ? 'Loading profile...' : `Logged in as ${user?.fullName ?? 'Unknown user'}`}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                {influenceStats.map(stat => (
                  <div key={stat.label} className={`rounded-xl border p-3 ${soft}`}>
                    <p className={`text-xs ${muted}`}>{stat.label}</p>
                    <p className="mt-1 text-lg font-bold">{stat.value}</p>
                    <p className={`text-xs mt-1 ${muted}`}>{stat.note}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold mb-3">Profile information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Full name"
                  className={`h-10 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={`h-10 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className={`h-10 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Location"
                  className={`h-10 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
                  Save profile
                </button>
                <button type="button" className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${soft}`}>
                  Cancel
                </button>
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Commerce performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {commerceStats.map(item => (
                  <div key={item.label} className={`rounded-lg border p-3 ${soft}`}>
                    <p className={`text-xs ${muted}`}>{item.label}</p>
                    <p className="text-base font-semibold mt-1">{item.value}</p>
                    <p className={`text-xs mt-1 ${muted}`}>{item.note}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-sm font-semibold mb-2">Active campaigns</h3>
              <ul className="space-y-2">
                {campaigns.map(item => (
                  <li key={item} className={`rounded-lg border p-3 text-sm ${soft}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Account insights</h2>
              <div className="space-y-3">
                {insights.map(item => (
                  <div key={item.label} className={`rounded-lg border p-3 ${soft}`}>
                    <p className={`text-xs ${muted}`}>{item.label}</p>
                    <p className="text-base font-semibold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Security</h2>
              <ul className="space-y-2 mb-4">
                {securityItems.map(item => (
                  <li key={item} className={`rounded-lg border p-3 text-sm ${soft}`}>
                    {item}
                  </li>
                ))}
              </ul>
              <h3 className="text-sm font-semibold mb-2">Connected accounts</h3>
              <div className="space-y-2">
                {['Google', 'Apple', 'Facebook'].map(provider => (
                  <button
                    key={provider}
                    type="button"
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}
                  >
                    {provider}
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
