import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import ListingGrid from '../components/ListingGrid';

export default function NearMePage() {
  const { theme } = useTheme();

  return (
    <AppLayout>
      <div className="min-h-screen px-5 py-6" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl border p-5 md:p-6" style={{ borderColor: 'var(--border-custom)', background: 'var(--bg2)' }}>
          <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Near Me</h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text2)' }}>
            Products and sellers around your location, optimized for faster delivery and local trust.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', color: 'var(--text1)' }}>Local discovery</span>
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', color: 'var(--text1)' }}>Nearby sellers</span>
            <span className="rounded-full px-3 py-1 text-xs" style={{ background: theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)', color: 'var(--text1)' }}>Quick fulfillment</span>
          </div>
        </section>

        <div className="mt-5">
          <ListingGrid category="All" search="" sort="popular" loaderStyle="ecommerce" isDark={theme === 'dark'} />
        </div>
      </div>
    </AppLayout>
  );
}
