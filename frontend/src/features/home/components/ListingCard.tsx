// ListingCard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMobileAlt,
  FaTshirt,
  FaHome,
  FaPaintBrush,
  FaUtensils,
  FaLaptop,
  FaClock,
  FaGuitar,
  FaBoxOpen,
  FaShoePrints,
  FaLeaf,
  FaBook,
  FaStar,
  FaMapMarkerAlt,
  FaCommentDots,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { Listing } from '../types';

interface Props {
  listingId: string | number;
  isDark:    boolean;
  index:     number;
}

const PALETTE = [
  ['#0a1a0f','#22c55e'],['#100a1a','#a855f7'],['#1a100a','#f97316'],
  ['#0a101a','#3b82f6'],['#1a0a10','#ec4899'],['#101a0a','#84cc16'],
  ['#1a1a0a','#eab308'],['#0a1a1a','#06b6d4'],
] as const;

const THUMB_ICONS: IconType[] = [
  FaMobileAlt,
  FaTshirt,
  FaHome,
  FaPaintBrush,
  FaUtensils,
  FaLaptop,
  FaClock,
  FaGuitar,
  FaBoxOpen,
  FaShoePrints,
  FaLeaf,
  FaBook,
];

function hashIndex(id: string | number, mod: number): number {
  const str = String(id);
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % mod;
}

const BADGE_COLORS: Record<string, string> = {
  new:      'rgba(34,197,94,0.88)',
  hot:      'rgba(251,146,60,0.88)',
  featured: 'rgba(59,130,246,0.88)',
};

