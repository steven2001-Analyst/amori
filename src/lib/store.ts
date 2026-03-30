import { create } from "zustand";
import { persist } from "zustand/middleware";
import { subjects, getAllTopics } from "./study-data";

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'member' | 'admin';
  joinedDate: string;
  avatarColor: string;
  profilePicture?: string; // base64 data URL
}

export interface LoginHistoryEntry {
  email: string;
  timestamp: number;
  action: 'login' | 'logout' | 'register';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  user: string;
  avatar: string;
  color: string;
  text: string;
  timestamp: number;
  reactions: Record<string, string[]>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tools: string[];
  status: 'in-progress' | 'completed' | 'showcase';
  link: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  targetDate: string;
  dailyHours: number;
  joinedDate: string;
  profilePicture?: string; // base64 data URL
}

export interface SecurityAuditEntry {
  id: string;
  type: 'copy_attempt' | 'screenshot_attempt' | 'context_menu' | 'print_attempt' | 'keyboard_shortcut';
  timestamp: number;
  details: string;
}

export interface BookAccessSession {
  bookId: string;
  token: string;
  grantedAt: number;
  pagesRead: number;
}

export interface UserBook {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverColor: string;
  rating: number;
  topics: string[];
  coverImage: string; // base64 data URL
  pdfData: string; // base64 data URL of PDF
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  content: {
    chapters: string[];
    chapterPreview: string[];
    keyTakeaways: string[];
    totalPages: number;
  };
}

export type CommunityCategory = 'help' | 'discussion' | 'showcase' | 'career' | 'tips';

export interface CommunityComment {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  authorColor: string;
  body: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
 replies: CommunityComment[];
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  author: string;
  authorColor: string;
  category: CommunityCategory;
  tags: string[];
  timestamp: number;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
 comments: CommunityComment[];
}

type UserRole = 'guest' | 'member' | 'admin';
type SubscriptionStatus = 'none' | 'active' | 'expired' | 'cancelled';
type SubscriptionPlan = 'free' | 'pro' | 'team';

interface StudyPlanItem {
  subjectId: string;
  duration: number;
}

/* ─── Community Forum helpers ─── */
function addReplyToComment(
  comment: CommunityComment,
  parentId: string,
  newComment: CommunityComment
): CommunityComment {
  if (comment.id === parentId) {
    return { ...comment, replies: [...comment.replies, newComment] };
  }
  return {
    ...comment,
    replies: comment.replies.map((r) => addReplyToComment(r, parentId, newComment)),
  };
}

function voteInComment(
  comment: CommunityComment,
  commentId: string,
  voteType: 'up' | 'down'
): CommunityComment {
  if (comment.id === commentId) {
    const newVote = comment.userVote === voteType ? null : voteType;
    let uv = comment.upvotes;
    let dv = comment.downvotes;
    if (comment.userVote === 'up') uv--;
    if (comment.userVote === 'down') dv--;
    if (newVote === 'up') uv++;
    if (newVote === 'down') dv++;
    return { ...comment, upvotes: uv, downvotes: dv, userVote: newVote };
  }
  return {
    ...comment,
    replies: comment.replies.map((r) => voteInComment(r, commentId, voteType)),
  };
}

// Kept for backward compatibility - LoginHistoryEntry is now exported above

interface ProgressState {
  // Existing fields
  completedTopics: string[];
  streak: number;
  lastStudyDate: string | null;
  studyDates: string[];
  quizHighScore: number;
  memoryGameCompleted: boolean;
  typingGameCompleted: boolean;
  typingGameBestWpm: number;
  wordScrambleHighScore: number;
  reactionTimeBest: number | null;
  bookStatuses: Record<string, 'none' | 'want' | 'reading' | 'completed'>;
  subscribedEmails: string[];
  notes: Record<string, string>;
  flashcards: Array<{ id: string; topicId: string; front: string; back: string }>;
  completedDailyChallenges: string[];
  completedCertificates: string[];
  practiceScores: Record<string, number>;
  studyPlan: Record<string, StudyPlanItem[]>;
  chatMessages: ChatMessage[];
  projects: Project[];
  savedResources: string[];
  profile: UserProfile;
  onboardingComplete: boolean;

  // Auth
  currentUser: string | null;
  registeredUsers: RegisteredUser[];
  loginHistory: LoginHistoryEntry[];
  loginEmail: string;
  loginPassword: string;
  isAuthenticated: boolean;
  failedLoginAttempts: number;
  lastLoginTime: number | null;
  sessionDuration: number;
  isLocked: boolean;
  lockExpiry: number | null;
  twoFactorEnabled: boolean;
  requirePasswordForBooks: boolean;

  // Auth methods
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  getCurrentUserData: () => RegisteredUser | null;
  authenticateUser: (email: string, password: string) => boolean;
  resetFailedAttempts: () => void;
  checkLockStatus: () => boolean;
  setTwoFactorEnabled: (enabled: boolean) => void;
  setRequirePasswordForBooks: (required: boolean) => void;
  lockAccount: (durationMinutes: number) => void;

  // New: Admin
  isAdmin: boolean;
  isLoggedIn: boolean;

  // New: Subscription/Role
  userRole: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string | null;

  // New: User uploaded books
  userBooks: UserBook[];

  // New: Book ratings & bookmarks
  bookRatings: Record<string, number>;
  bookmarkedBooks: string[];

  // New: Book reviews, reading progress & book notes
  bookReviews: Array<{ id: string; bookId: string; user: string; rating: number; text: string; date: number }>;
  readingProgress: Record<string, number>;
  bookNotes: Record<string, string>;

  // New: Security
  securityAuditLog: SecurityAuditEntry[];
  bookAccessSessions: BookAccessSession[];
  lastActivityTime: number | null;
  aiMessageCountThisMinute: number;
  aiMessageCountResetTime: number;

  // New: Notifications
  notifications: Array<{ id: string; type: 'achievement' | 'streak' | 'system' | 'community' | 'reminder'; title: string; message: string; timestamp: number; read: boolean; icon: string }>;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<ProgressState['notifications'][0], 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;

