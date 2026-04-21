import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaArrowRight,
  FaBullhorn,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { Listing } from '../types';

const TRENDING_ICONS: IconType[] = [
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

function hashIndex(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % mod;
}

interface ApiResponse { listings: Listing[]; }
interface Props { isDark: boolean; }

function getAdaptiveMinDelay(): number {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  const type = connection?.effectiveType;
  if (type === 'slow-2g' || type === '2g') return 1700;
  if (type === '3g') return 1100;
  return 650;
}

export default function TrendingSection({ isDark }: Props) {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);

  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cardBg  = isDark ? '#0f0f0f' : '#ffffff';
  const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const text1   = isDark ? '#fff' : '#0f0f0f';
  const text2   = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const rankCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const pulse: React.CSSProperties = {
    background: `linear-gradient(90deg,
      ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 25%,
      ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'} 50%,
      ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };

  useEffect(() => {
    const controller = new AbortController();
    const startedAt = Date.now();
    const minDelay = getAdaptiveMinDelay();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    axios
      .get<ApiResponse>('/api/listings', {
        params: { sort: 'popular', limit: 6 },
        signal: controller.signal,
      })
      .then(res => {
        const raw = res.data;
        const array: Listing[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.listings)
          ? raw.listings
          : [];
        setListings(array);
      })
      .catch(err => { if (!axios.isCancel(err)) setListings([]); })
      .finally(() => {
        const remaining = Math.max(minDelay - (Date.now() - startedAt), 0);
        timeoutId = setTimeout(() => setLoading(false), remaining);
      });

    return () => {
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (loading) return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: cardBg }}>
            <div style={{ ...pulse, width: 28, height: 22, flexShrink: 0 }} />
            <div style={{ ...pulse, width: 56, height: 56, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...pulse, height: 12, marginBottom: 6 }} />
              <div style={{ ...pulse, height: 11, width: '60%', marginBottom: 6 }} />
              <div style={{ ...pulse, height: 14, width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
        {listings.map((listing, i) => {
          const ListingIcon = TRENDING_ICONS[hashIndex(listing.id, TRENDING_ICONS.length)];

          return (
            <div
              key={listing.id}
              onClick={() => navigate(`/listing/${listing.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: cardBg, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#22c55e';
                (e.currentTarget as HTMLDivElement).style.background = hoverBg;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = border;
                (e.currentTarget as HTMLDivElement).style.background = cardBg;
              }}
            >
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: rankCol, width: 28, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>

              <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, background: isDark ? '#111' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${border}` }}>
                <ListingIcon size={22} color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: text1, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {listing.title}
                </p>
                <p style={{ fontSize: 11, color: text2, marginBottom: 4 }}>
                  {listing.seller?.shopName ?? listing.seller?.name}
                </p>
                <p style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FaBullhorn size={9} color="#22c55e" />
                  Creator influence boosts buyer traffic
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                  {listing.currency} {listing.price.toLocaleString()}
                </p>
              </div>

              <FaArrowRight size={14} color={text2} style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </>
  );
}