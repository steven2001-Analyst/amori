'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ───
interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

// ─── Navigation Keyword Detection ───
// Returns true if the input matches a known navigation/help keyword.
// These get instant hardcoded responses (fast, useful).
function isNavigationQuery(input: string): boolean {
  const lower = input.toLowerCase().trim();
  const navKeywords = [
    'dashboard', 'study', 'learn', 'book', 'library', 'chat',
    'ai', 'assistant', 'tool', 'advanced', 'game', 'achievement',
    'badge', 'trophy', 'certificate', 'profile', 'settings', 'account',
    'payment', 'subscription', 'upgrade', 'plan', 'pricing', 'admin',
    'flashcard', 'note', 'streak', 'challenge', 'daily', 'practice',
    'exercise', 'portfolio', 'resource', 'video', 'promo', 'discount',
    'code', 'help', 'how', 'what can', 'hello', 'hi', 'hey', 'greet',
    'thank', 'thanks', 'thx',
  ];
  return navKeywords.some((kw) => lower.includes(kw));
}

// ─── Smart Response Engine ───
function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // Navigation Help
  if (lower.includes('dashboard')) {
    return `📊 **Dashboard Guide**

The Dashboard is your home base! Here's what you'll find:

• **Progress Overview** — Your overall completion percentage across all 8 subjects, shown in a beautiful animated progress ring.
• **Streak Banner** — See your current study streak and keep it alive by studying daily.
• **Stats Grid** — Key metrics like total topics completed, study time, quiz scores, and more.
• **Weekly Heatmap** — A GitHub-style activity map showing your study patterns throughout the week.
• **Radar Chart** — Visual breakdown of your skill levels across all subjects.
• **Continue Learning** — Jump right back into where you left off with the "Continue Learning" button.
• **Daily Motivation** — Get inspired with a fresh motivational quote each day!

💡 **Tip**: Visit the dashboard first thing to plan your study session!`;
  }

  if (lower.includes('study') || lower.includes('learn')) {
    return `📚 **Study Path Guide**

The Study Path is where your learning happens! Here's everything you need to know:

• **8 Subjects** — Introduction to Data Analytics, Excel, SQL, Power BI, Python, Data Warehousing, Databricks & Spark, and Advanced Topics.
• **57 Total Topics** — Each subject has multiple topics (numbered like 1.1, 1.2, etc.) covering key concepts.
• **Checkboxes** — Click any topic to mark it as completed. Your progress is saved automatically!
• **Sequential Unlocking** — Subjects unlock as you progress. Stay focused and work through them in order.
• **Progress Tracking** — Each subject card shows a progress bar with your completion percentage.
• **Confetti Celebration** 🎉 — Complete all topics in a subject to trigger a fun confetti animation!

💡 **Tip**: Aim for consistency over speed. Even 15 minutes a day builds momentum!`;
  }

  if (lower.includes('book') || lower.includes('library')) {
    return `📖 **Books Library Guide**

The Books Library has **43 curated books** across all 8 subjects! Here's how to use it:

• **Browse by Subject** — Use filters to find books for any topic you're studying.
• **Book Cards** — Each card shows the title, author, rating, difficulty level, and a beautiful gradient cover.
• **Reading Status** — Mark books as "Want to Read", "Reading", or "Completed".
• **Secure Reader** — Click the eye icon to open the protected book viewer with chapter navigation.
• **Content Protection** — Books have right-click prevention, watermark overlays, and screenshot detection.
• **Ratings** — See community ratings (out of 5) to pick the best resources.
• **Difficulty Levels** — Books are tagged Beginner, Intermediate, or Advanced.

💡 **Tip**: Start with beginner books and work your way up as your skills grow!`;
  }

  if (lower.includes('chat')) {
    return `💬 **Community Chat Guide**

The Chat Room is where you connect with fellow learners! Here's what's inside:

• **6 Chat Rooms** — General, SQL Help, Python Help, Career Advice, Study Group, and Showcase.
• **Real-Time Messages** — Send messages and get simulated responses from community members.
• **Emoji Reactions** — React to messages with 👍 ❤️ 🎉 😂 🤔 👏 🔥 💯.
• **Full Emoji Picker** — Access 140+ emojis organized by category (Smileys, Gestures, Hearts, Objects).
• **Reply & Forward** — Reply to specific messages or forward them to other rooms.
• **Pinned Messages** — Check pinned messages per channel for important info.
• **Message Search** — Search within any channel to find past conversations.
• **Bookmarks** — Save important messages for later reference.

💡 **Tip**: Join the Study Group room for collaborative learning sessions!`;
  }

  if (lower.includes('ai') || lower.includes('assistant')) {
    return `🤖 **AI Study Assistant Guide**

The AI Study Assistant is your personal data analytics tutor! Here's how it helps:

• **Ask Anything** — Type any question about data analytics, Excel, SQL, Python, Power BI, and more.
• **Real AI Responses** — Powered by advanced AI to give you detailed, accurate explanations.
• **Quick Questions** — Try pre-built questions like "Explain JOIN types" or "Python vs SQL".
• **Chat History** — Your conversation stays visible during the session for easy reference.
• **Markdown Formatting** — Responses include bold text, code snippets, and formatted examples.
• **Clear Chat** — Start fresh anytime with the clear chat button.

💡 **Tip**: Ask follow-up questions to dive deeper into any topic!`;
  }

  if (lower.includes('tool') || lower.includes('advanced')) {
    return `🔧 **Advanced Developer Tools Guide**

DataTrack Pro includes powerful developer tools for data professionals:

• **Regex Tester** — Build and test regular expressions with real-time matching and highlighting.
• **JSON Formatter** — Paste, format, validate, and minify JSON data instantly.
• **SQL Playground** — Practice SQL queries with a built-in editor.
• **Color Picker** — Convert between HEX, RGB, and HSL color formats.
• **Data Converter** — Transform data between CSV, JSON, XML, and YAML formats.
• **Base64 Encoder/Decoder** — Encode and decode Base64 strings including Unicode support.
• **Hash Generator** — Generate MD5, SHA-1, and SHA-256 hashes for any text.
• **Study Tools** — Also includes Pomodoro Timer, Study Planner, Keyboard Shortcuts, and Cheat Sheet.

💡 **Tip**: The JSON Formatter is perfect for debugging API responses!`;
  }

  if (lower.includes('game')) {
    return `🎮 **Games & Break Guide**

Take fun breaks that sharpen your skills! Here are the 6 available games:

• **🧠 Quiz Game** — 15 data analytics multiple-choice questions. Track your high score!
• **🃏 Memory Match** — Card matching game with 3 difficulty levels (Easy/Medium/Hard).
• **⌨️ Typing Speed** — Test your typing speed with data analytics terms. Measure WPM and accuracy!
• **🔤 Word Scramble** — Unscramble data-related words before time runs out.
• **⚡ Reaction Time** — Test your reflexes across 10 rounds. Get a rating from "Snail" to "Flash"!
• **🧘 Breathing Exercise** — Relax with a 4-4-4 breathing pattern. Great between study sessions.

💡 **Tip**: Games track your best scores. Try to beat your personal records!`;
  }

  if (lower.includes('achievement') || lower.includes('badge') || lower.includes('trophy')) {
    return `🏆 **Achievements & Badges Guide**

DataTrack Pro has **12 achievements** across 4 categories to earn:

• **🚀 Progress Badges** — "First Steps" (1st topic), "Getting Started" (10 topics), "Halfway There" (50% complete), "Completionist" (100%).
• **📚 Subject Master** — "Excel Expert", "SQL Wizard", "Python Pro" — complete all topics in a subject.
• **🔥 Streak Badges** — "Week Warrior" (7-day streak), "Monthly Master" (30-day streak).
• **🎮 Game Champion** — "Quiz Master" (perfect quiz score), "Memory King" (memory game record).

Each badge shows as locked (grayed) until you earn it, then lights up with a celebration animation!

💡 **Tip**: Check the Achievements page regularly to see your progress toward the next badge!`;
  }

  if (lower.includes('certificate')) {
    return `🎓 **Certificate Guide**

Earn certificates for each subject you fully complete! Here's how:

• **100% Completion Required** — Complete ALL topics in a subject to unlock its certificate.
• **Beautiful Certificate Design** — Each certificate features decorative borders, amber accents, and a verified seal.
• **Unique Certificate Number** — Every certificate gets a unique ID (format: DT-YYYYMMDD-XXXX).
• **Print Ready** — Use the print button to get a physical copy of your certificate.
• **Filter View** — View All, Earned, or Locked certificates.

💡 **Tip**: Your certificates show on the "Earned" tab once unlocked. Complete all 8 subjects to become a certified data analyst!`;
  }

  if (lower.includes('profile') || lower.includes('settings') || lower.includes('account')) {
    return `👤 **Profile & Settings Guide**

Customize your DataTrack Pro experience with these options:

• **Profile Settings** — Update your name, email, bio, timezone, and avatar.
• **Study Preferences** — Set daily study hours (1-8h), target completion date, and difficulty level.
• **Appearance** — Switch between Light, Dark, and System themes. Adjust font size.
• **Privacy Controls** — Control who sees your profile and activity.
• **Notifications** — Configure email alerts, daily reminders, and achievement notifications.
• **Subscription Management** — View your current plan, update payment, and manage billing.
• **Danger Zone** — Export your data as JSON or reset all progress.

💡 **Tip**: Set a daily study reminder to stay consistent with your learning goals!`;
  }

  if (lower.includes('payment') || lower.includes('subscription') || lower.includes('upgrade') || lower.includes('plan') || lower.includes('pricing')) {
    return `💰 **Subscription & Payment Guide**

DataTrack Pro offers 3 plans to fit your learning journey:

• **🟢 Free Plan** — Basic access to study materials, limited games, community chat.
• **🟡 Pro Plan ($9.99/mo)** — Full access to all features: AI Assistant, advanced tools, certificates, unlimited books, and more.
• **🔴 Team Plan ($24.99/mo)** — Everything in Pro + team collaboration, admin dashboard, and priority support.

**16 Features Compared** including: Books access, AI Assistant, Daily Challenges, Certificates, Practice Exercises, Advanced Tools, Priority Support, and more.

**Payment Options** — Visa, Mastercard, American Express accepted.

💡 **Tip**: Use promo codes to save! Try **WELCOME20** (20% off), **STUDENT50** (50% off), or **SAVE10** (10% off)!`;
  }

  if (lower.includes('admin')) {
    return `🛡️ **Admin Panel Guide**

The Admin Panel is available to admin users only. It includes:

• **📊 Overview** — Total users, active streaks, books read, game scores, chat messages, practice rates, certificates, and more.
• **👥 User Management** — View, search, ban/unban users. See detailed user profiles and activity.
• **📚 Content Management** — Manage books, subjects, and challenges. View read counts and ratings.
• **📈 Content Analytics** — Subject completion rates, most read books, active chat rooms, and practice completion.
• **💳 Financial Overview** — Monthly revenue, annual projections, subscription breakdown, and churn rate.
• **🔒 Security Audit** — Track security events (copy attempts, screenshots, right-click, keyboard shortcuts) with CSV export.
• **⚙️ System Settings** — Maintenance mode, registration, rate limiting, 2FA, and content protection toggles.

💡 **Tip**: Use the Security Audit tab to monitor content protection events!`;
  }

  // Feature Help
  if (lower.includes('flashcard')) {
    return `🃏 **Flashcards Guide**

Create and study flashcards to reinforce your learning:

• **Create Cards** — Select a subject and topic, then enter a question (front) and answer (back).
• **Flip Animation** — Click cards to flip between question and answer with a smooth 3D animation.
• **Navigation** — Use Previous/Next buttons, or Shuffle to randomize the deck order.
• **Filter by Subject** — Focus on specific subjects using the dropdown filter.
• **Delete Cards** — Remove cards you no longer need.
• **Topic Labels** — Each card shows which topic it belongs to.

💡 **Tip**: Create flashcards for concepts you find difficult — repetition is key to retention!`;
  }

  if (lower.includes('note')) {
    return `📝 **Notes Guide**

Take organized notes for every topic you study:

• **Per-Topic Notes** — Each of the 57 topics has its own dedicated note space.
• **Auto-Save** — Notes save automatically after 800ms of inactivity.
• **Subject Organization** — Notes are grouped by subject in expandable accordion sections.
• **Search** — Search across all topic names and note content instantly.
• **Character Count** — See how much you've written for each topic.
• **Visual Indicators** — Topics with notes show a pencil icon for quick identification.
• **Clear Notes** — Delete individual notes when no longer needed.

💡 **Tip**: Write notes in your own words — it helps cement your understanding!`;
  }

  if (lower.includes('streak')) {
    return `🔥 **Streak Guide**

Streaks keep you motivated and consistent! Here's how they work:

• **Daily Study** — Complete at least one topic per day to maintain your streak.
• **Streak Counter** — Your current streak is displayed on the Dashboard banner.
• **Streak Badges** — Earn "Week Warrior" (7 days) and "Monthly Master" (30 days) achievements.
• **Daily Challenges** — Complete the daily challenge to contribute to your streak.
• **Don't Break It!** — Missing a day resets your streak to 0.

**Tips to maintain your streak:**
• ⏰ Set a daily reminder in your profile settings.
• 🎯 Start with just 1 topic if you're busy.
• 🧘 Use the breathing exercise on busy days (it counts!).
• 📅 Plan study sessions on your calendar.

💡 **Tip**: Consistency beats intensity. A 15-minute daily habit outperforms weekend cramming!`;
  }

  if (lower.includes('challenge') || lower.includes('daily')) {
    return `⚡ **Daily Challenge Guide**

A new challenge every day to test your knowledge! Here's what to expect:

• **30 Unique Challenges** — Across SQL, Excel, Python, Power BI, Data Warehousing, and General topics.
• **One Per Day** — A new challenge unlocks each day based on the day of the year.
• **Challenge Types** — Multiple choice (MCQ) and True/False questions.
• **Difficulty Levels** — Easy, Medium, and Hard challenges.
• **Instant Feedback** — See if you're correct immediately with detailed explanations.
• **Stats Tracking** — View your challenge streak, total completed, and monthly calendar.
• **Mini Calendar** — See which days you've completed challenges with green checkmarks.
• **Try Again** — If you get it wrong, try again until you get it right!

💡 **Tip**: Complete the daily challenge every morning to build a winning streak!`;
  }

  if (lower.includes('practice') || lower.includes('exercise')) {
    return `🏋️ **Practice Exercises Guide**

Sharpen your skills with targeted practice exercises:

• **26 Total Exercises** — Across Excel (6), SQL (6), Python (6), Power BI (4), and General (4).
• **Multiple Formats** — MCQ questions with selectable options and code exercises with free-form input.
• **Subject Tabs** — Filter exercises by subject at the top of the page.
• **Progress Tracking** — Per-subject progress bars and accuracy percentages.
• **Hints** — Code exercises include hints to help you when you're stuck.
• **Explanations** — Every exercise shows a detailed explanation after submission.
• **Retry** — Try incorrect MCQ answers again to learn from mistakes.
• **Best Scores** — Your best score per subject is saved to track improvement.

💡 **Tip**: Practice each subject until you hit 100% accuracy before moving on!`;
  }

  if (lower.includes('portfolio')) {
    return `💼 **Project Portfolio Guide**

Showcase your data analytics projects like a pro!

• **Add Projects** — Fill in the project name, description, tools used, status, and link.
• **21 Tool Options** — Tag your projects with tools like Python, SQL, Excel, Power BI, Tableau, R, and more.
• **3 Status Types** — Mark projects as "In Progress", "Completed", or "On Hold".
• **Project Cards** — Beautiful cards with colored tool badges, status icons, and action buttons.
• **Edit & Delete** — Update project details or remove them anytime.
• **External Links** — Attach URLs to GitHub repos, live demos, or documentation.
• **Empty State** — Get started with helpful guidance when you have no projects yet.

💡 **Tip**: A strong portfolio is the best way to land your first data analytics job!`;
  }

  if (lower.includes('resource') || lower.includes('video')) {
    return `🎬 **Video & Resources Guide**

Access **42 curated resources** across all 8 subjects!

• **Resource Types** — Filter by Course, Tutorial, Video, Article, Documentation, or YouTube.
• **Subject Filters** — Find resources for any subject you're studying.
• **Level Filters** — Beginner, Intermediate, and Advanced content.
• **Bookmark System** — Save resources for later with the bookmark toggle.
• **Search** — Find specific resources by title or description.
• **Rich Thumbnails** — Each resource has a gradient thumbnail, type badge, and duration display.
• **Free/Paid Labels** — See at a glance which resources are free and which require payment.
• **Real URLs** — Links point to actual YouTube videos and course platforms.

💡 **Tip**: Start with beginner tutorials and work up to advanced courses!`;
  }

  if (lower.includes('promo') || lower.includes('discount') || lower.includes('code')) {
    return `🏷️ **Promo Codes & Discounts**

Save on your DataTrack Pro subscription with these promo codes:

• **WELCOME20** — Get 20% off your first month!
• **STUDENT50** — Students get 50% off with a valid student email.
• **SAVE10** — Save 10% on any plan with this general discount.

**How to redeem:**
1. Go to **Payment** in the sidebar.
2. Scroll to the subscription section.
3. Click "Upgrade" or "Change Plan".
4. Enter your promo code at checkout.

💡 **Tip**: Promo codes are applied at checkout and stack with annual billing savings (17% off)!`;
  }

  // General responses
  if (lower.includes('help') || lower.includes('how') || lower.includes('what can')) {
    return `📋 **Available Help Topics**

I can help you with any of these features! Just type the keyword:

🧭 **Navigation:**
• \`dashboard\` — Dashboard overview
• \`study\` / \`learn\` — Study path & topics
• \`books\` / \`library\` — Books library
• \`chat\` — Community chat rooms
• \`ai\` / \`assistant\` — AI study assistant
• \`tools\` / \`advanced\` — Developer tools
• \`games\` — Games & breaks
• \`achievements\` / \`badges\` — Badges & trophies
• \`certificates\` — Certificate system
• \`profile\` / \`settings\` — Profile & settings
• \`payment\` / \`subscription\` — Plans & pricing
• \`admin\` — Admin panel

📚 **Features:**
• \`flashcard\` — Flashcard system
• \`notes\` — Note-taking
• \`streak\` — Study streaks
• \`challenge\` — Daily challenges
• \`practice\` — Practice exercises
• \`portfolio\` — Project portfolio
• \`resources\` / \`video\` — Video resources
• \`promo\` — Promo codes

Type any keyword above to learn more! 🚀`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('greet')) {
    return `👋 **Hey there! Welcome to DataTrack Pro!**

I'm DataBot Guide, and I'm here to help you navigate everything. Here are some quick tips to get started:

• 📊 Check your **Dashboard** to see your progress at a glance.
• 📚 Hit **Study Path** to continue where you left off.
• 🎮 Take a **Game** break to keep things fun!
• 💬 Join the **Chat Room** to connect with other learners.

**Need help with something specific?** Try asking me about:
• "dashboard" — How to use the dashboard
• "books" — Exploring the library
• "help" — Full list of topics I can explain

I'm always here — just click the floating button anytime! ✨`;
  }

  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thx')) {
    return `😊 You're welcome! I'm always here to help.

If you need anything else, just type a keyword like \`help\` for a full list of topics, or ask about any specific feature. Happy studying! 🚀`;
  }

  // Default fallback
  return `🤔 I'm not sure about that one! Here are some things I can help with:

• Type **"help"** to see all available topics.
• Type **"dashboard"** to learn about the main dashboard.
• Type **"study"** to explore the study path.
• Type **"books"** for the books library guide.
• Type **"games"** to see available games.
• Type **"payment"** for subscription info.

Or try one of the quick action buttons below! 👇`;
}

