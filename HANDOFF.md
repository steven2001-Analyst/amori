# AMORI — Project Handoff Document
> Last updated: 2026-03-31 | Status: Deployed & Working

---

## 1. PROJECT LOCATIONS

| Project | Directory | GitHub Repo | Branch |
|---------|-----------|-------------|--------|
| **Amori** (dating app) | `/home/z/amori` | `steven2001-Analyst/amori` | `main` |
| **DataTrack Pro** | `/home/z/my-project` | `steven2001-Analyst/datatrack-pro` | `main` |

**CRITICAL: NEVER write to `/home/z/my-project` — that is DataTrack Pro. Amori lives at `/home/z/amori` only.**

---

## 2. CREDENTIALS & API KEYS

All secrets are stored in the conversation context from the original session. Ask the user for:
- **GitHub PAT** (ghp_ prefix) — for both repos
- **Vercel API Token** (vcp_ prefix) — project ID: `prj_SY2k5Pv310YAd6XSK5WtGn5GY7nw`
- **Supabase** — project ref: `qysepabvnoftgtisqdic`, URL: `https://qysepabvnoftgtisqdic.supabase.co`
  - Service role key is hardcoded as fallback in `src/lib/supabase.ts`
  - Management API token (sbp_ prefix) — for creating/managing DB tables
  - DB password: check original conversation context

### Test User Account
- **Email**: `stevensaleh100@outlook.com`
- **Password**: `Amori2026!`
- **Name**: Steven (Premium user, seeded)

### Environment Variables (set in Vercel dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=https://qysepabvnoftgtisqdic.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<see src/lib/supabase.ts for fallback>
JWT_SECRET=amori-jwt-secret-2026
SEED_SECRET=amori-seed-2026
```
- No `.env.local` in the repo — env vars set in Vercel dashboard only
- For local dev, create `.env.local` with the above values

---

## 3. ARCHITECTURE DECISIONS

### Why Supabase REST instead of Prisma
- Local dev server AND Vercel build servers are IPv6-only
- Prisma requires direct TCP to PostgreSQL (fails on IPv6)
- All API routes use `@supabase/supabase-js` REST client (works over HTTPS)
- `prisma/schema.prisma` exists for documentation only, NOT used at runtime
- `src/lib/db.ts` is dead code (not imported anywhere)

### Why Query Params instead of bracket directories
- Shell globbing corrupts `[matchId]` to `atchId]` in this environment
- Chat room uses: `/chat/room?matchId=xxx`

### Authentication
- Custom JWT auth using `jose` + `bcryptjs` (NOT next-auth, NOT Supabase Auth)
- Cookie: `amori-token` (httpOnly, secure in prod, 7-day expiry)
- Every API route: check cookie, verifyToken, DB query

### State Management
- Zustand with persist, localStorage key `amori-auth`
- (app)/layout.tsx: SSR renders spinner, client reads store after mount

### Theme
- Light mode only. next-themes was REMOVED (caused React #185 hydration mismatch)
- html className="light" with suppressHydrationWarning

---

## 4. DATABASE SCHEMA (6 tables)

Created via Supabase Management API. Reference: `prisma/schema.prisma`

| Table | Purpose | Key Fields |
|-------|---------|------------|
| User | Profiles | id, email, name, passwordHash, avatar, bio, age, gender, interests[], isPremium |
| Photo | Photos | id, userId, url, order, isProfile |
| Match | Swipes/mutual | id, user1Id, user2Id, type (liked/passed/mutual) |
| Message | Chat | id, matchId, senderId, content, type, read |
| Notification | Alerts | id, userId, type, title, body, fromUserId, read |
| Report | Reports | id, reporterId, reportedId, reason, status |

Seeded: 9 profiles via POST /api/auth/seed with body `{ "secret": "amori-seed-2026" }`

---

## 5. API ROUTE MAP

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /api/auth/login | No | Login returns user + token + cookie |
| POST | /api/auth/register | No | Register creates user + token |
| GET | /api/auth/session | Yes | Get current user profile |
| POST | /api/auth/logout | No | Clear auth cookie |
| POST | /api/auth/seed | Secret | Seed 9 sample profiles |
| GET | /api/users/discover | Yes | Get swipeable profiles |
| POST | /api/users/swipe | Yes | Like/pass + mutual check |
| GET | /api/matches | Yes | Get mutual matches |
| GET | /api/messages/room?matchId= | Yes | Get chat messages |
| POST | /api/messages/room?matchId= | Yes | Send message |
| GET | /api/notifications | Yes | Get notifications (?unread=true) |
| PUT | /api/notifications/[id] | Yes | Mark as read |
| PUT | /api/profile | Yes | Update profile |

Missing APIs: /api/upload (photos), DELETE /api/notifications/[id]

---

## 6. FILE STRUCTURE

```
/home/z/amori/src/
  app/
    layout.tsx              Root layout (NO ThemeProvider)
    page.tsx                Landing page
    error.tsx               Error boundary (debug)
    (auth)/                 Login + Register
    (app)/                  Protected app (auth guard)
      discover/             Swipe cards
      matches/              Match grid
      chat/room/            Chat room (?matchId=)
      notifications/        Notifications list
      profile/              View + edit profile
      premium/              Pricing plans (static)
      onboarding/           3-step onboarding
    api/                    13 API routes
  components/               Views + shadcn/ui
  lib/
    auth.ts                 JWT + bcrypt helpers
    supabase.ts             Supabase client
    store.ts                Zustand store
    db.ts                   DEAD CODE (Prisma)
    utils.ts                cn()
