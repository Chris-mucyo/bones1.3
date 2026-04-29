import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AppLayout from "../../../shared/layouts/AppLayout";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Eye,
  MessageCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Copy,
  Printer,
} from "lucide-react";

/* ─────────────────── types ─────────────────── */
type OrderStage = "new" | "packed" | "in_transit" | "delivered" | "cancelled";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  buyer: string;
  buyerAvatar?: string;
  buyerLocation: string;
  items: OrderItem[];
  total: number;
  status: OrderStage;
  date: string;
  expectedDelivery: string;
  paymentMethod: string;
  trackingCode?: string;
  note?: string;
}

/* ─────────────────── status config ─────────────────── */
const STATUS_CONFIG: Record<OrderStage, {
  label: string;
  icon: React.ElementType;
  bg: string;
  color: string;
  border: string;
  dot: string;
  next?: OrderStage;
  nextLabel?: string;
}> = {
  new: {
    label: "New",
    icon: Clock,
    bg: "color-mix(in oklch, var(--chart-2) 15%, transparent)",
    color: "var(--chart-2)",
    border: "color-mix(in oklch, var(--chart-2) 35%, transparent)",
    dot: "oklch(0.6231 0.1880 259.8145)",
    next: "packed",
    nextLabel: "Mark as Packed",
  },
  packed: {
    label: "Packed",
    icon: Package,
    bg: "color-mix(in oklch, var(--secondary) 50%, transparent)",
    color: "oklch(0.65 0.14 100)",
    border: "color-mix(in oklch, var(--secondary) 80%, transparent)",
    dot: "oklch(0.7686 0.1647 70.0804)",
    next: "in_transit",
    nextLabel: "Mark as Shipped",
  },
  in_transit: {
    label: "In Transit",
    icon: Truck,
    bg: "color-mix(in oklch, var(--chart-3) 15%, transparent)",
    color: "var(--chart-3)",
    border: "color-mix(in oklch, var(--chart-3) 35%, transparent)",
    dot: "oklch(0.6056 0.2189 292.7172)",
    next: "delivered",
    nextLabel: "Mark as Delivered",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    bg: "color-mix(in oklch, var(--primary) 20%, transparent)",
    color: "var(--link)",
    border: "color-mix(in oklch, var(--primary) 40%, transparent)",
    dot: "oklch(0.8348 0.1302 160.9080)",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "color-mix(in oklch, var(--destructive) 12%, transparent)",
    color: "var(--destructive)",
    border: "color-mix(in oklch, var(--destructive) 30%, transparent)",
    dot: "oklch(0.5523 0.1927 32.7272)",
  },
};

const STAGES: OrderStage[] = ["new", "packed", "in_transit", "delivered", "cancelled"];

const API_BASE = "http://localhost:3000";

const fmtRWF = (n: number) =>
  new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(n);

