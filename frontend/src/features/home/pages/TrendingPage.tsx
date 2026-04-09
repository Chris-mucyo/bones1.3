import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import ListingGrid from '../components/ListingGrid';

export default function TrendingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AppLayout>
      <div className={`min-h-screen px-5 py-6 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl border p-5 md:p-6 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-white'}`}>
          <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Trending Marketplace</h1>
          <p className={`mt-2 text-sm md:text-base ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            Live momentum from creator influence, buyer engagement, and social commerce velocity.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs ${isDark ? 'bg-white/10 text-white/85' : 'bg-black/10 text-black'}`}>Sort: Popular</span>
            <span className={`rounded-full px-3 py-1 text-xs ${isDark ? 'bg-white/10 text-white/85' : 'bg-black/10 text-black'}`}>Signal: Real-time interest</span>
            <span className={`rounded-full px-3 py-1 text-xs ${isDark ? 'bg-white/10 text-white/85' : 'bg-black/10 text-black'}`}>Audience: Social shoppers</span>
          </div>
        </section>

        <div className="mt-5">
          <ListingGrid category="All" search="" sort="popular" isDark={isDark} />
        </div>
      </div>
    </AppLayout>
  );
}
