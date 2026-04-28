import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark, Flag,
  MessageCircle, Star, Check,
  MapPin, Eye,
  AlertCircle, RefreshCw, Phone, ShieldCheck, Truck,
} from 'lucide-react';
import type { Listing } from '../../home/types';
import AppLayout from '../../../shared/layouts/AppLayout';
import { useTheme } from '../../../shared/components/ThemeProvider';

// ── API SERVICE LAYER ─────────────────────────────────────

const API_BASE = '/api';

interface ListingDetail extends Listing {
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

const api = {
  getListing: async (id: string): Promise<ListingDetail> => {
    const { data } = await axios.get<ListingDetail>(`${API_BASE}/listings/${id}`);
    return {
      ...data,
      likesCount: data.likesCount ?? data.savedCount * 4,
      isLiked: data.isLiked ?? false,
      isSaved: data.isSaved ?? false,
    };
  },

  getRelated: async (id: string, category: string): Promise<Listing[]> => {
    const { data } = await axios.get<Listing[]>(`${API_BASE}/listings`, {
      params: { exclude: id, category, limit: 12 },
    });
    return data;
  },

  toggleLike: async (_listingId: string, liked: boolean): Promise<{ liked: boolean; likesCount: number }> => {
    await new Promise(r => setTimeout(r, 150));
    return { liked: !liked, likesCount: 0 };
  },

  toggleSave: async (_listingId: string, saved: boolean): Promise<{ saved: boolean }> => {
    await new Promise(r => setTimeout(r, 150));
    return { saved: !saved };
  },
};

// ── Thumbnail ─────────────────────────────────────────────
const CARD_COLORS = [
  ['#0a1a0f','#22c55e'],['#100a1a','#a855f7'],['#1a100a','#f97316'],
  ['#0a101a','#3b82f6'],['#1a0a10','#ec4899'],['#101a0a','#84cc16'],
  ['#1a1a0a','#eab308'],['#0a1a1a','#06b6d4'],
];
const EMOJIS = ['📱','👗','☕','📺','🖼️','🎧','🥑','👟','🥛','🧺','💻','🧴'];

function Thumb({ index }: { index: number }) {
  const [bg, accent] = CARD_COLORS[index % CARD_COLORS.length];
  return (
    <div className="absolute inset-0">
      <svg width="100%" height="100%" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
        <rect width="640" height="360" fill={bg} />
        <circle cx="320" cy="180" r="160" fill={accent} opacity=".05"/>
        <circle cx="320" cy="180" r="90"  fill={accent} opacity=".07"/>
        <rect x="220" y="110" width="200" height="140" rx="20" fill="none" stroke={accent} strokeWidth="1.5" opacity=".18"/>
        <circle cx="320" cy="180" r="52" fill={accent} opacity=".09"/>
        <text x="320" y="200" textAnchor="middle" fontSize="56" fill={accent} opacity=".6">
          {EMOJIS[index % EMOJIS.length]}
        </text>
      </svg>
    </div>
  );
}

// ── Suggested card ────────────────────────────────────────
function SuggestedCard({ listing, index, isDark }: { listing: Listing; index: number; isDark: boolean }) {
  const navigate = useNavigate();
  const sellerDisplay = listing.seller?.shopName || listing.seller?.name || 'Unknown seller';
  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex gap-3 cursor-pointer group rounded-xl p-2.5 transition-colors"
      style={{ ':hover': { background: 'rgba(0,0,0,0.04)' } } as React.CSSProperties}
      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 140, height: 80, background: '#f0f0f0' }}>
        <Thumb index={index} />
        {listing.badge && (
          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-500/90 text-black uppercase tracking-wide">
            {listing.badge}
          </span>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
          {listing.price >= 1000 ? `${(listing.price / 1000).toFixed(0)}k` : listing.price} RWF
        </div>
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[12.5px] font-semibold leading-snug line-clamp-2 mb-1.5" style={{ color: 'var(--text1)' }}>
          {listing.title}
        </p>
        <p className="text-[11px] truncate mb-0.5" style={{ color: 'var(--text2)' }}>
          {sellerDisplay}
          {listing.seller?.verified && <span className="ml-1 text-green-500">✓</span>}
        </p>
        <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text3)' }}>
          <Eye size={9} />{listing.views.toLocaleString()} views · {listing.createdAt}
        </p>
      </div>
    </div>
  );
}

