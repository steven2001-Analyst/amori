'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hash,
  Send,
  Search,
  Pin,
  SmilePlus,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
  Reply,
  Forward,
  Bookmark,
  MoreHorizontal,
  Paperclip,
  ImageIcon,
  Menu,
  AtSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useProgressStore, type ChatMessage } from '@/lib/store';

/* ─── Constants ─── */


const quickReactionEmojis = ['👍', '❤️', '🎉', '😂', '🤔', '👏', '🔥', '💯'];

const emojiCategories: { name: string; icon: string; emojis: string[] }[] = [
  {
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
      '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗',
      '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
      '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜',
      '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁',
    ],
  },
  {
    name: 'Gestures',
    icon: '👋',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    ],
  },
  {
    name: 'Hearts',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
    ],
  },
  {
    name: 'Objects',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🏆', '🥇', '⭐', '🌟', '✨', '💫', '🔥', '💥',
      '🔥', '💯', '✅', '❌', '⭕', '❗', '❓', '‼️', '⁉️', '💡',
      '📌', '📎', '🔗', '📝', '📖', '📚', '🎓', '💻', '📊', '📈',
    ],
  },
];

const chatRooms = [
  { id: 'general', name: 'general', icon: '💬' },
  { id: 'sql-help', name: 'sql-help', icon: '🗄️' },
  { id: 'python-help', name: 'python-help', icon: '🐍' },
  { id: 'career-advice', name: 'career-advice', icon: '💼' },
  { id: 'study-group', name: 'study-group', icon: '📚' },
  { id: 'showcase', name: 'showcase', icon: '🌟' },
];

const initialMessages: Omit<ChatMessage, 'id'>[] = [];

const pinnedMessages: Omit<ChatMessage, 'id' | 'timestamp'>[] = [];

/* ─── Helper functions ─── */
function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDateLabel(timestamp: number, prevTimestamp?: number): string | null {
  const label = formatTime(timestamp);
  if (!prevTimestamp) return label;
  const prevLabel = formatTime(prevTimestamp);
  if (label !== prevLabel) return label;
  return null;
}

