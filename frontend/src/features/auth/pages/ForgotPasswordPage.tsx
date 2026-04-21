import { useState } from 'react';
import { Sun, Moon, ArrowLeft, Mail, Eye, EyeOff, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider';

type View = 'request' | 'sent' | 'reset';

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    { label: 'Enter a password', color: 'transparent', width: '0%'   },
    { label: 'Weak',             color: '#ef4444',     width: '25%'  },
    { label: 'Fair',             color: '#f97316',     width: '50%'  },
    { label: 'Good',             color: '#eab308',     width: '75%'  },
    { label: 'Strong 💪',        color: '#22c55e',     width: '100%' },
  ][s];
}

export default function ForgotPasswordPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const [view,         setView]         = useState<View>('request');
  const [email,        setEmail]        = useState('');
  const [emailErr,     setEmailErr]     = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [pwdErr,       setPwdErr]       = useState('');
  const [confirmErr,   setConfirmErr]   = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [serverErr,    setServerErr]    = useState('');
  const [success,      setSuccess]      = useState(false);
  const [countdown,    setCountdown]    = useState(0);

  const strength = pwStrength(newPwd);

  /* ── Tokens ── */
  const t = {
    pageBg:        isDark ? '#080e09'                 : '#f0faf2',
    leftBg:        isDark ? 'linear-gradient(160deg,#071209 0%,#0a1a0d 50%,#060e08 100%)'
                          : 'linear-gradient(160deg,#dcfce7 0%,#bbf7d0 50%,#d1fae5 100%)',
    gridLine:      isDark ? 'rgba(34,197,94,0.04)'    : 'rgba(34,197,94,0.12)',
    orb1:          isDark ? 'rgba(34,197,94,0.08)'    : 'rgba(34,197,94,0.18)',
    orb2:          isDark ? 'rgba(34,197,94,0.06)'    : 'rgba(34,197,94,0.14)',
    headline:      isDark ? '#f0faf2'                 : '#052e16',
    subtext:       isDark ? 'rgba(240,250,242,0.5)'   : 'rgba(5,46,22,0.55)',
    rightBg:       isDark ? '#0d1410'                 : '#ffffff',
    rightBorder:   isDark ? 'rgba(34,197,94,0.1)'     : 'rgba(34,197,94,0.2)',
    logoText:      isDark ? '#f0faf2'                 : '#052e16',
    toggleBg:      isDark ? 'rgba(34,197,94,0.08)'    : 'rgba(34,197,94,0.12)',
    toggleBorder:  isDark ? 'rgba(34,197,94,0.2)'     : 'rgba(34,197,94,0.35)',
    toggleColor:   isDark ? '#86efac'                 : '#16a34a',
    text:          isDark ? '#f0faf2'                 : '#052e16',
    textSub:       isDark ? 'rgba(240,250,242,0.45)'  : 'rgba(5,46,22,0.55)',
    fieldBg:       isDark ? 'rgba(34,197,94,0.05)'    : '#fff',
    fieldBorder:   isDark ? 'rgba(34,197,94,0.25)'    : 'rgba(34,197,94,0.4)',
    labelColor:    isDark ? 'rgba(34,197,94,0.55)'    : 'rgba(21,128,61,0.9)',
    progressBg:    isDark ? 'rgba(34,197,94,0.1)'     : 'rgba(34,197,94,0.15)',
    eyeBtn:        isDark ? 'rgba(240,250,242,0.2)'   : 'rgba(5,46,22,0.3)',
    hintText:      isDark ? 'rgba(240,250,242,0.45)'  : 'rgba(5,46,22,0.5)',
    cardBg:        isDark ? 'rgba(34,197,94,0.04)'    : 'rgba(34,197,94,0.06)',
    cardBorder:    isDark ? 'rgba(34,197,94,0.15)'    : 'rgba(34,197,94,0.25)',
    sentIconBg:    isDark ? 'rgba(34,197,94,0.08)'    : 'rgba(34,197,94,0.1)',
    resendDim:     isDark ? 'rgba(240,250,242,0.25)'  : 'rgba(5,46,22,0.3)',
    errBg:         isDark ? 'rgba(239,68,68,0.08)'    : 'rgba(239,68,68,0.06)',
    errBorder:     isDark ? 'rgba(239,68,68,0.25)'    : 'rgba(239,68,68,0.3)',
    reqDot:        isDark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)',
    badgeBorder:   isDark ? 'rgba(34,197,94,0.25)'    : 'rgba(34,197,94,0.4)',
    badgeBg:       isDark ? 'rgba(34,197,94,0.07)'    : 'rgba(34,197,94,0.12)',
    ringOuter:     isDark ? 'rgba(34,197,94,0.06)'    : 'rgba(34,197,94,0.1)',
    ringBorder:    isDark ? 'rgba(34,197,94,0.15)'    : 'rgba(34,197,94,0.25)',
    ringMid:       isDark ? 'rgba(34,197,94,0.08)'    : 'rgba(34,197,94,0.14)',
    ringMidBorder: isDark ? 'rgba(34,197,94,0.2)'     : 'rgba(34,197,94,0.3)',
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-[9px] border text-[13px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder:opacity-40';
  const iStyle   = { background: t.fieldBg, borderColor: t.fieldBorder, color: t.text };
  const iErrStyle= { background: t.fieldBg, borderColor: '#ef4444',     color: t.text };
  const labelCls = 'block text-[10px] font-bold tracking-[1.5px] uppercase mb-1.5';
  const errCls   = 'text-[11px] text-red-400 mt-1 min-h-[14px]';

  function startCountdown() {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
  }

  async function handleRequest() {
    setEmailErr(''); setServerErr('');
    if (!email.trim())                              { setEmailErr('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('Enter a valid email'); return; }
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setView('sent');
      startCountdown();
    } catch { setServerErr('Something went wrong. Please try again.'); }
    finally  { setLoading(false); }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      startCountdown();
    } catch { setServerErr('Failed to resend. Try again.'); }
    finally  { setLoading(false); }
  }

  async function handleReset() {
    setPwdErr(''); setConfirmErr(''); setServerErr('');
    let ok = true;
    if (!newPwd || newPwd.length < 8) { setPwdErr('At least 8 characters required'); ok = false; }
    if (newPwd !== confirmPwd)         { setConfirmErr('Passwords do not match'); ok = false; }
    if (!ok) return;
    setLoading(true);
    try {
      const token = new URLSearchParams(window.location.search).get('token');
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: newPwd }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.errors?.[0] ?? d.message ?? 'Reset failed');
      }
      setSuccess(true);
    } catch (err: unknown) { setServerErr(err instanceof Error ? err.message : 'Reset failed.'); }
    finally { setLoading(false); }
  }

  const leftMeta = {
    request: { emoji: '🔐', title: 'Forgot your\npassword?', sub: "No worries — it happens.\nWe'll send a reset link instantly." },
    sent:    { emoji: '📬', title: 'Check your\ninbox',      sub: 'The link is on its way.\nUsually arrives within a minute.'    },
    reset:   { emoji: '🛡️', title: 'Create a new\npassword', sub: 'Make it strong and unique\nto keep your account safe.'        },
  }[view];

  const Logo = () => (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[9px] bg-green-500 flex items-center justify-center flex-shrink-0">
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: t.logoText }}>
        Shop<span style={{ color: '#22c55e' }}>Hub</span>
      </span>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ background: t.pageBg }} data-theme={theme}>

      {/* ══════ LEFT ══════ */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-[0_0_52%] relative overflow-hidden transition-all duration-300"
        style={{ background: t.leftBg }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute top-[-80px] right-[-60px] w-[320px] h-[320px] rounded-full blur-[70px] pointer-events-none"
          style={{ background: t.orb1, animation: 'orb 9s ease-in-out infinite' }} />
        <div className="absolute bottom-[-60px] left-[-50px] w-[260px] h-[260px] rounded-full blur-[70px] pointer-events-none"
          style={{ background: t.orb2, animation: 'orb 7s ease-in-out infinite reverse' }} />

        <div className="relative z-10 flex flex-col items-center px-12 text-center"
          style={{ animation: 'leftSlide 0.7s cubic-bezier(.22,1,.36,1) both' }}>

          {/* Concentric ring illustration */}
          <div className="relative mb-8">
            <div className="w-44 h-44 rounded-full flex items-center justify-center"
              style={{ background: t.ringOuter, border: `2px solid ${t.ringBorder}` }}>
              <div className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{ background: t.ringMid, border: `2px solid ${t.ringMidBorder}` }}>
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30"
                  style={{ animation: 'bob 3s ease-in-out infinite' }}>
                  <span className="text-4xl" style={{ animation: 'bob 3s ease-in-out infinite reverse' }}>
                    {leftMeta.emoji}
                  </span>
                </div>
              </div>
            </div>
            {/* Orbiting dots */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#22c55e' : (isDark ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.55)'),
                  top:  `${50 - 50 * Math.cos(deg * Math.PI / 180)}%`,
                  left: `${50 + 50 * Math.sin(deg * Math.PI / 180)}%`,
                  transform: 'translate(-50%,-50%)',
                  animation: `blink ${1.2 + i * 0.25}s ease-in-out infinite`,
                  animationDelay: `${i * 0.18}s`,
                }} />
            ))}
          </div>

          <h2 className="font-bold leading-tight mb-3 whitespace-pre-line transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,2.4vw,30px)', color: t.headline }}>
            {leftMeta.title}
          </h2>
          <p className="text-[13px] leading-relaxed whitespace-pre-line max-w-[260px] transition-colors duration-300"
            style={{ color: t.subtext }}>
            {leftMeta.sub}
          </p>

          {/* Security badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: '🔒', label: 'Encrypted link' },
              { icon: '⏱️', label: 'Expires in 1hr'  },
              { icon: '✉️', label: 'One-time use'    },
            ].map((b, i) => (
              <div key={b.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-green-500"
                style={{
                  border: `1px solid ${t.badgeBorder}`,
                  background: t.badgeBg,
                  animation: `appear 0.5s cubic-bezier(.22,1,.36,1) both`,
                  animationDelay: `${0.1 + i * 0.12}s`,
                }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ RIGHT ══════ */}
      <div className="flex flex-col items-center justify-center flex-1 lg:flex-[0_0_48%] overflow-y-auto relative px-6 py-8 transition-colors duration-300"
        style={{ background: t.rightBg, borderLeft: `1px solid ${t.rightBorder}` }}>

        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,#22c55e,transparent)', opacity: isDark ? 0.4 : 0.7 }} />

        {/* Top bar */}
        <div className="flex items-center justify-between w-full max-w-[400px] mb-8"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(.22,1,.36,1) both' }}>
          <Logo />
          <button onClick={toggle}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: t.toggleBg, borderColor: t.toggleBorder, color: t.toggleColor }}>
            {isDark
              ? <><Sun size={14} /><span className="text-[11px] font-semibold hidden sm:inline">Light</span></>
              : <><Moon size={14} /><span className="text-[11px] font-semibold hidden sm:inline">Dark</span></>
            }
          </button>
        </div>

        {/* ── VIEW 1: Request ── */}
        {view === 'request' && (
          <div className="w-full max-w-[400px] animate-[slideInF_0.4s_cubic-bezier(.22,1,.36,1)_both]">
            <a href="/login" className="inline-flex items-center gap-1.5 text-[11px] font-semibold mb-6 transition-colors hover:text-green-400"
              style={{ color: t.hintText }}>
              <ArrowLeft size={12} strokeWidth={2.5} /> Back to sign in
            </a>

            <div className="mb-6">
              <div className="w-11 h-11 rounded-xl border flex items-center justify-center mb-3"
                style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}>
                <Mail size={20} className="text-green-500" />
              </div>
              <h1 className="text-[22px] font-bold leading-tight mb-1.5"
                style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                Reset your password
              </h1>
              <p className="text-[12px] leading-relaxed" style={{ color: t.textSub }}>
                Enter the email linked to your account and we'll send you a secure reset link.
              </p>
            </div>

            <div className="mb-4">
              <label className={labelCls} style={{ color: t.labelColor }}>Email Address</label>
              <input className={inputCls} style={emailErr ? iErrStyle : iStyle}
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRequest()} />
              <p className={errCls}>{emailErr}</p>
            </div>

            {serverErr && (
              <div className="mb-4 px-3 py-2.5 rounded-lg text-red-400 text-[12px]"
                style={{ background: t.errBg, border: `1px solid ${t.errBorder}` }}>
                {serverErr}
              </div>
            )}

            <button onClick={handleRequest} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[9px] bg-green-500 text-black text-[13px] font-bold hover:bg-green-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                : <><Mail size={14} /> Send Reset Link</>
              }
            </button>

            <p className="text-center text-[11px] mt-4" style={{ color: t.hintText }}>
              Remembered it?{' '}
              <a href="/login" className="text-green-400 font-semibold hover:underline">Sign in →</a>
            </p>
          </div>
        )}

        {/* ── VIEW 2: Email sent ── */}
        {view === 'sent' && (
          <div className="w-full max-w-[400px] animate-[slideInF_0.4s_cubic-bezier(.22,1,.36,1)_both]">
            <div className="flex flex-col items-center mb-7 pt-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: t.sentIconBg, border: `2px solid ${t.ringMidBorder}`, animation: 'bob 3s ease-in-out infinite' }}>
                <span className="text-4xl">📬</span>
              </div>
              <h1 className="text-[22px] font-bold text-center mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                Check your inbox
              </h1>
              <p className="text-[12px] text-center leading-relaxed" style={{ color: t.textSub }}>
                We sent a reset link to
              </p>
              <div className="mt-2 px-4 py-1.5 rounded-full border"
                style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <span className="text-[12px] font-semibold text-green-400">{email}</span>
              </div>
            </div>

            {/* Steps */}
            <div className="rounded-xl px-4 py-4 mb-5 space-y-3"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
              {[
                'Open the email from ShopHub',
                'Click the "Reset Password" button',
                'Create your new password',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-green-400"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    {i + 1}
                  </span>
                  <span className="text-[12px]" style={{ color: t.textSub }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Resend */}
            <div className="text-center mb-5">
              <p className="text-[11px] mb-2" style={{ color: t.textSub }}>
                Didn't receive it? Check your spam or
              </p>
              <button onClick={handleResend} disabled={countdown > 0 || loading}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-all hover:text-green-400 disabled:cursor-not-allowed"
                style={{ color: countdown > 0 ? t.resendDim : '#22c55e' }}>
                <RotateCcw size={12} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend email'}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setView('request'); setEmail(''); setCountdown(0); }}
                className="w-full py-2.5 rounded-[9px] border text-[12px] font-semibold transition-all hover:border-green-500 hover:text-green-400"
                style={{ borderColor: t.fieldBorder, color: t.hintText }}>
                Use a different email
              </button>
              <a href="/login" className="text-center text-[11px] transition-colors hover:text-green-400"
                style={{ color: t.hintText }}>
                Back to sign in
              </a>
            </div>
          </div>
        )}

        {/* ── VIEW 3: New password ── */}
        {view === 'reset' && (
          <div className="w-full max-w-[400px] animate-[slideInF_0.4s_cubic-bezier(.22,1,.36,1)_both]">
            {!success ? (
              <>
                <div className="mb-6">
                  <div className="w-11 h-11 rounded-xl border flex items-center justify-center mb-3"
                    style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}>
                    <ShieldCheck size={20} className="text-green-500" />
                  </div>
                  <h1 className="text-[22px] font-bold leading-tight mb-1.5"
                    style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                    Create new password
                  </h1>
                  <p className="text-[12px] leading-relaxed" style={{ color: t.textSub }}>
                    Your new password must be different from your previous one.
                  </p>
                </div>

                {/* New password */}
                <div className="mb-3">
                  <label className={labelCls} style={{ color: t.labelColor }}>New Password</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} style={pwdErr ? iErrStyle : iStyle}
                      type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                      value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-green-400"
                      style={{ color: t.eyeBtn }}>
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="h-[3px] rounded-full mt-2 mb-1 overflow-hidden" style={{ background: t.progressBg }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <p className="text-[10px]" style={{ color: strength.color === 'transparent' ? t.textSub : strength.color }}>
                    {strength.label}
                  </p>
                  <p className={errCls}>{pwdErr}</p>
                </div>

                {/* Confirm */}
                <div className="mb-4">
                  <label className={labelCls} style={{ color: t.labelColor }}>Confirm New Password</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} style={confirmErr ? iErrStyle : iStyle}
                      type={showConfirm ? 'text' : 'password'} placeholder="Repeat your new password"
                      value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-green-400"
                      style={{ color: t.eyeBtn }}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {confirmPwd && (
                      <div className="absolute right-9 top-1/2 -translate-y-1/2">
                        {confirmPwd === newPwd
                          ? <Check size={13} className="text-green-400" />
                          : <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                        }
                      </div>
                    )}
                  </div>
                  <p className={errCls}>{confirmErr}</p>
                </div>

                {/* Requirements checklist */}
                <div className="rounded-xl px-4 py-3 mb-5 grid grid-cols-2 gap-y-2"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                  {[
                    { label: '8+ characters',   ok: newPwd.length >= 8           },
                    { label: 'Uppercase letter', ok: /[A-Z]/.test(newPwd)         },
                    { label: 'Number',           ok: /[0-9]/.test(newPwd)         },
                    { label: 'Special char',     ok: /[^A-Za-z0-9]/.test(newPwd)  },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{ background: r.ok ? '#22c55e' : t.reqDot }}>
                        {r.ok && <Check size={9} strokeWidth={3} color="#000" />}
                      </span>
                      <span className="text-[10px] transition-colors duration-200"
                        style={{ color: r.ok ? '#22c55e' : t.textSub }}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>

                {serverErr && (
                  <div className="mb-4 px-3 py-2.5 rounded-lg text-red-400 text-[12px]"
                    style={{ background: t.errBg, border: `1px solid ${t.errBorder}` }}>
                    {serverErr}
                  </div>
                )}

                <button onClick={handleReset} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[9px] bg-green-500 text-black text-[13px] font-bold hover:bg-green-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                    : <><ShieldCheck size={14} /> Set New Password</>
                  }
                </button>
              </>
            ) : (
              /* Success */
              <div className="flex flex-col items-center text-center animate-[slideInF_0.4s_cubic-bezier(.22,1,.36,1)_both]">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-5 shadow-lg shadow-green-500/30"
                  style={{ animation: 'checkPop 0.5s cubic-bezier(.22,1,.36,1) both' }}>
                  <Check size={36} strokeWidth={2.5} color="#fff" />
                </div>
                <h1 className="text-[24px] font-bold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: t.text }}>
                  Password updated!
                </h1>
                <p className="text-[12px] leading-relaxed max-w-[260px] mb-7" style={{ color: t.textSub }}>
                  Your password has been changed successfully. You can now sign in with your new password.
                </p>
                <a href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[9px] bg-green-500 text-black text-[13px] font-bold hover:bg-green-400 transition-all hover:-translate-y-0.5">
                  Go to Sign In →
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
