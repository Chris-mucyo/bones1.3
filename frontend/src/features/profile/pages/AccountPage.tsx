import { useEffect, useMemo, useRef, useState } from 'react';
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

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

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
        const apiUser = res.data;

        const mappedUser: CurrentUser = {
          id: String(apiUser.id),
          fullName: apiUser.fullName,
          avatarUrl: apiUser.avatarUrl ?? undefined,
          role: apiUser.role,
        };

        setUser(mappedUser);
        setDisplayName(mappedUser.fullName);
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          console.error('FETCH USER ERROR:', err);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const surface = '';
  const muted = '';
  const soft = '';
  const input = '';

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
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}>
          <div className="h-32 md:h-40 w-full" style={{ background: 'linear-gradient(to right, rgba(34,197,94,0.2), rgba(34,197,94,0.15), rgba(34,197,94,0.1))' }} />
          <div className="p-5 md:p-7">
            <div className="-mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-end gap-4">

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

                <div
                  className="relative h-20 w-20 md:h-24 md:w-24 rounded-full border-4 cursor-pointer flex-shrink-0"
                  style={{ borderColor: 'rgba(0,0,0,0.8)' }}
                  onClick={() => avatarInputRef.current?.click()}
                  onMouseEnter={() => setAvatarHovered(true)}
                  onMouseLeave={() => setAvatarHovered(false)}
                >
                  {avatarPreview || user?.avatarUrl ? (
                    <img
                      src={avatarPreview ?? user?.avatarUrl}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-green-500 text-black text-2xl font-bold grid place-items-center">
                      {(user?.fullName ?? 'A').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5 transition-opacity duration-200"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      opacity: avatarHovered ? 1 : 0,
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-white font-semibold tracking-wide uppercase" style={{ fontSize: '9px' }}>Change</span>
                  </div>
                </div>

                <div>
                  <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Account Profile</h1>
                  <p className="text-sm md:text-base" style={{ color: 'var(--text2)' }}>
                    Personal profile, preferences, and security settings.
                  </p>
                </div>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>
                {loading ? 'Loading profile...' : `Logged in as ${user?.fullName ?? 'Unknown user'}`}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className="rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                {influenceStats.map(stat => (
                  <div key={stat.label} className="rounded-xl border p-3" style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)' }}>
                    <p className="text-xs" style={{ color: 'var(--text2)' }}>{stat.label}</p>
                    <p className="mt-1 text-lg font-bold">{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{stat.note}</p>
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
                <button type="button" className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors`} style={{ background: 'var(--bg2)', borderColor: 'var(--border-custom)', color: 'var(--text1)' }}>
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
