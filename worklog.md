---
## Task ID: rebuild-from-scratch
Agent: main
Task: Complete rebuild of Amori dating app from scratch after infinite re-render errors

Work Log:
- Wiped all source code, kept .git, node_modules, public/
- Created fresh project config: package.json, tsconfig.json, next.config.ts, postcss.config.mjs, components.json
- Installed all dependencies (next, react, supabase, jose, bcryptjs, zustand, sonner, framer-motion, shadcn/ui)
- Installed 17 shadcn/ui components via CLI
- Created lib files: utils.ts, supabase.ts, auth.ts, store.ts
- Created 10 API routes: login, register, session, logout, seed, discover, swipe, matches, messages/room, notifications, profile, upload
- Created 11 pages: landing, login, register, discover, matches, chat list, chat room, notifications, profile, onboarding, premium, settings
- Created app layout with desktop sidebar + mobile bottom nav + auth guard
- Fixed TypeScript error in profile page (implicit any type)
- Build passes: 27 routes, zero errors

Stage Summary:
- Complete Amori dating app rebuilt from scratch
- All features: auth, discover/swipe, matches, chat (3s polling), notifications, profile edit, onboarding, premium, settings
- No next-themes (light mode only)
- Supabase REST API for all data operations
- Custom JWT auth with httpOnly cookies
- Zustand persist for client state
- Vercel auto-deploys from main branch push
