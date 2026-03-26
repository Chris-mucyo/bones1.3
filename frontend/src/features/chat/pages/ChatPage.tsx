import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Plus, MoreVertical, Video, Phone,
  Smile, SendHorizontal, Paperclip, MessageCircle,
  Mic, ArrowLeft, Check, CheckCheck, X,
  Home, ShoppingBag, PlusSquare, BarChart2, User, Settings,
} from 'lucide-react';
import type { Conversation, Message } from '../types';

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const COLORS   = ['#16a34a','#15803d','#166534','#14532d','#22c55e','#4ade80','#86efac','#bbf7d0'];
const ava      = (id: string) => COLORS[id.charCodeAt(id.length - 1) % COLORS.length];
const nowTime  = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


interface ConvoResponse { conversations: Conversation[]; }
interface MsgResponse   { messages: Message[]; }

const NAV = [
  { icon: Home,          label: 'Home',      to: '/home' },
  { icon: ShoppingBag,   label: 'Listings',  to: '/listings' },
  { icon: MessageCircle, label: 'Messages',  to: '/chat', active: true },
  { icon: PlusSquare,    label: 'Post',       to: '/listings/new' },
  { icon: BarChart2,     label: 'Dashboard', to: '/seller/dashboard' },
  { icon: User,          label: 'Profile',   to: '/profile' },
];

