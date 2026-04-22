import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/layouts/AppLayout';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'Wholesaler' | 'admin';
}

interface BulkSku {
  sku: string;
  unitCost: number;
  wholesalePrice: number;
  unitsSold30d: number;
  inventoryUnits: number;
  leadTimeDays: number;
  monthlyDemandGrowth: number;
}

const SKUS: BulkSku[] = [
  { sku: 'Wireless Earbuds Pro',    unitCost: 18500, wholesalePrice: 26900, unitsSold30d: 980,  inventoryUnits: 1650, leadTimeDays: 11, monthlyDemandGrowth: 0.16 },
  { sku: 'Portable Ring Light',     unitCost: 7300,  wholesalePrice: 11800, unitsSold30d: 1420, inventoryUnits: 900,  leadTimeDays: 8,  monthlyDemandGrowth: 0.22 },
  { sku: 'Desk Lamp Minimal',       unitCost: 12900, wholesalePrice: 18900, unitsSold30d: 640,  inventoryUnits: 1200, leadTimeDays: 14, monthlyDemandGrowth: 0.09 },
  { sku: 'Type-C Fast Charger',     unitCost: 2600,  wholesalePrice: 4700,  unitsSold30d: 2100, inventoryUnits: 2800, leadTimeDays: 6,  monthlyDemandGrowth: 0.18 },
  { sku: 'Bluetooth Speaker Mini',  unitCost: 9100,  wholesalePrice: 14600, unitsSold30d: 770,  inventoryUnits: 620,  leadTimeDays: 12, monthlyDemandGrowth: 0.11 },
];

