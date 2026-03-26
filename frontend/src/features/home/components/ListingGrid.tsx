import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListingCard from './ListingCard';
import type { Listing } from '../types';

interface Props { category: string; search: string; isDark: boolean; }

function GridSkeleton({ isDark }: { isDark: boolean }) {
  const base   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const shine  = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const bg     = isDark ? '#0f0f0f' : '#ffffff';

  const pulse: React.CSSProperties = {
    background: `linear-gradient(90deg, ${base} 25%, ${shine} 50%, ${base} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
  };

  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}`, background: bg }}>
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
        </div>
      ))}
    </>
  );
}

interface ApiResponse {
  listings: Listing[];
}

export default function ListingGrid({ category, search, isDark }: Props) {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;

    axios
      .get<ApiResponse>('/api/listings', { params, signal: controller.signal })
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
        if (!axios.isCancel(err)) {
          setError(
            axios.isAxiosError(err)
              ? (err.response?.data?.message ?? err.message)
              : 'Failed to load listings'
          );
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, search]);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      <GridSkeleton isDark={isDark} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ fontSize: 14 }}>{error}</p>
    </div>
  );

  if (!listings.length) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <p style={{ fontSize: 14 }}>No listings found.</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {listings.map((listing, i) => (
        <div key={listing.id} onClick={() => navigate(`/listing/${listing.id}`)} style={{ cursor: 'pointer' }}>
          <ListingCard listing={listing} isDark={isDark} index={i} />
        </div>
      ))}
    </div>
  );
}