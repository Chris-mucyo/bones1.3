import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';

export default function CreateListingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <AppLayout>
      <div style={{ padding: 40, color: isDark ? '#fff' : '#0f0f0f' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 8 }}>Post a Listing</h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Create a new listing — coming soon.</p>
      </div>
    </AppLayout>
  );
}
