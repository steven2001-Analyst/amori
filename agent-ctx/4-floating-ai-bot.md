## Task ID: 4 - floating-ai-bot
### Work Task
Build a Floating AI Instruction Bot component (floating-ai-bot.tsx) — a small floating button + expandable chat widget providing site-wide instructions and help with intelligent keyword-matching responses.

### Work Summary

**Created `/home/z/my-project/src/components/ai/floating-ai-bot.tsx`**

**1. Floating Button (always visible)**
- Fixed position: bottom-right corner (bottom-6 right-6), z-50
- 56x56px circular button with gradient from-violet-500 to-purple-600
- Shows Bot icon (toggles to X icon when open) with AnimatePresence rotation animation
- Subtle pulse animation (scale + opacity cycle) when idle and panel is closed
- Badge notification dot showing unread tip count (starts at 1), resets on open
- Hover: scale(1.1) + shadow-xl via framer-motion whileHover
- Click toggles chat panel

**2. Chat Panel (expandable with framer-motion)**
- Slides up from bottom-right with spring animation (stiffness: 400, damping: 30)
- Width: 380px on desktop, max-w-[calc(100vw-2rem)] on mobile
- Height: 500px max, max-h-[calc(100vh-8rem)]
- Violet-to-purple gradient header with Sparkles icon, "DataBot Guide" title, online indicator
- Scrollable message area with auto-scroll to bottom
- Quick-input area with rounded-xl input + gradient send button
- Proper z-indexing (z-50) to overlay all content

**3. Smart Keyword-Matching Response Engine (20+ topics)**
- Navigation Help: dashboard, study/learn, books/library, chat, ai/assistant, tools/advanced, games, achievement/badge, certificate, profile/settings, payment/subscription/upgrade, admin
- Feature Help: flashcard, note, streak, challenge, practice, portfolio, resource/video, promo/discount/code
- General: help/how (lists all topics), hello/hi/hey (friendly greeting), thanks (acknowledgment)
- Default fallback: suggests visiting dashboard or typing "help"
- All responses formatted with emojis, bold text, bullet points, and inline code

**4. Quick Action Buttons**
- 6 chips: "🎯 Dashboard Guide", "📚 Books Help", "📈 Study Tips", "💰 Subscription", "🎮 Games", "❓ More Help"
- Styled with violet theme, hover scale animation, ChevronRight icon
- Triggers toast notification when clicked

**5. Smart Welcome Message**
- On first open (tracked via ref, not localStorage), shows welcome message with guidance
- Welcome message uses markdown formatting (bold, inline code)

**6. Message System**
- ChatMessage interface with id, role (bot/user), content, timestamp
- User messages: violet/purple gradient bubble, aligned right
- Bot messages: muted background bubble with markdown formatting, aligned left
- Typing indicator: 3 bouncing violet dots with staggered animation
- Natural response delay: 400-1000ms random delay
- Auto-scroll to newest message

**7. Integration & Quality**
- Uses 'use client' directive
- Imports: motion/AnimatePresence from framer-motion, Bot/X/Send/Sparkles/ChevronRight from lucide-react
- Uses cn from @/lib/utils, toast from sonner
- Fixed lint error: moved welcome message logic from useEffect (setState-in-effect) to useCallback triggered in handleToggle
- ESLint: Zero errors, zero warnings
- Dev server: Compiles successfully (pre-existing errors in other files are unrelated)