// ─── Smart Fallback (keyword-based for API failures) ───
function getSmartFallback(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('sql') || lower.includes('query') || lower.includes('database') || lower.includes('select')) {
    return `📊 **SQL Quick Guide**\n\nHere's what I can tell you about SQL:\n\n• **SELECT** — retrieves data from tables\n• **WHERE** — filters rows by conditions\n• **JOIN** — combines data from multiple tables\n• **GROUP BY** — aggregates data into groups\n• **ORDER BY** — sorts your results\n\nTry our **AI SQL Assistant** in the Study section to generate SQL from plain English!\n\n💡 Type **"help"** for more topics.`;
  }
  if (lower.includes('python') || lower.includes('pandas') || lower.includes('numpy') || lower.includes('dataframe')) {
    return `🐍 **Python for Data Analytics**\n\nKey libraries you should know:\n\n• **pandas** — Data manipulation with DataFrames\n• **numpy** — Numerical computing & arrays\n• **matplotlib** — Create charts and visualizations\n• **scikit-learn** — Machine learning models\n\n**Quick example:**\n\`df.groupby('department')['salary'].mean()\`\n\n💡 Visit the **AI Tutor** for in-depth Python help!`;
  }
  if (lower.includes('excel') || lower.includes('vlookup') || lower.includes('pivot') || lower.includes('spreadsheet')) {
    return `📊 **Excel for Analytics**\n\nEssential functions:\n\n• **VLOOKUP/XLOOKUP** — Find values in tables\n• **INDEX/MATCH** — Flexible lookups\n• **SUMIFS/COUNTIFS** — Conditional calculations\n• **Pivot Tables** — Summarize data instantly\n\n**Pro tip:** Use \`Ctrl+T\` to convert ranges to Tables for dynamic formulas!\n\n💡 Check the **Study Path** for Excel tutorials!`;
  }
  if (lower.includes('power bi') || lower.includes('dax') || lower.includes('dashboard')) {
    return `📈 **Power BI Essentials**\n\nCore components:\n\n• **Power Query** — Transform & clean data (M language)\n• **DAX** — Create custom calculations\n• **Data Model** — Build relationships between tables\n• **Visualizations** — Charts, maps, KPIs\n\n**Best practice:** Use a star schema with one fact table + dimension tables.\n\n💡 Explore the **AI Tutor** for Power BI deep dives!`;
  }
  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('model') || lower.includes('predict')) {
    return `🤖 **Machine Learning Basics**\n\nTypes of ML:\n\n• **Supervised** — Labeled data (classification, regression)\n• **Unsupervised** — No labels (clustering, PCA)\n\n**Workflow:** Collect data → Clean → Feature engineering → Train → Evaluate\n\n**Popular algorithms:** Random Forest, Gradient Boosting, Neural Networks\n\n💡 Try the **AI Career Advisor** for ML career paths!`;
  }
  if (lower.includes('statistic') || lower.includes('mean') || lower.includes('probability') || lower.includes('average')) {
    return `📐 **Statistics Quick Reference**\n\n**Key measures:**\n• **Mean** — Average (sensitive to outliers)\n• **Median** — Middle value (robust)\n• **Std Dev** — How spread out data is\n• **Correlation** — Relationship between variables\n\n**Common tests:** T-test, Chi-square, ANOVA\n\n💡 Significance level α = 0.05 means 95% confidence!`;
  }
  if (lower.includes('career') || lower.includes('job') || lower.includes('resume') || lower.includes('interview') || lower.includes('salary')) {
    return `💼 **Data Career Guide**\n\n**Top roles & salary ranges:**\n• Data Analyst — $65K-$95K\n• Data Scientist — $95K-$140K\n• Data Engineer — $110K-$160K\n• BI Developer — $70K-$110K\n\n**Most in-demand skills:** SQL, Python, Tableau/Power BI, Statistics, Cloud\n\n💡 Use the **AI Career Advisor** for personalized recommendations!`;
  }
  if (lower.includes('tableau') || lower.includes('visualization') || lower.includes('chart') || lower.includes('graph')) {
    return `📊 **Data Visualization Tips**\n\n**Top tools:** Tableau, Power BI, matplotlib, seaborn\n\n**Best practices:**\n• Choose the right chart type for your data\n• Use color intentionally (not just to make it pretty)\n• Keep it simple — remove chart junk\n• Label clearly and add context\n\n💡 Visit the **Study Path** for visualization courses!`;
  }

  return `🤔 I couldn't reach my AI brain just now, but here's what you can do:\n\n• Type **"help"** to see all topics I can explain instantly\n• Try the **AI Tutor** in the Study section for detailed help\n• Visit the **AI SQL Assistant** for SQL query help\n\nOr try asking about: **SQL**, **Python**, **Excel**, **Power BI**, **Statistics**, **Machine Learning**, or **Careers**`;
}

