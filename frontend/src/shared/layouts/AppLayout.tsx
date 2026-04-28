import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AppNavigation, { type CurrentUser } from './components/AppNavigation';

interface Props { children: React.ReactNode; }
type Viewport = 'mobile' | 'tablet' | 'desktop';

export default function AppLayout({ children }: Props) {
  
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [viewport, setViewport] = useState<Viewport>(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < 768) return 'mobile';
    if (window.innerWidth < 1024) return 'tablet';
    return 'desktop';
  });

  const activePath = location.pathname;
  const isChatRoute = activePath.startsWith('/chat');
  const showTopNav = activePath.startsWith('/home');
  const responsiveCollapsed = viewport !== 'desktop';
  const effectiveCollapsed = isChatRoute ? true : (responsiveCollapsed ? true : collapsed);
  const mainMarginLeft = viewport === 'mobile' ? 0 : effectiveCollapsed ? 72 : 236;
  const mainPaddingTop = showTopNav ? 56 : 0;
  const mainPaddingBottom = viewport === 'mobile' ? 84 : 0;

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

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setViewport('mobile');
      else if (window.innerWidth < 1024) setViewport('tablet');
      else setViewport('desktop');
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppNavigation
        activePath={activePath}
        collapsed={effectiveCollapsed}
        user={user}
        viewport={viewport}
        onToggleCollapse={() => {
          if (!isChatRoute && viewport === 'desktop') setCollapsed(c => !c);
        }}
      />

      <main
        style={{
          marginLeft: mainMarginLeft,
          paddingTop: mainPaddingTop,
          paddingBottom: mainPaddingBottom,
          minHeight: '100vh',
          transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {children}
      </main>
    </div>
  );
}