// ── Skeleton loaders ──────────────────────────────────────
function SkeletonMain() {
  return (
    <div className="animate-pulse">
      <div className="w-full rounded-2xl" style={{ paddingTop:'56.25%', background: 'var(--bg2)' }} />
      <div className="mt-4 h-7 rounded-lg w-3/4" style={{ background: 'var(--bg2)' }} />
      <div className="mt-2 h-4 rounded w-1/2" style={{ background: 'var(--bg2)' }} />
      <div className="mt-4 flex gap-2">
        {[80,60,60,100].map((w,i) => <div key={i} className="h-9 rounded-full" style={{ width: w, background: 'var(--bg2)' }} />)}
      </div>
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-3 p-2.5">
          <div className="rounded-xl flex-shrink-0" style={{ width:140, height:80, background: 'var(--bg2)' }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 rounded w-full" style={{ background: 'var(--bg2)' }} />
            <div className="h-3.5 rounded w-4/5" style={{ background: 'var(--bg2)' }} />
            <div className="h-3 rounded w-1/2 mt-2" style={{ background: 'var(--bg2)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Badge styles ──────────────────────────────────────────
const BADGE_STYLE: Record<string, string> = {
  new:      'bg-green-500/20 text-green-400 border-green-500/30',
  hot:      'bg-orange-500/20 text-orange-400 border-orange-500/30',
  featured: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ─────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark    = theme === 'dark';

  // ── Data state ───────────────────────────────────────
  const [listing,     setListing]     = useState<ListingDetail | null>(null);
  const [related,     setRelated]     = useState<Listing[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingSide, setLoadingSide] = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────
  const [liked,      setLiked]      = useState(false);
  const [disliked,   setDisliked]   = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [activeTab,  setActiveTab]  = useState<'description'|'details'|'seller'>('description');
  const [showPhone,  setShowPhone]  = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // ── Theme class helpers ──────────────────────────────
  const mutedText  = isDark ? 'text-white/40'  : 'text-black/55';
  const cardBg     = isDark ? 'bg-[#111]'      : 'bg-white';
  const cardBorder = isDark ? 'border-white/[0.07]' : 'border-black/10';
  const cardTone   = `${cardBg} border ${cardBorder}`;
  const softButton = isDark
    ? 'border border-white/[0.1] text-white/60 hover:bg-white/[0.06] hover:text-white'
    : 'border border-black/10 text-black/70 hover:bg-black/[0.06] hover:text-black';
  const borderTone = isDark ? 'border-white/[0.07]' : 'border-black/[0.08]';
  const tabIdle    = isDark ? 'text-white/35'  : 'text-black/50';
  const divider    = isDark ? 'bg-white/[0.07]' : 'bg-black/[0.08]';

  // ── Fetch listing ────────────────────────────────────
  const fetchListing = async (listingId: string) => {
    setLoadingMain(true); setError(null);
    try {
      const data = await api.getListing(listingId);
      setListing(data);
      setLiked(data.isLiked);
      setSaved(data.isSaved);
      setLikesCount(data.likesCount);
    } catch {
      setError('Failed to load listing. Please try again.');
    } finally {
      setLoadingMain(false);
    }
  };

  const fetchRelated = async (listingId: string, category: string) => {
    setLoadingSide(true);
    try {
      const data = await api.getRelated(listingId, category);
      setRelated(data);
    } catch { /* silent */ }
    finally { setLoadingSide(false); }
  };

  useEffect(() => {
    if (!id) return;
    setListing(null); setRelated([]);
    setLiked(false); setDisliked(false); setSaved(false);
    setActiveTab('description'); setShowPhone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchListing(id);
  }, [id]);

  useEffect(() => {
    if (listing) fetchRelated(id!, listing.category);
  }, [listing?.id]);

  // ── Actions ──────────────────────────────────────────
  const handleLike = async () => {
    if (!listing) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    if (disliked) setDisliked(false);
    setLikesCount(n => wasLiked ? n - 1 : n + 1);
    try {
      await api.toggleLike(listing.id, wasLiked);
    } catch {
      setLiked(wasLiked);
      setLikesCount(n => wasLiked ? n + 1 : n - 1);
    }
  };

  const handleSave = async () => {
    if (!listing) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      await api.toggleSave(listing.id, wasSaved);
    } catch {
      setSaved(wasSaved);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const idx = listing ? (parseInt(String(listing.id ?? '').replace(/\D/g,'') || '0') % 12) : 0;

  const seller = listing?.seller ?? {
    id: '', name: '', shopName: '', verified: false,
    rating: 0, totalSales: 0, avatar: '',
  };
  const sellerDisplay = seller.shopName || seller.name || 'Unknown seller';

  return (
    <AppLayout>
      <div style={{ minHeight: '100vh', overflow: 'hidden', fontFamily: "'Outfit',sans-serif", background: 'var(--bg)', color: 'var(--text1)' }}>

        {/* ── Share toast ── */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-green-500 text-black text-[13px] font-bold rounded-full shadow-xl"
            style={{ animation:'fadeUp .3s ease both' }}>
            <Check size={14} /> Link copied!
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className={`flex flex-col items-center justify-center py-24 gap-4 ${mutedText}`}>
            <AlertCircle size={40} className="text-red-400 opacity-60" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchListing(id!)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all ${softButton}`}
            >
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        {/* ── Main layout ── */}
        {!error && (
          <div className="flex flex-col xl:flex-row">

            {/* ════ LEFT — player + details ════ */}
            <div className="flex-1 min-w-0 px-4 md:px-8 xl:px-10 py-6 xl:max-w-[calc(100%-480px)]">

              {loadingMain ? <SkeletonMain /> : listing && (<>

                {/* 16:9 product visual */}
                <div className={`relative w-full rounded-2xl overflow-hidden border ${isDark ? 'bg-[#0f0f0f] border-white/[0.07]' : 'bg-white border-black/10'}`}
                  style={{ paddingTop:'56.25%' }}>
                  <Thumb index={idx} />

                  {listing.badge && (
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide backdrop-blur-sm ${BADGE_STYLE[listing.badge]}`}>
                      {listing.badge}
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize backdrop-blur-sm ${isDark ? 'bg-black/75 text-white/60 border border-white/[0.1]' : 'bg-white/90 text-black/60 border border-black/10'}`}>
                    {listing.condition}
                  </span>
                  <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/25 shadow-xl">
                    <span className="text-[22px] font-black text-green-500">
                      {listing.currency} {listing.price?.toLocaleString() ?? '0'}
                    </span>
                  </div>
                  <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 backdrop-blur-sm px-3 py-1.5 rounded-lg border ${isDark ? 'bg-black/70 border-white/[0.07]' : 'bg-white/90 border-black/10'}`}>
                    <Eye size={11} className={mutedText} />
                    <span className={`text-[11px] font-medium ${mutedText}`}>{listing.views?.toLocaleString() ?? '0'} views</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-[21px] md:text-[24px] font-bold leading-tight mt-5 mb-2">
                  {listing.title}
                </h1>

                {/* Meta */}
                <div className={`flex items-center gap-3 text-[12px] flex-wrap mb-5 ${mutedText}`}>
                  <span className="flex items-center gap-1"><MapPin size={11}/>{listing.location}</span>
                  <span>·</span>
                  <span>{listing.createdAt?.toLocaleString() ?? ''}</span>
                  <span>·</span>
                  <span className={`capitalize px-2.5 py-0.5 rounded-full border ${cardTone}`}>{listing.category}</span>
                </div>

                {/* ── Action bar ── */}
                <div className={`flex items-center justify-between py-3.5 border-y mb-6 gap-2 flex-wrap ${borderTone}`}>
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Like / Dislike */}
                    <div className={`flex items-center rounded-full border overflow-hidden ${softButton}`}>
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all
                          ${liked ? 'bg-green-500/15 text-green-500' : ''}`}
                      >
                        <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} />
                        <span>{likesCount.toLocaleString()}</span>
                      </button>
                      <div className={`w-px h-5 ${divider}`} />
                      <button
                        onClick={() => {
                          setDisliked(d => !d);
                          if (liked) { setLiked(false); setLikesCount(n => n - 1); }
                        }}
                        className={`px-3 py-2 transition-all ${disliked
                          ? 'bg-red-500/10 text-red-400'
                          : isDark
                            ? 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                            : 'text-black/70 hover:bg-black/[0.06] hover:text-black'}`}
                      >
                        <ThumbsDown size={14} fill={disliked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <button
                      onClick={handleShare}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all ${softButton}`}
                    >
                      <Share2 size={13}/> Share
                    </button>

                    <button
                      onClick={handleSave}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all
                        ${saved
                          ? 'border-green-500/40 bg-green-500/10 text-green-500'
                          : softButton}`}
                    >
                      <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
                      {saved ? 'Saved' : 'Save'}
                    </button>

                    <Link
                      to={`/chat?seller=${encodeURIComponent(sellerDisplay)}&item=${encodeURIComponent(listing.title)}&price=${listing.price}`}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-black font-bold text-[13px] transition-all no-underline shadow-lg shadow-green-500/20"
                    >
                      <MessageCircle size={13}/> Chat seller
                    </Link>
                  </div>

                  <button className={`p-2 rounded-full transition-all ${isDark
                    ? 'text-white/25 hover:text-white/60 hover:bg-white/[0.06]'
                    : 'text-black/40 hover:text-black/75 hover:bg-black/[0.06]'}`}>
                    <Flag size={14}/>
                  </button>
                </div>

                {/* ── Seller card ── */}
                <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border mb-6 ${cardTone}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-black flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                      {String(seller.name ?? '').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[14px] font-bold">{sellerDisplay}</span>
                        {seller.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] ${mutedText}`}>
                        <span className="flex items-center gap-0.5">
                          {[...Array(5)].map((_,i) => (
                            <Star key={i} size={9}
                              fill={i < Math.floor(seller.rating) ? '#22c55e' : 'none'}
                              className={i < Math.floor(seller.rating) ? 'text-green-500' : isDark ? 'text-white/15' : 'text-black/20'}
                            />
                          ))}
                          <span className="ml-1">{seller.rating}</span>
                        </span>
                        <span>·</span>
                        <span>{seller.totalSales.toLocaleString()} sales</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/chat?seller=${encodeURIComponent(sellerDisplay)}&item=${encodeURIComponent(listing.title)}&price=${listing.price}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-[12px] transition-all no-underline"
                    >
                      <MessageCircle size={12}/> Chat
                    </Link>
                    <button
                      onClick={() => setShowPhone(s => !s)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[12px] font-semibold transition-all ${softButton}`}
                    >
                      <Phone size={12}/>
                      {showPhone ? listing.location : 'Call'}
                    </button>
                  </div>
                </div>

                {/* ── Buyer confidence strip ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">
                  <div className={`rounded-xl border p-3.5 flex items-start gap-2.5 ${cardTone}`}>
                    <ShieldCheck size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-semibold">Verified seller signals</p>
                      <p className={`text-[11px] mt-1 ${mutedText}`}>Seller profile, rating, and order history visible before you buy.</p>
                    </div>
                  </div>
                  <div className={`rounded-xl border p-3.5 flex items-start gap-2.5 ${cardTone}`}>
                    <Truck size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-semibold">Delivery coordination</p>
                      <p className={`text-[11px] mt-1 ${mutedText}`}>Discuss pickup and delivery details directly in seller chat.</p>
                    </div>
                  </div>
                  <div className={`rounded-xl border p-3.5 flex items-start gap-2.5 ${cardTone}`}>
                    <Phone size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-semibold">Fast response path</p>
                      <p className={`text-[11px] mt-1 ${mutedText}`}>Use chat first, then call when both sides are ready to close.</p>
                    </div>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className={`flex border-b mb-5 ${borderTone}`}>
                  {(['description','details','seller'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 text-[13px] font-semibold capitalize transition-all border-b-2 -mb-px
                        ${activeTab === tab ? 'border-green-500 text-green-400' : `border-transparent ${tabIdle}`}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mb-10" style={{ animation:'fadeUp .3s ease both' }} key={activeTab}>
                  {activeTab === 'description' && (
                    <p className={`text-[14px] leading-relaxed ${isDark ? 'text-white/55' : 'text-black/75'}`}>
                      {listing.description || 'No description provided.'}
                    </p>
                  )}
                  {activeTab === 'details' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        ['Category',  listing.category],
                        ['Condition', listing.condition],
                        ['Location',  listing.location],
                        ['Currency',  listing.currency],
                        ['Posted',    listing.createdAt],
                        ['Views',     listing.views.toLocaleString()],
                      ].map(([k,v]) => (
                        <div key={k} className={`p-3.5 rounded-xl border ${cardTone}`}>
                          <p className={`text-[9px] uppercase tracking-widest mb-1.5 font-bold ${isDark ? 'text-white/20' : 'text-black/45'}`}>{k}</p>
                          <p className="text-[13px] font-semibold capitalize">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'seller' && (
                    <div className={`rounded-2xl border overflow-hidden ${borderTone}`}>
                      {[
                        ['Shop name',   sellerDisplay],
                        ['Rating',      `${seller.rating} / 5`],
                        ['Total sales', seller.totalSales.toLocaleString()],
                        ['Verified',    seller.verified ? '✓ Verified' : 'Not verified'],
                        ['Seller ID',   seller.id],
                      ].map(([k,v], i, arr) => (
                        <div
                          key={k}
                          className={`flex justify-between items-center px-4 py-3.5 ${i < arr.length - 1 ? `border-b ${isDark ? 'border-white/[0.05]' : 'border-black/10'}` : ''}`}
                        >
                          <span className={`text-[13px] ${mutedText}`}>{k}</span>
                          <span className={`text-[13px] font-semibold ${k === 'Verified' && seller.verified ? 'text-green-500' : ''}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>)}
            </div>

            {/* ════ RIGHT — suggested sidebar ════ */}
            <div className={`w-full xl:w-[460px] 2xl:w-[500px] flex-shrink-0 xl:border-l border-t xl:border-t-0 ${borderTone}`}>
              <div className="xl:sticky xl:top-[72px] xl:max-h-[calc(100vh-72px)] xl:overflow-y-auto scrollbar-none px-5 py-6">
                <h3 className={`text-[11px] font-bold uppercase tracking-[2px] mb-4 ${mutedText}`}>Related Listings</h3>

                {loadingSide ? <SkeletonSidebar /> : (
                  <div className="flex flex-col gap-1">
                    {related.map((l) => {
                      const relIdx = parseInt(String(l.id ?? '').replace(/\D/g,'') || '0') % 12;
                      return <SuggestedCard key={l.id} listing={l} index={relIdx} isDark={isDark} />;
                    })}
                    {!related.length && (
                      <div className={`rounded-xl border px-4 py-6 text-sm text-center ${cardTone} ${mutedText}`}>
                        No related listings yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </AppLayout>
  );
}