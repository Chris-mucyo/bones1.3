import { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../shared/components/ThemeProvider';
import type { LoginCredentials } from '../types/auth.types';
import { validators } from '../../../shared/utils/validators';
import { authService } from '../services/authService';

interface Props {
  onSubmit: (data: LoginCredentials) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function LoginForm({ onSubmit, loading, error }: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [showPassword, setShowPassword] = useState(false);

  const t1 = theme === 'dark' ? '#f0faf2' : '#0c1f0e';
  const t2 = theme === 'dark' ? 'rgba(240,250,242,0.5)' : 'rgba(12,31,14,0.55)';
  const t3 = theme === 'dark' ? 'rgba(240,250,242,0.25)' : 'rgba(12,31,14,0.3)';
  const labelColor = theme === 'dark' ? 'rgba(34,197,94,0.45)' : 'rgba(22,163,74,0.6)';
  const divider = theme === 'dark' ? 'rgba(34,197,94,0.1)' : 'rgba(22,163,74,0.12)';
  const link = theme === 'dark' ? '#22c55e' : '#16a34a';
  

  function validate() {
    const e = { email: validators.email(form.email), password: validators.password(form.password) };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  return (
    <div className="w-full max-w-[390px]">

      {/* Header */}
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
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: t2 }}>
          Sign in to continue your commerce experience
        </p>
      </div>

      {/* Google Button — full width */}
      <div className="auth-anim-2 mb-5">
        <button
          type="button"
          onClick={() => authService.loginWithGoogle()}
          className="w-full flex items-center justify-center gap-3 rounded-xl border py-3.5 font-semibold text-sm transition-all duration-200"
          style={{
            background: theme === 'dark' ? '#000000' : '#ffffff',
            borderColor: theme === 'dark' ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.12)',
            color: t1,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#22c55e';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = theme === 'dark' ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.12)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 auth-anim-2 mb-5">
        <div className="flex-1 h-px" style={{ background: divider }} />
        <span className="text-[10px] font-medium tracking-[1.5px] uppercase" style={{ color: t3 }}>or sign in with email</span>
        <div className="flex-1 h-px" style={{ background: divider }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Email */}
        <div className="auth-anim-3">
          <label className="block text-[10px] font-semibold tracking-[1.4px] uppercase mb-1.5" style={{ color: labelColor }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`auth-field${errors.email ? ' !border-red-500' : ''}`}
            
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="auth-anim-3">
          <label className="block text-[10px] font-semibold tracking-[1.4px] uppercase mb-1.5" style={{ color: labelColor }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`auth-field${errors.password ? ' !border-red-500' : ''}`}
              style={{ paddingRight: 44 }}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: t3 }}
            >
{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between auth-anim-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="auth-chk"
              checked={form.rememberMe}
              onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
            />
            <span className="auth-chk-box" />
            <span className="text-xs" style={{ color: t2 }}>Remember me</span>
          </label>
          <a href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: link }}>
            Forgot password?
          </a>
        </div>

        {/* Server error */}
        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm border"
            style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        {/* Submit — full width */}
        <div className="auth-anim-4">
          <button
            type="submit"
            className="auth-btn w-full py-3.5"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                Sign In
<ArrowRight size={15} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

      </form>

      {/* Footer */}
      <p className="text-center text-xs mt-8 auth-anim-5" style={{ color: t2 }}>
        Don't have an account?{' '}
        <a href="/register" className="font-semibold" style={{ color: link }}>
          Create one free →
        </a>
      </p>

      {/* Role hints */}
      <div className="mt-5 flex items-center justify-center gap-3 flex-wrap auth-anim-5">
        <span className="text-[10px] tracking-wider uppercase" style={{ color: t3 }}>Join as</span>
        {['🛍️ Buyer', '🏪 Seller', '🏭 Wholesale'].map(r => (
          <span key={r} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border text-green-500" style={{ borderColor: 'var(--border)' }}>
            {r}
          </span>
        ))}
      </div>

    </div>
  );
}