```

---

## 7. WHAT'S WORKING

Landing page, Login, Register, Onboarding, Auth guard, Discover (swipe cards), Swipe API (mutual match detection), Matches page, Chat list, Chat room (3s polling), Notifications (list + mark read), Profile (view + edit), Premium page (static), Responsive design, Vercel deployment (auto from main), No hydration errors

---

## 8. WHAT'S BROKEN / NEXT STEPS

### Critical
1. Photo upload missing: /api/upload doesn't exist, onboarding/profile photo fails silently
2. Chat room otherUser: GET /api/messages/room doesn't return other user, header shows "?"
3. No local .env.local file

### Missing Features
4. Report user API, Delete notification API
5. Settings page (icon exists in sidebar, no route)
6. Real-time messaging (Socket.io installed but not wired)
7. Premium/Stripe integration (static page only)
8. Logout doesn't set isOnline=false in DB

### Code Cleanup
9. next-themes in package.json (unused), src/lib/db.ts (dead code)
10. Unused import: Users in landing-view.tsx

---

## 9. KNOWN GOTCHAS

1. IPv6-only servers: Always use Supabase REST, never Prisma/direct PostgreSQL
2. Bracket directories: Shell corrupts [matchId], always use query params
3. Shell resets CWD: Always cd /home/z/amori explicitly
4. Vercel deploys main only: Always push to main
5. Supabase tables capitalized: User, Photo, Match, etc.

---

## 10. GIT HISTORY (latest first)

```
3f4346d Fix React #185 hydration mismatch - remove next-themes entirely  LATEST
cee82eb fix: eliminate hydration mismatch
041c3d6 debug: add global error boundary
cb72c2f fix: prevent hydration mismatch in app layout
254f456 deploy: final clean build with Supabase env vars
c3a9cee feat: migrate all API routes from Prisma to Supabase REST API
a46ebcc fix: login, routing, interests
8a40537 fix: login failure
d7edf57 feat: build Amori dating app - complete rewrite
```

---

## 11. DATAFLOW

Login -> POST /api/auth/login -> bcrypt verify -> JWT -> cookie -> Zustand localStorage
Discover -> GET /api/users/discover -> Supabase query -> swipe cards
Swipe -> POST /api/users/swipe -> check reverse -> mutual? notify both
Chat -> GET/POST /api/messages/room?matchId= -> 3s polling
Profile -> GET /api/auth/session -> PUT /api/profile

---

## 12. HOW TO RESUME

```bash
git clone https://github.com/steven2001-Analyst/amori.git /home/z/amori
cd /home/z/amori && npm install && npx next build
git push origin main   # Vercel auto-deploys
```

Priority next: (1) Photo upload, (2) Chat otherUser fix, (3) Local .env, (4) Settings page, (5) Real-time messaging, (6) Code cleanup
