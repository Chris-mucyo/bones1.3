import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import AppLayout from "../../../shared/layouts/AppLayout";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Zap,
} from "lucide-react";

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

// FALLBACK DATA for when API is not ready
const FALLBACK_REVENUE_DATA: ChartDataPoint[] = [
  { date: "2024-01-15", revenue: 220000, orders: 12, visitors: 450 },
  { date: "2024-01-16", revenue: 310000, orders: 18, visitors: 520 },
  { date: "2024-01-17", revenue: 280000, orders: 15, visitors: 480 },
  { date: "2024-01-18", revenue: 420000, orders: 25, visitors: 650 },
  { date: "2024-01-19", revenue: 510000, orders: 32, visitors: 780 },
  { date: "2024-01-20", revenue: 640000, orders: 41, visitors: 920 },
  { date: "2024-01-21", revenue: 720000, orders: 48, visitors: 1050 },
];

const FALLBACK_PRODUCT_DATA: ProductPerformance[] = [
  { id: "1", name: "Wireless Earbuds", sales: 327, revenue: 2340000, views: 4500, conversionRate: 0.073 },
  { id: "2", name: "Ring Light", sales: 221, revenue: 1650000, views: 3200, conversionRate: 0.069 },
  { id: "3", name: "Desk Lamp", sales: 149, revenue: 1120000, views: 2100, conversionRate: 0.071 },
  { id: "4", name: "Mouse Pad", sales: 102, revenue: 780000, views: 1450, conversionRate: 0.070 },
];