/* ─────────────────── order detail drawer ─────────────────── */
function OrderDrawer({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStage) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const CfgIcon = cfg.icon;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", justifyContent: "flex-end",
      }}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      />

      {/* panel */}
      <div
        style={{
          position: "relative", zIndex: 1,
          width: "min(480px, 100vw)",
          height: "100%",
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-2xl)",
          overflowY: "auto",
          fontFamily: "Outfit, sans-serif",
          animation: "slideIn .25s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* header */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--card)", zIndex: 2 }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--link)", fontWeight: 600 }}>Order Detail</p>
              <h2 style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.4rem", color: "var(--foreground)", marginTop: "2px" }}>
                {order.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", color: "var(--muted-foreground)", fontFamily: "Outfit, sans-serif", fontSize: "13px" }}
            >
              ✕ Close
            </button>
          </div>

          {/* status badge */}
          <div className="flex items-center gap-2 mt-4">
            <span
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              <CfgIcon size={12} /> {cfg.label}
            </span>
            {order.trackingCode && (
              <span
                className="flex items-center gap-1 text-xs rounded-full px-3 py-1 cursor-pointer"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                onClick={() => navigator.clipboard?.writeText(order.trackingCode!)}
              >
                <Copy size={10} /> {order.trackingCode}
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "24px" }} className="space-y-6">
          {/* buyer info */}
          <div style={{ background: "var(--accent)", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "8px" }}>Buyer</p>
            <p style={{ fontWeight: 700, fontSize: "15px", color: "var(--foreground)" }}>{order.buyer}</p>
            <p className="flex items-center gap-1 mt-1" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              <MapPin size={11} /> {order.buyerLocation}
            </p>
          </div>

          {/* dates */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Order Date", value: order.date, icon: Calendar },
              { label: "Expected Delivery", value: order.expectedDelivery, icon: Truck },
            ].map((d) => (
              <div key={d.label} style={{ background: "var(--muted)", borderRadius: "10px", padding: "12px", border: "1px solid var(--border)" }}>
                <p className="flex items-center gap-1" style={{ fontSize: "11px", color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  <d.icon size={11} /> {d.label}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>{d.value}</p>
              </div>
            ))}
          </div>

          {/* items */}
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "10px" }}>Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between" style={{ background: "var(--accent)", borderRadius: "10px", padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>{item.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Qty: {item.qty}</p>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)" }}>{fmtRWF(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* total */}
          <div className="flex items-center justify-between" style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)", borderRadius: "12px", padding: "16px", border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)" }}>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--foreground)" }}>Order Total</p>
            <p style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--link)" }}>{fmtRWF(order.total)}</p>
          </div>

          {/* payment */}
          <div style={{ background: "var(--muted)", borderRadius: "10px", padding: "12px 14px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>Payment Method</p>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginTop: "3px" }}>{order.paymentMethod}</p>
          </div>

          {/* note */}
          {order.note && (
            <div className="flex items-start gap-2" style={{ background: "color-mix(in oklch, var(--chart-4) 12%, transparent)", borderRadius: "10px", padding: "12px 14px", border: "1px solid color-mix(in oklch, var(--chart-4) 30%, transparent)" }}>
              <AlertCircle size={14} style={{ color: "oklch(0.7686 0.1647 70.0804)", marginTop: "1px", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--foreground)" }}>{order.note}</p>
            </div>
          )}

          {/* actions */}
          <div className="space-y-2 pt-2">
            {cfg.next && (
              <button
                onClick={() => { onStatusChange(order.id, cfg.next!); onClose(); }}
                className="auth-btn"
                style={{ width: "100%", gap: "8px" }}
              >
                <ChevronRight size={15} /> {cfg.nextLabel}
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button className="auth-social" style={{ width: "100%", fontSize: "12px", padding: "10px" }}>
                <MessageCircle size={13} /> Message Buyer
              </button>
              <button className="auth-social" style={{ width: "100%", fontSize: "12px", padding: "10px" }}>
                <Printer size={13} /> Print Label
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SellerOrdersPage() {
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStage | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 6;

  /* fetch orders */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/seller/orders`);
      if (res.data?.orders?.length) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError("Failed to load orders. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* status change handler — optimistic update + API call */
  const handleStatusChange = useCallback(async (id: string, status: OrderStage) => {
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await axios.patch(`${API_BASE}/api/seller/orders/${id}/status`, { status });
    } catch {
      // Revert on failure by re-fetching
      fetchOrders();
    }
  }, [fetchOrders]);

  /* filtered + paginated */
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.buyer.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /* pipeline counts */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STAGES.forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  /* revenue from delivered */
  const deliveredRevenue = useMemo(
    () => orders.filter((o) => o.status === "delivered").reduce((acc, o) => acc + o.total, 0),
    [orders]
  );

  /* shared styles */
  const card: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
    borderRadius: "16px",
    padding: "20px 24px",
  };

  /* ── RENDER ── */
  return (
    <AppLayout>
      <div
        className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6"
        style={{ background: "var(--bg)", color: "var(--foreground)", fontFamily: "Outfit, sans-serif" }}
      >
        {/* ══ HEADER ══ */}
        <header style={{ ...card }}>
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--link)", fontWeight: 600, marginBottom: "4px" }}>
                Seller HQ · Order Management
              </p>
              <h1 style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "var(--foreground)", lineHeight: 1.15 }}>
                Orders
              </h1>
              <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginTop: "6px" }}>
                Track, update, and manage every order from your store.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="auth-social"
                style={{ width: "auto", padding: "10px 18px", fontSize: "13px" }}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button
                className="auth-btn"
                style={{ width: "auto", padding: "10px 18px", fontSize: "13px", gap: "6px" }}
                onClick={async () => {
                  try {
                    const res = await axios.get(`${API_BASE}/api/seller/orders/export`, { responseType: "blob" });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "orders.csv");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch {
                    alert("Export failed. Please try again.");
                  }
                }}
              >
                <Download size={14} /> Export CSV
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
              onClick={fetchOrders}
              style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--destructive)", background: "none", border: "none", cursor: "pointer", fontFamily: "Outfit, sans-serif" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ══ SUMMARY PILLS ══ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* all */}
          <button
            onClick={() => { setFilterStatus("all"); setCurrentPage(1); }}
            style={{
              ...card,
              padding: "14px 16px",
              cursor: "pointer",
              border: filterStatus === "all" ? "1px solid var(--ring)" : "1px solid var(--border)",
              background: filterStatus === "all" ? "color-mix(in oklch, var(--primary) 10%, var(--card))" : "var(--card)",
              textAlign: "left",
              transition: "all .2s",
              animation: "cardIn .4s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>All Orders</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "4px" }}>{counts.all}</p>
          </button>

          {STAGES.map((stage, i) => {
            const cfg = STATUS_CONFIG[stage];
            const CfgIcon = cfg.icon;
            const active = filterStatus === stage;
            return (
              <button
                key={stage}
                onClick={() => { setFilterStatus(stage); setCurrentPage(1); }}
                style={{
                  ...card,
                  padding: "14px 16px",
                  cursor: "pointer",
                  border: active ? `1px solid ${cfg.border}` : "1px solid var(--border)",
                  background: active ? cfg.bg : "var(--card)",
                  textAlign: "left",
                  transition: "all .2s",
                  animation: `cardIn .4s cubic-bezier(.22,1,.36,1) ${(i + 1) * 70}ms both`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CfgIcon size={12} style={{ color: cfg.color }} />
                  <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted-foreground)" }}>{cfg.label}</p>
                </div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: active ? cfg.color : "var(--foreground)" }}>{counts[stage] ?? 0}</p>
              </button>
            );
          })}
        </div>

        {/* ══ REVENUE STRIP ══ */}
        <div
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          style={{ ...card, background: "color-mix(in oklch, var(--primary) 8%, var(--card))", borderColor: "color-mix(in oklch, var(--primary) 30%, transparent)" }}
        >
          <TrendingUp size={20} style={{ color: "var(--link)", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Revenue from Delivered Orders</p>
            <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--link)" }}>{fmtRWF(deliveredRevenue)}</p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Pending fulfillment value</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>
              {fmtRWF(orders.filter((o) => o.status === "new" || o.status === "packed").reduce((a, o) => a + o.total, 0))}
            </p>
          </div>
        </div>

        {/* ══ SEARCH + FILTER ROW ══ */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
            <input
              className="auth-field"
              style={{ paddingLeft: "40px" }}
              placeholder="Search by order ID, buyer name, or product…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="auth-social"
              style={{ width: "auto", padding: "10px 16px", fontSize: "13px", gap: "6px" }}
              onClick={() => { setSearch(""); setFilterStatus("all"); setCurrentPage(1); }}
            >
              <Filter size={13} /> Clear filters
            </button>
          </div>
        </div>

        {/* ══ LOADING STATE ══ */}
        {loading && orders.length === 0 && (
          <div className="flex flex-col items-center py-20" style={{ color: "var(--muted-foreground)" }}>
            <RefreshCw size={32} className="animate-spin" style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>Loading orders…</p>
          </div>
        )}

        {/* ══ ORDERS TABLE ══ */}
        {!loading || orders.length > 0 ? (
          <section style={card}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--foreground)" }}>
                {filtered.length} order{filtered.length !== 1 ? "s" : ""} {filterStatus !== "all" ? `· ${STATUS_CONFIG[filterStatus as OrderStage]?.label}` : ""}
              </h2>
            </div>

            {/* table header — desktop */}
            <div
              className="hidden md:grid"
              style={{
                gridTemplateColumns: "1.4fr 1.2fr 1fr 0.9fr 1fr 0.7fr",
                padding: "8px 12px",
                marginBottom: "6px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["Order ID", "Buyer", "Items", "Total", "Status", ""].map((h) => (
                <p key={h} style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 600 }}>{h}</p>
              ))}
            </div>

            {/* rows */}
            <div className="space-y-2">
              {paginated.length === 0 ? (
                <div className="flex flex-col items-center py-16" style={{ color: "var(--muted-foreground)" }}>
                  <ShoppingBag size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>No orders found</p>
                  <p style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your search or filter.</p>
                </div>
              ) : (
                paginated.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const CfgIcon = cfg.icon;
                  return (
                    <div
                      key={order.id}
                      className="group rounded-xl transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--accent)",
                        animation: `cardIn .35s cubic-bezier(.22,1,.36,1) ${i * 50}ms both`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ring)"; e.currentTarget.style.background = "color-mix(in oklch, var(--primary) 5%, var(--card))"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--accent)"; }}
                    >
                      {/* mobile card layout */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "13px", color: "var(--foreground)" }}>{order.id}</p>
                            <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>{order.buyer}</p>
                          </div>
                          <span
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                          >
                            <CfgIcon size={10} /> {cfg.label}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                          {order.items.map((i) => i.name).join(", ")}
                        </p>
                        <div className="flex items-center justify-between">
                          <p style={{ fontWeight: 700, color: "var(--foreground)" }}>{fmtRWF(order.total)}</p>
                          <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{order.date}</p>
                        </div>
                      </div>

                      {/* desktop row layout */}
                      <div
                        className="hidden md:grid items-center"
                        style={{
                          gridTemplateColumns: "1.4fr 1.2fr 1fr 0.9fr 1fr 0.7fr",
                          padding: "14px 12px",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: "var(--foreground)" }}>{order.id}</p>
                          <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>{order.date}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>{order.buyer}</p>
                          <p className="flex items-center gap-0.5 mt-0.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                            <MapPin size={9} /> {order.buyerLocation}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: "12px", color: "var(--foreground)" }}>{order.items[0].name}</p>
                          {order.items.length > 1 && (
                            <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>+{order.items.length - 1} more</p>
                          )}
                        </div>
                        <p style={{ fontWeight: 700, fontSize: "13px", color: "var(--foreground)" }}>{fmtRWF(order.total)}</p>
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold w-fit"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                          {cfg.next && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, cfg.next!); }}
                              title={cfg.nextLabel}
                              style={{
                                background: "color-mix(in oklch, var(--primary) 15%, transparent)",
                                border: "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
                                borderRadius: "8px",
                                padding: "5px 8px",
                                cursor: "pointer",
                                color: "var(--link)",
                                fontSize: "11px",
                                fontWeight: 600,
                                fontFamily: "Outfit, sans-serif",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <ChevronRight size={12} style={{ display: "inline" }} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                            style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", color: "var(--muted-foreground)" }}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  Page {currentPage} of {totalPages} · {filtered.length} orders
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="auth-social"
                    style={{ width: "auto", padding: "7px 14px", fontSize: "13px", opacity: currentPage === 1 ? 0.4 : 1 }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: 34, height: 34, borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                        background: currentPage === p ? "var(--primary)" : "var(--muted)",
                        color: currentPage === p ? "var(--primary-foreground)" : "var(--muted-foreground)",
                        border: `1px solid ${currentPage === p ? "var(--primary)" : "var(--border)"}`,
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="auth-social"
                    style={{ width: "auto", padding: "7px 14px", fontSize: "13px", opacity: currentPage === totalPages ? 0.4 : 1 }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {/* ══ ORDER DETAIL DRAWER ══ */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </AppLayout>
  );
}