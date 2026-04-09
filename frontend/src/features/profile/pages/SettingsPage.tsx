import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';

interface CurrentUser {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
}

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [contentMode, setContentMode] = useState<'balanced' | 'social-first' | 'commerce-first'>('balanced');
  const [autoBoostTrending, setAutoBoostTrending] = useState(true);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(true);
  const [allowAffiliateTags, setAllowAffiliateTags] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showInventorySignals, setShowInventorySignals] = useState(true);
  const [acceptWholesaleRequests, setAcceptWholesaleRequests] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeenVisibility, setLastSeenVisibility] = useState(true);
  const [storyReplies, setStoryReplies] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [autoDownloadMedia, setAutoDownloadMedia] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [highContrastText, setHighContrastText] = useState(false);
  const [autoPlayPreviews, setAutoPlayPreviews] = useState(true);
  const [language, setLanguage] = useState('English');
  const [fontScale, setFontScale] = useState('100');
  const [defaultMarkup, setDefaultMarkup] = useState('18');
  const [dailyAdBudget, setDailyAdBudget] = useState('25000');

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
  const input = isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-white border-black/15 text-black';

  const socialCommerceScore = useMemo(() => {
    let score = 50;
    if (autoBoostTrending) score += 10;
    if (showVerifiedBadge) score += 8;
    if (allowAffiliateTags) score += 7;
    if (showInventorySignals) score += 10;
    if (acceptWholesaleRequests) score += 8;
    if (contentMode === 'social-first') score += 4;
    if (contentMode === 'commerce-first') score += 6;
    return Math.min(100, score);
  }, [
    autoBoostTrending,
    showVerifiedBadge,
    allowAffiliateTags,
    showInventorySignals,
    acceptWholesaleRequests,
    contentMode,
  ]);

  const roleHint =
    user?.role === 'buyer'
      ? 'Buyer settings focus on trust, deals, and creator recommendations.'
      : user?.role === 'seller'
      ? 'Seller settings focus on conversion, campaigns, and storefront growth.'
      : user?.role === 'Wholesaler'
      ? 'Wholesaler settings focus on bulk signals, verification, and B2B demand.'
      : 'Personalize social-commerce settings for your account.';

  const Toggle = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className={`rounded-xl border p-3 ${soft}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className={`text-xs mt-1 ${muted}`}>{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-green-500' : isDark ? 'bg-white/20' : 'bg-black/20'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
              value ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl p-5 md:p-6 ${surface}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Settings</h1>
              <p className={`mt-1 text-sm md:text-base ${muted}`}>{roleHint}</p>
              <p className={`mt-2 text-xs ${muted}`}>
                {loading ? 'Loading account...' : `${user?.name ?? 'Unknown'} • ${user?.role ?? 'guest'}`}
              </p>
            </div>
            <button type="button" className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
              Save all changes
            </button>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Appearance & accessibility</h2>
              <div className={`rounded-xl border p-3 mb-4 ${soft}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Dark / Light mode</p>
                    <p className={`text-xs mt-1 ${muted}`}>Switch app theme with a smooth toggle.</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Toggle dark mode"
                    className={`relative h-8 w-16 rounded-full transition-colors duration-300 ${
                      isDark ? 'bg-green-500' : 'bg-black/20'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        isDark ? 'left-[34px]' : 'left-1'
                      }`}
                    />
                    <span
                      className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold transition-opacity ${
                        isDark ? 'opacity-0' : 'opacity-100 text-black/70'
                      }`}
                    >
                      L
                    </span>
                    <span
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold transition-opacity ${
                        isDark ? 'opacity-100 text-black' : 'opacity-0'
                      }`}
                    >
                      D
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <label className="text-sm">
                  <span className={`block mb-1 ${muted}`}>App language</span>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm ${input}`}
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Kinyarwanda</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className={`block mb-1 ${muted}`}>Font scale (%)</span>
                  <input
                    value={fontScale}
                    onChange={e => setFontScale(e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm ${input}`}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Toggle
                  label="Compact mode"
                  description="Show denser feed and settings rows for power users."
                  value={compactMode}
                  onChange={setCompactMode}
                />
                <Toggle
                  label="High contrast text"
                  description="Improve readability for long browsing sessions."
                  value={highContrastText}
                  onChange={setHighContrastText}
                />
                <Toggle
                  label="Auto-play product previews"
                  description="Play social product clips while scrolling."
                  value={autoPlayPreviews}
                  onChange={setAutoPlayPreviews}
                />
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Social influence controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Toggle
                  label="Auto-boost trending products"
                  description="Prioritize products with high saves, shares, and engagement."
                  value={autoBoostTrending}
                  onChange={setAutoBoostTrending}
                />
                <Toggle
                  label="Show verified status publicly"
                  description="Display verification trust marker on profile and listings."
                  value={showVerifiedBadge}
                  onChange={setShowVerifiedBadge}
                />
                <Toggle
                  label="Allow affiliate tags"
                  description="Enable creator partnerships and commission tagging."
                  value={allowAffiliateTags}
                  onChange={setAllowAffiliateTags}
                />
                <Toggle
                  label="Public profile visibility"
                  description="Allow discovery through social feed and top seller boards."
                  value={publicProfile}
                  onChange={setPublicProfile}
                />
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">E-commerce strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <label className="text-sm">
                  <span className={`block mb-1 ${muted}`}>Content mode</span>
                  <select
                    value={contentMode}
                    onChange={e => setContentMode(e.target.value as 'balanced' | 'social-first' | 'commerce-first')}
                    className={`w-full h-10 rounded-lg border px-3 text-sm ${input}`}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="social-first">Social-first</option>
                    <option value="commerce-first">Commerce-first</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className={`block mb-1 ${muted}`}>Default markup (%)</span>
                  <input
                    value={defaultMarkup}
                    onChange={e => setDefaultMarkup(e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm ${input}`}
                  />
                </label>

                <label className="text-sm">
                  <span className={`block mb-1 ${muted}`}>Daily ad budget (RWF)</span>
                  <input
                    value={dailyAdBudget}
                    onChange={e => setDailyAdBudget(e.target.value)}
                    className={`w-full h-10 rounded-lg border px-3 text-sm ${input}`}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Toggle
                  label="Show inventory urgency signals"
                  description="Display low-stock urgency to increase conversion."
                  value={showInventorySignals}
                  onChange={setShowInventorySignals}
                />
                <Toggle
                  label="Accept wholesale requests"
                  description="Enable B2B inquiries from verified bulk buyers."
                  value={acceptWholesaleRequests}
                  onChange={setAcceptWholesaleRequests}
                />
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Privacy & messaging</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Toggle
                  label="Read receipts"
                  description="Let other users know when you viewed messages."
                  value={readReceipts}
                  onChange={setReadReceipts}
                />
                <Toggle
                  label="Last seen visibility"
                  description="Show your online activity to connections."
                  value={lastSeenVisibility}
                  onChange={setLastSeenVisibility}
                />
                <Toggle
                  label="Story and short replies"
                  description="Allow replies to stories and product shorts."
                  value={storyReplies}
                  onChange={setStoryReplies}
                />
                <Toggle
                  label="Auto-download media"
                  description="Download images/videos automatically on Wi-Fi."
                  value={autoDownloadMedia}
                  onChange={setAutoDownloadMedia}
                />
              </div>
            </article>
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Security</h2>
              <div className="space-y-3">
                <Toggle
                  label="Two-factor authentication"
                  description="Add an extra verification step at login."
                  value={twoFactorAuth}
                  onChange={setTwoFactorAuth}
                />
                <Toggle
                  label="Login alerts"
                  description="Notify when your account signs in from a new device."
                  value={loginAlerts}
                  onChange={setLoginAlerts}
                />
              </div>
              <div className={`rounded-lg border p-3 text-sm mt-3 ${soft}`}>
                <p className="font-semibold">Active sessions</p>
                <p className={`${muted} mt-1`}>Kigali (Windows) • Mobile app session • Last seen 8 min ago</p>
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Notification settings</h2>
              <div className="space-y-3">
                <Toggle
                  label="Order alerts"
                  description="Push notifications for new orders and status updates."
                  value={orderAlerts}
                  onChange={setOrderAlerts}
                />
                <Toggle
                  label="Message alerts"
                  description="Buyer/seller/wholesaler chat message notifications."
                  value={messageAlerts}
                  onChange={setMessageAlerts}
                />
                <Toggle
                  label="Campaign alerts"
                  description="Promotion performance and trend movement alerts."
                  value={campaignAlerts}
                  onChange={setCampaignAlerts}
                />
                <Toggle
                  label="Desktop notifications"
                  description="Receive notifications directly in browser/desktop app."
                  value={desktopNotifications}
                  onChange={setDesktopNotifications}
                />
                <Toggle
                  label="Email digest"
                  description="Daily recap for sales, trends, and messages."
                  value={emailDigest}
                  onChange={setEmailDigest}
                />
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Payout and billing</h2>
              <div className={`rounded-lg border p-3 text-sm ${soft}`}>
                <p className="font-semibold">Primary payout method</p>
                <p className={`${muted} mt-1`}>Mobile Money (MTN)</p>
              </div>
              <div className={`rounded-lg border p-3 text-sm mt-3 ${soft}`}>
                <p className="font-semibold">Settlement cycle</p>
                <p className={`${muted} mt-1`}>Every 3 business days</p>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
