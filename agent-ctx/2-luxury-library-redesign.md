---
## Task ID: 2 - luxury-library-redesign
### Work Task
Completely redesign the Books Library section to look like a premium digital library (Apple Books/Kindle style). Update the Zustand store with new book interaction fields (reviews, reading progress, book notes).

### Work Summary

**1. Updated Zustand Store (src/lib/store.ts)**
Added new state fields and methods for rich book interactions:
- `bookReviews: Array<{id, bookId, user, rating, text, date}>` — user-written book reviews
- `readingProgress: Record<string, number>` — per-book reading progress (0-100%)
- `bookNotes: Record<string, string>` — per-book personal notes
- `addBookReview(bookId, text, rating)` — add review with auto-generated ID
- `removeBookReview(reviewId)` — delete review by ID
- `setReadingProgress(bookId, percent)` — set progress with 0-100 clamping
- `setBookNotes(bookId, notes)` — save personal notes per book
- All new fields included in `resetProgress()` and `merge` defaults for persistence migration

**2. Complete Rewrite of books-view.tsx — Premium Digital Library**

**Hero Header:**
- Large gradient banner (`from-amber-900 via-amber-800 to-yellow-900`) with warm gold tones
- 6 animated floating book icons with varied sizes, delays, and durations
- Integrated search bar with amber-tinted glassmorphism styling
- "Featured Book" spotlight card — rotates daily among 5-star books, clickable
- Animated stats ribbon (Books, Reading, Completed, Favorites) with AnimatedCounter
- Upload Book button with glassmorphism styling

**View Controls:**
- Grid/List toggle with amber active indicator
- Sort dropdown: A-Z, Top Rated, Recently Added, Most Popular
- Scrollable subject filter chips with gradient active state

**Book Grid View (4-column responsive):**
- 3D perspective hover effect (perspective 1000px, rotateY -3, scale 1.02, y -8)
- Cover area: gradient OR uploaded image with decorative vertical lines
- Hover overlay with semi-transparent backdrop-blur actions (Read, Favorite)
- Favorite heart toggle with bounce animation
- Interactive star rating with hover preview
- Reading progress bar (gradient emerald→teal)
- Status cycle button (Want to Read → Reading → Completed)
- "Uploaded" badge with violet accent, Delete for user books

**Book List View:**
- Compact horizontal layout: cover | info | actions
- Same interactive features as grid

**Book Detail Modal (4-tab dialog):**
- Overview tab: large cover, interactive rating, progress, description, subjects, CTAs
- Chapters tab: checkbox list with completion tracking, auto-updates progress
- Reviews tab: write review form + review list with delete
- My Notes tab: textarea with save and character count

**Preserved:** Upload dialog, delete confirmation, secure book reader, pro user notice

**Lint Results:** Zero errors, 2 pre-existing warnings (false positive a11y)
**Files Modified:** src/lib/store.ts, src/components/books/books-view.tsx