/* ─── Emoji Picker Component ─── */
function EmojiPicker({
  onSelect,
  side = 'top',
}: {
  onSelect: (emoji: string) => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchEmoji, setSearchEmoji] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchEmoji.trim()) return emojiCategories;
    const q = searchEmoji.toLowerCase();
    return emojiCategories
      .map((cat) => ({
        ...cat,
        emojis: cat.emojis,
      }))
      .filter((cat) => cat.emojis.length > 0);
  }, [searchEmoji]);

  return (
    <PopoverContent
      side={side}
      sideOffset={8}
      align="start"
      className="w-80 p-0 border-border/60 shadow-xl"
    >
      <div className="flex flex-col">
        {/* Search */}
        <div className="p-2.5 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emoji..."
              value={searchEmoji}
              onChange={(e) => setSearchEmoji(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/30 border-0 focus-visible:ring-1"
              autoFocus
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-0.5 px-2.5 py-1.5 border-b border-border/30 overflow-x-auto">
          {emojiCategories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                activeCategory === i
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="max-h-56 overflow-y-auto p-2">
          {filteredCategories.map((category) => (
            <div key={category.name} className="mb-1">
              {!searchEmoji && (
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5 py-1">
                  {category.icon} {category.name}
                </p>
              )}
              <div className="grid grid-cols-8 gap-0.5">
                {category.emojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelect(emoji)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PopoverContent>
  );
}

/* ─── Message Hover Actions ─── */
function MessageActions({
  messageId,
  onReply,
  onEmojiPick,
}: {
  messageId: string;
  onReply: (id: string) => void;
  onEmojiPick: (id: string, emoji: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const actionBtn = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          >
            {icon}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex items-center gap-0.5">
      {actionBtn(<Reply className="w-4 h-4" />, 'Reply', () => onReply(messageId))}
      {actionBtn(<Forward className="w-4 h-4" />, 'Forward', () => {})}
      {actionBtn(<Bookmark className="w-4 h-4" />, 'Bookmark', () => {})}

      {/* Emoji button with inline quick picker */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          >
            <SmilePlus className="w-4 h-4" />
          </motion.button>
        </PopoverTrigger>
        <EmojiPicker
          side="top"
          onSelect={(emoji) => {
            onEmojiPick(messageId, emoji);
            setShowPicker(false);
          }}
        />
      </Popover>

      {actionBtn(<MoreHorizontal className="w-4 h-4" />, 'More', () => {})}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CommunityChatView() {
  const [activeRoom, setActiveRoom] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinned, setShowPinned] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { chatMessages, addChatMessage, addReaction, profile } = useProgressStore();

  // Dynamic current user from store
  const currentUser = useMemo(() => ({
    name: profile?.name || 'You',
    avatar: profile?.name ? profile.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : 'YO',
    color: 'from-emerald-500 to-teal-600',
    profilePicture: profile?.profilePicture,
  }), [profile]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Initialize with seed messages if empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      initialMessages.forEach((msg) => {
        addChatMessage({ ...msg, id: generateId() });
      });
    }
  }, [chatMessages.length, addChatMessage]);

  const roomMessages = useMemo(
    () =>
      chatMessages
        .filter((m) => m.roomId === activeRoom)
        .sort((a, b) => a.timestamp - b.timestamp),
    [chatMessages, activeRoom]
  );

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return roomMessages;
    const q = searchQuery.toLowerCase();
    return roomMessages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) || m.user.toLowerCase().includes(q)
    );
  }, [roomMessages, searchQuery]);

  const roomPinned = useMemo(
    () => pinnedMessages.filter((p) => p.roomId === activeRoom),
    [activeRoom]
  );

  const replyingMessage = useMemo(
    () => (replyingTo ? chatMessages.find((m) => m.id === replyingTo) : null),
    [replyingTo, chatMessages]
  );

  const onlineCount = useProgressStore.getState().registeredUsers?.length || 1;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    addChatMessage({
      id: generateId(),
      roomId: activeRoom,
      user: currentUser.name,
      avatar: currentUser.avatar,
      color: currentUser.color,
      text: replyingTo
        ? `> ${replyingMessage?.text?.substring(0, 60)}${(replyingMessage?.text?.length ?? 0) > 60 ? '...' : ''}\n\n${messageInput.trim()}`
        : messageInput.trim(),
      timestamp: Date.now(),
      reactions: {},
    });

    setMessageInput('');
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji, currentUser.avatar);
  };

  const handleEmojiInsert = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full">
      {/* Room Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="w-[280px] h-full flex flex-col">
              {/* Sidebar header */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    <h2 className="font-bold text-base">Channels</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {/* Search button */}
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 text-sm h-10',
                    showSearch &&
                      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                  )}
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setSearchQuery('');
                  }}
                >
                  <Search className="w-4 h-4" />
                  {showSearch ? 'Clear search' : 'Search messages...'}
                </Button>
              </div>

              {/* Room list */}
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-1">
                  {chatRooms.map((room) => {
                    const isActive = activeRoom === room.id;
                    return (
                      <motion.button
                        key={room.id}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveRoom(room.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group',
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <span className="text-lg shrink-0">{room.icon}</span>
                        <Hash className="w-4 h-4 shrink-0 opacity-50" />
                        <span className="flex-1 text-left truncate text-sm font-medium">
                          {room.name}
                        </span>

                      </motion.button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Online users */}
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {onlineCount}
                    </span>
                  </div>
                  <span>members online</span>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle - always visible */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>

              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {chatRooms.find((r) => r.id === activeRoom)?.icon}
                </span>
                <Hash className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-bold text-base md:text-lg">{activeRoom}</h3>
              </div>
              <Badge variant="secondary" className="text-xs h-6 font-semibold ml-1">
                {roomMessages.length} messages
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              {roomPinned.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-10 text-sm gap-2 font-medium px-3',
                    showPinned &&
                      'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                  )}
                  onClick={() => setShowPinned(!showPinned)}
                >
                  <Pin className="w-4 h-4" />
                  <span className="hidden sm:inline">Pinned</span>({roomPinned.length})
                </Button>
              )}
            </div>
          </div>

          {/* Pinned messages panel */}
          <AnimatePresence>
            {showPinned && roomPinned.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Pinned Messages
                  </p>
                  {roomPinned.map((pin, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30"
                    >
                      <Pin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                          {pin.user}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {pin.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search messages in this channel..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-11 text-sm bg-background/50"
                      autoFocus
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-4 md:px-10 md:py-5 space-y-1 max-w-4xl mx-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-muted-foreground">
                  {searchQuery ? 'No messages found' : 'No messages yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Be the first to start a conversation!'}
                </p>
              </div>
            ) : (
              filteredMessages.map((message, index) => {
                const prevMessage =
                  index > 0 ? filteredMessages[index - 1] : undefined;
                const dateLabel = getDateLabel(
                  message.timestamp,
                  prevMessage?.timestamp
                );
                const isCurrentUser = message.user === currentUser.name;
                const showAvatar =
                  !prevMessage ||
                  prevMessage.user !== message.user ||
                  message.timestamp - prevMessage.timestamp > 300000;

                return (
                  <React.Fragment key={message.id}>
                    {/* Date separator */}
                    {dateLabel && (
                      <div className="flex items-center gap-4 py-4">
                        <Separator className="flex-1 bg-border/50" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                          {dateLabel}
                        </span>
                        <Separator className="flex-1 bg-border/50" />
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      onMouseEnter={() => setHoveredMessage(message.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                      className={cn(
                        'group flex items-start gap-4 rounded-2xl px-4 py-3 transition-all duration-200 relative',
                        isCurrentUser
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/15 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/25'
                          : 'hover:bg-muted/40'
                      )}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 pt-0.5">
                        {showAvatar ? (
                          <div
                            className={cn(
                              'w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-background overflow-hidden',
                              message.color
                            )}
                          >
                            {isCurrentUser && currentUser.profilePicture ? (
                              <img src={currentUser.profilePicture} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                              message.avatar
                            )}
                          </div>
                        ) : (
                          <div className="w-11 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-baseline gap-2.5 mb-1.5">
                            <span
                              className={cn(
                                'text-base font-bold tracking-tight',
                                isCurrentUser
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-foreground'
                              )}
                            >
                              {message.user}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={cn(
                            'rounded-2xl px-5 py-3.5 max-w-full shadow-sm',
                            isCurrentUser
                              ? 'bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-800/30'
                              : 'bg-muted/50 border border-border/30'
                          )}
                        >
                          <p className="text-[15px] leading-7 text-foreground/90 break-words whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>

                        {/* Reactions */}
                        {Object.keys(message.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(message.reactions).map(
                              ([emoji, users]) => (
                                <motion.button
                                  key={emoji}
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={() =>
                                    handleReaction(message.id, emoji)
                                  }
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border transition-colors font-semibold',
                                    users.includes(currentUser.avatar)
                                      ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-muted/50 border-border/50 hover:bg-muted text-foreground/80'
                                  )}
                                >
                                  <span className="text-base">{emoji}</span>
                                  <span className="text-sm font-bold">
                                    {users.length}
                                  </span>
                                </motion.button>
                              )
                            )}
                          </div>
                        )}

                        {/* Hover actions: quick reactions + message actions */}
                        <AnimatePresence>
                          {hoveredMessage === message.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center gap-1 mt-2 flex-wrap"
                            >
                              {/* Quick emoji reactions */}
                              {quickReactionEmojis.map((emoji) => (
                                <motion.button
                                  key={emoji}
                                  whileHover={{ scale: 1.25 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleReaction(message.id, emoji)
                                  }
                                  className="w-8 h-8 rounded-lg hover:bg-muted/80 flex items-center justify-center text-base transition-colors"
                                >
                                  {emoji}
                                </motion.button>
                              ))}

                              <div className="w-px h-5 bg-border/50 mx-1" />

                              {/* Action buttons */}
                              <MessageActions
                                messageId={message.id}
                                onReply={setReplyingTo}
                                onEmojiPick={handleReaction}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })
            )}

            {/* Typing indicator */}
            <AnimatePresence>
              {typingUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.15,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold">{typingUser}</span> is
                    typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm p-3 md:p-4">
          {/* Reply preview */}
          <AnimatePresence>
            {replyingTo && replyingMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 rounded-xl border border-border/40">
                  <Reply className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Replying to {replyingMessage.user}
                    </p>
                    <p className="text-sm text-foreground/70 truncate">
                      {replyingMessage.text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Attachment buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-medium">
                    Attach file
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-foreground"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-medium">
                    Add image
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-muted-foreground hover:text-foreground"
                    >
                      <AtSign className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-medium">
                    Mention someone
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Input + Emoji Picker */}
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder={`Message #${activeRoom}...`}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="pr-12 bg-background/80 border-border/50 text-base h-12 rounded-xl pl-4"
              />

              {/* Emoji picker for input */}
              <Popover
                open={showInputEmojiPicker}
                onOpenChange={setShowInputEmojiPicker}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                  >
                    <SmilePlus className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <EmojiPicker
                  side="top"
                  onSelect={(emoji) => {
                    handleEmojiInsert(emoji);
                  }}
                />
              </Popover>
            </div>

            {/* Send button - BIGGER */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="h-12 w-12 p-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-40 rounded-xl shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Typing indicator text */}
          <AnimatePresence>
            {isTyping && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-muted-foreground mt-2 ml-1"
              >
                You are typing...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
