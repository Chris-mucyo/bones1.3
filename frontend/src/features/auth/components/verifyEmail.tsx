import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider'; // Same path!
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService'; // Same path!

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  // === SAME COLORS AS LOGIN FORM ===
  const t1 = theme === 'dark' ? '#f0faf2' : '#0c1f0e';
  const t2 = theme === 'dark' ? 'rgba(240,250,242,0.5)' : 'rgba(12,31,14,0.55)';
  const t3 = theme === 'dark' ? 'rgba(240,250,242,0.25)' : 'rgba(12,31,14,0.3)';
  const divider = theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.12)';
  const link = theme === 'dark' ? '#22c55e' : '#16a34a';

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token found');
      return;
    }
    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('loading');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
      if (!res.ok) throw new Error('Verification failed');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Verification failed');
    }
  };

  const resendVerification = async () => {
    const email = prompt('Enter your email to resend verification:');
    if (!email) return;
    
    try {
      await authService.resendVerification(email);
      alert('Verification email sent!');
    } catch {
      alert('Failed to send. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: theme === 'dark' ? 
        'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 
        'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    }}>
      <div className="w-full max-w-[390px]"> {/* Same width! */}

        {/* Header - EXACT LOGIN STYLE */}
        <div className="mb-8 auth-anim-1">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 text-[10px] font-semibold tracking-widest uppercase"
            style={{ borderColor: 'var(--border)', color: link + 'aa' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Commerce Network
          </div>
          <h1
            className="text-3xl font-bold leading-tight mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: t1 }}
          >
            Verify Email
          </h1>
          <p className="text-sm" style={{ color: t2 }}>
            Confirm your email address to continue
          </p>
        </div>

        {/* Status Content */}
        {status === 'loading' && (
          <div className="auth-anim-2 text-center space-y-4 p-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-500/20 border-2 border-blue-200/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: t1 }}>Verifying your email...</p>
              <p className="text-sm" style={{ color: t3 }}>Please wait a moment</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="auth-anim-3 text-center space-y-6 p-8 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-2xl border-2" 
               style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}>
            <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100/80 dark:bg-green-900/30 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle size={32} style={{ color: link }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: t1 }}>
                Email Verified!
              </h2>
              <p className="text-sm" style={{ color: t2 }}>
                Your account is now active. Sign in to continue.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="auth-btn w-full py-3.5" // Same button class!
              style={{ background: link, color: '#fff' }}
            >
              Go to Sign In
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="auth-anim-4 space-y-4 p-6 rounded-2xl border" 
               style={{ 
                 background: 'rgba(239,68,68,0.07)', 
                 borderColor: 'rgba(239,68,68,0.2)', 
                 color: '#f87171' 
               }}>
            <div className="text-center mb-4">
              <XCircle size={48} style={{ color: '#f87171' }} />
              <h2 className="text-xl font-bold mt-2" style={{ color: t1 }}>
                Verification Failed
              </h2>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={resendVerification}
                className="w-full auth-btn py-3"
                style={{ 
                  background: 'rgba(239,68,68,0.1)', 
                  color: '#dc2626', 
                  border: '1px solid rgba(239,68,68,0.3)' 
                }}
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl border font-semibold text-sm"
                style={{ 
                  borderColor: divider, 
                  color: link,
                  background: theme === 'dark' ? '#000' : '#fff' 
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Footer - SAME AS LOGIN */}
        <div className="mt-12 text-center">
          <p className="text-xs mb-6 auth-anim-5" style={{ color: t2 }}>
            Don't have an account?{' '}
            <a href="/register" className="font-semibold" style={{ color: link }}>
              Create one →
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap auth-anim-5">
            <span className="text-[10px] tracking-wider uppercase" style={{ color: t3 }}>
              Join as
            </span>
            {['🛍️ Buyer', '🏪 Seller', '🏭 Wholesale'].map(r => (
              <span key={r} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border text-green-500" 
                    style={{ borderColor: 'var(--border)' }}>
                {r}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}