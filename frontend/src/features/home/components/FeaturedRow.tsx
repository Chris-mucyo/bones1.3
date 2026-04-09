import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { Listing } from '../types';

const PALETTE = [
  ['#0a1a0f','#22c55e'],['#100a1a','#a855f7'],['#1a100a','#f97316'],
  ['#0a101a','#3b82f6'],['#1a0a10','#ec4899'],['#101a0a','#84cc16'],
  ['#1a1a0a','#eab308'],['#0a1a1a','#06b6d4'],
] as const;

const FEATURED_ICONS: IconType[] = [
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

function hashIndex(id: string, mod: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % mod;
}

interface ApiResponse { listings: Listing[]; }
interface Props { isDark: boolean; }

export default function FeaturedRow ({ isDark }: Props) {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const cardBg = isDark ? '#0f0f0f' : '#fff';
  const text1 = isDark ? '#fff' : '#0f0f0f';

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<ApiResponse>('/api/listings', {
        params: { badge: 'featured'},
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
      .catch(err => {
        if (!axios.isCancel(err)) setListings([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

   const pulse: React.CSSProperties = {
    background: `linear-gradient(90deg,
      ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 25%,
      ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'} 50%,
      ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };

  if (loading) return (
    <>
       <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ flexShrink: 0, width: 160, borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}`, background: cardBg }}>
            <div style={{ ...pulse, height: 120, borderRadius: 0 }} />
            <div style={{ padding: '10px 10px 12px' }}>
              <div style={{ ...pulse, height: 10, marginBottom: 6 }} />
              <div style={{ ...pulse, height: 10, width: '60%', marginBottom: 8 }} />
              <div style={{ ...pulse, height: 14, width: '70%' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )


  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
        {listings.map(listing => {
          const [bg, accent] = PALETTE[hashIndex(listing.id, PALETTE.length)];
          const ListingIcon  = FEATURED_ICONS[hashIndex(listing.id, FEATURED_ICONS.length)];

          return (
            <div
              key={listing.id}
              onClick={() => navigate(`/listing/${listing.id}`)}
              style={{ flexShrink: 0, width: 160, borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}`, background: cardBg, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#22c55e';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(34,197,94,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = border;
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'relative', height: 120, background: bg }}>
                <svg width="100%" height="100%" viewBox="0 0 160 120" style={{ position: 'absolute', inset: 0 }}>
                  <rect width="160" height="120" fill={bg} />
                  <circle cx="80" cy="55" r="40" fill={accent} opacity=".08" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ListingIcon size={28} color={accent} style={{ opacity: 0.65 }} />
                </div>
                {listing.badge && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'rgba(34,197,94,0.9)', color: '#fff',
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                    textTransform: 'uppercase',
                  }}>
                    {listing.badge}
                  </span>
                )}
              </div>

              <div style={{ padding: '10px 10px 12px' }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: text1, lineHeight: 1.4, marginBottom: 4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {listing.title}
                </p>
                <p style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.55)', marginBottom: 5 }}>
                  {listing.seller?.shopName ?? listing.seller?.name}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                  {listing.currency} {listing.price.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

}