function Skeleton({ isDark }: { isDark: boolean }) {
  const base   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const shine  = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const pulse: React.CSSProperties = {
    background: `linear-gradient(90deg, ${base} 25%, ${shine} 50%, ${base} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ paddingTop: '72%', position: 'relative' }}>
        <div style={{ ...pulse, position: 'absolute', inset: 0, borderRadius: 0 }} />
      </div>
      <div style={{ padding: '12px 12px 8px' }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
          <div style={{ ...pulse, width: 22, height: 22, borderRadius: '50%' }} />
          <div style={{ ...pulse, height: 10, flex: 1 }} />
        </div>
        <div style={{ ...pulse, height: 12, marginBottom: 6 }} />
        <div style={{ ...pulse, height: 12, width: '65%', marginBottom: 10 }} />
        <div style={{ ...pulse, height: 10, width: '45%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 10px', borderTop: `1px solid ${border}` }}>
        <div style={{ ...pulse, height: 10, width: 55 }} />
        <div style={{ ...pulse, height: 10, width: 38 }} />
        <div style={{ ...pulse, height: 24, width: 52, borderRadius: 20 }} />
      </div>
    </>
  );
}

function ListingThumb({ listingId }: { listingId: string | number }) {
  const pi = hashIndex(listingId, PALETTE.length);
  const ii = hashIndex(listingId, THUMB_ICONS.length);
  const [bg, accent] = PALETTE[pi];
  const Icon = THUMB_ICONS[ii];
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg }}>
      <svg width="100%" height="100%" viewBox="0 0 320 230" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="160" cy="100" r="55" fill={accent} opacity=".07" />
        <rect x="110" y="60" width="100" height="80" rx="12" fill="none" stroke={accent} strokeWidth="1.5" opacity=".2" />
        <circle cx="160" cy="100" r="28" fill={accent} opacity=".1" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={30} color={accent} style={{ opacity: 0.62 }} />
      </div>
    </div>
  );
}

export default function ListingCard({ listingId, isDark, index }: Props) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<Listing>(`/api/listings/${listingId}`, { signal: controller.signal })
      .then(res => setListing(res.data))
      .catch(err => {
        if (!axios.isCancel(err)) {
          setError(
            axios.isAxiosError(err)
              ? (err.response?.data?.message ?? err.message)
              : 'Failed to load'
          );
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [listingId]);

  const border   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cardBg   = isDark ? '#0f0f0f' : '#ffffff';
  const text1    = isDark ? '#ffffff' : '#0f0f0f';
  const text2    = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const text3    = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)';
  const footerBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const pi = hashIndex(listingId, PALETTE.length);
  const [avatarBg, avatarAccent] = PALETTE[pi];

  const cardStyle: React.CSSProperties = {
    borderRadius: 12, overflow: 'hidden',
    border: `1px solid ${hovered && listing ? '#22c55e' : border}`,
    background: cardBg,
    cursor: listing ? 'pointer' : 'default',
    transform: hovered && listing ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: hovered && listing ? '0 10px 30px rgba(34,197,94,0.1)' : 'none',
    transition: 'all .2s',
    animation: `cardIn .4s cubic-bezier(.22,1,.36,1) both`,
    animationDelay: `${index * 60}ms`,
  };

  if (error) return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 8 }}>
      <FaExclamationTriangle size={22} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'} />
      <span style={{ fontSize: 11, color: text3, textAlign: 'center', padding: '0 16px' }}>{error}</span>
    </div>
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardStyle}
    >
      {loading || !listing ? (
        <Skeleton isDark={isDark} />
      ) : (
        <>
          {/* Thumbnail */}
          <div style={{ position: 'relative', paddingTop: '72%', overflow: 'hidden' }}>
            <ListingThumb listingId={listingId} />

            {listing.badge && (
              <span style={{
                position: 'absolute', top: 8, left: 8,
                background: BADGE_COLORS[listing.badge] ?? 'rgba(34,197,94,0.88)',
                color: '#fff', fontSize: 9, fontWeight: 700,
                padding: '3px 8px', borderRadius: 6,
                textTransform: 'uppercase', letterSpacing: '.5px',
              }}>
                {listing.badge}
              </span>
            )}

            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.8)', color: '#fff',
              fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 8,
              backdropFilter: 'blur(6px)',
            }}>
              {listing.currency ?? ''} {listing.price?.toLocaleString() ?? '—'}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '12px 12px 8px' }}>
            {/* Seller row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: avatarBg,
                border: `1.5px solid ${avatarAccent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: avatarAccent,
              }}>
                {listing.seller?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, color: text2,
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {listing.seller?.shopName ?? listing.seller?.name ?? '—'}
              </span>
              {listing.seller?.verified && (
                <FaCheckCircle size={12} color="#22c55e" />
              )}
            </div>

            {/* Title */}
            <p style={{
              fontSize: 13, fontWeight: 600, color: text1, lineHeight: 1.45, marginBottom: 8,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {listing.title ?? '—'}
            </p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FaStar size={11} color="#fbbf24" />
              <span style={{ fontSize: 11, color: text2 }}>
                {listing.seller?.rating ?? '—'}
              </span>
              <span style={{ fontSize: 10, color: text3 }}>
                {listing.seller?.totalSales != null
                  ? `· ${listing.seller.totalSales.toLocaleString()} sales`
                  : ''}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px 10px',
            borderTop: `1px solid ${border}`,
            background: footerBg,
          }}>
            <span style={{ fontSize: 10, color: text3, display: 'flex', alignItems: 'center', gap: 3 }}>
              <FaMapMarkerAlt size={10} />
              {listing.location ?? '—'}
            </span>
            <span style={{ fontSize: 10, color: text3 }}>
              {listing.createdAt ?? ''}
            </span>

            
            <a href={`/chat?seller=${encodeURIComponent(listing.seller?.shopName ?? listing.seller?.name ?? '')}&item=${encodeURIComponent(listing.title ?? '')}&price=${listing.price ?? ''}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.12] bg-transparent text-white/55 text-[11px] font-semibold hover:border-green-500 hover:text-green-500 transition-all no-underline"
            >
              <FaCommentDots size={11} />
              Chat
            </a>
          </div>
        </>
      )}
    </div>
  );
}