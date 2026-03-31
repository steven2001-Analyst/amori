## Task ID: 2-a - certification-prep
### Work Task
Create Certification Prep component at `/home/z/my-project/src/components/certification/certification-view.tsx` — a practice exam system for data analytics certifications.

### Work Summary

**Created Certification View (src/components/certification/certification-view.tsx)** — 812 lines

**Certification Data:**
- 4 certifications with 15 questions each (60 total):
  - Microsoft Power BI Data Analyst (PL-300) — Intermediate, blue/indigo gradient
  - Google Data Analytics Professional — Beginner, emerald/teal gradient
  - SQL Certification Exam (DataTrack Pro) — Intermediate, violet/purple gradient
  - AWS Certified Data Analytics — Advanced, amber/orange gradient
- Each question has 4 options, correct answer index, and detailed explanation

**Cert Selection Screen:**
- Overview stats bar (4 certifications, total attempts, passed count, 70% threshold)
- 2-column responsive grid of certification cards
- Each card shows: gradient header with icon/name/provider, difficulty badge, question count, duration
- Per-cert score display with best score, attempts, last score, and progress bar
- "Start Exam" / "Retake Exam" button with gradient styling
- Framer Motion staggered card entrance animations

**Exam Mode:**
- 30-minute countdown timer with red warning animation under 5 minutes
- Question counter (1/15) and answered count display
- Animated progress bar for completion tracking
- Radio button options with A/B/C/D labels and hover/select animations
- Previous/Next navigation buttons
- Question number grid with color-coded indicators (answered, flagged, unanswered)
- Flag questions for review toggle per question
- Auto-submit when timer reaches zero

**Review Mode:**
- Animated score reveal with Trophy/XCircle icon and spring animation
- Grade display (Excellent ≥90%, Pass ≥70%, Fail <70%)
- Score percentage with large animated counter
- 4 stat cards: Attempts, Best Score, Avg Score, Time Used
- Retake Exam and Choose Another buttons
- Question-by-question review with scrollable list (max-h-600px):
  - Green CheckCircle2 for correct, Red XCircle for incorrect, amber AlertTriangle for skipped
  - Color-coded answer options showing correct (green) and user's wrong answer (red)
  - Explanation box for each question

**State Persistence:**
- Uses localStorage directly (key: `datatrack-cert-scores`) to avoid complex store modifications
- CertScore interface: `{ attempts, bestScore, lastScore, lastDate }`
- Scores loaded on mount via lazy state initializer

**Technical Details:**
- `use client` directive, default export
- shadcn/ui components: Card, Button, Badge, Progress, RadioGroup
- Framer Motion animations for card entrances, question transitions, score reveal
- Timer managed via setInterval with ref-based cleanup
- Ref-based submission pattern to avoid stale closures in timer auto-submit
- No lint errors, no TypeScript errors