// ─── Quick Action Buttons ───
const quickActions = [
  { label: '🎯 Dashboard Guide', keyword: 'dashboard' },
  { label: '📚 Books Help', keyword: 'books' },
  { label: '📈 Study Tips', keyword: 'study' },
  { label: '💰 Subscription', keyword: 'payment' },
  { label: '🎮 Games', keyword: 'games' },
  { label: '❓ More Help', keyword: 'help' },
];

// ─── Typing Indicator ───
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function FloatingAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasShownWelcome = useRef(false);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide button after 10 seconds of inactivity
  const resetCollapseTimer = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      if (isOpen) {
        setIsOpen(false);
      }
      setIsCollapsed(true); // Always collapse the button after idle
    }, 10000); // 10 seconds of inactivity
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !isCollapsed) {
      resetCollapseTimer();
      return () => {
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      };
    }
  }, [isOpen, isCollapsed, resetCollapseTimer]);

  // Show welcome message on first open
  const showWelcome = useCallback(() => {
    if (hasShownWelcome.current) return;
    hasShownWelcome.current = true;
    const welcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      role: 'bot',
      content: `👋 Hi! I'm **DataBot Guide**. I can help you navigate DataTrack Pro! Ask me about any feature — try typing \`dashboard\`, \`books\`, or \`help\` for a full list.`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Toggle chat panel (single definition — duplicate removed)
  const handleToggle = useCallback(() => {
    setIsCollapsed(false); // Always uncollapse when user clicks
    if (!isOpen) {
      setUnreadCount(0);
      showWelcome();
    }
    setIsOpen((prev) => !prev);
  }, [isOpen, showWelcome]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const trimmed = text.trim();
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Strategy: navigation/help keywords get instant hardcoded responses;
    // everything else goes to the real AI API.
    if (isNavigationQuery(trimmed)) {
      // Instant hardcoded response for navigation queries (fast & useful)
      const responseDelay = 300 + Math.random() * 400;
      setTimeout(() => {
        const response = getBotResponse(trimmed);
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          role: 'bot',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, responseDelay);
      return;
    }

    // General questions → call the real AI API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.reply) {
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          role: 'bot',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // API returned no reply — use smart keyword fallback
        const smartReply = getSmartFallback(trimmed);
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          role: 'bot',
          content: smartReply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      clearTimeout(timeoutId);
      // API call failed (timeout, network, etc.) — use smart keyword fallback
      const smartReply = getSmartFallback(trimmed);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'bot',
        content: smartReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickAction = (keyword: string) => {
    sendMessage(keyword);
    toast.info(`Asking about "${keyword}"...`);
  };

  // Format bot messages with markdown-like syntax
  const formatBotMessage = (content: string) => {
    let formatted = content;
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };

  return (
    <>
      {/* ─── Floating Button Container - slides right when collapsed ─── */}
      <motion.div
        animate={{ x: isCollapsed && !isOpen ? 44 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => { if (isCollapsed && !isOpen) setIsCollapsed(false); }}
      >
        <motion.button
          onClick={handleToggle}
          className={cn(
            'w-14 h-14 rounded-full',
            'bg-gradient-to-br from-violet-500 to-purple-600',
            'text-white shadow-lg shadow-violet-500/30',
            'flex items-center justify-center',
            'transition-shadow duration-300',
            'hover:shadow-xl hover:shadow-violet-500/40 hover:scale-110',
            'active:scale-95',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? 'Close DataBot Guide' : 'Open DataBot Guide'}
        >
          {/* Pulse animation when idle and closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 relative z-10" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="w-6 h-6 relative z-10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute -top-1 -right-1 w-5 h-5 rounded-full',
                'bg-red-500 text-white text-[10px] font-bold',
                'flex items-center justify-center',
                'border-2 border-background',
                'shadow-sm'
              )}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      </motion.div>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click outside to close overlay - works on all screen sizes */}
            <div
              className="fixed inset-0 z-[49]"
              onClick={() => setIsOpen(false)}
            />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className={cn(
              'fixed bottom-24 right-6 z-50',
              'w-[380px] max-w-[calc(100vw-2rem)]',
              'h-[500px] max-h-[calc(100vh-8rem)]',
              'rounded-2xl overflow-hidden',
              'bg-background border border-border',
              'shadow-2xl shadow-violet-500/10',
              'flex flex-col',
            )}
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">DataBot Guide</h3>
                  <p className="text-[10px] text-violet-100/80">Site-wide help & instructions</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-violet-100/80">Online</span>
              </div>
            </div>

            {/* ─── Messages Area ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex gap-2.5',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      msg.role === 'user'
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                    )}
                  >
                    {msg.role === 'bot' ? (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">U</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-sm'
                        : 'bg-muted/80 rounded-tl-sm'
                    )}
                  >
                    {msg.role === 'bot' ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted/80 rounded-2xl rounded-tl-sm">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Quick Action Buttons ─── */}
            {messages.length > 0 && !isTyping && (
              <div className="px-3 pb-2 shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.map((action) => (
                    <motion.button
                      key={action.keyword}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuickAction(action.keyword)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full',
                        'text-[11px] font-medium',
                        'bg-violet-50 dark:bg-violet-950/30',
                        'text-violet-700 dark:text-violet-300',
                        'border border-violet-200/60 dark:border-violet-800/40',
                        'hover:bg-violet-100 dark:hover:bg-violet-950/50',
                        'transition-colors duration-150',
                      )}
                    >
                      {action.label}
                      <ChevronRight className="w-3 h-3 opacity-50" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Input Area ─── */}
            <div className="border-t border-border px-3 py-3 shrink-0 bg-background">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className={cn(
                    'flex-1 h-10 rounded-xl border border-border bg-muted/30',
                    'px-3.5 text-sm placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-300',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200',
                  )}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                    'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
                    'shadow-md shadow-violet-500/20',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'hover:shadow-lg hover:shadow-violet-500/30',
                    'transition-shadow duration-200',
                  )}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