export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => { if (!axios.isCancel(err)) setUser(null); });
    return () => controller.abort();
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue     = SKUS.reduce((sum, s) => sum + s.wholesalePrice * s.unitsSold30d, 0);
    const totalCost        = SKUS.reduce((sum, s) => sum + s.unitCost * s.unitsSold30d, 0);
    const grossProfit      = totalRevenue - totalCost;
    const grossMarginPct   = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;
    const totalUnits       = SKUS.reduce((sum, s) => sum + s.unitsSold30d, 0);
    const weightedGrowth   = totalUnits
      ? SKUS.reduce((sum, s) => sum + s.monthlyDemandGrowth * (s.unitsSold30d / totalUnits), 0) * 100
      : 0;

    const avgDaily = (u: number) => u / 30;
    const skuRisks = SKUS.map(s => {
      const daysCover      = avgDaily(s.unitsSold30d) ? s.inventoryUnits / avgDaily(s.unitsSold30d) : 0;
      const reorderPoint   = avgDaily(s.unitsSold30d) * s.leadTimeDays * 1.25;
      const shortageRisk   = Math.max(0, (reorderPoint - s.inventoryUnits) / Math.max(reorderPoint, 1));
      return { ...s, daysCover, reorderPoint, shortageRisk };
    });

    const highRiskCount            = skuRisks.filter(s => s.shortageRisk > 0.2).length;
    const cashConversionCycleDays  = 42 - Math.min(8, weightedGrowth / 4);
    const breakEvenUnitsAvg        = SKUS.reduce((sum, s) => {
      const contribution = Math.max(1, s.wholesalePrice - s.unitCost);
      return sum + Math.ceil(220000 / contribution);
    }, 0) / SKUS.length;
    const negotiationPowerScore    = Math.min(100, Math.round(
      (grossMarginPct * 1.8) + (weightedGrowth * 2.4) + ((1 - highRiskCount / SKUS.length) * 24),
    ));

    return { totalRevenue, grossProfit, grossMarginPct, weightedGrowth, highRiskCount, cashConversionCycleDays, breakEvenUnitsAvg, negotiationPowerScore, skuRisks };
  }, []);

  const kpis = [
    { label: 'Gross revenue (30d)',      value: `RWF ${Math.round(metrics.totalRevenue).toLocaleString()}`,   note: `Gross profit RWF ${Math.round(metrics.grossProfit).toLocaleString()}`, trend: null },
    { label: 'Weighted demand growth',   value: `${metrics.weightedGrowth.toFixed(2)}%`,                      note: 'Weighted by SKU sales contribution',                                  trend: `+${metrics.weightedGrowth.toFixed(1)}%` },
    { label: 'Gross margin',             value: `${metrics.grossMarginPct.toFixed(2)}%`,                      note: 'Across all wholesale SKUs',                                           trend: null },
    { label: 'Negotiation power score',  value: `${metrics.negotiationPowerScore}/100`,                        note: `Risk-adjusted using ${SKUS.length} SKUs`,                             trend: null },
  ];

  const founderMoves = [
    { title: 'Reorder risk control',   detail: `${metrics.highRiskCount} SKUs are above 20% shortage risk. Prioritize safety stock and split shipments by lead-time tiers.` },
    { title: 'Cashflow discipline',    detail: `Projected cash conversion cycle is ${metrics.cashConversionCycleDays.toFixed(1)} days. Tighten buyer payment terms for low-margin accounts.` },
    { title: 'Unit economics floor',   detail: `Average break-even is ${Math.round(metrics.breakEvenUnitsAvg)} units/SKU. Push bundles where contribution margin is strongest.` },
  ];

  const riskColor = (risk: number) => {
    if (risk > 0.5)  return 'color-mix(in oklch, var(--destructive) 30%, transparent)';
    if (risk > 0.2)  return 'color-mix(in oklch, var(--secondary) 60%, transparent)';
    return 'color-mix(in oklch, var(--primary) 20%, transparent)';
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg)', color: 'var(--foreground)', fontFamily: 'Outfit, sans-serif' }}>

        {/* ── Header ── */}
        <section
          className="rounded-2xl p-5 md:p-7"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>
                Wholesaler Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Master bulk pricing, inventory risk, and enterprise-grade growth decisions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  `Operator: ${user?.name ?? 'Wholesaler'}`,
                  `Role: ${user?.role ?? 'Wholesaler'}`,
                  `Portfolio: ${SKUS.length} SKUs`,
                ].map(label => (
                  <span
                    key={label}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate('/listings/new')} className="auth-btn" style={{ width: 'auto', padding: '10px 20px' }}>
                Create bulk offer
              </button>
              <button type="button" onClick={() => navigate('/chat')} className="auth-social" style={{ width: 'auto', padding: '10px 20px' }}>
                Open buyer pipeline
              </button>
            </div>
          </div>
        </section>

        {/* ── KPI Cards ── */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((item, i) => (
            <article
              key={item.label}
              className="rounded-xl p-5"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
              }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{item.value}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.note}</p>
                {item.trend && (
                  <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: 'color-mix(in oklch, var(--primary) 20%, transparent)', color: 'var(--link)' }}>
                    {item.trend}
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* ── Main Grid ── */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">

            {/* SKU risk table */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>SKU risk & reorder intelligence</h2>
                <span
                  className="text-xs rounded-full px-2.5 py-1 font-medium"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                >
                  Safety stock: 1.25× lead-time demand
                </span>
              </div>
              <div className="space-y-3">
                {metrics.skuRisks.map(sku => (
                  <div key={sku.sku} className="rounded-xl p-4" style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{sku.sku}</p>
                      <span
                        className="self-start text-xs rounded-full px-2.5 py-1 font-medium"
                        style={{ background: riskColor(sku.shortageRisk), border: '1px solid var(--border)', color: 'var(--accent-foreground)' }}
                      >
                        Shortage risk {(sku.shortageRisk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Days cover',     val: `${sku.daysCover.toFixed(1)}d` },
                        { label: 'Reorder point',  val: `${Math.round(sku.reorderPoint).toLocaleString()} units` },
                        { label: 'Inventory',      val: `${sku.inventoryUnits.toLocaleString()} units` },
                        { label: 'Growth',         val: `${(sku.monthlyDemandGrowth * 100).toFixed(1)}%` },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Founder moves */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Entrepreneurship skill board</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {founderMoves.map(item => (
                  <div key={item.title} className="rounded-lg p-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* ── Sidebar ── */}
          <aside className="xl:col-span-4 space-y-6">

            {/* Pricing snapshot */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Pricing strategy snapshot</h2>
              <div className="space-y-2">
                {[
                  { label: 'Target margin band',         val: '28% – 36%' },
                  { label: 'Volume discount threshold',   val: '120+ units per order' },
                  { label: 'Upside if +2% margin',        val: `+RWF ${Math.round(metrics.totalRevenue * 0.02).toLocaleString()} / month` },
                ].map(item => (
                  <div key={item.label} className="rounded-lg p-3" style={{ background: 'var(--accent)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--foreground)' }}>{item.val}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* Quick actions */}
            <article className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Quick actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Launch wholesale campaign',   path: '/listings/new' },
                  { label: 'Negotiate with top buyers',   path: '/chat' },
                  { label: 'Update enterprise profile',   path: '/account' },
                ].map(action => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ring)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}