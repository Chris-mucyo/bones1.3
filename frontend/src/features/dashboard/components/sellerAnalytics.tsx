import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { subDays } from "date-fns";
import AppLayout from "../../../shared/layouts/AppLayout";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import {
  ChevronRight,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Zap,
  Flame,
  Share2,
  Heart,
  MessageCircle,
  Star,
  ArrowUpRight,
  Play,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

/* ─────────────────── types ─────────────────── */
interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  role: "buyer" | "seller" | "Wholesaler" | "admin";
}

interface AnalyticsData {
  revenue: number;
  orders: number;
  conversionRate: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface OrderStatus {
  name: string;
  value: number;
  color: string;
}

interface TopListing {
  name: string;
  views: string;
  saves: string;
  sales: string;
  status: string;
  engagement: string;
}

interface SocialSignal {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
}

/* ─────────────────── icon map for social signals ─────────────────── */
const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
  followers: Users,
  ctr: Play,
  collabs: Share2,
  wishlist: Heart,
  review: Star,
  live: Flame,
};

/* ─────────────────── base URL ─────────────────── */
const API_BASE = "http://localhost:3000";

/* ─────────────────── custom tooltip ─────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "var(--shadow-lg)",
        fontFamily: "Outfit, sans-serif",
      }}>
        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginBottom: "6px" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: "13px", fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue")
              ? `RWF ${p.value.toLocaleString()}`
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─────────────────── status badge style ─────────────────── */
const statusStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    "Top performer": { background: "color-mix(in oklch, var(--primary) 25%, transparent)", color: "var(--link)", border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)" },
    "Growing":       { background: "color-mix(in oklch, var(--chart-2) 20%, transparent)", color: "var(--chart-2)", border: "1px solid color-mix(in oklch, var(--chart-2) 40%, transparent)" },
    "Needs promo":   { background: "color-mix(in oklch, var(--destructive) 15%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in oklch, var(--destructive) 30%, transparent)" },
  };
  return map[status] ?? { background: "var(--muted)", color: "var(--muted-foreground)" };
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function SellerAnalyticsDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [orderPipeline, setOrderPipeline] = useState<OrderStatus[]>([]);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [socialSignals, setSocialSignals] = useState<SocialSignal[]>([]);

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  /* ── fetch current user ── */
  useEffect(() => {
    const ctrl = new AbortController();
    axios.get(`${API_BASE}/api/auth/me`, { signal: ctrl.signal })
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
    return () => ctrl.abort();
  }, []);

  /* ── fetch analytics ── */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const end = new Date();
      const start = subDays(end, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);

      const res = await axios.get(`${API_BASE}/api/seller/analytics`, {
        params: {
          timeRange,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      const data = res.data;
      if (data.summary)       setAnalytics(data.summary);
      if (data.revenueTrend)  setRevenueData(data.revenueTrend);
      if (data.topProducts)   setProductData(data.topProducts);
      if (data.orderPipeline) setOrderPipeline(data.orderPipeline);
      if (data.topListings)   setTopListings(data.topListings);
      if (data.socialSignals) {
        // Attach icon components based on a key provided by the API
        setSocialSignals(
          data.socialSignals.map((s: any) => ({
            ...s,
            icon: SOCIAL_ICON_MAP[s.iconKey] ?? Star,
          }))
        );
      }
    } catch {
      setError("Failed to load analytics. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  /* format helpers */
  const fmtRWF = (n: number) =>
    new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(n);

  /* KPI cards — derived from live analytics only */
  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      { icon: DollarSign, label: "Total Revenue",     value: fmtRWF(analytics.revenue),                       change: null, note: `vs last ${timeRange}` },
      { icon: ShoppingCart, label: "Total Orders",    value: analytics.orders.toLocaleString(),                change: null, note: "Pending fulfillment tracked separately" },
      { icon: TrendingUp, label: "Conversion Rate",   value: `${(analytics.conversionRate * 100).toFixed(1)}%`, change: null, note: "From product page visits" },
      { icon: Users, label: "Unique Customers",       value: analytics.totalCustomers.toLocaleString(),        change: null, note: "Across all channels" },
    ];
  }, [analytics, timeRange]);

  /* ── shared card style ── */
  const card: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
    borderRadius: "16px",
    padding: "24px",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "Playfair Display, serif",
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "var(--foreground)",
    marginBottom: "4px",
  };

  const subText: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--muted-foreground)",
    marginBottom: "20px",
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <AppLayout>
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6"
        style={{ background: "var(--bg)", color: "var(--foreground)", fontFamily: "Outfit, sans-serif" }}
      >
        {/* ══ HEADER ══ */}
        <header style={{ ...card, padding: "28px 32px" }}>
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--link)", fontWeight: 600, marginBottom: "6px" }}>
                Social Commerce · Seller HQ
              </p>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "var(--foreground)", lineHeight: 1.15 }}>
                Analytics Dashboard
              </h1>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--muted-foreground)", maxWidth: "480px" }}>
                Monitor revenue, track social-driven conversions, and scale your commerce listings.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  userLoading ? "Loading user…" : `Seller: ${user?.name ?? "Unknown"}`,
                  `Role: ${user?.role ?? "seller"}`,
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/listings/new")}
                className="auth-btn"
                style={{ width: "auto", padding: "10px 22px", gap: "8px" }}
              >
                <Zap size={16} /> New Listing
              </button>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="auth-social"
                style={{ width: "auto", padding: "10px 22px" }}
              >
                <MessageCircle size={16} /> Buyer Chats
              </button>
            </div>
          </div>
        </header>

        {/* ══ ERROR BANNER ══ */}
        {error && (
          <div
            className="flex items-center gap-3"
            style={{ ...card, background: "color-mix(in oklch, var(--destructive) 10%, var(--card))", borderColor: "color-mix(in oklch, var(--destructive) 30%, transparent)", padding: "14px 20px" }}
          >
            <AlertCircle size={16} style={{ color: "var(--destructive)", flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: "var(--destructive)" }}>{error}</p>
            <button
              onClick={fetchAnalytics}
              style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--destructive)", background: "none", border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ══ TIME RANGE + REFRESH ══ */}
        <div
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap"
          style={{ ...card, padding: "16px 24px" }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            <Calendar size={16} style={{ color: "var(--link)" }} />
            Period:
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .2s",
                  background: timeRange === r ? "var(--primary)" : "var(--muted)",
                  color: timeRange === r ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: `1px solid ${timeRange === r ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="auth-btn"
            style={{ width: "auto", padding: "8px 20px", marginLeft: "auto", gap: "6px", fontSize: "13px" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ══ LOADING STATE ══ */}
        {loading && stats.length === 0 && (
          <div className="flex flex-col items-center py-20" style={{ color: "var(--muted-foreground)" }}>
            <RefreshCw size={32} className="animate-spin" style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>Loading analytics…</p>
          </div>
        )}

        {/* ══ KPI CARDS ══ */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <article
                key={s.label}
                style={{
                  ...card,
                  animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "var(--primary)", borderRadius: "16px 16px 0 0" }} />
                <div className="flex items-start justify-between mb-3">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: "10px",
                      background: "color-mix(in oklch, var(--primary) 15%, transparent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <s.icon size={20} style={{ color: "var(--link)" }} />
                  </div>
                </div>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2 }}>{s.value}</p>
                <p style={{ marginTop: "6px", fontSize: "12px", color: "var(--muted-foreground)" }}>{s.note}</p>
              </article>
            ))}
          </div>
        )}

        {/* ══ MAIN GRID ══ */}
        {!loading && !error && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* ── LEFT COLUMN (8 cols) ── */}
            <div className="xl:col-span-8 space-y-6">

              {/* Revenue & Orders chart */}
              {revenueData.length > 0 && (
                <section style={card}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                    <div>
                      <h2 style={sectionTitle}>Revenue & Orders Trend</h2>
                      <p style={subText}>Daily performance · {timeRange === "7d" ? "Past week" : timeRange === "30d" ? "Past 30 days" : "Past quarter"}</p>
                    </div>
                    <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1"><span style={{ width: 10, height: 3, background: "var(--primary)", display: "inline-block", borderRadius: 2 }} /> Revenue</span>
                      <span className="flex items-center gap-1"><span style={{ width: 10, height: 3, background: "var(--chart-2)", display: "inline-block", borderRadius: 2 }} /> Orders</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.8348 0.1302 160.9080)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="oklch(0.8348 0.1302 160.9080)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.6231 0.1880 259.8145)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="oklch(0.6231 0.1880 259.8145)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis dataKey="date" stroke="var(--border)" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={12} />
                      <YAxis stroke="var(--border)" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} tickMargin={8} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="oklch(0.8348 0.1302 160.9080)" strokeWidth={2.5} fill="url(#gRev)" />
                      <Area type="monotone" dataKey="orders" name="Orders" stroke="oklch(0.6231 0.1880 259.8145)" strokeWidth={2} fill="url(#gOrd)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </section>
              )}

              {/* Top Listings */}
              {topListings.length > 0 && (
                <section style={card}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 style={sectionTitle}>Top Listing Performance</h2>
                      <p style={subText}>Views · Saves · Social engagement</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/explore")}
                      className="flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "var(--link)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      View all <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {topListings.map((item, i) => (
                      <div
                        key={item.name}
                        style={{
                          background: "var(--accent)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "16px 20px",
                          animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 100}ms both`,
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--foreground)" }}>{item.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs rounded-full px-2.5 py-1 font-semibold" style={statusStyle(item.status)}>
                              {item.status}
                            </span>
                            <span
                              className="text-xs rounded-full px-2.5 py-1 font-semibold flex items-center gap-1"
                              style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)", color: "var(--link)" }}
                            >
                              <TrendingUp size={10} /> {item.engagement}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Views", val: item.views, icon: "👁" },
                            { label: "Saves", val: item.saves, icon: "❤️" },
                            { label: "Sales", val: item.sales, icon: "🛒" },
                          ].map((s) => (
                            <div key={s.label}>
                              <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{s.icon} {s.label}</p>
                              <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginTop: "2px" }}>{s.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Social Influence Signals */}
              {socialSignals.length > 0 && (
                <section style={card}>
                  <h2 style={sectionTitle}>Social Influence Signals</h2>
                  <p style={subText}>Creator collabs · Live commerce · Virality</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {socialSignals.map((sig, i) => (
                      <div
                        key={sig.label}
                        style={{
                          background: "var(--muted)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          animation: `cardIn .5s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
                        }}
                      >
                        <sig.icon size={16} style={{ color: "var(--link)", marginBottom: "8px" }} />
                        <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{sig.label}</p>
                        <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground)", margin: "4px 0 2px" }}>{sig.value}</p>
                        <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{sig.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Product Performance Scatter */}
              {productData.length > 0 && (
                <section style={card}>
                  <h2 style={sectionTitle}>Product Performance Matrix</h2>
                  <p style={subText}>Views vs Revenue correlation</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="views" name="Page Views" stroke="var(--border)" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="revenue" name="Revenue" stroke="var(--border)" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                      <Scatter name="Products" data={productData} fill="var(--primary)" />
                      <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="5 5" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </section>
              )}
            </div>

            {/* ── RIGHT SIDEBAR (4 cols) ── */}
            <aside className="xl:col-span-4 space-y-6">

              {/* Top Products bar chart */}
              {productData.length > 0 && (
                <section style={card}>
                  <h2 style={sectionTitle}>Top Products</h2>
                  <p style={subText}>Sales volume ranking</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={productData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis type="number" stroke="var(--border)" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" name="Sales" fill="oklch(0.8348 0.1302 160.9080)" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}

              {/* Order Pipeline */}
              {orderPipeline.length > 0 && (
                <section style={card}>
                  <h2 style={sectionTitle}>Order Pipeline</h2>
                  <p style={subText}>Status distribution</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={orderPipeline}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={42}
                        paddingAngle={3}
                        cornerRadius={6}
                      >
                        {orderPipeline.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "11px", color: "var(--muted-foreground)", paddingTop: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {orderPipeline.map((step) => (
                      <div
                        key={step.name}
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "var(--accent)", border: "1px solid var(--border)" }}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: step.color, display: "inline-block" }} />
                          <span style={{ fontSize: "13px", color: "var(--accent-foreground)" }}>{step.name}</span>
                        </div>
                        <span
                          style={{
                            fontSize: "12px", fontWeight: 700,
                            background: "var(--muted)", color: "var(--foreground)",
                            borderRadius: "999px", padding: "2px 10px",
                          }}
                        >
                          {step.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Actions */}
              <section style={card}>
                <h2 style={sectionTitle}>Quick Actions</h2>
                <p style={subText}>Jump to key workflows</p>
                <div className="space-y-2">
                  {[
                    { label: "Create campaign listing", path: "/listings/new", icon: Package },
                    { label: "Reply to buyer messages", path: "/chat", icon: MessageCircle },
                    { label: "Manage orders", path: "/orders", icon: ShoppingCart },
                    { label: "Edit seller profile", path: "/account", icon: Users },
                    { label: "Download reports", path: "/reports", icon: Download },
                    { label: "Run promotions", path: "/promotions", icon: Flame },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="w-full text-left rounded-xl flex items-center gap-3 transition-all"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                        padding: "10px 14px",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--ring)";
                        e.currentTarget.style.background = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--muted)";
                      }}
                    >
                      <action.icon size={15} style={{ color: "var(--link)", flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{action.label}</span>
                      <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </AppLayout>
  );
}