const FALLBACK_ORDER_PIPELINE: OrderStatus[] = [
  { name: "New", value: 14, color: "#6366f1" },
  { name: "Packed", value: 9, color: "#8b5cf6" },
  { name: "Transit", value: 23, color: "#06b6d4" },
  { name: "Delivered", value: 127, color: "#10b981" },
];

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>(FALLBACK_REVENUE_DATA);
  const [productData, setProductData] = useState<ProductPerformance[]>(FALLBACK_PRODUCT_DATA);
  const [orderPipeline, setOrderPipeline] = useState<OrderStatus[]>(FALLBACK_ORDER_PIPELINE);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch user data
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("/api/auth/me", { signal: controller.signal })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/seller/analytics", {
        params: { 
          timeRange, 
          startDate: dateRange.start.toISOString(), 
          endDate: dateRange.end.toISOString() 
        },
      });
      
      setAnalytics(response.data.summary);
      setRevenueData(response.data.revenueTrend || FALLBACK_REVENUE_DATA);
      setProductData(response.data.topProducts || FALLBACK_PRODUCT_DATA);
      setOrderPipeline(response.data.orderPipeline || FALLBACK_ORDER_PIPELINE);
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Keep fallback data on error
    } finally {
      setLoading(false);
    }
  }, [timeRange, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Time range handler
  const setTimeRangeHandler = (range: "7d" | "30d" | "90d") => {
    const end = new Date();
    const start = subDays(end, range === "7d" ? 7 : range === "30d" ? 30 : 90);
    setDateRange({ start, end });
    setTimeRange(range);
  };

  // Stats cards with safe data access
  const stats = useMemo(() => {
    if (!analytics) {
      return [
        {
          icon: DollarSign,
          label: "Total Revenue",
          value: formatCurrency(4860000),
          change: "+18.4%",
          trend: "up" as "up" | "down",
          period: "30 days",
        },
        {
          icon: ShoppingCart,
          label: "Total Orders",
          value: "173",
          change: "+12.3%",
          trend: "up" as "up" | "down",
          period: "30 days",
        },
        {
          icon: TrendingUp,
          label: "Conversion Rate",
          value: "7.9%",
          change: "+1.2%",
          trend: "up" as "up" | "down",
          period: "vs last period",
        },
        {
          icon: Users,
          label: "Unique Customers",
          value: "1,247",
          change: "+8.7%",
          trend: "up" as "up" | "down",
          period: "30 days",
        },
      ];
    }
    
    return [
      {
        icon: DollarSign,
        label: "Total Revenue",
        value: formatCurrency(analytics.revenue),
        change: "+18.4%",
        trend: "up" as "up" | "down",
        period: "30 days",
      },
      {
        icon: ShoppingCart,
        label: "Total Orders",
        value: analytics.orders.toLocaleString(),
        change: "+12.3%",
        trend: "up" as "up" | "down",
        period: "30 days",
      },
      {
        icon: TrendingUp,
        label: "Conversion Rate",
        value: `${(analytics.conversionRate * 100).toFixed(1)}%`,
        change: "+1.2%",
        trend: "up" as "up" | "down",
        period: "vs last period",
      },
      {
        icon: Users,
        label: "Unique Customers",
        value: analytics.totalCustomers.toLocaleString(),
        change: "+8.7%",
        trend: "up" as "up" | "down",
        period: "30 days",
      },
    ];
  }, [analytics]);

  const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

  if (loading && !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Seller Analytics Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Monitor your business performance, track revenue growth, and optimize your listings
              </p>
              <div className="mt-4 flex gap-3 flex-wrap">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium text-white border border-white/30">
                  Welcome back, {user?.name || "Seller"}
                </span>
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-white border border-white/20">
                  Role: <span className="capitalize">{user?.role || "seller"}</span>
                </span>
                {!isDataLoaded && (
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-100 rounded-xl text-sm font-medium border border-yellow-500/30">
                    Using demo data
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate("/listings/new")}
                className="flex items-center gap-2 px-6 py-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-2xl font-semibold text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50"
              >
                <Zap size={20} />
                + New Listing
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Buyer Chats
              </button>
            </div>
          </div>
        </header>

        {/* Time Range Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
            <Calendar size={20} />
            <span>Analytics Period:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRangeHandler(range)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                  timeRange === range
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-white/70 hover:bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="ml-auto flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative rounded-2xl p-6 md:p-8 bg-white/70 backdrop-blur-sm border border-white/40 hover:border-white/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon size={32} className="text-gray-500 group-hover:text-blue-500 transition-all duration-300 scale-100 group-hover:scale-110" />
                  <div className={`text-xs md:text-sm px-3 py-1 rounded-full font-semibold shadow-sm ${
                    stat.trend === "up"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm md:text-base font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{stat.value}</p>
                <p className="mt-2 text-xs md:text-sm text-gray-500 font-medium">{stat.period}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <section className="xl:col-span-2 2xl:col-span-2 rounded-3xl p-8 bg-white/70 backdrop-blur-sm border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Revenue & Orders Trend</h2>
                <p className="text-gray-600 text-lg">Daily performance overview</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 rounded-xl text-sm font-medium text-gray-700">
                <Package size={16} />
                Orders | Revenue
              </div>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(0,0,0,0.4)"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={16}
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(0,0,0,0.4)"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={16}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    background: "rgba(255,255,255,0.98)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "16px",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 25px -5px rgba(0, 0,0, 0.1)"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fill="url(#revenueGradient)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  dot={{ fill: "#10b981", strokeWidth: 3, r: 6 }}
                  yAxisId={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          {/* Product Performance */}
          <section className="xl:col-span-1 2xl:col-span-1 rounded-3xl p-8 bg-white/70 backdrop-blur-sm border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Top Products</h2>
              <p className="text-gray-600 text-sm">Sales performance</p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart 
                data={(productData || []).slice(0, 6)} 
                layout="vertical"
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis 
                  type="number" 
                  stroke="rgba(0,0,0,0.4)"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="rgba(0,0,0,0.4)"
                  width={140}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar 
                  dataKey="sales" 
                  fill="#8b5cf6" 
                  radius={[6, 0, 0, 6]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Order Pipeline */}
          <section className="xl:col-span-1 2xl:col-span-1 rounded-3xl p-8 bg-white/70 backdrop-blur-sm border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Order Pipeline</h2>
              <p className="text-gray-600 text-sm">Order status distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={orderPipeline || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={60}
                  paddingAngle={3}
                  cornerRadius={8}
                >
                  {(orderPipeline || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Customer Analytics */}
          <section className="xl:col-span-2 rounded-3xl p-8 bg-white/70 backdrop-blur-sm border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Product Performance Matrix</h2>
              <p className="text-gray-600 text-sm">Views vs Revenue correlation</p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="views" 
                  name="Page Views"
                  stroke="rgba(0,0,0,0.4)"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                />
                <YAxis 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="rgba(0,0,0,0.4)"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Products" 
                  data={(productData || []).slice(0, 15)} 
                  fill="#8884d8"
                >
                  {(productData || []).slice(0, 15).map((entry, index) => (
                    <circle
                      key={`product-${index}`}
                      cx={entry.views}
                      cy={entry.revenue}
                      r={8}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={3}
                      className="hover:scale-125 transition-transform duration-200"
                    />
                  ))}
                </Scatter>
                <ReferenceLine y={0} stroke="rgba(0,0,0,0.2)" strokeDasharray="5 5" />
              </ScatterChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="rounded-3xl p-8 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-indigo-500/5 border border-white/20 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            Quick Actions
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">Priority</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Create New Listing", path: "/listings/new", icon: Package, bg: "from-blue-500 to-indigo-500" },
              { label: "Manage Orders", path: "/orders", icon: ShoppingCart, bg: "from-emerald-500 to-teal-500" },
              { label: "View Buyer Messages", path: "/chat", icon: Users, bg: "from-purple-500 to-pink-500" },
              { label: "Edit Store Profile", path: "/account", icon: Users, bg: "from-orange-500 to-red-500" },
              { label: "Download Reports", path: "/reports", icon: Download, bg: "from-amber-500 to-yellow-500" },
              { label: "Run Promotions", path: "/promotions", icon: TrendingUp, bg: "from-rose-500 to-fuchsia-500" },
            ].map((item, index) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="group relative flex items-center gap-4 p-6 lg:p-8 rounded-2xl bg-white/70 hover:bg-white backdrop-blur-sm border border-white/40 hover:border-white/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <item.icon 
                  size={28} 
                  className="text-gray-500 group-hover:text-gray-900 transition-all duration-300 flex-shrink-0 z-10"
                />
                <div className="z-10">
                  <p className="font-bold text-lg text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600 mt-1">Start immediately</p>
                </div>
                <ChevronRight 
                  size={24} 
                  className="ml-auto text-gray-400 group-hover:text-gray-900 transition-all duration-300 z-10"
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}