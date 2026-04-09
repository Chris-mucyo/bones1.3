import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../components/ThemeProvider';
import AppNavigation, { type CurrentUser } from './components/AppNavigation';

interface Props { children: React.ReactNode; }

export default function AppLayout({ children }: Props) {
  const { theme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  const isDark = theme === 'dark';
  const activePath = location.pathname;
  const isChatRoute = activePath.startsWith('/chat');
  const effectiveCollapsed = isChatRoute ? true : collapsed;

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => {
        if (!axios.isCancel(err)) setUser(null);
      });
    return () => controller.abort();
  }, []);

  // Softer palette for eye comfort in both themes.
  const navTheme = {
    topbarBg: isDark ? 'rgba(19,21,22,0.9)' : 'rgba(246,247,248,0.94)',
    border: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)',
    sidebarBg: isDark ? '#131516' : '#f3f5f7',
    bg: isDark ? '#111314' : '#f8f9fb',
    text1: isDark ? 'rgba(255,255,255,0.95)' : '#0f1720',
    text2: isDark ? 'rgba(255,255,255,0.58)' : '#000000',
    hover: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)',
    green: '#22c55e',
    greenDim: isDark ? 'rgba(34,197,94,0.14)' : 'rgba(34,197,94,0.12)',
    badgeBg: '#ef4444',
    searchBg: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.85)',
  };

  return (
    <div style={{ minHeight: '100vh', background: navTheme.bg }}>
      <AppNavigation
        activePath={activePath}
        collapsed={effectiveCollapsed}
        isDark={isDark}
        user={user}
        theme={navTheme}
        onToggleCollapse={() => {
          if (!isChatRoute) setCollapsed(c => !c);
        }}
      />

      <main style={{ marginLeft: effectiveCollapsed ? 72 : 236, paddingTop: 56, minHeight: '100vh', transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)' }}>
        {children}
      </main>
    </div>
  );
}