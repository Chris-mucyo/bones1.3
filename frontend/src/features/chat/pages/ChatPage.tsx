import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  Search, Plus, MoreVertical, Video, Phone,
  Smile, SendHorizontal, Paperclip, MessageCircle,
  Mic, ArrowLeft, Check, CheckCheck, X,
} from 'lucide-react';
import type { Conversation, Message } from '../types';
import AppLayout from '../../../shared/layouts/AppLayout';

// ─── Helpers ────────────────────────────────────────────────────────────────
const initials = (n: string) => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const COLORS = ['#16a34a', '#15803d', '#166534', '#14532d', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];
const ava = (id: string) => COLORS[id.charCodeAt(id.length - 1) % COLORS.length];
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

interface ConvoResponse { conversations: Conversation[]; }
interface MsgResponse { messages: Message[]; }

// ─── Socket singleton ────────────────────────────────────────────────────────
let socket: Socket | null = null;

function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${import.meta.env.VITE_API_URL ?? ''}/chat`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export default function ChatPage() {
  const location = useLocation();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [convos, setConvos] = useState<Conversation[]>([]);
  const [msgs, setMsgs] = useState<Record<string, Message[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [product, setProduct] = useState<{ name: string; price: string } | null>(null);
  const [mobile, setMobile] = useState<'list' | 'chat'>('list');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const [convosLoading, setConvosLoading] = useState(true);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const active = convos.find(c => c.id === activeId);
  const curMsgs = msgs[activeId ?? ''] ?? [];
  const filtered = convos.filter(c =>
      c.otherUser.name.toLowerCase().includes(search.toLowerCase())
  );

  // Theme tokens
  const shellBg = "bg-[var(--bg)]";
  const panelBg = "bg-[var(--bg)] border-[var(--border-custom)]";
  const chatAreaBg = "bg-[var(--bg2)]";
  const textMain = "text-[var(--text1)]";
  const textMuted = "text-[var(--text2)]";
  const textDim = "text-[var(--text3)]";
  const lineBorder = "border-[var(--border-custom)]";
  const bubbleMe = "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm";
  const bubbleOther = "bg-[var(--muted)] text-[var(--text1)] border border-[var(--border-custom)]";
  const pulse = "bg-[var(--divider)] animate-pulse";

  // ─── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? '';
    const sock = getSocket(token);
    socketRef.current = sock;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => setConnected(false));

    // Real-time new message
    sock.on('message.new', ({ conversationId, message }: { conversationId: string; message: Message }) => {
      setMsgs(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), message],
      }));
      setConvos(prev => prev.map(c =>
          c.id === conversationId
              ? { ...c, lastMessage: message, updatedAt: 'Now', unreadCount: c.id === activeId ? 0 : c.unreadCount + 1 }
              : c
      ));
      // Auto mark as read if this conversation is open
      if (conversationId === activeId) {
        sock.emit('messages.read', { conversationId });
      }
    });

    // Read receipts
    sock.on('messages.read', ({ conversationId }: { conversationId: string }) => {
      setMsgs(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map(m =>
            m.senderId === 'me' ? { ...m, read: true } : m
        ),
      }));
    });

    // Presence
    sock.on('user.online', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => new Set([...prev, String(userId)]));
    });
    sock.on('user.offline', ({ userId }: { userId: number }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
    });

    // Typing indicators
    sock.on('typing.start', ({ conversationId, userId }: { conversationId: string; userId: number }) => {
      setTypingUsers(prev => ({ ...prev, [`${conversationId}:${userId}`]: true }));
    });
    sock.on('typing.stop', ({ conversationId, userId }: { conversationId: string; userId: number }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[`${conversationId}:${userId}`];
        return next;
      });
    });

    return () => {
      sock.off('connect');
      sock.off('disconnect');
      sock.off('message.new');
      sock.off('messages.read');
      sock.off('user.online');
      sock.off('user.offline');
      sock.off('typing.start');
      sock.off('typing.stop');
    };
  }, [activeId]);

  // ─── Fetch conversations ───────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    axios.get<ConvoResponse>('/api/conversations', { signal: controller.signal })
        .then(res => {
          const raw = res.data;
          const array: Conversation[] = Array.isArray(raw) ? raw : Array.isArray(raw.conversations) ? raw.conversations : [];
          setConvos(array);
        })
        .catch(err => { if (!axios.isCancel(err)) setConvos([]); })
        .finally(() => setConvosLoading(false));
    return () => controller.abort();
  }, []);

  // ─── Fetch messages on conversation open ──────────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    const controller = new AbortController();
    setMsgsLoading(true);
    axios.get<MsgResponse>(`/api/conversations/${activeId}/messages`, { signal: controller.signal })
        .then(res => {
          const raw = res.data;
          const array: Message[] = Array.isArray(raw) ? raw : Array.isArray(raw.messages) ? raw.messages : [];
          setMsgs(p => ({ ...p, [activeId]: array }));
          // Mark as read via socket
          socketRef.current?.emit('messages.read', { conversationId: activeId });
        })
        .catch(err => { if (!axios.isCancel(err)) setMsgs(p => ({ ...p, [activeId]: [] })); })
        .finally(() => setMsgsLoading(false));
    return () => controller.abort();
  }, [activeId]);

  // ─── Query params (open chat from listing page) ────────────────────────────
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

  // ─── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeId, msgs]);

  // ─── Open chat ────────────────────────────────────────────────────────────
  const openChat = useCallback((id: string) => {
    setActiveId(id); setMobile('chat');
    setConvos(p => p.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
  }, []);

  // ─── Typing indicator ─────────────────────────────────────────────────────
  const handleTyping = useCallback((val: string) => {
    setText(val);
    if (!activeId || !socketRef.current) return;
    socketRef.current.emit('typing.start', { conversationId: activeId });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing.stop', { conversationId: activeId });
    }, 1500);
  }, [activeId]);

  // ─── Send via socket ──────────────────────────────────────────────────────
  const send = useCallback(async () => {
    if (!text.trim() || !activeId || sending) return;

    const optimistic: Message = {
      id: `tmp_${Date.now()}`,
      senderId: 'me',
      receiverId: active?.otherUser.id ?? '',
      content: text,
      type: 'text',
      read: false,
      createdAt: nowTime(),
    };

    setMsgs(p => ({ ...p, [activeId]: [...(p[activeId] ?? []), optimistic] }));
    setConvos(p => p.map(c =>
        c.id === activeId ? { ...c, lastMessage: optimistic, updatedAt: 'Now', unreadCount: 0 } : c
    ));
    const sentText = text;
    setText('');
    inputRef.current?.focus();

    // Stop typing indicator
    socketRef.current?.emit('typing.stop', { conversationId: activeId });
    if (typingTimer.current) clearTimeout(typingTimer.current);

    setSending(true);
    try {
      if (socketRef.current?.connected) {
        // Real-time path via socket
        socketRef.current.emit(
            'message.send',
            { conversationId: activeId, content: sentText, type: 'text' },
            (confirmed: Message) => {
              // Replace optimistic with confirmed
              setMsgs(p => ({
                ...p,
                [activeId]: (p[activeId] ?? []).map(m =>
                    m.id === optimistic.id ? confirmed : m
                ),
              }));
            }
        );
      } else {
        // Fallback to REST if socket disconnected
        const res = await axios.post<Message>(`/api/conversations/${activeId}/messages`, {
          content: sentText, type: 'text',
        });
        setMsgs(p => ({
          ...p,
          [activeId]: (p[activeId] ?? []).map(m => m.id === optimistic.id ? res.data : m),
        }));
      }
    } catch {
      // Rollback optimistic on error
      setMsgs(p => ({
        ...p,
        [activeId]: (p[activeId] ?? []).filter(m => m.id !== optimistic.id),
      }));
      setText(sentText);
    } finally {
      setSending(false);
    }
  }, [text, activeId, sending, active]);

  // ─── Derived state helpers ─────────────────────────────────────────────────
  const isOnline = (userId: string) => onlineUsers.has(userId);
  const isTyping = (conversationId: string) =>
      Object.keys(typingUsers).some(k => k.startsWith(`${conversationId}:`));

  // ─── Avatar component ──────────────────────────────────────────────────────
  const Av = ({ id, name, size = 42 }: { id: string; name: string; size?: number }) => (
      <div
          className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none shadow-sm"
          style={{ width: size, height: size, background: ava(id), fontSize: size * 0.33 }}
      >
        {initials(name)}
      </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
      <AppLayout>
        <div className={`h-[calc(100vh-56px)] flex overflow-hidden ${shellBg}`} style={{ fontFamily: 'var(--font-sans)' }}>

          {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
          <div className={`flex flex-col shrink-0 border-r w-full md:w-[340px] lg:w-[380px] ${panelBg} ${lineBorder} ${mobile === 'chat' ? 'hidden md:flex' : 'flex'}`}>

            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${lineBorder}`}>
              <div className="flex items-center gap-2">
                <h1 className={`text-[17px] font-bold ${textMain}`}>Messages</h1>
                {/* Connection status dot */}
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--link)]' : 'bg-[var(--text3)]'}`} title={connected ? 'Connected' : 'Reconnecting...'} />
              </div>
              <div className="flex gap-0.5">
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--social-bg)] ${textMuted}`}>
                  <Plus size={17} />
                </button>
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--social-bg)] ${textMuted}`}>
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className={`px-3 py-2.5 border-b ${lineBorder}`}>
              <div className="relative">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${textDim}`} />
                <input
                    type="text" placeholder="Search conversations..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className={`w-full rounded-xl pl-9 pr-4 py-2 text-[13px] outline-none border transition-colors bg-[var(--input-bg)] ${textMain} placeholder:text-[var(--text3)] border-[var(--input-border)] focus:border-[var(--link)]`}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {convosLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className={`${pulse} rounded-full w-11 h-11 shrink-0`} />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className={`${pulse} h-3 w-32 rounded-lg`} />
                          <div className={`${pulse} h-2.5 w-48 rounded-lg`} />
                        </div>
                      </div>
                  ))
              ) : filtered.length === 0 ? (
                  <p className={`p-10 text-center text-sm ${textMuted}`}>No conversations found.</p>
              ) : (
                  filtered.map(c => {
                    const isAct = c.id === activeId;
                    const online = isOnline(c.otherUser.id);
                    const typing = isTyping(c.id);
                    const preview = typing
                        ? 'typing...'
                        : msgs[c.id]?.slice(-1)[0]?.content ?? c.lastMessage?.content ?? 'Start a conversation';

                    return (
                        <div key={c.id} onClick={() => openChat(c.id)}
                             className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2
                      ${isAct ? 'bg-[var(--input-bg)] border-[var(--link)]' : 'border-transparent hover:bg-[var(--social-bg)]'}`}>
                          <div className="relative shrink-0">
                            <Av id={c.otherUser.id} name={c.otherUser.name} size={44} />
                            {online && (
                                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[var(--link)] rounded-full border-2 border-[var(--bg)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-[14px] font-semibold truncate ${textMain}`}>
                          {c.otherUser.shopName ?? c.otherUser.name}
                        </span>
                              <span className={`text-[11px] shrink-0 ml-2 ${c.unreadCount ? 'text-[var(--link)]' : textDim}`}>
                          {c.updatedAt}
                        </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`text-[12px] truncate ${typing ? 'text-[var(--link)] italic' : textMuted}`}>
                                {preview}
                              </p>
                              {c.unreadCount > 0 && (
                                  <span className="ml-2 shrink-0 min-w-[18px] h-[18px] bg-[var(--link)] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
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

          {/* ── CHAT AREA ───────────────────────────────────────────────────── */}
          <div className={`flex-1 flex flex-col overflow-hidden ${chatAreaBg} ${mobile === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {active ? (
                <>
                  {/* Chat header */}
                  <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${panelBg} ${lineBorder}`}>
                    <button onClick={() => setMobile('list')} className={`md:hidden w-8 h-8 flex items-center justify-center ${textMuted}`}>
                      <ArrowLeft size={20} />
                    </button>
                    <div className="relative cursor-pointer">
                      <Av id={active.otherUser.id} name={active.otherUser.name} size={40} />
                      {isOnline(active.otherUser.id) && (
                          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[var(--link)] rounded-full border-2 border-[var(--bg)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer">
                      <p className={`text-[15px] font-semibold truncate leading-none mb-0.5 ${textMain}`}>
                        {active.otherUser.shopName ?? active.otherUser.name}
                      </p>
                      <p className={`text-[11px] ${isOnline(active.otherUser.id) ? 'text-[var(--link)]' : textMuted}`}>
                        {isTyping(active.id)
                            ? <span className="italic">typing...</span>
                            : isOnline(active.otherUser.id) ? 'online' : 'last seen recently'
                        }
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[Video, Phone, MoreVertical].map((Icon, i) => (
                          <button key={i} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--social-bg)] ${textMuted}`}>
                            <Icon size={18} />
                          </button>
                      ))}
                    </div>
                  </div>

                  {/* Product banner */}
                  {product && (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--input-bg)] border-b border-[var(--divider)] shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[var(--bg)] rounded-lg border border-[var(--border2)] flex items-center justify-center">
                            <Paperclip size={14} className="text-[var(--link)] opacity-60" />
                          </div>
                          <div>
                            <p className={`text-[9px] uppercase font-bold tracking-widest ${textDim}`}>Discussing</p>
                            <p className="text-sm font-bold text-[var(--link)]">{product.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-xs font-bold ${textMain}`}>RWF {product.price}</p>
                            <p className="text-[10px] text-[var(--link)] opacity-60">View listing →</p>
                          </div>
                          <button onClick={() => setProduct(null)} className={`transition-colors ${textMuted}`}>
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 lg:px-12 py-4 flex flex-col gap-1">
                    <div className="flex justify-center mb-2">
                      <span className={`text-[11px] px-3 py-1 rounded-full border bg-[var(--bg)] ${lineBorder} ${textMuted}`}>Today</span>
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
                          {curMsgs.map((m, i) => {
                            const isMe = m.senderId === 'me';
                            const isFirst = i === 0 || curMsgs[i - 1].senderId !== m.senderId;
                            const isTemp = m.id.startsWith('tmp_');
                            return (
                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-2' : 'mt-0.5'}`}>
                                  <div className={`relative max-w-[65%] md:max-w-[52%] px-3.5 py-2.5 shadow-sm
                            ${isMe ? bubbleMe : bubbleOther}
                            ${isFirst ? (isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm') : 'rounded-2xl'}
                            ${isTemp ? 'opacity-60' : ''}`}>
                                    <p className="text-[14px] leading-relaxed pr-10 whitespace-pre-wrap">{m.content}</p>
                                    <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1">
                                      <span className="text-[10px] opacity-70">{m.createdAt}</span>
                                      {isMe && (m.read
                                              ? <CheckCheck size={13} className="text-white/80" />
                                              : <Check size={13} className="text-white/40" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                            );
                          })}

                          {/* Typing bubble */}
                          {isTyping(active.id) && (
                              <div className="flex justify-start mt-2">
                                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${bubbleOther}`}>
                                  <div className="flex gap-1 items-center h-4">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--text2)] animate-bounce"
                                              style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                          )}
                        </>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* Input bar */}
                  <div className={`flex items-center gap-2 px-3 py-3 border-t shrink-0 ${panelBg} ${lineBorder}`}>
                    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${textDim} hover:bg-[var(--social-bg)]`}>
                      <Smile size={21} />
                    </button>
                    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${textDim} hover:bg-[var(--social-bg)]`}>
                      <Paperclip size={19} />
                    </button>
                    <input
                        ref={inputRef}
                        placeholder="Type a message"
                        value={text}
                        onChange={e => handleTyping(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                        className={`flex-1 border text-[14px] rounded-2xl px-4 py-2.5 outline-none transition-colors min-h-11 bg-[var(--input-bg)] border-[var(--input-border)] focus:border-[var(--link)] ${textMain} placeholder:text-[var(--text3)]`}
                    />
                    <button onClick={send} disabled={sending}
                            className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--link)] hover:opacity-90 disabled:opacity-50 text-white transition-all shrink-0 shadow-lg">
                      {text.trim() ? <SendHorizontal size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                </>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-5 text-[var(--text2)]">
                  <div className="w-28 h-28 rounded-full border border-[var(--divider)] flex items-center justify-center bg-[var(--input-bg)]">
                    <MessageCircle size={48} className="text-[var(--link)] opacity-20" />
                  </div>
                  <div className="text-center">
                    <p className={`text-xl font-light mb-1 ${textMain}`}>ShopHub Messages</p>
                    <p className={`text-sm text-[var(--text3)]`}>Select a conversation or tap Chat on any listing</p>
                  </div>
                </div>
            )}
          </div>
        </div>
      </AppLayout>
  );
}