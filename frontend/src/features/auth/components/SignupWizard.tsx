import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, ArrowLeft, ArrowRight,
  LayoutDashboard, Check, Search, Camera,
} from 'lucide-react';
import { useSignup } from '../hooks/useSignup';
import type { UserRole } from '../types/signup.types';
import { WIZARD_STEPS, CATEGORY_DATA } from '../types/signup.types';
import { authService } from '../services/authService';

type Dir = 'forward' | 'back';

const ROLE_OPTIONS: { id: UserRole; icon: string; name: string; desc: string }[] = [
  { id: 'buyer',      icon: '🛍️', name: 'Buy Products',  desc: 'Discover & shop from verified sellers' },
  { id: 'seller',     icon: '🏪', name: 'Sell Products', desc: 'List products to thousands of buyers'  },
  { id: 'wholesaler', icon: '🏭', name: 'Wholesale',     desc: 'Supply bulk to sellers & businesses'   },
];

const STEP_META: Record<number, { eyebrow: string; title: string; sub: string }> = {
  1: { eyebrow: 'Step 1 of 5', title: 'Create your account',               sub: 'Join thousands on ShopHub marketplace.'                   },
  2: { eyebrow: 'Step 2 of 5', title: "Let's personalise your experience", sub: 'This helps us tailor the platform just for you.'           },
  3: { eyebrow: 'Step 3 of 5', title: 'Set up your profile',               sub: 'Tell buyers or sellers more about you.'                   },
  4: { eyebrow: 'Step 4 of 5', title: 'Add a profile photo',               sub: 'A clear photo helps people recognise you. Optional.'      },
  5: { eyebrow: 'Step 5 of 5', title: 'Review & submit',                   sub: 'Everything look good? Hit submit to create your account.' },
};

interface Props { isDark?: boolean; }

