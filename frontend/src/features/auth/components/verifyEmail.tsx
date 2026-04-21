import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider'; 
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService'; 

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
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
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
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
            </div>
          </div>
        )}

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
            </button>
          </div>
        )}

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
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center auth-anim-5">
          <p className="text-xs" style={{ color: t3 }}>
            Need help?{' '}
            <a href="/support" className="font-semibold" style={{ color: link }}>
              Contact support →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}