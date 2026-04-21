import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';

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
  { sku: 'Wireless Earbuds Pro', unitCost: 18500, wholesalePrice: 26900, unitsSold30d: 980, inventoryUnits: 1650, leadTimeDays: 11, monthlyDemandGrowth: 0.16 },
  { sku: 'Portable Ring Light', unitCost: 7300, wholesalePrice: 11800, unitsSold30d: 1420, inventoryUnits: 900, leadTimeDays: 8, monthlyDemandGrowth: 0.22 },
  { sku: 'Desk Lamp Minimal', unitCost: 12900, wholesalePrice: 18900, unitsSold30d: 640, inventoryUnits: 1200, leadTimeDays: 14, monthlyDemandGrowth: 0.09 },
  { sku: 'Type-C Fast Charger', unitCost: 2600, wholesalePrice: 4700, unitsSold30d: 2100, inventoryUnits: 2800, leadTimeDays: 6, monthlyDemandGrowth: 0.18 },
  { sku: 'Bluetooth Speaker Mini', unitCost: 9100, wholesalePrice: 14600, unitsSold30d: 770, inventoryUnits: 620, leadTimeDays: 12, monthlyDemandGrowth: 0.11 },
];

export default function WholesalerDashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<CurrentUser>('/api/auth/me', { signal: controller.signal })
      .then(res => setUser(res.data))
      .catch(err => {
        if (!axios.isCancel(err)) setUser(null);
      });
    return () => controller.abort();
  }, []);

  const surface = '';
  const soft = '';
  const muted = '';
  const chip = '';

  const metrics = useMemo(() => {
    const totalRevenue = SKUS.reduce((sum, sku) => sum + sku.wholesalePrice * sku.unitsSold30d, 0);
    const totalCost = SKUS.reduce((sum, sku) => sum + sku.unitCost * sku.unitsSold30d, 0);
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPct = totalRevenue ? (grossProfit / totalRevenue) * 100 : 0;
    const totalUnits = SKUS.reduce((sum, sku) => sum + sku.unitsSold30d, 0);
    const weightedGrowth = totalUnits
      ? SKUS.reduce((sum, sku) => sum + sku.monthlyDemandGrowth * (sku.unitsSold30d / totalUnits), 0) * 100
      : 0;

    const avgDailyDemand = (units: number) => units / 30;
    const skuRisks = SKUS.map(sku => {
      const daysCover = avgDailyDemand(sku.unitsSold30d) ? sku.inventoryUnits / avgDailyDemand(sku.unitsSold30d) : 0;
      const reorderPoint = avgDailyDemand(sku.unitsSold30d) * sku.leadTimeDays * 1.25;
      const shortageRisk = Math.max(0, (reorderPoint - sku.inventoryUnits) / Math.max(reorderPoint, 1));
      return { ...sku, daysCover, reorderPoint, shortageRisk };
    });

    const highRiskCount = skuRisks.filter(s => s.shortageRisk > 0.2).length;
    const cashConversionCycleDays = 42 - Math.min(8, weightedGrowth / 4);
    const breakEvenUnitsAvg = SKUS.reduce((sum, sku) => {
      const contribution = Math.max(1, sku.wholesalePrice - sku.unitCost);
      return sum + Math.ceil(220000 / contribution);
    }, 0) / SKUS.length;
    const negotiationPowerScore = Math.min(
      100,
      Math.round((grossMarginPct * 1.8) + (weightedGrowth * 2.4) + ((1 - highRiskCount / SKUS.length) * 24)),
    );

    return {
      totalRevenue,
      grossProfit,
      grossMarginPct,
      weightedGrowth,
      highRiskCount,
      cashConversionCycleDays,
      breakEvenUnitsAvg,
      negotiationPowerScore,
      skuRisks,
    };
  }, []);

  const kpis = [
    {
      label: 'Gross revenue (30d)',
      value: `RWF ${Math.round(metrics.totalRevenue).toLocaleString()}`,
      note: `Gross profit RWF ${Math.round(metrics.grossProfit).toLocaleString()}`,
    },
    {
      label: 'Weighted demand growth',
      value: `${metrics.weightedGrowth.toFixed(2)}%`,
      note: 'Weighted by SKU sales contribution',
    },
    {
      label: 'Gross margin',
      value: `${metrics.grossMarginPct.toFixed(2)}%`,
      note: 'Across all wholesale SKUs',
    },
    {
      label: 'Negotiation power score',
      value: `${metrics.negotiationPowerScore}/100`,
      note: `Risk-adjusted using ${SKUS.length} SKUs`,
    },
  ];

  const founderMoves = [
    {
      title: 'Reorder risk control',
      detail: `${metrics.highRiskCount} SKUs are above 20% shortage risk. Prioritize safety stock and split shipments by lead-time tiers.`,
    },
    {
      title: 'Cashflow discipline',
      detail: `Projected cash conversion cycle is ${metrics.cashConversionCycleDays.toFixed(1)} days. Tighten buyer payment terms for low-margin accounts.`,
    },
    {
      title: 'Unit economics floor',
      detail: `Average break-even is ${Math.round(metrics.breakEvenUnitsAvg)} units/SKU. Push bundles where contribution margin is strongest.`,
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg)', color: 'var(--text1)' }}>
        <section className="rounded-2xl p-5 md:p-7" style={{ background: 'var(--bg)', border: '1px solid var(--border-custom)' }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">Wholesaler Dashboard</h1>
              <p className="mt-1 text-sm md:text-base" style={{ color: 'var(--text2)' }}>
                Master bulk pricing, inventory risk, and enterprise-grade growth decisions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>
                  Operator: {user?.name ?? 'Wholesaler'}
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--bg2)', border: '1px solid var(--border-custom)', color: 'var(--text3)' }}>
                  Role: {user?.role ?? 'Wholesaler'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${chip}`}>
                  Portfolio: {SKUS.length} SKUs
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/listings/new')}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
              >
                Create bulk offer
              </button>
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${soft}`}
              >
                Open buyer pipeline
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(item => (
            <article key={item.label} className={`rounded-xl p-4 ${surface}`}>
              <p className={`text-xs uppercase tracking-wide ${muted}`}>{item.label}</p>
              <p className="mt-2 text-xl font-bold">{item.value}</p>
              <p className={`mt-1 text-xs ${muted}`}>{item.note}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-8 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">SKU risk and reorder intelligence</h2>
                <span className={`text-xs rounded-full px-2.5 py-1 ${chip}`}>
                  Safety stock model: 1.25x lead-time demand
                </span>
              </div>
              <div className="space-y-3">
                {metrics.skuRisks.map(sku => (
                  <div key={sku.sku} className={`rounded-xl border p-4 ${soft}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <p className="font-semibold">{sku.sku}</p>
                      <span className={`text-xs rounded-full border px-2.5 py-1 ${soft}`}>
                        Shortage risk {(sku.shortageRisk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <p className={`text-xs ${muted}`}>Days cover</p>
                        <p className="text-sm font-semibold">{sku.daysCover.toFixed(1)}d</p>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Reorder point</p>
                        <p className="text-sm font-semibold">{Math.round(sku.reorderPoint).toLocaleString()} units</p>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Inventory</p>
                        <p className="text-sm font-semibold">{sku.inventoryUnits.toLocaleString()} units</p>
                      </div>
                      <div>
                        <p className={`text-xs ${muted}`}>Growth</p>
                        <p className="text-sm font-semibold">{(sku.monthlyDemandGrowth * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-4">Entrepreneurship skill board</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {founderMoves.map(item => (
                  <div key={item.title} className={`rounded-lg border p-3 ${soft}`}>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className={`text-xs mt-1 ${muted}`}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="xl:col-span-4 space-y-6">
            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Pricing strategy snapshot</h2>
              <div className="space-y-2">
                <div className={`rounded-lg border p-3 ${soft}`}>
                  <p className={`text-xs ${muted}`}>Target margin band</p>
                  <p className="text-sm font-semibold">28% - 36%</p>
                </div>
                <div className={`rounded-lg border p-3 ${soft}`}>
                  <p className={`text-xs ${muted}`}>Volume discount threshold</p>
                  <p className="text-sm font-semibold">120+ units per order</p>
                </div>
                <div className={`rounded-lg border p-3 ${soft}`}>
                  <p className={`text-xs ${muted}`}>Upside if +2% margin</p>
                  <p className="text-sm font-semibold">
                    +RWF {Math.round(metrics.totalRevenue * 0.02).toLocaleString()} / month
                  </p>
                </div>
              </div>
            </article>

            <article className={`rounded-2xl p-5 ${surface}`}>
              <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
              <div className="space-y-2">
                <button type="button" onClick={() => navigate('/listings/new')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Launch wholesale campaign</button>
                <button type="button" onClick={() => navigate('/chat')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Negotiate with top buyers</button>
                <button type="button" onClick={() => navigate('/account')} className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors hover:border-green-500 ${soft}`}>Update enterprise profile</button>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