  // New: Gamification & XP
  xp: number;
  level: number;
  xpHistory: Array<{ date: string; xp: number }>;
  dailyQuests: Array<{ id: string; title: string; description: string; xpReward: number; completed: boolean; type: string }>;
  addXp: (amount: number) => void;
  completeDailyQuest: (id: string) => void;

  // New: Leaderboard
  leaderboardEntries: Array<{ name: string; xp: number; level: number; streak: number; rank: number }>;

  // Existing methods
  setNote: (topicId: string, content: string) => void;
  addFlashcard: (card: { topicId: string; front: string; back: string }) => void;
  removeFlashcard: (id: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  clearChatMessages: () => void;
  toggleTopic: (topicId: string) => void;
  isTopicCompleted: (topicId: string) => boolean;
  getSubjectProgress: (subjectId: string) => number;
  getOverallProgress: () => number;
  updateStreak: () => void;
  setQuizHighScore: (score: number) => void;
  setMemoryGameCompleted: (completed: boolean) => void;
  setTypingGameCompleted: (completed: boolean) => void;
  setTypingGameBestWpm: (wpm: number) => void;
  setWordScrambleHighScore: (score: number) => void;
  setReactionTimeBest: (time: number) => void;
  setBookStatus: (bookId: string, status: 'none' | 'want' | 'reading' | 'completed') => void;
  addSubscribedEmail: (email: string) => void;
  addDailyChallenge: (date: string) => void;
  addCertificate: (subjectId: string) => void;
  setPracticeScore: (subjectId: string, score: number) => void;
  addStudyPlanItem: (date: string, subjectId: string, duration: number) => void;
  removeStudyPlanItem: (date: string, index: number) => void;
  clearStudyPlan: () => void;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  resetProgress: () => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  toggleSavedResource: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setProfilePicture: (dataUrl: string | null) => void;
  setOnboardingComplete: () => void;

  // New: Admin methods
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  setIsAdmin: (value: boolean) => void;

  // New: Subscription methods
  setUserRole: (role: UserRole) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setSubscriptionExpiry: (date: string | null) => void;
  isProUser: () => boolean;
  canAccessFeature: (featureId: string) => boolean;

  // Payment verification
  paymentHistory: Array<{
    id: string;
    plan: 'free' | 'pro' | 'team';
    amount: number;
    currency: string;
    status: 'verified' | 'pending' | 'failed' | 'refunded';
    method: string;
    last4: string;
    date: string;
    transactionId: string;
  }>;
  addPaymentRecord: (record: Omit<ProgressState['paymentHistory'][0], 'id' | 'date' | 'transactionId'>) => void;
  verifyPayment: (paymentId: string) => boolean;
  refundPayment: (paymentId: string) => boolean;
  cancelSubscription: () => void;
  getActiveSubscription: () => { plan: string; status: string; expiry: string | null };

  // New: User books methods
  addUserBook: (book: Omit<UserBook, 'id' | 'uploadedAt'>) => void;
  removeUserBook: (id: string) => void;
  updateUserBook: (id: string, updates: Partial<UserBook>) => void;

  // New: Book ratings & bookmarks methods
  setBookRating: (bookId: string, rating: number) => void;
  toggleBookmark: (bookId: string) => void;

  // New: Book reviews, reading progress & book notes methods
  addBookReview: (bookId: string, text: string, rating: number) => void;
  removeBookReview: (reviewId: string) => void;
  setReadingProgress: (bookId: string, percent: number) => void;
  setBookNotes: (bookId: string, notes: string) => void;

  // New: Security methods
  addSecurityAuditEntry: (entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>) => void;
  createBookAccessSession: (bookId: string) => string;
  updateBookPagesRead: (bookId: string, pages: number) => void;
  invalidateBookSession: (bookId: string) => void;
  isBookSessionValid: (bookId: string, token: string) => boolean;
  updateLastActivity: () => void;
  checkAiRateLimit: () => boolean;
  incrementAiMessageCount: () => void;
  clearSecurityAuditLog: () => void;

  // New: Gamification methods
  addXp: (amount: number) => void;
  completeDailyQuest: (id: string) => void;

  // Certification Exam tracking
  completedCertExams: Array<{
    examId: string;
    score: number;
    total: number;
    passed: boolean;
    date: string;
    answers: number[];
  }>;
  addCertExamResult: (result: { examId: string; score: number; total: number; passed: boolean; answers: number[] }) => void;

  // Community Forum
  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'userVote' | 'comments'>) => void;
  addCommunityComment: (postId: string, comment: Omit<CommunityComment, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'userVote' | 'replies'>) => void;
  voteCommunityPost: (postId: string, voteType: 'up' | 'down') => void;
  voteCommunityComment: (postId: string, commentId: string, voteType: 'up' | 'down') => void;

  // Marketplace
  purchasedCourses: string[];
  premiumTier: 'free' | 'silver' | 'gold' | 'platinum';
  purchaseCourse: (courseId: string) => void;
  setPremiumTier: (tier: 'free' | 'silver' | 'gold' | 'platinum') => void;

  // Referral System
  referralCode: string;
  referralStats: { clicks: number; signups: number; conversions: number; earnings: number };
  referralHistory: Array<{ code: string; referredEmail: string; date: string; status: string }>;
  addReferralClick: () => void;
  addReferralSignup: (email: string) => void;
  addReferralConversion: (email: string) => void;

  // Site Control Center
  maintenanceMode: boolean;
  disabledFeatures: string[];
  customPricing: Record<string, number>;
  siteBranding: { name: string; tagline: string; primaryColor: string };
  registrationSettings: { open: boolean; emailVerification: boolean; autoApprove: boolean };

