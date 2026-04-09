import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';
import {
  INITIAL_LISTING_FORM,
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  type ListingFormData,
} from '../types';

export default function CreateListingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ListingFormData>(INITIAL_LISTING_FORM);

  const surface = isDark ? 'bg-neutral-950 border border-white/10 text-white' : 'bg-white border border-black/10 text-black';
  const soft = isDark ? 'bg-white/5 border-white/10' : 'bg-black/[0.03] border-black/10';
  const muted = isDark ? 'text-white/60' : 'text-black/60';
  const input = isDark
    ? 'bg-black/40 border-white/15 text-white placeholder:text-white/35'
    : 'bg-white border-black/15 text-black placeholder:text-black/40';

  const steps = ['Details', 'Media', 'Pricing', 'Publish'];

  const completion = useMemo(() => {
    const checks = [
      form.title.trim().length > 2,
      form.description.trim().length > 15,
      form.category !== '',
      form.location.trim().length > 1,
      form.images.length > 0,
      Number(form.price) > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const onImageChange = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, 8);
    const previews = picked.map(file => URL.createObjectURL(file));
    setForm(prev => ({ ...prev, images: picked, previews }));
  };

  const goNext = () => setStep(s => Math.min(4, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  const publish = () => {
    // API hook can be wired here later
    navigate('/seller/dashboard');
  };

  return (
    <AppLayout>
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${isDark ? 'bg-black text-white' : 'bg-[#f7f9fc] text-black'}`}>
        <section className={`rounded-2xl p-5 md:p-7 ${surface}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Create listing</h1>
              <p className={`mt-1 text-sm md:text-base ${muted}`}>
                Friendly creator flow inspired by YouTube Studio: complete details, add media, then publish.
              </p>
            </div>
            <div className={`rounded-xl border px-4 py-3 min-w-[170px] ${soft}`}>
              <p className={`text-xs ${muted}`}>Completion</p>
              <p className="text-lg font-bold">{completion}%</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
            {steps.map((label, idx) => {
              const n = idx + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className={`rounded-lg border px-3 py-2 text-sm font-medium ${active ? 'border-green-500 text-green-500 bg-green-500/10' : done ? 'border-green-500/40 text-green-500' : `${soft}`}`}>
                  {n}. {label}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            {step === 1 && (
              <article className={`rounded-2xl p-5 ${surface}`}>
                <h2 className="text-lg font-semibold mb-4">Listing details</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Title (e.g. iPhone 13 Pro, 128GB)"
                    className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                  />
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe condition, specs, and what buyers should know..."
                    rows={6}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-green-500 ${input}`}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className={`h-11 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                    >
                      <option value="">Select category</option>
                      {LISTING_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <select
                      value={form.condition}
                      onChange={e => setForm(p => ({ ...p, condition: e.target.value as ListingFormData['condition'] }))}
                      className={`h-11 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                    >
                      {LISTING_CONDITIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="Location (City / District)"
                    className={`h-11 w-full rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                  />
                </div>
              </article>
            )}

            {step === 2 && (
              <article className={`rounded-2xl p-5 ${surface}`}>
                <h2 className="text-lg font-semibold mb-4">Add photos</h2>
                <label className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-8 cursor-pointer transition-colors hover:border-green-500 ${soft}`}>
                  <span className="text-3xl">+</span>
                  <p className="mt-2 text-sm font-medium">Upload up to 8 photos</p>
                  <p className={`text-xs ${muted}`}>High-quality photos perform better, just like thumbnails.</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => onImageChange(e.target.files)} />
                </label>

                {form.previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.previews.map(src => (
                      <div key={src} className={`rounded-lg overflow-hidden border ${soft}`}>
                        <img src={src} alt="Preview" className="h-28 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            )}

            {step === 3 && (
              <article className={`rounded-2xl p-5 ${surface}`}>
                <h2 className="text-lg font-semibold mb-4">Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="Price"
                    className={`h-11 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                  />
                  <select
                    value={form.currency}
                    onChange={e => setForm(p => ({ ...p, currency: e.target.value as ListingFormData['currency'] }))}
                    className={`h-11 rounded-lg border px-3 text-sm outline-none focus:border-green-500 ${input}`}
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <p className={`mt-3 text-xs ${muted}`}>
                  Tip: fair pricing improves impressions and chat conversion.
                </p>
              </article>
            )}

            {step === 4 && (
              <article className={`rounded-2xl p-5 ${surface}`}>
                <h2 className="text-lg font-semibold mb-4">Review & publish</h2>
                <div className={`rounded-xl border p-4 ${soft}`}>
                  <p className="font-semibold">{form.title || 'Untitled listing'}</p>
                  <p className={`text-sm mt-1 ${muted}`}>
                    {form.category || 'No category'} • {form.condition} • {form.location || 'No location'}
                  </p>
                  <p className={`text-sm mt-2 ${muted}`}>{form.description || 'No description provided yet.'}</p>
                  <p className="mt-3 text-base font-bold text-green-500">
                    {form.currency} {form.price || '0'}
                  </p>
                </div>
              </article>
            )}

            <div className="flex items-center justify-between">
              <button type="button" onClick={goBack} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${soft}`}>
                Back
              </button>
              {step < 4 ? (
                <button type="button" onClick={goNext} className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
                  Continue
                </button>
              ) : (
                <button type="button" onClick={publish} className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
                  Publish listing
                </button>
              )}
            </div>
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Creator tips</h2>
              <ul className="space-y-2">
                {[
                  'Use clear photos from multiple angles.',
                  'Put the most searchable keywords in title.',
                  'Mention warranty, delivery, and accessories.',
                  'Respond quickly to boost listing rank.',
                ].map(tip => (
                  <li key={tip} className={`rounded-lg border p-3 text-sm ${soft}`}>
                    {tip}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Live preview</h2>
              <div className={`rounded-xl border p-4 ${soft}`}>
                <div className={`h-28 rounded-lg mb-3 ${isDark ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                <p className="font-semibold text-sm">{form.title || 'Your title appears here'}</p>
                <p className={`text-xs mt-1 ${muted}`}>{form.location || 'Location'} • {form.category || 'Category'}</p>
                <p className="mt-2 font-bold text-green-500">{form.currency} {form.price || '0'}</p>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
