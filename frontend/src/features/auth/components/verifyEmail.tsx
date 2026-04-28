<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider'; // Same path!
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService'; // Same path!
=======
import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider'; 
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService'; 
>>>>>>> main

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
<<<<<<< HEAD
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
=======
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      setIsChecking(false);
      return;
    }
    
    // Initial verification attempt
    verifyEmail(token);
    
    // Poll every 3 seconds for a max of 12 attempts (36 seconds)
    pollIntervalRef.current = setInterval(() => {
      setAttemptCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 12) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsChecking(false);
        } else {
          verifyEmail(token);
        }
        return newCount;
      });
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
>>>>>>> main
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
<<<<<<< HEAD
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
=======
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`);
      if (!res.ok) throw new Error('Verification failed');
      
      setStatus('success');
      setIsChecking(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    } catch (err: any) {
      // Don't set error yet - keep polling
      if (attemptCount >= 11) {
        setStatus('error');
        setError(err.message || 'Verification link expired or invalid');
        setIsChecking(false);
      }
    }
  };

  const handleManualCheck = async () => {
    if (!token) return;
    setIsChecking(true);
    setAttemptCount(0);
    await verifyEmail(token);
    setIsChecking(false);
  };

  const handleResend = async () => {
    if (!email) {
      const emailInput = prompt('Enter your email to resend verification:');
      if (!emailInput) return;
      setEmail(emailInput);
    }
    
    try {
      await authService.resendVerification(email);
      alert('Verification email sent! Check your inbox.');
    } catch {
      alert('Failed to send. Try again later.');
    }
  };

  const t1 = 'var(--text1)';
  const t2 = 'var(--text2)';
  const t3 = 'var(--text3)';
  const link = 'var(--link)';

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        background: theme === 'dark' ? 
          'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 
          'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
      }}
    >
      <div className="w-full max-w-md">
        {/* Header - Clean & Simple (GitHub Style) */}
        <div className="mb-10 auth-anim-1 text-center">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: t1 }}
          >
            Verify your email
          </h1>
          <p className="text-sm" style={{ color: t2 }}>
            We sent a confirmation link to your email. Click it to activate your account.
          </p>
        </div>

        {/* Status Card - Pending/Checking */}
        {status === 'pending' && (
          <div className="auth-anim-2 space-y-6 p-8 rounded-2xl border" 
               style={{ 
                 background: theme === 'dark' ? 'rgba(34,197,94,0.03)' : 'rgba(22,163,74,0.03)',
                 borderColor: 'var(--border)'
               }}>
            {/* Mail Icon with Animation */}
            <div className="flex justify-center">
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.1)',
                  border: '2px solid var(--border)',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <Mail size={28} style={{ color: link }} />
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p style={{ color: t1 }} className="font-semibold mb-1">
                {isChecking ? 'Waiting for confirmation...' : 'Link expired'}
              </p>
              <p style={{ color: t2 }} className="text-sm">
                {isChecking 
                  ? 'Once you confirm, you\'ll be automatically signed in.' 
                  : 'Your verification link has expired or we lost connection.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleManualCheck}
                disabled={!isChecking}
                className="auth-btn w-full flex items-center justify-center gap-2"
                style={{ 
                  background: link, 
                  color: '#fff',
                  opacity: isChecking ? 1 : 0.5,
                  cursor: isChecking ? 'pointer' : 'not-allowed'
                }}
              >
                <RefreshCw 
                  size={16} 
                  style={{ 
                    animation: isChecking ? 'spin 1s linear infinite' : 'none' 
                  }} 
                />
                {isChecking ? 'Checking...' : 'Try again'}
              </button>

              {!isChecking && (
                <button
                  onClick={handleResend}
                  className="w-full py-2.5 px-4 rounded-lg border font-medium text-sm transition-all"
                  style={{ 
                    borderColor: 'var(--border)',
                    color: link,
                    background: 'transparent'
                  }}
                >
                  Resend verification email
                </button>
              )}
            </div>

            {/* Helper Text */}
            <div style={{ color: t3 }} className="text-xs text-center">
              <p>Didn't receive the email? Check your spam folder.</p>
>>>>>>> main
            </div>
          </div>
        )}

<<<<<<< HEAD
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
=======
        {/* Status Card - Success */}
        {status === 'success' && (
          <div className="auth-anim-3 space-y-6 p-8 rounded-2xl border" 
               style={{ 
                 background: theme === 'dark' ? 'rgba(34,197,94,0.08)' : 'rgba(22,163,74,0.08)',
                 borderColor: 'rgba(34,197,94,0.2)'
               }}>
            {/* Success Icon */}
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: link + '25',
                  border: `2px solid ${link}`,
                  animation: 'checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <CheckCircle size={32} style={{ color: link }} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: t1 }}>
                Email verified!
              </h2>
              <p style={{ color: t2 }} className="text-sm">
                Your account is activated. Let's get you signed in.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/login')}
              className="auth-btn w-full"
              style={{ background: link, color: '#fff' }}
            >
              Continue to login
>>>>>>> main
            </button>
          </div>
        )}

<<<<<<< HEAD
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
=======
        {/* Status Card - Error */}
        {status === 'error' && (
          <div className="auth-anim-4 space-y-6 p-8 rounded-2xl border" 
               style={{ 
                 background: 'rgba(239,68,68,0.07)',
                 borderColor: 'rgba(239,68,68,0.2)'
               }}>
            {/* Error Icon */}
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '2px solid rgba(239,68,68,0.3)'
                }}
              >
                <XCircle size={32} style={{ color: '#ef4444' }} />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: t1 }}>
                Verification failed
              </h2>
              <p style={{ color: t2 }} className="text-sm mb-3">
                {error}
              </p>
              <p style={{ color: t3 }} className="text-xs">
                Links expire after 24 hours. Request a new one below.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleResend}
                className="auth-btn w-full"
                style={{ background: link, color: '#fff' }}
              >
                Resend verification email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-lg border font-medium text-sm"
                style={{ 
                  borderColor: 'var(--border)',
                  color: link,
                  background: 'transparent'
                }}
              >
                Back to login
>>>>>>> main
              </button>
            </div>
          </div>
        )}

<<<<<<< HEAD
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

=======
        {/* Footer */}
        <div className="mt-12 text-center auth-anim-5">
          <p className="text-xs" style={{ color: t3 }}>
            Need help?{' '}
            <a href="/support" className="font-semibold" style={{ color: link }}>
              Contact support →
            </a>
          </p>
        </div>
>>>>>>> main
      </div>
    </div>
  );
}