  // Site Control Center methods
  setMaintenanceMode: (enabled: boolean) => void;
  toggleFeature: (featureId: string) => void;
  setCustomPricing: (pricing: Record<string, number>) => void;
  setSiteBranding: (branding: Partial<{ name: string; tagline: string; primaryColor: string }>) => void;
  setRegistrationSettings: (settings: Partial<{ open: boolean; emailVerification: boolean; autoApprove: boolean }>) => void;
  resetAllUserProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedTopics: [],
      streak: 0,
      lastStudyDate: null,
      studyDates: [],
      quizHighScore: 0,
      memoryGameCompleted: false,
      typingGameCompleted: false,
      typingGameBestWpm: 0,
      wordScrambleHighScore: 0,
      reactionTimeBest: null,
      bookStatuses: {},
      subscribedEmails: [],
      chatMessages: [],
      projects: [],
      savedResources: [],
      profile: {
        name: 'Steven',
        email: 'stevensaleh100@outlook.com',
        bio: '',
        targetDate: '',
        dailyHours: 2,
        joinedDate: new Date().toISOString().split('T')[0],
        profilePicture: undefined,
      },
      notes: {},
      flashcards: [],
      completedDailyChallenges: [],
      completedCertificates: [],
      practiceScores: {},
      studyPlan: {},
      onboardingComplete: false,

      // Certification exams initial state
      completedCertExams: [],

      // Auth initial state
      currentUser: null,
      registeredUsers: [
        {
          id: 'admin-seed-001',
          name: 'Steven',
          email: 'stevensaleh100@outlook.com',
          passwordHash: simpleHash('datatrack2026'),
          role: 'admin',
          joinedDate: '2025-01-01',
          avatarColor: '#10b981',
        },
      ],
      loginHistory: [],
      loginEmail: '',
      loginPassword: '',
      isAuthenticated: false,
      failedLoginAttempts: 0,
      lastLoginTime: null,
      sessionDuration: 0,
      isLocked: false,
      lockExpiry: null,
      twoFactorEnabled: false,
      requirePasswordForBooks: false,

      // Admin initial state
      isAdmin: false,
      isLoggedIn: false,

      // Subscription initial state
      userRole: 'guest',
      subscriptionStatus: 'none',
      subscriptionPlan: 'free',
      subscriptionExpiry: null,

      // Payment history initial state
      paymentHistory: [],

      // User books initial state
      userBooks: [],

      // Book ratings & bookmarks initial state
      bookRatings: {},
      bookmarkedBooks: [],

      // Book reviews, reading progress & book notes initial state
      bookReviews: [],
      readingProgress: {},
      bookNotes: {},

      // Security initial state
      securityAuditLog: [],
      bookAccessSessions: [],
      lastActivityTime: Date.now(),
      aiMessageCountThisMinute: 0,
      aiMessageCountResetTime: Date.now(),

      // Notifications initial state
      notifications: [],

      // Gamification initial state
      xp: 0,
      level: 1,
      xpHistory: [],
      dailyQuests: [
        { id: 'q1', title: 'Daily Learner', description: 'Complete at least 1 topic today', xpReward: 25, completed: false, type: 'study' },
        { id: 'q2', title: 'Quiz Master', description: 'Score 80%+ on any quiz', xpReward: 50, completed: false, type: 'quiz' },
        { id: 'q3', title: 'Bookworm', description: 'Spend 10 minutes reading', xpReward: 30, completed: false, type: 'books' },
        { id: 'q4', title: 'Social Butterfly', description: 'Send a message in chat', xpReward: 15, completed: false, type: 'community' },
        { id: 'q5', title: 'Streak Keeper', description: 'Maintain your current streak', xpReward: 40, completed: false, type: 'streak' },
      ],

      // Leaderboard initial state
      leaderboardEntries: [
        { name: 'Alex Chen', xp: 4520, level: 12, streak: 45, rank: 1 },
        { name: 'Sarah Kim', xp: 3890, level: 10, streak: 32, rank: 2 },
        { name: 'David Lee', xp: 3210, level: 9, streak: 28, rank: 3 },
        { name: 'Priya Patel', xp: 2870, level: 8, streak: 21, rank: 4 },
        { name: 'Mike Johnson', xp: 2340, level: 7, streak: 15, rank: 5 },
        { name: 'You', xp: 0, level: 1, streak: 0, rank: 6 },
      ],

      // Community Forum initial state
      communityPosts: [],

