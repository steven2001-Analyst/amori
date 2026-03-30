'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  Tag,
  Clock,
  TrendingUp,
  Award,
  HelpCircle,
  MessageCircle,
  Briefcase,
  Lightbulb,
  Trophy,
  Send,
  CornerDownRight,
  Filter,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProgressStore, CommunityCategory, CommunityPost, CommunityComment } from '@/lib/store';
import { cn } from '@/lib/utils';
import { subjects, getTotalTopicCount } from '@/lib/study-data';

/* ─── Helpers ─── */
function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

function countAllComments(comments: CommunityComment[]): number {
  let total = comments.length;
  for (const c of comments) {
    total += countAllComments(c.replies);
  }
  return total;
}

/* ─── Category config ─── */
const CATEGORIES: { value: CommunityCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'help', label: 'Help', icon: HelpCircle, color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  { value: 'discussion', label: 'Discussion', icon: MessageCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'showcase', label: 'Project Showcase', icon: Trophy, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { value: 'career', label: 'Career', icon: Briefcase, color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  { value: 'tips', label: 'Tips & Tricks', icon: Lightbulb, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
];

/* ─── No more seed data — posts come from database ─── */
function getSeedPosts(): CommunityPost[] {
  return [];
}

const TOP_CONTRIBUTORS: { name: string; posts: number; color: string }[] = [];

/* ─── Avatar component ─── */
function Avatar({ name, color, size = 'sm' }: { name: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'w-10 h-10 text-sm' : size === 'md' ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-[10px]';
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-bold text-white shrink-0', sizeClasses)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Vote buttons ─── */
function VoteButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  compact = false,
}: {
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  onVote: (type: 'up' | 'down') => void;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-0.5', compact ? 'flex-row gap-2' : '')}>
      <button
        onClick={() => onVote('up')}
        className={cn(
          'rounded-md p-1 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
          userVote === 'up' && 'text-emerald-600 dark:text-emerald-400'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={cn('w-4 h-4', userVote === 'up' && 'fill-current')} />
      </button>
      <span className={cn(
        'text-sm font-semibold tabular-nums',
        userVote === 'up' ? 'text-emerald-600 dark:text-emerald-400' : userVote === 'down' ? 'text-rose-500' : 'text-muted-foreground'
      )}>
        {upvotes - downvotes}
      </span>
      <button
        onClick={() => onVote('down')}
        className={cn(
          'rounded-md p-1 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30',
          userVote === 'down' && 'text-rose-500'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={cn('w-4 h-4', userVote === 'down' && 'fill-current')} />
      </button>
    </div>
  );
}

/* ─── Comment item ─── */
function CommentItem({
  comment,
  postId,
  depth = 0,
  onVote,
  onReply,
}: {
  comment: CommunityComment;
  postId: string;
  depth?: number;
  onVote: (commentId: string, type: 'up' | 'down') => void;
  onReply: (parentId: string) => void;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <div className={cn(depth > 0 && 'ml-6 sm:ml-10 border-l-2 border-border/40 pl-4')}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-3 py-3"
      >
        <Avatar name={comment.author} color={comment.authorColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground/90 mt-1 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
          <div className="flex items-center gap-3 mt-2">
            <VoteButtons
              upvotes={comment.upvotes}
              downvotes={comment.downvotes}
              userVote={comment.userVote}
              onVote={(type) => onVote(comment.id, type)}
              compact
            />
            {depth < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}
          </div>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 flex gap-2"
            >
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
              />
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim()} className="h-9 px-3 bg-emerald-500 hover:bg-emerald-600">
                <Send className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            postId={postId}
            depth={depth + 1}
            onVote={onVote}
            onReply={onReply}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Post card ─── */
function PostCard({
  post,
  onVotePost,
  onVoteComment,
  onAddComment,
  onClick,
}: {
  post: CommunityPost;
  onVotePost: (type: 'up' | 'down') => void;
  onVoteComment: (commentId: string, type: 'up' | 'down') => void;
  onAddComment: (body: string, parentId?: string) => void;
  onClick: () => void;
}) {
  const catConfig = CATEGORIES.find((c) => c.value === post.category) || CATEGORIES[0];
  const CatIcon = catConfig.icon;
  const totalComments = countAllComments(post.comments);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors cursor-pointer overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex">
            {/* Vote column */}
            <div className="flex items-start py-4 px-3">
              <VoteButtons
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                userVote={post.userVote}
                onVote={(type) => {
                  onVotePost(type);
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-4 pr-4 border-t border-b border-border/30" onClick={onClick}>
              {/* Category + meta */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className={cn('text-[10px] font-medium gap-1 px-2 py-0', catConfig.color)}>
                  <CatIcon className="w-3 h-3" />
                  {catConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(post.timestamp)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold leading-snug mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Body preview */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {post.body}
              </p>

              {/* Tags + Author */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Avatar name={post.author} color={post.authorColor} />
                  <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Post detail view ─── */
function PostDetail({
  post,
  onBack,
  onVotePost,
  onVoteComment,
  onAddComment,
}: {
  post: CommunityPost;
  onBack: () => void;
  onVotePost: (type: 'up' | 'down') => void;
  onVoteComment: (commentId: string, type: 'up' | 'down') => void;
  onAddComment: (body: string, parentId?: string) => void;
}) {
  const [commentText, setCommentText] = useState('');

  const catConfig = CATEGORIES.find((c) => c.value === post.category) || CATEGORIES[0];
  const CatIcon = catConfig.icon;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  const handleReply = (body: string, parentId?: string) => {
    onAddComment(body, parentId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        ← Back to posts
      </button>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <VoteButtons
                upvotes={post.upvotes}
                downvotes={post.downvotes}
                userVote={post.userVote}
                onVote={(type) => {
                  onVotePost(type);
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className={cn('text-xs font-medium gap-1 px-2 py-0.5', catConfig.color)}>
                  <CatIcon className="w-3 h-3" />
                  {catConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(post.timestamp)}
                </span>
              </div>
              <h2 className="text-xl font-bold leading-snug mb-3">{post.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <Avatar name={post.author} color={post.authorColor} size="md" />
                <span className="text-sm font-medium">{post.author}</span>
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-4">
                {post.body}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted/80 text-muted-foreground px-2 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 my-6" />

          {/* Comments section */}
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {countAllComments(post.comments)} Comments
            </h3>

            {/* New comment input */}
            <div className="flex gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                Y
              </div>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[60px] text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment();
                  }}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="self-end h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Post
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="max-h-[500px] overflow-y-auto space-y-1">
              {post.comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    onVote={onVoteComment}
                    onReply={(parentId) => {
                      // Reply handling is inline in CommentItem
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── New post dialog ─── */
function NewPostDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const store = useProgressStore();
  const profile = store.profile || { name: 'You' };
  const addCommunityPost = store.addCommunityPost;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('discussion');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;
    addCommunityPost({
      title: title.trim(),
      body: body.trim(),
      author: profile.name,
      authorColor: '#10b981',
      category,
      tags,
    });
    setTitle('');
    setBody('');
    setCategory('discussion');
    setTags([]);
    setTagInput('');
    onOpenChange(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            Create New Post
          </DialogTitle>
          <DialogDescription>Share your questions, insights, or projects with the community.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v as CommunityCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/150</p>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details, ask questions, or describe your project..."
              className="min-h-[120px] text-sm"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{body.length}/2000</p>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags (optional, max 5)</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={addTag} className="h-9">
                <Tag className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    #{tag}
                    <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !body.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Top Contributors sidebar ─── */
function TopContributorsSidebar() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-500" />
          Top Contributors
        </h3>
        <div className="space-y-3">
          {TOP_CONTRIBUTORS.map((contributor, i) => (
            <div key={contributor.name} className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                {i + 1}
              </span>
              <Avatar name={contributor.name} color={contributor.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{contributor.name}</p>
                <p className="text-[10px] text-muted-foreground">{contributor.posts} posts</p>
              </div>
              {i === 0 && <Trophy className="w-4 h-4 text-amber-500" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Community stats (loaded from API) ─── */
function CommunityStatsCompact() {
  const store = useProgressStore();
  // These will be populated from API when database is connected
  const stats = [
    { label: 'Members', value: '—', icon: Users, color: 'from-emerald-500 to-teal-500' },
    { label: 'Discussions', value: '—', icon: MessageSquare, color: 'from-blue-500 to-cyan-500' },
    { label: 'Online', value: '—', icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2', stat.color)}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-lg font-bold">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CommunityView() {
  const store = useProgressStore();
  const communityPosts = store.communityPosts || [];
  const addCommunityPost = store.addCommunityPost;
  const addCommunityComment = store.addCommunityComment;
  const voteCommunityPost = store.voteCommunityPost;
  const voteCommunityComment = store.voteCommunityComment;
  const profile = store.profile || { name: 'You' };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'discussed'>('newest');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newPostOpen, setNewPostOpen] = useState(false);

  // Use seed data if no posts exist
  const displayPosts = useMemo(() => {
    const posts = communityPosts.length > 0 ? communityPosts : getSeedPosts();
    return posts;
  }, [communityPosts]);

  const filteredPosts = useMemo(() => {
    let posts = displayPosts;

    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (categoryFilter !== 'all') {
      posts = posts.filter((p) => p.category === categoryFilter);
    }

    switch (sortBy) {
      case 'popular':
        posts = [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'discussed':
        posts = [...posts].sort((a, b) => countAllComments(b.comments) - countAllComments(a.comments));
        break;
      case 'newest':
      default:
        posts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
        break;
    }

    return posts;
  }, [displayPosts, search, categoryFilter, sortBy]);

  const selectedPost = selectedPostId ? displayPosts.find((p) => p.id === selectedPostId) : null;

  const handleVotePost = useCallback((postId: string, type: 'up' | 'down') => {
    voteCommunityPost(postId, type);
  }, [voteCommunityPost]);

  const handleVoteComment = useCallback((postId: string, commentId: string, type: 'up' | 'down') => {
    voteCommunityComment(postId, commentId, type);
  }, [voteCommunityComment]);

  const handleAddComment = useCallback((postId: string, body: string, parentId?: string) => {
    addCommunityComment(postId, {
      postId,
      parentId: parentId || null,
      author: profile.name,
      authorColor: '#10b981',
      body: body.trim(),
    });
  }, [addCommunityComment, profile.name]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
          </div>
          <CardContent className="p-6 lg:p-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Community Forum
                  </Badge>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Join the Conversation
                </h1>
                <p className="text-emerald-100/80 max-w-lg text-sm leading-relaxed">
                  Ask questions, share your progress, help others, and connect with fellow data enthusiasts.
                  The community is here to support your learning journey.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2">
                  {TOP_CONTRIBUTORS.slice(0, 4).map((c) => (
                    <div
                      key={c.name}
                      className="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {getInitials(c.name)}
                    </div>
                  ))}
                </div>
                <div className="text-white text-sm">
                  <span className="font-semibold">0</span>
                  <span className="text-emerald-200/60 ml-1">members</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <CommunityStatsCompact />

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Posts area */}
        <div className="space-y-4">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts, tags, or authors..."
                className="pl-9 h-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-10">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-1.5">
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="discussed">Most Discussed</SelectItem>
              </SelectContent>
            </Select>

            {/* New post button */}
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">New Post</span>
                </Button>
              </DialogTrigger>
              <NewPostDialog open={newPostOpen} onOpenChange={setNewPostOpen} />
            </Dialog>
          </motion.div>

          {/* Category quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 flex-wrap"
          >
            <button
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium',
                categoryFilter === 'all'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-transparent text-muted-foreground border-border/50 hover:border-emerald-200'
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium flex items-center gap-1',
                  categoryFilter === cat.value
                    ? cat.color + ' border-current/20'
                    : 'bg-transparent text-muted-foreground border-border/50 hover:border-emerald-200'
                )}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Posts list or detail view */}
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <PostDetail
                key={`detail-${selectedPost.id}`}
                post={selectedPost}
                onBack={() => setSelectedPostId(null)}
                onVotePost={(type) => handleVotePost(selectedPost.id, type)}
                onVoteComment={(commentId, type) => handleVoteComment(selectedPost.id, commentId, type)}
                onAddComment={(body, parentId) => handleAddComment(selectedPost.id, body, parentId)}
              />
            ) : (
              <motion.div
                key="post-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredPosts.length === 0 ? (
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                      <h3 className="text-base font-semibold mb-1">
                        {search || categoryFilter !== 'all' ? 'No matching posts' : 'No posts yet'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {search || categoryFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to start a discussion!'}
                      </p>
                      {!search && categoryFilter === 'all' && (
                        <Button
                          onClick={() => setNewPostOpen(true)}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Create First Post
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                      {communityPosts.length === 0 && ' — be the first to post!'}
                    </p>
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onVotePost={(type) => handleVotePost(post.id, type)}
                        onVoteComment={(commentId, type) => handleVoteComment(post.id, commentId, type)}
                        onAddComment={(body, parentId) => handleAddComment(post.id, body, parentId)}
                        onClick={() => setSelectedPostId(post.id)}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Mobile new post button */}
            <Button
              onClick={() => setNewPostOpen(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 mb-4 lg:mb-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Discussion Post
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TopContributorsSidebar />
          </motion.div>

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Community Guidelines
                </h3>
                <ul className="space-y-2">
                  {[
                    'Be respectful and constructive',
                    'Stay on topic with the category',
                    'Search before posting a question',
                    'Share your progress and learnings',
                    'Help others when you can',
                    'Tag your posts appropriately',
                  ].map((rule) => (
                    <li key={rule} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Mobile sidebar content */}
      <div className="lg:hidden space-y-4">
        <TopContributorsSidebar />
      </div>
    </div>
  );
}