export default function SignupWizard({ isDark = true }: Props) {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const {
    form, errors, loading, serverError,
    update, validate, submit,
    passwordStrength, toggleList, handleProfileImage,
  } = useSignup();

  const [step,        setStep]        = useState(1);
  const [direction,   setDirection]   = useState<Dir>('forward');
  const [animKey,     setAnimKey]     = useState(0);
  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [catSearch,   setCatSearch]   = useState('');

  const total    = WIZARD_STEPS.length;
  const strength = passwordStrength(form.password);
  const meta     = STEP_META[step];

  const filteredCats = CATEGORY_DATA.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  const goTo = useCallback((next: number, dir: Dir) => {
    setDirection(dir);
    setAnimKey(k => k + 1);
    setStep(next);
  }, []);

  async function handleNext() {
    if (!validate(step)) return;
    if (step === total) {
      const ok = await submit();
      if (!ok) return;
      navigate(`/${form.role}/dashboard`);
      return;
    }
    goTo(step + 1, 'forward');
  }

  function handleBack() {
    if (step > 1) goTo(step - 1, 'back');
  }

  const panelAnim = direction === 'forward'
    ? 'animate-[slideInF_0.4s_cubic-bezier(.22,1,.36,1)_both]'
    : 'animate-[slideInB_0.4s_cubic-bezier(.22,1,.36,1)_both]';

  /* ─── Theme tokens ─── */
  const tk = {
    text:             isDark ? '#f0faf2'                 : '#052e16',
    textSub:          isDark ? 'rgba(240,250,242,0.45)'  : 'rgba(5,46,22,0.55)',
    fieldBg:          isDark ? 'rgba(34,197,94,0.05)'    : '#fff',
    fieldBorder:      isDark ? 'rgba(34,197,94,0.25)'    : 'rgba(34,197,94,0.4)',
    labelColor:       isDark ? 'rgba(34,197,94,0.55)'    : 'rgba(21,128,61,0.9)',
    progressBg:       isDark ? 'rgba(34,197,94,0.1)'     : 'rgba(34,197,94,0.15)',
    dividerLine:      isDark ? 'rgba(34,197,94,0.12)'    : 'rgba(34,197,94,0.25)',
    dividerText:      isDark ? 'rgba(240,250,242,0.2)'   : 'rgba(5,46,22,0.35)',
    chkBg:            isDark ? 'rgba(34,197,94,0.06)'    : '#fff',
    stepDotBg:        isDark ? '#080e09'                 : '#fff',
    stepDotInactive:  isDark ? 'rgba(34,197,94,0.15)'    : 'rgba(34,197,94,0.2)',
    stepTextInactive: isDark ? 'rgba(240,250,242,0.2)'   : 'rgba(5,46,22,0.25)',
    cardBg:           isDark ? 'rgba(34,197,94,0.04)'    : 'rgba(34,197,94,0.05)',
    cardBorder:       isDark ? 'rgba(34,197,94,0.12)'    : 'rgba(34,197,94,0.2)',
    roleCardBg:       isDark ? 'rgba(34,197,94,0.04)'    : 'rgba(34,197,94,0.05)',
    roleCardBorder:   isDark ? 'rgba(34,197,94,0.18)'    : 'rgba(34,197,94,0.3)',
    roleCardText:     isDark ? 'rgba(240,250,242,0.5)'   : 'rgba(5,46,22,0.55)',
    tagBg:            isDark ? 'rgba(34,197,94,0.05)'    : 'rgba(34,197,94,0.07)',
    tagBorder:        isDark ? 'rgba(34,197,94,0.2)'     : 'rgba(34,197,94,0.3)',
    tagText:          isDark ? 'rgba(240,250,242,0.55)'  : 'rgba(5,46,22,0.65)',
    reviewBg:         isDark ? 'rgba(34,197,94,0.05)'    : 'rgba(34,197,94,0.06)',
    reviewBorder:     isDark ? 'rgba(34,197,94,0.15)'    : 'rgba(34,197,94,0.25)',
    reviewRowBorder:  isDark ? 'rgba(34,197,94,0.08)'    : 'rgba(34,197,94,0.13)',
    avatarBg:         isDark ? '#0d1410'                 : '#f0fdf4',
    eyeBtn:           isDark ? 'rgba(240,250,242,0.2)'   : 'rgba(5,46,22,0.3)',
    hintText:         isDark ? 'rgba(240,250,242,0.45)'  : 'rgba(5,46,22,0.5)',
    counterText:      isDark ? 'rgba(240,250,242,0.25)'  : 'rgba(5,46,22,0.35)',
    backBorder:       isDark ? 'rgba(34,197,94,0.25)'    : 'rgba(34,197,94,0.4)',
    backText:         isDark ? 'rgba(240,250,242,0.5)'   : 'rgba(5,46,22,0.6)',
    errBg:            isDark ? 'rgba(239,68,68,0.08)'    : 'rgba(239,68,68,0.06)',
    errBorder:        isDark ? 'rgba(239,68,68,0.25)'    : 'rgba(239,68,68,0.3)',
    googleBtn:        isDark ? 'rgba(255,255,255,0.03)'  : '#fff',
    googleBorder:     isDark ? 'rgba(34,197,94,0.25)'    : 'rgba(34,197,94,0.4)',
    tinBg:            isDark ? 'rgba(34,197,94,0.03)'    : 'rgba(34,197,94,0.04)',
    tinBorder:        isDark ? 'rgba(34,197,94,0.2)'     : 'rgba(34,197,94,0.35)',
  };

  const inputCls = [
    'w-full px-3.5 py-2.5 rounded-[9px] border text-[13px]',
    'focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500',
    'transition-all duration-200 placeholder:opacity-40',
  ].join(' ');

  const inputStyle    = { background: tk.fieldBg, borderColor: tk.fieldBorder, color: tk.text };
  const inputErrStyle = { background: tk.fieldBg, borderColor: '#ef4444',      color: tk.text };
  const selectCls     = inputCls + ' appearance-none cursor-pointer';
  const labelCls      = 'block text-[10px] font-bold tracking-[1.5px] uppercase mb-1.5';
  const errCls        = 'text-[11px] text-red-400 mt-1 min-h-[14px]';

  const ReviewRow = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div className="flex justify-between items-center py-2 border-b last:border-0"
        style={{ borderColor: tk.reviewRowBorder }}>
        <span className="text-[11px] uppercase tracking-wide" style={{ color: tk.textSub }}>{label}</span>
        <span className="text-[12px] font-medium capitalize" style={{ color: tk.text }}>{value}</span>
      </div>
    ) : null;

  return (
    <div className="w-full max-w-100">

      {/* ── Progress bar ── */}
      <div className="h-[3px] rounded-full mb-5 overflow-hidden" style={{ background: tk.progressBg }}>
        <div className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }} />
      </div>

      {/* ── Step tracker ── */}
      <div className="flex items-center mb-6">
        {WIZARD_STEPS.map((s, i) => {
          const done = step > s.id; const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                  style={{
                    background:  done ? '#22c55e' : active ? 'rgba(34,197,94,0.1)' : tk.stepDotBg,
                    borderColor: done || active ? '#22c55e' : tk.stepDotInactive,
                    color:       done ? '#fff' : active ? '#22c55e' : tk.stepTextInactive,
                    transform:   active ? 'scale(1.12)' : 'scale(1)',
                  }}>
                  {done ? <Check size={11} strokeWidth={3} /> : s.id}
                </div>
                <span className="text-[8px] font-semibold tracking-[0.7px] uppercase whitespace-nowrap transition-colors duration-300"
                  style={{ color: active ? '#22c55e' : done ? 'rgba(34,197,94,0.5)' : tk.stepTextInactive }}>
                  {s.label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-1 mb-4 rounded-full transition-all duration-500"
                  style={{ background: done ? '#22c55e' : tk.stepDotInactive }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Animated panel ── */}
      <div key={animKey} className={panelAnim}>

        {/* Step header */}
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-[2px] uppercase text-green-500 opacity-70 mb-0.5">{meta.eyebrow}</p>
          <h2 className="font-['Playfair_Display'] text-[20px] font-bold leading-tight mb-1" style={{ color: tk.text }}>{meta.title}</h2>
          <p className="text-[11.5px] leading-relaxed" style={{ color: tk.textSub }}>{meta.sub}</p>
        </div>

        {/* ══════════ STEP 1 — Account ══════════ */}
        {step === 1 && (
          <div>
            {/* Google */}
            <button type="button" onClick={() => authService.loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-[9px] border text-[13px] font-semibold transition-all duration-200 mb-3 hover:border-green-500"
              style={{ background: tk.googleBtn, borderColor: tk.googleBorder, color: tk.text }}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex-1 h-px" style={{ background: tk.dividerLine }} />
              <span className="text-[9px] uppercase tracking-[1.5px]" style={{ color: tk.dividerText }}>or with email</span>
              <div className="flex-1 h-px" style={{ background: tk.dividerLine }} />
            </div>

            {/* Full name */}
            <div className="mb-3">
              <label className={labelCls} style={{ color: tk.labelColor }}>Full Name</label>
              <input className={inputCls} style={errors.fullName ? inputErrStyle : inputStyle}
                type="text" placeholder="John Doe"
                value={form.fullName} onChange={e => update({ fullName: e.target.value })} />
              <p className={errCls}>{errors.fullName}</p>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className={labelCls} style={{ color: tk.labelColor }}>Email Address</label>
              <input className={inputCls} style={errors.email ? inputErrStyle : inputStyle}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={e => update({ email: e.target.value })} />
              <p className={errCls}>{errors.email}</p>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className={labelCls} style={{ color: tk.labelColor }}>Password</label>
              <div className="relative">
                <input className={inputCls + ' pr-10'} style={errors.password ? inputErrStyle : inputStyle}
                  type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => update({ password: e.target.value })} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-green-400"
                  style={{ color: tk.eyeBtn }}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="h-[3px] rounded-full mt-2 mb-1 overflow-hidden" style={{ background: tk.progressBg }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: strength.width, background: strength.color }} />
              </div>
              <p className="text-[10px]" style={{ color: strength.color === 'transparent' ? tk.textSub : strength.color }}>
                {strength.label}
              </p>
              <p className={errCls}>{errors.password}</p>
            </div>

            {/* Confirm password */}
            <div className="mb-3">
              <label className={labelCls} style={{ color: tk.labelColor }}>Confirm Password</label>
              <div className="relative">
                <input className={inputCls + ' pr-10'} style={errors.confirmPassword ? inputErrStyle : inputStyle}
                  type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                  value={form.confirmPassword} onChange={e => update({ confirmPassword: e.target.value })} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-green-400"
                  style={{ color: tk.eyeBtn }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className={errCls}>{errors.confirmPassword}</p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="hidden"
                checked={form.terms} onChange={e => update({ terms: e.target.checked })} />
              <span className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all"
                style={form.terms
                  ? { background: '#22c55e', borderColor: '#22c55e' }
                  : { background: tk.chkBg,  borderColor: tk.fieldBorder }}>
                {form.terms && <Check size={10} strokeWidth={3} color="#fff" />}
              </span>
              <span className="text-[11px] leading-relaxed" style={{ color: tk.hintText }}>
                I agree to the <a href="#" className="text-green-400 hover:underline">Terms of Service</a>{' '}
                and <a href="#" className="text-green-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
            <p className={errCls}>{errors.terms}</p>
          </div>
        )}

        {/* ══════════ STEP 2 — Personalise ══════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className={labelCls} style={{ color: tk.labelColor }}>What do you want to do?</p>
              <div className="flex gap-2">
                {ROLE_OPTIONS.map(r => {
                  const active = form.role === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => update({ role: r.id })}
                      className="flex-1 py-3 px-2 rounded-xl border-2 text-[11px] font-semibold transition-all duration-200 flex flex-col items-center gap-1.5"
                      style={active
                        ? { background: 'rgba(34,197,94,0.1)', borderColor: '#22c55e', color: '#22c55e', transform: 'translateY(-2px)' }
                        : { background: tk.roleCardBg, borderColor: tk.roleCardBorder, color: tk.roleCardText }}>
                      <span className="text-xl">{r.icon}</span>
                      <span>{r.name}</span>
                      <span className="text-[9px] font-normal text-center opacity-75 leading-tight px-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className={errCls}>{errors.role}</p>
            </div>

            {form.role === 'buyer' && (
              <div className="space-y-3 animate-[slideInF_0.3s_cubic-bezier(.22,1,.36,1)_both]">
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>How often do you shop online?</label>
                  <select className={selectCls} style={errors.shoppingFrequency ? inputErrStyle : inputStyle}
                    value={form.shoppingFrequency} onChange={e => update({ shoppingFrequency: e.target.value })}>
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="occasionally">Occasionally</option>
                  </select>
                  <p className={errCls}>{errors.shoppingFrequency}</p>
                </div>
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>Typical budget per purchase</label>
                  <select className={selectCls} style={errors.budgetRange ? inputErrStyle : inputStyle}
                    value={form.budgetRange} onChange={e => update({ budgetRange: e.target.value })}>
                    <option value="">Select budget</option>
                    <option value="low">Below 50,000 RWF</option>
                    <option value="mid">50,000 – 200,000 RWF</option>
                    <option value="high">Above 200,000 RWF</option>
                  </select>
                  <p className={errCls}>{errors.budgetRange}</p>
                </div>
              </div>
            )}

            {(form.role === 'seller' || form.role === 'wholesaler') && (
              <div className="space-y-3 animate-[slideInF_0.3s_cubic-bezier(.22,1,.36,1)_both]">
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>Your selling experience</label>
                  <select className={selectCls} style={errors.experienceLevel ? inputErrStyle : inputStyle}
                    value={form.experienceLevel} onChange={e => update({ experienceLevel: e.target.value })}>
                    <option value="">Select level</option>
                    <option value="beginner">Beginner — just getting started</option>
                    <option value="intermediate">Intermediate — some experience</option>
                    <option value="expert">Expert — seasoned seller</option>
                  </select>
                  <p className={errCls}>{errors.experienceLevel}</p>
                </div>
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>What products do you sell?</label>
                  <select className={selectCls} style={errors.productType ? inputErrStyle : inputStyle}
                    value={form.productType} onChange={e => update({ productType: e.target.value })}>
                    <option value="">Select type</option>
                    <option value="food">Food & Beverages</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="electronics">Electronics</option>
                    <option value="wholesale">Wholesale / Bulk</option>
                    <option value="other">Other</option>
                  </select>
                  <p className={errCls}>{errors.productType}</p>
                </div>
              </div>
            )}

            {!form.role && (
              <p className="text-[11px] text-center py-2" style={{ color: tk.counterText }}>
                Select a role above to see personalised questions
              </p>
            )}
          </div>
        )}

        {/* ══════════ STEP 3 — Setup ══════════ */}
        {step === 3 && (
          <div>
            {(form.role === 'seller' || form.role === 'wholesaler') && (
              <div className="space-y-4">

                {/* Shop name */}
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>Shop Name</label>
                  <input className={inputCls} style={errors.shopName ? inputErrStyle : inputStyle}
                    type="text" placeholder="e.g. Kigali Electronics Hub"
                    value={form.shopName} onChange={e => update({ shopName: e.target.value })} />
                  <p className={errCls}>{errors.shopName}</p>
                </div>

                {/* National ID */}
                <div>
                  <label className={labelCls} style={{ color: tk.labelColor }}>
                    National ID Number
                    <span className="ml-1.5 text-[9px] normal-case tracking-normal font-normal opacity-60">
                      16-digit Rwanda NID
                    </span>
                  </label>
                  <input
                    className={inputCls}
                    style={errors.nationalId ? inputErrStyle : inputStyle}
                    type="text"
                    placeholder="1 YYYY7 XXXXXXX XX X"
                    maxLength={16}
                    value={form.nationalId}
                    onChange={e => update({ nationalId: e.target.value.replace(/[^0-9]/g, '') })}
                  />
                  {/* Info box */}
                  <div className="mt-2 px-3 py-2 rounded-lg flex gap-2 items-start"
                    style={{ background: isDark ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.07)', border: `1px solid ${tk.tinBorder}` }}>
                    <span className="text-green-500 text-[13px] mt-0.5 flex-shrink-0">ℹ️</span>
                    <p className="text-[10px] leading-relaxed" style={{ color: tk.textSub }}>
                      We use your NID to look up your TIN via{' '}
                      <a href="https://etax.rra.gov.rw/nidAssignedTIN/" target="_blank" rel="noreferrer"
                        className="text-green-400 hover:underline font-medium">
                        RRA eTax
                      </a>
                      {' '}and verify your business is tax-registered.
                      Your NID is stored securely and never shared publicly.
                    </p>
                  </div>
                  <p className={errCls}>{errors.nationalId}</p>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls} style={{ color: tk.labelColor }}>Product Categories</label>
                    <span className="text-[10px]" style={{ color: tk.counterText }}>{form.categories.length}/5 selected</span>
                  </div>
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: tk.textSub }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle}
                      type="text" placeholder="Search categories…"
                      value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-0.5">
                    {filteredCats.map(cat => {
                      const sel = form.categories.includes(cat.name);
                      return (
                        <button key={cat.name} type="button" onClick={() => toggleList('categories', cat.name, 5)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all duration-200"
                          style={sel
                            ? { background: 'rgba(34,197,94,0.12)', borderColor: '#22c55e', color: '#22c55e' }
                            : { background: tk.tagBg, borderColor: tk.tagBorder, color: tk.tagText }}>
                          <span className="text-base flex-shrink-0">{cat.icon}</span>
                          <span className="text-left leading-tight flex-1">{cat.name}</span>
                          {sel && <Check size={11} strokeWidth={3} className="flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className={errCls}>{errors.categories}</p>
                </div>
              </div>
            )}

            {form.role === 'buyer' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls} style={{ color: tk.labelColor }}>What are you interested in?</label>
                  <span className="text-[10px]" style={{ color: tk.counterText }}>{form.interests.length}/5 selected</span>
                </div>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: tk.textSub }} />
                  <input className={inputCls + ' pl-9'} style={inputStyle}
                    type="text" placeholder="Search interests…"
                    value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-0.5">
                  {filteredCats.map(cat => {
                    const sel = form.interests.includes(cat.name);
                    return (
                      <button key={cat.name} type="button" onClick={() => toggleList('interests', cat.name, 5)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all duration-200"
                        style={sel
                          ? { background: 'rgba(34,197,94,0.12)', borderColor: '#22c55e', color: '#22c55e' }
                          : { background: tk.tagBg, borderColor: tk.tagBorder, color: tk.tagText }}>
                        <span className="text-base flex-shrink-0">{cat.icon}</span>
                        <span className="text-left leading-tight flex-1">{cat.name}</span>
                        {sel && <Check size={11} strokeWidth={3} className="flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <p className={errCls}>{errors.interests}</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════ STEP 4 — Profile Photo ══════════ */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-36 h-36 rounded-full p-[3px]"
                style={{ background: form.profilePreview
                  ? 'linear-gradient(135deg,#22c55e,#16a34a,#86efac)'
                  : tk.stepDotInactive }}>
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: tk.avatarBg }}>
                  {form.profilePreview
                    ? <img src={form.profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-1.5" style={{ color: tk.textSub }}>
                        <Camera size={30} />
                        <span className="text-[10px] font-medium">Upload photo</span>
                      </div>
                  }
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full group-hover:scale-105 transition shadow-lg">
                {form.profilePreview ? 'Change' : 'Add'}
              </span>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleProfileImage(f); }} />

            <p className="text-[12px] text-center leading-relaxed max-w-[240px]" style={{ color: tk.textSub }}>
              A clear photo helps people recognise you.{' '}
              <span className="text-green-500 font-medium">You can skip this step</span> and add it later.
            </p>

            {form.profilePreview && (
              <button type="button" onClick={() => update({ profileImage: null, profilePreview: null })}
                className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors">
                Remove photo
              </button>
            )}
          </div>
        )}

        {/* ══════════ STEP 5 — Review ══════════ */}
        {step === 5 && (
          <div className="space-y-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: tk.reviewBg, borderColor: tk.reviewBorder }}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border"
                style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
                {form.profilePreview
                  ? <img src={form.profilePreview} alt="" className="w-full h-full object-cover" />
                  : <span className="text-green-500 font-bold text-lg">{form.fullName.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: tk.text }}>{form.fullName}</p>
                <p className="text-[11px] truncate" style={{ color: tk.textSub }}>{form.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
                {form.role}
              </span>
            </div>

            {/* Details */}
            <div className="rounded-xl px-4 py-1"
              style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }}>
              <ReviewRow label="Role"           value={form.role} />
              <ReviewRow label="Shopping freq." value={form.shoppingFrequency} />
              <ReviewRow label="Budget range"   value={form.budgetRange} />
              <ReviewRow label="Experience"     value={form.experienceLevel} />
              <ReviewRow label="Product type"   value={form.productType} />
              <ReviewRow label="Shop name"      value={form.shopName} />
              <ReviewRow label="National ID"    value={form.nationalId} />
            </div>

            {/* Tags */}
            {(form.categories.length > 0 || form.interests.length > 0) && (
              <div className="rounded-xl px-4 py-3"
                style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }}>
                <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: tk.textSub }}>
                  {form.role === 'buyer' ? 'Interests' : 'Categories'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(form.role === 'buyer' ? form.interests : form.categories).map(item => (
                    <span key={item} className="px-2.5 py-1 rounded-full text-[10px] font-medium border"
                      style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-center" style={{ color: tk.counterText }}>
              Not right? Hit <span className="text-green-500">Back</span> to edit any step.
            </p>
          </div>
        )}

      </div>

      {/* ── Server error ── */}
      {serverError && (
        <div className="mt-3 px-4 py-3 rounded-lg text-red-400 text-[12px]"
          style={{ background: tk.errBg, border: `1px solid ${tk.errBorder}` }}>
          {serverError}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-5">
        <button type="button" onClick={handleBack} disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[9px] border text-[12px] font-semibold transition-all hover:border-green-500 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderColor: tk.backBorder, color: tk.backText }}>
          <ArrowLeft size={13} strokeWidth={2.5} /> Back
        </button>

        <span className="text-[10px] font-medium" style={{ color: tk.counterText }}>{step} of {total}</span>

        <button type="button" onClick={handleNext} disabled={loading}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-[9px] bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center">
          {loading
            ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : step === total
              ? <><LayoutDashboard size={14} />&nbsp;Submit</>
              : step === 4
                ? <>Skip&nbsp;<ArrowRight size={13} strokeWidth={2.5} /></>
                : <>Continue&nbsp;<ArrowRight size={13} strokeWidth={2.5} /></>
          }
        </button>
      </div>

      <p className="text-center text-[11px] mt-4" style={{ color: tk.hintText }}>
        Already have an account?{' '}
        <a href="/login" className="text-green-400 font-semibold hover:underline">Sign in →</a>
      </p>
    </div>
  );
}
