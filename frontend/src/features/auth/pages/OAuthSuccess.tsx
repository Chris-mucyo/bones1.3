import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userRaw      = params.get('user');

    if (!accessToken || !refreshToken || !userRaw) {
      navigate('/login?error=oauth_failed');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      authService.saveUser({ ...user, token: accessToken, refreshToken }, true);
      navigate(`/${user.role}/dashboard`);
    } catch {
      navigate('/login?error=oauth_failed');
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#080e09' }}
    >
      {/* Spinning ring */}
      <div
        className="w-12 h-12 rounded-full border-2 border-green-500"
        style={{ borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#f0faf2' }}>
          Shop<span style={{ color: '#22c55e' }}>Hub</span>
        </span>
      </div>

      <p className="text-green-500 text-sm font-medium tracking-wide">
        Signing you in...
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