      // Community Forum methods
      addCommunityPost: (post) => {
        const id = `cpost-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          communityPosts: [{
            ...post,
            id,
            timestamp: Date.now(),
            upvotes: 0,
            downvotes: 0,
            userVote: null,
            comments: [],
          }, ...(state.communityPosts || [])],
        }));
      },
      addCommunityComment: (postId, comment) => {
        const id = `ccom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          communityPosts: (state.communityPosts || []).map((p) => {
            if (p.id !== postId) return p;
            const newComment: CommunityComment = {
              ...comment,
              id,
              timestamp: Date.now(),
              upvotes: 0,
              downvotes: 0,
              userVote: null,
              replies: [],
            };
            if (!comment.parentId) {
              return { ...p, comments: [...p.comments, newComment] };
            }
            return {
              ...p,
              comments: p.comments.map((c) =>
                addReplyToComment(c, comment.parentId!, newComment)
              ),
            };
          }),
        }));
      },
      voteCommunityPost: (postId, voteType) => {
        set((state) => ({
          communityPosts: (state.communityPosts || []).map((p) => {
            if (p.id !== postId) return p;
            const newVote = p.userVote === voteType ? null : voteType;
            let uv = p.upvotes;
            let dv = p.downvotes;
            if (p.userVote === 'up') uv--;
            if (p.userVote === 'down') dv--;
            if (newVote === 'up') uv++;
            if (newVote === 'down') dv++;
            return { ...p, upvotes: uv, downvotes: dv, userVote: newVote };
          }),
        }));
      },
      voteCommunityComment: (postId, commentId, voteType) => {
        set((state) => ({
          communityPosts: (state.communityPosts || []).map((p) => {
            if (p.id !== postId) return p;
            return { ...p, comments: p.comments.map((c) => voteInComment(c, commentId, voteType)) };
          }),
        }));
      },

      // Marketplace initial state
      purchasedCourses: [],
      premiumTier: 'free' as const,

      // Referral System initial state
      referralCode: `DT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      referralStats: { clicks: 0, signups: 0, conversions: 0, earnings: 0 },
      referralHistory: [],

      // Site Control Center initial state
      maintenanceMode: false,
      disabledFeatures: [],
      customPricing: { free: 0, pro: 9.99, team: 24.99 },
      siteBranding: { name: 'DataTrack Pro', tagline: 'Your Data Analytics Journey', primaryColor: 'emerald' },
      registrationSettings: { open: true, emailVerification: false, autoApprove: true },

      setNote: (topicId: string, content: string) => {
        set((state) => ({
          notes: { ...state.notes, [topicId]: content },
        }));
      },

      addFlashcard: (card: { topicId: string; front: string; back: string }) => {
        const id = `fc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          flashcards: [...state.flashcards, { id, ...card }],
        }));
      },

      removeFlashcard: (id: string) => {
        set((state) => ({
          flashcards: state.flashcards.filter((f) => f.id !== id),
        }));
      },

      addChatMessage: (msg: ChatMessage) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, msg],
        }));
      },

      addReaction: (messageId: string, emoji: string, userId: string) => {
        set((state) => ({
          chatMessages: state.chatMessages.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions[emoji] || [];
            const alreadyReacted = existing.includes(userId);
            return {
              ...m,
              reactions: {
                ...m.reactions,
                [emoji]: alreadyReacted
                  ? existing.filter((u) => u !== userId)
                  : [...existing, userId],
              },
            };
          }),
        }));
      },

      clearChatMessages: () => {
        set({ chatMessages: [] });
      },

      toggleTopic: (topicId: string) => {
        set((state) => {
          const isCompleted = state.completedTopics.includes(topicId);
          const newCompleted = isCompleted
            ? state.completedTopics.filter((id) => id !== topicId)
            : [...state.completedTopics, topicId];

          if (!isCompleted) {
            const today = new Date().toISOString().split("T")[0];
            const lastDate = state.lastStudyDate;
            let newStreak = state.streak;

            if (lastDate === today) {
              newStreak = newStreak;
            } else {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];

              if (lastDate === yesterdayStr) {
                newStreak = state.streak + 1;
              } else {
                newStreak = 1;
              }
            }

            const newStudyDates = state.studyDates.includes(today)
              ? state.studyDates
              : [...state.studyDates, today];

            return {
              completedTopics: newCompleted,
              streak: newStreak,
              lastStudyDate: today,
              studyDates: newStudyDates,
            };
          }

          return { completedTopics: newCompleted };
        });
      },

      isTopicCompleted: (topicId: string) => {
        return get().completedTopics.includes(topicId);
      },

      getSubjectProgress: (subjectId: string) => {
        const state = get();
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject) return 0;
        const completed = subject.topics.filter((t) =>
          state.completedTopics.includes(t.id)
        ).length;
        return Math.round((completed / subject.topics.length) * 100);
      },

      getOverallProgress: () => {
        const state = get();
        const total = getAllTopics().length;
        if (total === 0) return 0;
        return Math.round((state.completedTopics.length / total) * 100);
      },

      updateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();

        if (state.lastStudyDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = 1;
        if (state.lastStudyDate === yesterdayStr) {
          newStreak = state.streak + 1;
        }

        set({
          streak: newStreak,
          lastStudyDate: today,
        });
      },

      setQuizHighScore: (score: number) => {
        set((state) => ({
          quizHighScore: Math.max(state.quizHighScore, score),
        }));
      },

      setMemoryGameCompleted: (completed: boolean) => {
        set({ memoryGameCompleted: completed });
      },

      setTypingGameCompleted: (completed: boolean) => {
        set({ typingGameCompleted: completed });
      },

      setTypingGameBestWpm: (wpm: number) => {
        set((state) => ({
          typingGameBestWpm: Math.max(state.typingGameBestWpm, wpm),
        }));
      },

      setWordScrambleHighScore: (score: number) => {
        set((state) => ({
          wordScrambleHighScore: Math.max(state.wordScrambleHighScore, score),
        }));
      },

      setReactionTimeBest: (time: number) => {
        set((state) => {
          if (state.reactionTimeBest === null || time < state.reactionTimeBest) {
            return { reactionTimeBest: time };
          }
          return {};
        });
      },

      setBookStatus: (bookId: string, status: 'none' | 'want' | 'reading' | 'completed') => {
        set((state) => ({
          bookStatuses: { ...state.bookStatuses, [bookId]: status },
        }));
      },

      addSubscribedEmail: (email: string) => {
        set((state) => ({
          subscribedEmails: [...state.subscribedEmails, email],
        }));
      },

      addDailyChallenge: (date: string) => {
        set((state) => {
          const current = Array.isArray(state.completedDailyChallenges) ? state.completedDailyChallenges : [];
          return {
            completedDailyChallenges: current.includes(date) ? current : [...current, date],
          };
        });
      },

      addCertificate: (subjectId: string) => {
        set((state) => {
          const current = Array.isArray(state.completedCertificates) ? state.completedCertificates : [];
          return {
            completedCertificates: current.includes(subjectId) ? current : [...current, subjectId],
          };
        });
      },

      setPracticeScore: (subjectId: string, score: number) => {
        set((state) => ({
          practiceScores: { ...(state.practiceScores || {}), [subjectId]: score },
        }));
      },

      addStudyPlanItem: (date: string, subjectId: string, duration: number) => {
        set((state) => {
          const plan = { ...(state.studyPlan || {}) };
          const items = [...(plan[date] || []), { subjectId, duration }];
          plan[date] = items;
          return { studyPlan: plan };
        });
      },

      removeStudyPlanItem: (date: string, index: number) => {
        set((state) => {
          const plan = { ...(state.studyPlan || {}) };
          const items = (plan[date] || []).filter((_: StudyPlanItem, i: number) => i !== index);
          plan[date] = items;
          return { studyPlan: plan };
        });
      },

      clearStudyPlan: () => {
        set({ studyPlan: {} });
      },

      getCompletedCount: () => {
        return get().completedTopics.length;
      },

      getTotalCount: () => {
        return getAllTopics().length;
      },

      addProject: (project: Omit<Project, 'id'>) => {
        const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          projects: [...state.projects, { ...project, id }],
        }));
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removeProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      toggleSavedResource: (id: string) => {
        set((state) => ({
          savedResources: state.savedResources.includes(id)
            ? state.savedResources.filter((r) => r !== id)
            : [...state.savedResources, id],
        }));
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      setProfilePicture: (dataUrl: string | null) => {
        set((state) => {
          const newProfile = { ...state.profile, profilePicture: dataUrl || undefined };
          const newUsers = state.registeredUsers.map((u) =>
            u.email === state.currentUser
              ? { ...u, profilePicture: dataUrl || undefined }
              : u
          );
          return {
            profile: newProfile,
            registeredUsers: newUsers,
          };
        });
      },

      setOnboardingComplete: () => {
        set({ onboardingComplete: true });
      },

      addCertExamResult: (result) => {
        set((state) => ({
          completedCertExams: [...(state.completedCertExams || []), {
            ...result,
            date: new Date().toISOString(),
          }],
        }));
      },

      // Auth methods
      loginUser: (email: string, password: string) => {
        const state = get();

        // Check lock status first
        if (state.isLocked) {
          if (state.lockExpiry && Date.now() < state.lockExpiry) {
            return { success: false, error: 'Account locked. Try again later.' };
          }
          set({ isLocked: false, lockExpiry: null, failedLoginAttempts: 0 });
        }

        if (!email.trim()) {
          return { success: false, error: 'Please enter your email.' };
        }
        if (!password) {
          return { success: false, error: 'Please enter your password.' };
        }

        const hash = simpleHash(password);
        const user = state.registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hash
        );

        if (user) {
          const loginTime = Date.now();
          set({
            currentUser: user.email,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isLoggedIn: true,
            userRole: user.role,
            subscriptionStatus: user.role === 'admin' ? 'active' : state.subscriptionStatus,
            subscriptionPlan: user.role === 'admin' ? 'pro' : state.subscriptionPlan,
            failedLoginAttempts: 0,
            lastLoginTime: loginTime,
            sessionDuration: 0,
            loginEmail: user.email,
            profile: { ...state.profile, name: user.name, email: user.email, joinedDate: user.joinedDate },
            loginHistory: [
              { email: user.email, timestamp: loginTime, action: 'login' },
              ...(state.loginHistory || []).slice(0, 49),
            ],
          });
          return { success: true };
        } else {
          const newFailedAttempts = state.failedLoginAttempts + 1;
          const newHistory: LoginHistoryEntry[] = [
            { email, timestamp: Date.now(), action: 'login' },
            ...(state.loginHistory || []).slice(0, 49),
          ];

          if (newFailedAttempts >= 5) {
            const lockExpiry = Date.now() + 5 * 60 * 1000;
            set({
              failedLoginAttempts: newFailedAttempts,
              isLocked: true,
              lockExpiry,
              loginHistory: newHistory,
            });
            return { success: false, error: 'Too many failed attempts. Account locked for 5 minutes.' };
          }

          set({
            failedLoginAttempts: newFailedAttempts,
            loginHistory: newHistory,
          });

          return { success: false, error: 'Invalid email or password.' };
        }
      },

      authenticateUser: (email: string, password: string) => {
        const result = get().loginUser(email, password);
        return result.success;
      },

      registerUser: (name: string, email: string, password: string) => {
        const state = get();

        if (!name.trim()) {
          return { success: false, error: 'Please enter your full name.' };
        }
        if (!email.trim()) {
          return { success: false, error: 'Please enter your email.' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (password.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters.' };
        }

        if (
          state.registeredUsers.some(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          )
        ) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
        const newUser: RegisteredUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash: simpleHash(password),
          role: 'member',
          joinedDate: new Date().toISOString().split('T')[0],
          avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
        };

        set({
          registeredUsers: [...state.registeredUsers, newUser],
          loginHistory: [
            { email: newUser.email, timestamp: Date.now(), action: 'register' },
            ...(state.loginHistory || []).slice(0, 49),
          ],
        });

        return { success: true };
      },

      getCurrentUserData: () => {
        const state = get();
        if (!state.currentUser) return null;
        return state.registeredUsers.find((u) => u.email === state.currentUser) || null;
      },

      logoutUser: () => {
        const state = get();
        const newHistory: LoginHistoryEntry[] = state.currentUser
          ? [{ email: state.currentUser, timestamp: Date.now(), action: 'logout' }, ...(state.loginHistory || []).slice(0, 49)]
          : state.loginHistory || [];
        set({
          currentUser: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoggedIn: false,
          userRole: 'guest',
          subscriptionPlan: 'free',
          subscriptionStatus: 'none',
          sessionDuration: 0,
          lastLoginTime: null,
          loginEmail: '',
          loginPassword: '',
          loginHistory: newHistory,
        });
      },

      resetFailedAttempts: () => {
        set({ failedLoginAttempts: 0 });
      },

      checkLockStatus: () => {
        const state = get();
        if (!state.isLocked) return false;
        if (state.lockExpiry && Date.now() >= state.lockExpiry) {
          set({ isLocked: false, lockExpiry: null, failedLoginAttempts: 0 });
          return false;
        }
        return true;
      },

      setTwoFactorEnabled: (enabled: boolean) => {
        set({ twoFactorEnabled: enabled });
      },

      setRequirePasswordForBooks: (required: boolean) => {
        set({ requirePasswordForBooks: required });
      },

      lockAccount: (durationMinutes: number) => {
        set({
          isLocked: true,
          lockExpiry: Date.now() + durationMinutes * 60 * 1000,
        });
      },

      // Admin methods
      loginAdmin: (username: string, password: string) => {
        const state = get();
        const adminEmail = 'stevensaleh100@outlook.com';
        const adminPass = 'datatrack2026';
        const isAdminCreds =
          (username === 'admin' && password === adminPass) ||
          (username === adminEmail && password === adminPass);

        if (isAdminCreds) {
          const loginTime = Date.now();
          set({
            currentUser: adminEmail,
            isLoggedIn: true,
            isAuthenticated: true,
            isAdmin: true,
            userRole: 'admin',
            subscriptionStatus: 'active',
            subscriptionPlan: 'pro',
            loginEmail: adminEmail,
            lastLoginTime: loginTime,
            profile: { ...state.profile, name: 'Steven', email: adminEmail },
            loginHistory: [
              { email: adminEmail, timestamp: loginTime, action: 'login' },
              ...(state.loginHistory || []).slice(0, 49),
            ],
          });
          return true;
        }
        return false;
      },

      logoutAdmin: () => {
        set({
          isAdmin: false,
          isLoggedIn: false,
          currentUser: null,
          isAuthenticated: false,
          loginEmail: '',
          lastLoginTime: null,
          userRole: 'guest',
          subscriptionStatus: 'none',
          subscriptionPlan: 'free',
        });
      },

      setIsAdmin: (value: boolean) => {
        set({ isAdmin: value });
      },

      // Subscription methods
      setUserRole: (role: UserRole) => {
        set({ userRole: role });
      },

      setSubscriptionStatus: (status: SubscriptionStatus) => {
        set({ subscriptionStatus: status });
      },

      setSubscriptionPlan: (plan: SubscriptionPlan) => {
        set({ subscriptionPlan: plan });
        if (plan === 'free') {
          set({ subscriptionStatus: 'none', userRole: 'guest' });
        } else {
          set({ subscriptionStatus: 'active', userRole: 'member' });
        }
      },

      setSubscriptionExpiry: (date: string | null) => {
        set({ subscriptionExpiry: date });
      },

      isProUser: () => {
        const state = get();
        return state.subscriptionPlan === 'pro' || state.subscriptionPlan === 'team' || state.userRole === 'admin';
      },

      canAccessFeature: (featureId: string) => {
        const state = get();
        if (state.userRole === 'admin') return true;
        
        // Check if subscription is active
        const isActive = state.subscriptionStatus === 'active' || state.userRole === 'admin';
        
        const freeFeatures = [
          'dashboard', 'study', 'books', 'games', 'community', 'chat',
          'notes', 'flashcards', 'profile', 'settings', 'achievements',
          'challenge', 'leaderboard', 'notifications', 'challenges',
        ];
        
        const proFeatures = [
          'ai-assistant', 'ai-questions', 'advanced-tools',
          'resume', 'playground', 'assessment', 'visualization',
          'whiteboard', 'peer-review', 'practice', 'certificate',
          'portfolio', 'resources', 'payment',
          'ai-sql-assistant', 'career-advisor',
          'course-store', 'pro-certifications', 'mentorship',
        ];
        
        if (freeFeatures.includes(featureId)) return true;
        if (proFeatures.includes(featureId)) {
          return isActive && (state.subscriptionPlan === 'pro' || state.subscriptionPlan === 'team');
        }
        return true;
      },

      addPaymentRecord: (record) => {
        const id = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const transactionId = `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          paymentHistory: [{
            ...record,
            id,
            date: new Date().toISOString(),
            transactionId,
          }, ...state.paymentHistory],
        }));
      },

      verifyPayment: (paymentId) => {
        set((state) => {
          const payment = state.paymentHistory.find(p => p.id === paymentId);
          if (!payment) return false;
          // Update payment status to verified
          const updated = state.paymentHistory.map(p => 
            p.id === paymentId ? { ...p, status: 'verified' as const } : p
          );
          // Auto-activate subscription based on payment plan
          const plan = payment.plan;
          const expiryDate = new Date();
          if (plan === 'pro') expiryDate.setMonth(expiryDate.getMonth() + 1);
          else if (plan === 'team') expiryDate.setMonth(expiryDate.getMonth() + 1);
          return {
            paymentHistory: updated,
            subscriptionPlan: plan,
            subscriptionStatus: 'active' as const,
            subscriptionExpiry: plan !== 'free' ? expiryDate.toISOString() : null,
            userRole: plan === 'free' ? 'guest' as const : 'member' as const,
          };
        });
        return true;
      },

      refundPayment: (paymentId) => {
        set((state) => ({
          paymentHistory: state.paymentHistory.map(p =>
            p.id === paymentId ? { ...p, status: 'refunded' as const } : p
          ),
        }));
        return true;
      },

      cancelSubscription: () => {
        set({
          subscriptionPlan: 'free',
          subscriptionStatus: 'cancelled' as const,
          userRole: 'guest' as const,
        });
      },

      getActiveSubscription: () => {
        const state = get();
        return {
          plan: state.subscriptionPlan,
          status: state.subscriptionStatus,
          expiry: state.subscriptionExpiry,
        };
      },

      // User books methods
      addUserBook: (book: Omit<UserBook, 'id' | 'uploadedAt'>) => {
        const id = `ubook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          userBooks: [...state.userBooks, { ...book, id, uploadedAt: Date.now() }],
        }));
      },

      removeUserBook: (id: string) => {
        set((state) => ({
          userBooks: state.userBooks.filter((b) => b.id !== id),
        }));
      },

      updateUserBook: (id: string, updates: Partial<UserBook>) => {
        set((state) => ({
          userBooks: state.userBooks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      // Book ratings & bookmarks methods
      setBookRating: (bookId: string, rating: number) => {
        set((state) => ({
          bookRatings: { ...state.bookRatings, [bookId]: rating },
        }));
      },

      toggleBookmark: (bookId: string) => {
        set((state) => ({
          bookmarkedBooks: state.bookmarkedBooks.includes(bookId)
            ? state.bookmarkedBooks.filter((id) => id !== bookId)
            : [...state.bookmarkedBooks, bookId],
        }));
      },

      // Book reviews, reading progress & book notes methods
      addBookReview: (bookId: string, text: string, rating: number) => {
        const id = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          bookReviews: [...(state.bookReviews || []), { id, bookId, user: 'You', rating, text, date: Date.now() }],
        }));
      },

      removeBookReview: (reviewId: string) => {
        set((state) => ({
          bookReviews: (state.bookReviews || []).filter((r) => r.id !== reviewId),
        }));
      },

      setReadingProgress: (bookId: string, percent: number) => {
        set((state) => ({
          readingProgress: { ...(state.readingProgress || {}), [bookId]: Math.min(100, Math.max(0, percent)) },
        }));
      },

      setBookNotes: (bookId: string, notes: string) => {
        set((state) => ({
          bookNotes: { ...(state.bookNotes || {}), [bookId]: notes },
        }));
      },

      // Security methods
      addSecurityAuditEntry: (entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>) => {
        const newEntry: SecurityAuditEntry = {
          ...entry,
          id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          securityAuditLog: [...state.securityAuditLog.slice(-99), newEntry],
        }));
      },

      createBookAccessSession: (bookId: string) => {
        const token = `session-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
        const session: BookAccessSession = {
          bookId,
          token,
          grantedAt: Date.now(),
          pagesRead: 0,
        };
        set((state) => ({
          bookAccessSessions: [...state.bookAccessSessions.filter(s => s.bookId !== bookId), session],
        }));
        return token;
      },

      updateBookPagesRead: (bookId: string, pages: number) => {
        set((state) => ({
          bookAccessSessions: state.bookAccessSessions.map((s) =>
            s.bookId === bookId ? { ...s, pagesRead: pages } : s
          ),
        }));
      },

      invalidateBookSession: (bookId: string) => {
        set((state) => ({
          bookAccessSessions: state.bookAccessSessions.filter((s) => s.bookId !== bookId),
        }));
      },

      isBookSessionValid: (bookId: string, token: string) => {
        const state = get();
        const session = state.bookAccessSessions.find((s) => s.bookId === bookId && s.token === token);
        if (!session) return false;
        // Session expires after 2 hours
        return Date.now() - session.grantedAt < 2 * 60 * 60 * 1000;
      },

      updateLastActivity: () => {
        set({ lastActivityTime: Date.now() });
      },

      checkAiRateLimit: () => {
        const state = get();
        const now = Date.now();
        // Reset counter if minute has passed
        if (now - state.aiMessageCountResetTime > 60000) {
          set({ aiMessageCountThisMinute: 0, aiMessageCountResetTime: now });
          return true;
        }
        // Pro users have unlimited, guests have 5 per minute
        if (state.isProUser()) return true;
        return state.aiMessageCountThisMinute < 5;
      },

      incrementAiMessageCount: () => {
        const state = get();
        const now = Date.now();
        if (now - state.aiMessageCountResetTime > 60000) {
          set({ aiMessageCountThisMinute: 1, aiMessageCountResetTime: now });
        } else {
          set({ aiMessageCountThisMinute: state.aiMessageCountThisMinute + 1 });
        }
      },

      clearSecurityAuditLog: () => {
        set({ securityAuditLog: [] });
      },

      // Notification methods
      addNotification: (n) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          notifications: [{ ...n, id, timestamp: Date.now(), read: false }, ...state.notifications].slice(0, 50),
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
        }));
      },
      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Gamification methods
      addXp: (amount) => {
        set((state) => {
          const newTotal = state.xp + amount;
          const xpPerLevel = 500;
          const newLevel = Math.floor(newTotal / xpPerLevel) + 1;
          const today = new Date().toISOString().split('T')[0];
          const newHistory = [...state.xpHistory];
          const todayEntry = newHistory.find((h) => h.date === today);
          if (todayEntry) {
            todayEntry.xp += amount;
          } else {
            newHistory.push({ date: today, xp: amount });
          }
          // Update leaderboard entry for "You"
          const newLeaderboard = state.leaderboardEntries.map((e) =>
            e.name === 'You' ? { ...e, xp: newTotal, level: newLevel, streak: state.streak } : e
          ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));
          return { xp: newTotal, level: newLevel, xpHistory: newHistory.slice(-90), leaderboardEntries: newLeaderboard };
        });
      },
      completeDailyQuest: (id) => {
        set((state) => {
          const quest = state.dailyQuests.find((q) => q.id === id);
          if (!quest || quest.completed) return {};
          const newTotal = state.xp + quest.xpReward;
          const xpPerLevel = 500;
          const newLevel = Math.floor(newTotal / xpPerLevel) + 1;
          const newLeaderboard = state.leaderboardEntries.map((e) =>
            e.name === 'You' ? { ...e, xp: newTotal, level: newLevel, streak: state.streak } : e
          ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));
          return {
            dailyQuests: state.dailyQuests.map((q) => q.id === id ? { ...q, completed: true } : q),
            xp: newTotal,
            level: newLevel,
            leaderboardEntries: newLeaderboard,
          };
        });
      },

      // Site Control Center methods
      setMaintenanceMode: (enabled: boolean) => {
        set({ maintenanceMode: enabled });
      },

      toggleFeature: (featureId: string) => {
        set((state) => {
          const current = Array.isArray(state.disabledFeatures) ? state.disabledFeatures : [];
          return {
            disabledFeatures: current.includes(featureId)
              ? current.filter((f) => f !== featureId)
              : [...current, featureId],
          };
        });
      },

      setCustomPricing: (pricing: Record<string, number>) => {
        set({ customPricing: pricing });
      },

      setSiteBranding: (branding: Partial<{ name: string; tagline: string; primaryColor: string }>) => {
        set((state) => ({
          siteBranding: { ...state.siteBranding, ...branding },
        }));
      },

      setRegistrationSettings: (settings: Partial<{ open: boolean; emailVerification: boolean; autoApprove: boolean }>) => {
        set((state) => ({
          registrationSettings: { ...state.registrationSettings, ...settings },
        }));
      },

      resetAllUserProgress: () => {
        set({
          completedTopics: [],
          streak: 0,
          lastStudyDate: null,
          studyDates: [],
          quizHighScore: 0,
          memoryGameCompleted: false,
          typingGameCompleted: false,
          typingGameBestWpm: 0,
          wordScrambleHighScore: 0,
          reactionTimeBest: null,
          bookStatuses: {},
          notes: {},
          flashcards: [],
          completedDailyChallenges: [],
          completedCertificates: [],
          practiceScores: {},
          studyPlan: {},
          chatMessages: [],
          projects: [],
          savedResources: [],
          xp: 0,
          level: 1,
          xpHistory: [],
        });
      },

      purchaseCourse: (courseId: string) => {
        set((state) => ({
          purchasedCourses: state.purchasedCourses.includes(courseId)
            ? state.purchasedCourses
            : [...state.purchasedCourses, courseId],
        }));
      },
      setPremiumTier: (tier: 'free' | 'silver' | 'gold' | 'platinum') => {
        set({ premiumTier: tier });
      },
      addReferralClick: () => {
        set((state) => ({
          referralStats: { ...state.referralStats, clicks: state.referralStats.clicks + 1 },
        }));
      },
      addReferralSignup: (email: string) => {
        set((state) => ({
          referralStats: { ...state.referralStats, signups: state.referralStats.signups + 1 },
          referralHistory: [...state.referralHistory, { code: state.referralCode, referredEmail: email, date: new Date().toISOString(), status: 'signed_up' }],
        }));
      },
      addReferralConversion: (email: string) => {
        set((state) => ({
          referralStats: { ...state.referralStats, conversions: state.referralStats.conversions + 1, earnings: state.referralStats.earnings + 5 },
          referralHistory: state.referralHistory.map(h => h.referredEmail === email ? { ...h, status: 'converted' } : h),
        }));
      },

      resetProgress: () => {
        set({
          completedTopics: [],
          streak: 0,
          lastStudyDate: null,
          studyDates: [],
          quizHighScore: 0,
          memoryGameCompleted: false,
          typingGameCompleted: false,
          typingGameBestWpm: 0,
          wordScrambleHighScore: 0,
          reactionTimeBest: null,
          bookStatuses: {},
          subscribedEmails: [],
          notes: {},
          flashcards: [],
          chatMessages: [],
          projects: [],
          savedResources: [],
          completedDailyChallenges: [],
          completedCertificates: [],
          practiceScores: {},
          studyPlan: {},
          securityAuditLog: [],
          bookAccessSessions: [],
          userBooks: [],
          bookRatings: {},
          bookmarkedBooks: [],
          bookReviews: [],
          readingProgress: {},
          bookNotes: {},
          currentUser: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoggedIn: false,
          userRole: 'guest' as UserRole,
          subscriptionPlan: 'free' as SubscriptionPlan,
          subscriptionStatus: 'none' as SubscriptionStatus,
          subscriptionExpiry: null,
          paymentHistory: [],
          failedLoginAttempts: 0,
          isLocked: false,
          lockExpiry: null,
          sessionDuration: 0,
          lastLoginTime: null,
          loginEmail: '',
          loginPassword: '',
          twoFactorEnabled: false,
          loginHistory: [],
          registeredUsers: [{
            id: 'admin-seed-001',
            name: 'Steven',
            email: 'stevensaleh100@outlook.com',
            passwordHash: simpleHash('datatrack2026'),
            role: 'admin' as const,
            joinedDate: '2025-01-01',
            avatarColor: '#10b981',
          }],
          requirePasswordForBooks: false,
          communityPosts: [],
          maintenanceMode: false,
          disabledFeatures: [],
          customPricing: { free: 0, pro: 9.99, team: 24.99 },
          siteBranding: { name: 'DataTrack Pro', tagline: 'Your Data Analytics Journey', primaryColor: 'emerald' },
          registrationSettings: { open: true, emailVerification: false, autoApprove: true },
          completedCertExams: [],
          purchasedCourses: [],
          premiumTier: 'free' as const,
          referralStats: { clicks: 0, signups: 0, conversions: 0, earnings: 0 },
          referralHistory: [],
        });
      },
    }),
    {
      name: "study-progress",
      version: 2,
      merge: (persisted, current) => {
        // Ensure all new fields exist when loading old localStorage data
        const defaults = {
          completedDailyChallenges: [],
          completedCertificates: [],
          practiceScores: {},
          studyPlan: {},
          isAdmin: false,
          isLoggedIn: false,
          userRole: 'guest' as UserRole,
          subscriptionStatus: 'none' as SubscriptionStatus,
          subscriptionPlan: 'free' as SubscriptionPlan,
          subscriptionExpiry: null,
          paymentHistory: [],
          securityAuditLog: [],
          bookAccessSessions: [],
          lastActivityTime: Date.now(),
          aiMessageCountThisMinute: 0,
          aiMessageCountResetTime: Date.now(),
          userBooks: [],
          bookRatings: {},
          bookmarkedBooks: [],
          bookReviews: [],
          readingProgress: {},
          bookNotes: {},
          currentUser: null,
          loginEmail: '',
          loginPassword: '',
          isAuthenticated: false,
          failedLoginAttempts: 0,
          lastLoginTime: null,
          sessionDuration: 0,
          isLocked: false,
          lockExpiry: null,
          twoFactorEnabled: false,
          loginHistory: [],
          registeredUsers: [],
          requirePasswordForBooks: false,
          notifications: [],
          xp: 0,
          level: 1,
          xpHistory: [],
          dailyQuests: [
            { id: 'q1', title: 'Daily Learner', description: 'Complete at least 1 topic today', xpReward: 25, completed: false, type: 'study' },
            { id: 'q2', title: 'Quiz Master', description: 'Score 80%+ on any quiz', xpReward: 50, completed: false, type: 'quiz' },
            { id: 'q3', title: 'Bookworm', description: 'Spend 10 minutes reading', xpReward: 30, completed: false, type: 'books' },
            { id: 'q4', title: 'Social Butterfly', description: 'Send a message in chat', xpReward: 15, completed: false, type: 'community' },
            { id: 'q5', title: 'Streak Keeper', description: 'Maintain your current streak', xpReward: 40, completed: false, type: 'streak' },
          ],
          leaderboardEntries: [],
          communityPosts: [],
          maintenanceMode: false,
          disabledFeatures: [],
          customPricing: { free: 0, pro: 9.99, team: 24.99 },
          siteBranding: { name: 'DataTrack Pro', tagline: 'Your Data Analytics Journey', primaryColor: 'emerald' },
          registrationSettings: { open: true, emailVerification: false, autoApprove: true },
          completedCertExams: [],
        };
        const merged = { ...current, ...defaults, ...(persisted as object) };
        // Ensure admin seed user always exists
        if (!Array.isArray(merged.registeredUsers) || !merged.registeredUsers.some((u: RegisteredUser) => u.email === 'stevensaleh100@outlook.com')) {
          merged.registeredUsers = [
            {
              id: 'admin-seed-001',
              name: 'Steven',
              email: 'stevensaleh100@outlook.com',
              passwordHash: simpleHash('datatrack2026'),
              role: 'admin' as const,
              joinedDate: '2025-01-01',
              avatarColor: '#10b981',
            },
            ...(Array.isArray(merged.registeredUsers) ? merged.registeredUsers : []),
          ];
        }
        return merged;
      },
    }
  )
);
