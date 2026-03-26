import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark, Flag,
  MessageCircle, Star, ChevronLeft, MoreVertical,
  MapPin, Eye, Send, Home, ShoppingBag, PlusSquare,
  BarChart2, User, Settings, Search, Bell, Check,
  Loader2, AlertCircle, RefreshCw, Phone,
} from 'lucide-react';
import type { Listing } from '../../home/types';

// ── API SERVICE LAYER ─────────────────────────────────────
// Replace BASE_URL with your actual backend when ready
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

interface Comment {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

interface ListingDetail extends Listing {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

// ── Stubbed API calls — swap out fetch() bodies when backend is live ──
const api = {
  getListing: async (id: string): Promise<ListingDetail> => {
    // TODO: return fetch(`${BASE_URL}/listings/${id}`).then(r => r.json());
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const { ALL_LISTINGS } = await import('../../home/data/listings');
    const l = ALL_LISTINGS.find(x => x.id === id) ?? ALL_LISTINGS[0];
    return { ...l, likesCount: l.savedCount * 4, commentsCount: 5, isLiked: false, isSaved: false };
  },

  getRelated: async (id: string, category: string): Promise<Listing[]> => {
    // TODO: return fetch(`${BASE_URL}/listings?category=${category}&exclude=${id}&limit=12`).then(r => r.json());
    await new Promise(r => setTimeout(r, 400));
    const { ALL_LISTINGS } = await import('../../home/data/listings');
    return ALL_LISTINGS.filter(l => l.id !== id);
  },

  getComments: async (listingId: string): Promise<Comment[]> => {
    // TODO: return fetch(`${BASE_URL}/listings/${listingId}/comments`).then(r => r.json());
    await new Promise(r => setTimeout(r, 300));
    return [
      { id:'q1', userId:'u1', user:'Alice M.',  avatar:'A', text:'Is this still available? I am in Kacyiru.',              time:'1h ago',  likes:3,  liked:false },
      { id:'q2', userId:'u2', user:'Jean P.',   avatar:'J', text:'What is the lowest you can go? I can offer 580,000.',   time:'3h ago',  likes:7,  liked:false },
      { id:'q3', userId:'u3', user:'Grace U.',  avatar:'G', text:'Bought from this seller last month — smooth 👍',         time:'5h ago',  likes:12, liked:false },
      { id:'q4', userId:'u4', user:'David K.',  avatar:'D', text:'Does it come with the original charger and earphones?', time:'1d ago',  likes:2,  liked:false },
      { id:'q5', userId:'u5', user:'Fatuma R.', avatar:'F', text:'Can you deliver to Musanze? How much extra?',           time:'2d ago',  likes:1,  liked:false },
    ];
  },

  postComment: async (listingId: string, text: string): Promise<Comment> => {
    // TODO: return fetch(`${BASE_URL}/listings/${listingId}/comments`, { method:'POST', body: JSON.stringify({ text }), headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }}).then(r => r.json());
    await new Promise(r => setTimeout(r, 200));
    return { id: `q_${Date.now()}`, userId: 'me', user: 'You', avatar: 'Y', text, time: 'Just now', likes: 0, liked: false };
  },

  toggleLike: async (listingId: string, liked: boolean): Promise<{ liked: boolean; likesCount: number }> => {
    // TODO: return fetch(`${BASE_URL}/listings/${listingId}/like`, { method: liked ? 'DELETE' : 'POST', headers:{ 'Authorization': `Bearer ${localStorage.getItem('token')}` }}).then(r => r.json());
    await new Promise(r => setTimeout(r, 150));
    return { liked: !liked, likesCount: 0 }; // count managed locally
  },

  toggleSave: async (listingId: string, saved: boolean): Promise<{ saved: boolean }> => {
    // TODO: return fetch(`${BASE_URL}/listings/${listingId}/save`, { method: saved ? 'DELETE' : 'POST', headers:{ 'Authorization': `Bearer ${localStorage.getItem('token')}` }}).then(r => r.json());
    await new Promise(r => setTimeout(r, 150));
    return { saved: !saved };
  },

  toggleCommentLike: async (commentId: string, liked: boolean): Promise<void> => {
    // TODO: fetch(`${BASE_URL}/comments/${commentId}/like`, { method: liked ? 'DELETE' : 'POST', headers:{ 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
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

// ── Side nav (collapsed) ──────────────────────────────────
const NAV = [
  { Icon: Home,          label: 'Home',      to: '/home' },
  { Icon: Search,        label: 'Search',    to: '/home' },
  { Icon: ShoppingBag,   label: 'Shop',      to: '/home' },
  { Icon: MessageCircle, label: 'Messages',  to: '/chat' },
  { Icon: PlusSquare,    label: 'Post',      to: '/listings/new' },
  { Icon: BarChart2,     label: 'Dashboard', to: '/seller/dashboard' },
  { Icon: User,          label: 'Profile',   to: '/home' },
];

function SideNav() {
  return (
    <aside className="hidden md:flex flex-col items-center py-4 gap-1 bg-[#0a0a0a] border-r border-white/[0.07] flex-shrink-0" style={{ width: 64 }}>
      <Link to="/home" className="no-underline mb-3" title="ShopHub">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
      </Link>
      {NAV.map(({ Icon, label, to }) => (
        <Link key={label} to={to} title={label} className="no-underline w-full flex justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white/25 hover:bg-white/[0.06] hover:text-white/70 transition-all">
            <Icon size={18} />
          </div>
        </Link>
      ))}
      <div className="mt-auto">
        <Link to="/home" title="Settings" className="no-underline flex justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:bg-white/[0.06] hover:text-white/40 transition-all">
            <Settings size={17} />
          </div>
        </Link>
      </div>
    </aside>
  );
}

// ── Suggested card ────────────────────────────────────────
function SuggestedCard({ listing, index }: { listing: Listing; index: number }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="flex gap-3 cursor-pointer group hover:bg-white/[0.04] rounded-xl p-2.5 transition-colors"
    >
      {/* Thumb — slightly taller for breathing room */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-[#111]" style={{ width: 140, height: 80 }}>
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

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-[12.5px] font-semibold text-white/80 group-hover:text-white leading-snug line-clamp-2 mb-1.5 transition-colors">
          {listing.title}
        </p>
        <p className="text-[11px] text-white/40 truncate mb-0.5">
          {listing.seller.shopName ?? listing.seller.name}
          {listing.seller.verified && <span className="ml-1 text-green-500">✓</span>}
        </p>
        <p className="text-[11px] text-white/20 flex items-center gap-1">
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
      <div className="w-full rounded-2xl bg-white/[0.05]" style={{ paddingTop:'56.25%' }} />
      <div className="mt-4 h-7 bg-white/[0.05] rounded-lg w-3/4" />
      <div className="mt-2 h-4 bg-white/[0.03] rounded w-1/2" />
      <div className="mt-4 flex gap-2">
        {[80,60,60,100].map((w,i) => <div key={i} className="h-9 bg-white/[0.04] rounded-full" style={{ width: w }} />)}
      </div>
    </div>
  );
}

function SkeletonSidebar() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-3 p-2.5">
          <div className="rounded-xl bg-white/[0.05] flex-shrink-0" style={{ width:140, height:80 }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-white/[0.05] rounded w-full" />
            <div className="h-3.5 bg-white/[0.04] rounded w-4/5" />
            <div className="h-3 bg-white/[0.03] rounded w-1/2 mt-2" />
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
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Data state ───────────────────────────────────────
  const [listing,      setListing]      = useState<ListingDetail | null>(null);
  const [related,      setRelated]      = useState<Listing[]>([]);
  const [comments,     setComments]     = useState<Comment[]>([]);
  const [loadingMain,  setLoadingMain]  = useState(true);
  const [loadingSide,  setLoadingSide]  = useState(true);
  const [loadingCmts,  setLoadingCmts]  = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────
  const [liked,        setLiked]        = useState(false);
  const [disliked,     setDisliked]     = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [likesCount,   setLikesCount]   = useState(0);
  const [comment,      setComment]      = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [activeTab,    setActiveTab]    = useState<'description'|'details'|'seller'>('description');
  const [showPhone,    setShowPhone]    = useState(false);
  const [shareToast,   setShareToast]   = useState(false);

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
    } catch { /* silent — sidebar can fail gracefully */ }
    finally { setLoadingSide(false); }
  };

  const fetchComments = async (listingId: string) => {
    setLoadingCmts(true);
    try {
      const data = await api.getComments(listingId);
      setComments(data);
    } catch { /* silent */ }
    finally { setLoadingCmts(false); }
  };

  useEffect(() => {
    if (!id) return;
    // Reset UI
    setListing(null); setRelated([]); setComments([]);
    setLiked(false); setDisliked(false); setSaved(false);
    setActiveTab('description'); setShowPhone(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fetch all
    fetchListing(id);
    fetchComments(id);
  }, [id]);

  useEffect(() => {
    if (listing) fetchRelated(id!, listing.category);
  }, [listing?.id]);

  // ── Actions ──────────────────────────────────────────
  const handleLike = async () => {
    if (!listing) return;
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    if (disliked) setDisliked(false);
    setLikesCount(n => wasLiked ? n - 1 : n + 1);
    try {
      await api.toggleLike(listing.id, wasLiked);
    } catch {
      // Rollback
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

  const submitComment = async () => {
    if (!comment.trim() || !listing || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await api.postComment(listing.id, comment);
      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch { /* TODO: show error toast */ }
    finally { setSubmitting(false); }
  };

  const handleCommentLike = async (cid: string) => {
    const c = comments.find(x => x.id === cid);
    if (!c) return;
    // Optimistic
    setComments(prev => prev.map(x =>
      x.id === cid ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 } : x
    ));
    try {
      await api.toggleCommentLike(cid, c.liked);
    } catch {
      setComments(prev => prev.map(x =>
        x.id === cid ? { ...x, liked: c.liked, likes: c.likes } : x
      ));
    }
  };

  // ── idx for thumb color ──────────────────────────────
  const idx = listing ? (parseInt(listing.id.replace(/\D/g,'')) || 0) % 12 : 0;

  return (
    <div className="flex min-h-screen bg-black text-white overflow-x-hidden" style={{ fontFamily:"'Outfit',sans-serif" }}>

      <SideNav />

      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-2.5 bg-black/95 backdrop-blur-xl border-b border-white/[0.07]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/40 hover:text-white transition-colors flex-shrink-0">
            <ChevronLeft size={20} />
          </button>

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 no-underline flex-shrink-0">
            <div className="w-30 h-6 rounded-md flex items-center justify-center">
              <img src="../src/assets/shophub-logo.svg" alt="" />
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:flex items-center bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.12] rounded-full px-3.5 py-1.5 transition-colors">
            <Search size={13} className="text-white/25 mr-2 flex-shrink-0" />
            <input
              placeholder="Search listings..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white transition-colors">
              <Bell size={16} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {/* ── Share toast ── */}
        {shareToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-green-500 text-black text-[13px] font-bold rounded-full shadow-xl"
            style={{ animation:'fadeUp .3s ease both' }}>
            <Check size={14} /> Link copied!
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
            <AlertCircle size={40} className="text-red-400/60" />
            <p className="text-[14px]">{error}</p>
            <button onClick={() => fetchListing(id!)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.1] hover:border-white/25 text-[13px] font-semibold transition-all">
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
                <div className="relative w-full rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/[0.07]"
                  style={{ paddingTop:'56.25%' }}>
                  {/* TODO: swap <Thumb> for <img src={listing.images[0]} className="absolute inset-0 w-full h-full object-cover" /> when images exist */}
                  <Thumb index={idx} />

                  {listing.badge && (
                    <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide backdrop-blur-sm ${BADGE_STYLE[listing.badge]}`}>
                      {listing.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/75 text-white/60 border border-white/[0.1] capitalize backdrop-blur-sm">
                    {listing.condition}
                  </span>
                  <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/25 shadow-xl">
                    <span className="text-[22px] font-black text-green-500">
                      {listing.currency} {listing.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/[0.07]">
                    <Eye size={11} className="text-white/40" />
                    <span className="text-[11px] text-white/40 font-medium">{listing.views.toLocaleString()} views</span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-[21px] md:text-[24px] font-bold text-white leading-tight mt-5 mb-2">
                  {listing.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[12px] text-white/30 flex-wrap mb-5">
                  <span className="flex items-center gap-1"><MapPin size={11}/>{listing.location}</span>
                  <span>·</span>
                  <span>{listing.createdAt}</span>
                  <span>·</span>
                  <span className="capitalize bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 rounded-full">{listing.category}</span>
                </div>

                {/* ── Action bar ── */}
                <div className="flex items-center justify-between py-3.5 border-y border-white/[0.07] mb-6 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Like / Dislike */}
                    <div className="flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] overflow-hidden">
                      <button onClick={handleLike}
                        className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-all
                          ${liked ? 'bg-green-500/15 text-green-500' : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}`}>
                        <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} />
                        <span>{likesCount.toLocaleString()}</span>
                      </button>
                      <div className="w-px h-5 bg-white/[0.1]"/>
                      <button
                        onClick={() => { setDisliked(d => !d); if (liked) { setLiked(false); setLikesCount(n => n - 1); }}}
                        className={`px-3 py-2 transition-all ${disliked ? 'bg-red-500/10 text-red-400' : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}`}>
                        <ThumbsDown size={14} fill={disliked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <button onClick={handleShare}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/[0.1] bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white text-[13px] font-semibold transition-all">
                      <Share2 size={13}/> Share
                    </button>

                    <button onClick={handleSave}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-semibold transition-all
                        ${saved ? 'border-green-500/40 bg-green-500/10 text-green-500' : 'border-white/[0.1] bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white'}`}>
                      <Bookmark size={13} fill={saved ? 'currentColor' : 'none'} />
                      {saved ? 'Saved' : 'Save'}
                    </button>

                    {/* Chat seller — primary CTA */}
                    <Link
                      to={`/chat?seller=${encodeURIComponent(listing.seller.shopName ?? listing.seller.name)}&item=${encodeURIComponent(listing.title)}&price=${listing.price}`}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-black font-bold text-[13px] transition-all no-underline shadow-lg shadow-green-500/20">
                      <MessageCircle size={13}/> Chat seller
                    </Link>
                  </div>

                  <button className="p-2 rounded-full text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                    <Flag size={14}/>
                  </button>
                </div>

                {/* ── Seller card ── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar — TODO: swap for <img src={listing.seller.avatar} /> */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-black flex-shrink-0"
                      style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                      {listing.seller.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-[14px] font-bold text-white">{listing.seller.shopName ?? listing.seller.name}</span>
                        {listing.seller.verified && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/35">
                        <span className="flex items-center gap-0.5">
                          {[...Array(5)].map((_,i) => (
                            <Star key={i} size={9} fill={i < Math.floor(listing.seller.rating) ? '#22c55e' : 'none'}
                              className={i < Math.floor(listing.seller.rating) ? 'text-green-500' : 'text-white/15'}/>
                          ))}
                          <span className="ml-1">{listing.seller.rating}</span>
                        </span>
                        <span>·</span>
                        <span>{listing.seller.totalSales.toLocaleString()} sales</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/chat?seller=${encodeURIComponent(listing.seller.shopName ?? listing.seller.name)}&item=${encodeURIComponent(listing.title)}&price=${listing.price}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-[12px] transition-all no-underline">
                      <MessageCircle size={12}/> Chat
                    </Link>
                    <button onClick={() => setShowPhone(s => !s)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white/55 hover:text-white text-[12px] font-semibold transition-all">
                      <Phone size={12}/>
                      {showPhone ? listing.location : 'Call'}
                    </button>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-white/[0.07] mb-5">
                  {(['description','details','seller'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 text-[13px] font-semibold capitalize transition-all border-b-2 -mb-px
                        ${activeTab === tab ? 'border-green-500 text-green-400' : 'border-transparent text-white/30 hover:text-white/60'}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mb-10" style={{ animation:'fadeUp .3s ease both' }} key={activeTab}>
                  {activeTab === 'description' && (
                    <p className="text-[14px] text-white/55 leading-relaxed">{listing.description || 'No description provided.'}</p>
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
                        <div key={k} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1.5 font-bold">{k}</p>
                          <p className="text-[13px] font-semibold text-white capitalize">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'seller' && (
                    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                      {[
                        ['Shop name',   listing.seller.shopName ?? listing.seller.name],
                        ['Rating',      `${listing.seller.rating} / 5`],
                        ['Total sales', listing.seller.totalSales.toLocaleString()],
                        ['Verified',    listing.seller.verified ? '✓ Verified' : 'Not verified'],
                        ['Seller ID',   listing.seller.id],
                      ].map(([k,v], i, arr) => (
                        <div key={k} className={`flex justify-between items-center px-4 py-3.5 ${i < arr.length-1 ? 'border-b border-white/[0.05]' : ''}`}>
                          <span className="text-[13px] text-white/35">{k}</span>
                          <span className={`text-[13px] font-semibold ${k==='Verified'&&listing.seller.verified ? 'text-green-500' : 'text-white'}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Comments ── */}
                <div className="mb-12">
                  <h2 className="text-[17px] font-bold text-white mb-5 flex items-center gap-2">
                    <MessageCircle size={16} className="text-green-500"/>
                    Questions & Reviews
                    {!loadingCmts && <span className="text-[12px] font-normal text-white/25 ml-1">{comments.length}</span>}
                  </h2>

                  {/* Comment input */}
                  <div className="flex gap-3 mb-7">
                    <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0">Y</div>
                    <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] focus-within:border-green-500/40 rounded-2xl px-4 py-2.5 transition-colors">
                      <input
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
                        placeholder="Ask the seller a question..."
                        className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
                      />
                      <button onClick={submitComment} disabled={!comment.trim() || submitting}
                        className={`p-1.5 rounded-full transition-all flex-shrink-0 ${comment.trim() && !submitting ? 'text-green-500 hover:bg-green-500/10' : 'text-white/15'}`}>
                        {submitting ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
                      </button>
                    </div>
                  </div>

                  {/* Comment list */}
                  {loadingCmts ? (
                    <div className="space-y-5 animate-pulse">
                      {[...Array(3)].map((_,i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/[0.06] flex-shrink-0"/>
                          <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-white/[0.06] rounded w-1/4"/>
                            <div className="h-3 bg-white/[0.04] rounded w-full"/>
                            <div className="h-3 bg-white/[0.04] rounded w-3/4"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[12px] font-bold text-white/50 flex-shrink-0">
                            {c.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-[13px] font-bold text-white">{c.user}</span>
                              <span className="text-[11px] text-white/20">{c.time}</span>
                            </div>
                            <p className="text-[13px] text-white/55 leading-relaxed mb-2">{c.text}</p>
                            <div className="flex items-center gap-4">
                              <button onClick={() => handleCommentLike(c.id)}
                                className={`flex items-center gap-1.5 text-[11px] transition-colors ${c.liked ? 'text-green-500' : 'text-white/25 hover:text-white/60'}`}>
                                <ThumbsUp size={11} fill={c.liked ? 'currentColor' : 'none'}/>{c.likes}
                              </button>
                              <button className="text-[11px] text-white/25 hover:text-white/55 transition-colors font-semibold">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>)}
            </div>

            {/* ════ RIGHT — suggested sidebar (wider, separated) ════ */}
            <div className="w-full xl:w-[460px] 2xl:w-[500px] flex-shrink-0 xl:border-l border-t xl:border-t-0 border-white/[0.07]">
              {/* Sticky inner wrapper */}
              <div className="xl:sticky xl:top-[57px] xl:max-h-[calc(100vh-57px)] xl:overflow-y-auto scrollbar-none px-5 py-6">
                <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-[2px] mb-4">Related Listings</h3>

                {loadingSide ? <SkeletonSidebar /> : (
                  <div className="flex flex-col gap-1">
                    {related.map((l) => {
                      const relIdx = parseInt(l.id.replace(/\D/g,'')) % 12;
                      return <SuggestedCard key={l.id} listing={l} index={relIdx} />;
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}