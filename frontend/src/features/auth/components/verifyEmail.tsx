import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () =>
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [status, setStatus] = useState<'input' | 'success' | 'error'>('input');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [showEmailInput, setShowEmailInput] = useState(!searchParams.get('email'));

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t1 = 'var(--text1)';
  const t2 = 'var(--text2)';
  const t3 = 'var(--text3)';
  const link = '#22c55e';

  // Start cooldown timer after resend
  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // Auto-send verification on mount if email is known
  useEffect(() => {
    if (email && !showEmailInput) {
      handleSendCode();
    }
  }, []);

  const handleSendCode = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to send code');
      }
      setShowEmailInput(false);
      setCode(Array(6).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      startCooldown();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(
        `${API_URL}/api/v1/auth/verify-email?token=${otp}&email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Invalid or expired code');
      }
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (digit && index === 5 && next.every(d => d !== '')) {
      setTimeout(() => handleVerifyWithCode(next), 80);
    }
  };

  const handleVerifyWithCode = async (digits: string[]) => {
    const otp = digits.join('');
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(
        `${API_URL}/api/v1/auth/verify-email?token=${otp}&email=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Invalid or expired code');
      }
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
      setCode(Array(6).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 50);
    if (pasted.length === 6) {
      setTimeout(() => handleVerifyWithCode(next), 120);
    }
  };

  const filled = code.filter(d => d !== '').length;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0a1a0f 0%, #0f1f14 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      }}
    >
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center auth-anim-1">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.1)',
              border: '1.5px solid rgba(34,197,94,0.25)',
            }}
          >
            <Mail size={26} style={{ color: link }} />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: t1 }}
          >
            Verify your email
          </h1>
          <p className="text-sm" style={{ color: t2 }}>
            {showEmailInput
              ? 'Enter your email address to receive a verification code.'
              : <>We sent a 6-digit code to <strong>{email || 'your email'}</strong>.</>}
          </p>
          {!showEmailInput && email && (
            <p className="text-sm font-semibold mt-1" style={{ color: link }}>{email}</p>
          )}
        </div>

        {/* ── Email input step ── */}
        {showEmailInput && status !== 'success' && (
          <div
            className="auth-anim-2 p-8 rounded-2xl border space-y-5"
            style={{
              background: isDark ? 'rgba(34,197,94,0.03)' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: t1 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                placeholder="you@example.com"
                className="w-full h-11 rounded-xl border px-4 text-sm outline-none transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                  color: t1,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = link)}
                onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)')}
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <XCircle size={12} /> {error}
              </p>
            )}
            <button
              onClick={handleSendCode}
              disabled={resending || !email}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: email ? link : isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
                color: email ? '#000' : isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
                cursor: email && !resending ? 'pointer' : 'not-allowed',
              }}
            >
              {resending ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={15} />}
              {resending ? 'Sending...' : 'Send verification code'}
            </button>
          </div>
        )}

        {/* ── OTP input step ── */}
        {!showEmailInput && status === 'input' && (
          <div
            className="auth-anim-2 p-8 rounded-2xl border space-y-6"
            style={{
              background: isDark ? 'rgba(34,197,94,0.03)' : '#fff',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
            }}
          >
            {/* OTP boxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: t3 }}>
                Enter 6-digit code
              </label>
              <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="text-center font-bold text-xl rounded-xl outline-none transition-all"
                    style={{
                      width: 48,
                      height: 56,
                      background: isDark
                        ? digit ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)'
                        : digit ? 'rgba(34,197,94,0.08)' : '#f9fafb',
                      border: `2px solid ${digit
                          ? 'rgba(34,197,94,0.5)'
                          : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
                        }`,
                      color: t1,
                      caretColor: link,
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = link)}
                    onBlur={e => (e.currentTarget.style.borderColor = digit
                      ? 'rgba(34,197,94,0.5)'
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)')}
                  />
                ))}
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {code.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: d ? 8 : 5,
                      height: 5,
                      background: d ? link : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                <XCircle size={13} /> {error}
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={submitting || filled < 6}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: filled === 6 ? link : isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
                color: filled === 6 ? '#000' : isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af',
                cursor: filled === 6 && !submitting ? 'pointer' : 'not-allowed',
              }}
            >
              {submitting
                ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <CheckCircle size={15} />}
              {submitting ? 'Verifying...' : 'Verify email'}
            </button>

            {/* Resend row */}
            <div className="flex items-center justify-between text-xs" style={{ color: t3 }}>
              <span>Didn't receive it? Check spam.</span>
              <button
                onClick={handleSendCode}
                disabled={resending || resendCooldown > 0}
                className="font-semibold transition-all flex items-center gap-1"
                style={{
                  color: resendCooldown > 0 ? t3 : link,
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                }}
              >
                {resending
                  ? <><RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'}
              </button>
            </div>

            {/* Change email */}
            <div className="text-center">
              <button
                onClick={() => { setShowEmailInput(true); setCode(Array(6).fill('')); setError(''); }}
                className="text-xs font-medium transition-colors"
                style={{ color: t3 }}
                onMouseEnter={e => (e.currentTarget.style.color = link)}
                onMouseLeave={e => (e.currentTarget.style.color = t3)}
              >
                Wrong email? Change it →
              </button>
            </div>
          </div>
        )}

        {/* ── Success state ── */}
        {status === 'success' && (
          <div
            className="auth-anim-3 p-8 rounded-2xl border space-y-6"
            style={{
              background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
              borderColor: 'rgba(34,197,94,0.25)',
            }}
          >
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  border: `2px solid ${link}`,
                  animation: 'checkPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',
                }}
              >
                <CheckCircle size={32} style={{ color: link }} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: t1 }}>Email verified!</h2>
              <p className="text-sm" style={{ color: t2 }}>Your account is activated. Let's get you signed in.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl font-bold text-sm transition-all"
              style={{ background: link, color: '#000' }}
            >
              Continue to login
            </button>
          </div>
        )}

        {/* ── Error state ── */}
        {status === 'error' && (
          <div
            className="auth-anim-4 p-8 rounded-2xl border space-y-6"
            style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <div className="flex justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }}
              >
                <XCircle size={32} style={{ color: '#ef4444' }} />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: t1 }}>Verification failed</h2>
              <p className="text-sm mb-2" style={{ color: t2 }}>{error}</p>
              <p className="text-xs" style={{ color: t3 }}>Codes expire after 10 minutes. Request a new one below.</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setStatus('input'); setCode(Array(6).fill('')); setError(''); handleSendCode(); }}
                className="w-full h-11 rounded-xl font-bold text-sm transition-all"
                style={{ background: link, color: '#000' }}
              >
                Send a new code
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full h-11 rounded-xl border font-semibold text-sm transition-all"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: t2, background: 'transparent' }}
              >
                Back to login
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center auth-anim-5">
          <p className="text-xs" style={{ color: t3 }}>
            Need help?{' '}
            <a href="/support" className="font-semibold" style={{ color: link }}>Contact support →</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes checkPop { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}