export default function ChatPage() {
  const location = useLocation();
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [convos,   setConvos]   = useState<Conversation[]>([]);
  const [msgs,     setMsgs]     = useState<Record<string, Message[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text,     setText]     = useState('');
  const [search,   setSearch]   = useState('');
  const [product,  setProduct]  = useState<{ name: string; price: string } | null>(null);
  const [mobile,   setMobile]   = useState<'list' | 'chat'>('list');

  const [convosLoading, setConvosLoading] = useState(true);
  const [msgsLoading,   setMsgsLoading]   = useState(false);
  const [sending,       setSending]       = useState(false);

  const active      = convos.find(c => c.id === activeId);
const curMsgs     = msgs[activeId ?? ''] ?? [];
const filtered    = convos.filter(c => c.otherUser.name.toLowerCase().includes(search.toLowerCase()));
const totalUnread = convos.reduce((s, c) => s + c.unreadCount, 0);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<ConvoResponse>('/api/conversations', { signal: controller.signal })
      .then(res => {
        const raw = res.data;
        const array: Conversation[] = Array.isArray(raw) ? raw : Array.isArray(raw.conversations) ? raw.conversations : [];
        setConvos(array);
      })
      .catch(err => { if (!axios.isCancel(err)) setConvos([]); })
      .finally(() => setConvosLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const controller = new AbortController();
    setMsgsLoading(true);
    axios
      .get<MsgResponse>(`/api/conversations/${activeId}/messages`, { signal: controller.signal })
      .then(res => {
        const raw = res.data;
        const array: Message[] = Array.isArray(raw) ? raw : Array.isArray(raw.messages) ? raw.messages : [];
        setMsgs(p => ({ ...p, [activeId]: array }));
      })
      .catch(err => { if (!axios.isCancel(err)) setMsgs(p => ({ ...p, [activeId]: [] })); })
      .finally(() => setMsgsLoading(false));
    return () => controller.abort();
  }, [activeId]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const seller = p.get('seller'), item = p.get('item'), price = p.get('price');
    if (!seller) return;
    setConvos(prev => {
      const ex = prev.find(c => c.otherUser.name.toLowerCase() === seller.toLowerCase());
      if (ex) {
        setActiveId(ex.id); setMobile('chat');
        if (item) setProduct({ name: item, price: price ?? '' });
        return prev;
      }
      const nc: Conversation = {
        id: `chat_${Date.now()}`, participants: ['me', seller],
        otherUser: { id: seller, name: seller, online: true, avatar: '', shopName: '' },
        lastMessage: null, unreadCount: 0, updatedAt: 'Now',
      };
      setActiveId(nc.id); setMobile('chat');
      if (item) setProduct({ name: item, price: price ?? '' });
      return [nc, ...prev];
    });
  }, [location.search]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeId, msgs]);

  const openChat = useCallback((id: string) => {
    setActiveId(id); setMobile('chat');
    setConvos(p => p.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  }, []);

  const send = useCallback(async () => {
    if (!text.trim() || !activeId || sending) return;
    const optimistic: Message = {
      id: `tmp_${Date.now()}`, senderId: 'me',
      receiverId: active?.otherUser.id ?? '',
      content: text, type: 'text', read: false, createdAt: nowTime(),
    };
    setMsgs(p => ({ ...p, [activeId]: [...(p[activeId] ?? []), optimistic] }));
    setConvos(p => p.map(c => c.id === activeId ? { ...c, lastMessage: optimistic, updatedAt: 'Now', unreadCount: 0 } : c));
    setText(''); inputRef.current?.focus();
    setSending(true);
    try {
      const res = await axios.post<Message>(`/api/conversations/${activeId}/messages`, {
        content: text, type: 'text',
      });
      setMsgs(p => ({
        ...p,
        [activeId]: (p[activeId] ?? []).map(m => m.id === optimistic.id ? res.data : m),
      }));
    } catch {
      setMsgs(p => ({
        ...p,
        [activeId]: (p[activeId] ?? []).filter(m => m.id !== optimistic.id),
      }));
      setText(optimistic.content);
    } finally {
      setSending(false);
    }
  }, [text, activeId, sending, active]);


  const pulse = 'bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg';

  const Av = ({ id, name, size = 42 }: { id: string; name: string; size?: number }) => (
    <div className="rounded-full flex items-center justify-center font-bold text-black flex-shrink-0 select-none"
      style={{ width: size, height: size, background: ava(id), fontSize: size * 0.33 }}>
      {initials(name)}
    </div>
  );

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-black" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Strip 1 — app nav */}
      <div className="hidden md:flex flex-col items-center py-4 gap-1 bg-[#0a0a0a] border-r border-white/[0.07]" style={{ width: 68 }}>
        <Link to="/home" className="no-underline mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
        </Link>
        {NAV.map(({ icon: Icon, label, to, active: isActive }) => (
          <Link key={label} to={to} title={label} className="no-underline w-full flex justify-center">
            <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer
              ${isActive ? 'bg-green-500/15 text-green-500' : 'text-white/30 hover:bg-white/6 hover:text-white/70'}`}>
              <Icon size={20} />
              {label === 'Messages' && totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-green-500 text-black text-[9px] font-black rounded-full flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </div>
          </Link>
        ))}
        <div className="mt-auto">
          <Link to="/settings" title="Settings" className="no-underline">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white/30 hover:bg-white/6 hover:text-white/70 transition-all">
              <Settings size={19} />
            </div>
          </Link>
        </div>
      </div>

      {/* Strip 2 — conversation list */}
      <div className={`flex flex-col bg-[#111111] border-r border-white/[0.07] shrink-0
        w-full md:w-[320px] lg:w-90
        ${mobile === 'chat' ? 'hidden md:flex' : 'flex'}`}>

        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
          <h1 className="text-[17px] font-bold text-white">Messages</h1>
          <div className="flex gap-0.5">
            <button className="w-8 h-8 rounded-full hover:bg-white/8 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Plus size={17} />
            </button>
            <button className="w-8 h-8 rounded-full hover:bg-white/8 flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <MoreVertical size={17} />
            </button>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-white/5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              type="text" placeholder="Search conversations..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/6 rounded-xl pl-9 pr-4 py-2 text-[13px] text-white placeholder:text-white/25 outline-none border border-white/8 focus:border-green-500/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none">
          {convosLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`${pulse} w-11 h-11 rounded-full shrink-0`} />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className={`${pulse} h-3 w-32`} />
                  <div className={`${pulse} h-2.5 w-48`} />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-white/20 text-sm">No conversations found.</p>
          ) : (
            filtered.map(c => {
              const isAct   = c.id === activeId;
              const preview = msgs[c.id]?.slice(-1)[0]?.content ?? c.lastMessage?.content ?? 'Start a conversation';
              return (
                <div key={c.id} onClick={() => openChat(c.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2
                    ${isAct ? 'bg-white/5 border-green-500' : 'border-transparent hover:bg-white/3'}`}>
                  <div className="relative shrink-0">
                    <Av id={c.otherUser.id} name={c.otherUser.name} size={44} />
                    {c.otherUser.online && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111111]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[14px] font-semibold text-white truncate">
                        {c.otherUser.shopName ?? c.otherUser.name}
                      </span>
                      <span className={`text-[11px] shrink-0 ml-2 ${c.unreadCount ? 'text-green-400' : 'text-white/30'}`}>
                        {c.updatedAt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-white/35 truncate">{preview}</p>
                      {c.unreadCount > 0 && (
                        <span className="ml-2 shrink-0 min-w-4.5 h-4.5 bg-green-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Strip 3 — active chat */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-black ${mobile === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {active ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#0a0a0a] shrink-0">
              <button onClick={() => setMobile('list')} className="md:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white">
                <ArrowLeft size={20} />
              </button>
              <div className="relative cursor-pointer">
                <Av id={active.otherUser.id} name={active.otherUser.name} size={40} />
                {active.otherUser.online && (
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
                )}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer">
                <p className="text-[15px] font-semibold text-white truncate leading-none mb-0.5">
                  {active.otherUser.shopName ?? active.otherUser.name}
                </p>
                <p className={`text-[11px] ${active.otherUser.online ? 'text-green-500' : 'text-white/30'}`}>
                  {active.otherUser.online ? 'online' : 'last seen recently'}
                </p>
              </div>
              <div className="flex gap-0.5">
                {[Video, Phone, MoreVertical].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-full hover:bg-white/8 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {product && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-green-500/6 border-b border-green-500/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center justify-center">
                    <Paperclip size={14} className="text-green-500/60" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Discussing</p>
                    <p className="text-sm font-bold text-green-500">{product.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">RWF {product.price}</p>
                    <p className="text-[10px] text-green-500/60">View listing →</p>
                  </div>
                  <button onClick={() => setProduct(null)} className="text-white/30 hover:text-white transition-colors">
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-12 lg:px-24 py-4 flex flex-col gap-1"
              style={{ background: 'radial-gradient(ellipse at top right, #0a1a0f 0%, #000 60%)' }}>
              <div className="flex justify-center mb-2">
                <span className="bg-white/6 border border-white/8 text-white/30 text-[11px] px-3 py-1 rounded-full">Today</span>
              </div>

              {msgsLoading ? (
                <div className="flex flex-col gap-3 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className={`${pulse} h-10 rounded-2xl`} style={{ width: `${180 + (i * 30) % 120}px` }} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {curMsgs.length === 0 && (
                    <div className="flex justify-center mb-2">
                      <span className="bg-white/4 border border-white/6 text-white/20 text-[11px] px-4 py-1.5 rounded-full text-center">
                        🔒 Messages are end-to-end encrypted
                      </span>
                    </div>
                  )}
                  {curMsgs.map((m, i) => {
                    const isMe    = m.senderId === 'me';
                    const isFirst = i === 0 || curMsgs[i - 1].senderId !== m.senderId;
                    const isTemp  = m.id.startsWith('tmp_');
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-2' : 'mt-0.5'}`}>
                        <div className={`relative max-w-[65%] md:max-w-[52%] px-3.5 py-2.5 shadow-lg
                          ${isMe ? 'bg-green-500/20 border border-green-500/30 text-white' : 'bg-white/[0.07] border border-white/8 text-white'}
                          ${isFirst ? (isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm') : 'rounded-2xl'}
                          ${isTemp ? 'opacity-60' : ''}`}>
                          <p className="text-[14px] leading-relaxed pr-10 whitespace-pre-wrap">{m.content}</p>
                          <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
                            <span className="text-[10px] text-white/30">{m.createdAt}</span>
                            {isMe && (m.read
                              ? <CheckCheck size={13} className="text-green-400" />
                              : <Check size={13} className="text-white/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2 px-3 py-3 bg-[#0a0a0a] border-t border-white/[0.07] shrink-0">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/6 transition-colors shrink-0">
                <Smile size={21} />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/6 transition-colors shrink-0">
                <Paperclip size={19} />
              </button>
              <input
                ref={inputRef} placeholder="Type a message"
                value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                className="flex-1 bg-white/6 border border-white/8 focus:border-green-500/40 text-[14px] text-white placeholder:text-white/25 rounded-2xl px-4 py-2.5 outline-none transition-colors min-h-11"
              />
              <button onClick={send} disabled={sending}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black transition-all shrink-0 shadow-lg shadow-green-500/20">
                {text.trim() ? <SendHorizontal size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-5 text-white/20">
            <div className="w-28 h-28 rounded-full bg-white/4 border border-green-500/10 flex items-center justify-center">
              <MessageCircle size={48} className="text-green-500/30" />
            </div>
            <div className="text-center">
              <p className="text-xl font-light text-white/40 mb-1">ShopHub Messages</p>
              <p className="text-sm text-white/20">Select a conversation or tap Chat on any listing</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/10 mt-2">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              End-to-end encrypted
            </div>
          </div>
        )}
      </div>
    </div>
  );
}