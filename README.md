# The Woodshed

A private web app for the Pieper High School Band of Warriors — the opt-in layer on top of BAND. Where BAND handles rehearsal logistics, The Woodshed is for the work: mentorship, outside opportunities, practice (sheds), and making serious musicianship visible inside the program.

**Tagline:** Where the work happens.

> Built to complement the official Pieper BAND (band.us), not replace it. No rehearsal schedules, no parent accounts, no photo albums — those already exist on BAND.

## Quick start

```bash
npm install
npm run db:push    # push schema to local SQLite
npm run db:seed    # director, Hailey, 5 students, 3 opportunities, 1 mentor request
npm run dev
```

Open <http://localhost:3000>. Either use the demo accounts below, or the first time you set up a fresh DB with no users, head to `/setup` to create the director account from scratch (the /setup page 404s forever once a user exists).

### Demo accounts

| Role         | Email                           | Password                |
|--------------|---------------------------------|-------------------------|
| Director     | director@pieperhs.test          | director-demo-password  |
| Drum Major   | hailey@pieperhs.test            | hailey-demo-password    |
| Section Lead | fred2@pieperhs.test / mia@pieperhs.test | demo-password   |
| Student      | jalen / ava / diego @pieperhs.test      | demo-password   |

Active invite code: **`WOOD-SHED`** (rotate from Admin → Settings).

## Stack

- Next.js 15 (App Router), TypeScript, Tailwind v4
- Drizzle ORM over libSQL — SQLite file in dev, Turso in prod
- Custom invite-code auth with bcrypt passwords + `jose` JWT cookies + DB-backed sessions (revocable per device)
- Resend + React Email for transactional email (falls back to stdout when `RESEND_API_KEY` is unset)
- PostHog for aggregate telemetry (hashed user IDs, no emails/names captured). No-op when key unset.
- Server actions for every mutation; no REST API surface other than `/manifest.webmanifest`
- Inter (body) + Cormorant Garamond (display) via `next/font`

## Architecture

### User lifecycle

```
  signup (grade 9-10)              signup (11-12)
         │                               │
         ▼                               ▼
  awaiting_parent_consent   ────►     pending
         │ (14-day window)               │
         │ (auto-delete on expiry)       │
         ▼                               ▼
     pending ──────────────────────► approved  ──► onboarding ──► active
                                            │
                                            │ on May 31 of graduation year
                                            ▼
                                          alumni  (profile visible, mentor requests disabled)
```

Other terminal states: `inactive` (deactivated by admin), `deleted_pending` (7-day grace before hard delete).

### Roles

- `student` — default, after approval.
- `section_leader` — can post opportunities; eventually section-specific views.
- `drum_major` — approves signups, moderates, rotates invite code, features members, force-signs-out students.
- `director` — everything a DM can do + promote drum majors, suspend/delete users via moderation, override hidden content.

Role changes require a confirmation dialog that spells out what the promotion unlocks.

### Auth + sessions

- JWT cookie (`HS256`, signed with `SESSION_SECRET`) encodes `sub`, `role`, `status`, and `sid`.
- `sessions` table tracks every active session (user agent + IP + last seen). "Sign out of this device" revokes a single `sid`; director "Force sign-out" revokes all sessions for a user.
- Middleware runs on the edge and trusts JWT claims (fast path, no DB).
- `getCurrentUser()` on the server checks `sessions.revokedAt IS NULL`, so revocation takes effect on the very next page load.
- Password is bcrypt(12-round). Rate limits: 8 signup/hour/IP, 10 signin/15-min/IP, 40 uses per invite code/hour.

### Routes

```
Public:
  /                       Landing + BAND-complement positioning
  /signin · /signup       Auth pages (signup shows parent-email field for grade 9-10)
  /pending                "Waiting" screen; `?state=parent` shows parent-consent variant
  /consent/[token]        Parent's one-click consent page
  /terms · /privacy       Plain-language policy pages
  /setup                  First-run director bootstrap (404 once any user exists)

Authenticated (pending + approved + alumni):
  /onboarding             7-step wizard with "see how others filled this out" modal
  /settings               Overview
  /settings/notifications Email preferences
  /settings/sessions      Active sessions + revoke
  /settings/data          Download JSON export + delete account (7-day grace)
  /settings/account       Graduation info + directory visibility toggle
  /notifications          Full notification history

Approved only:
  /directory              Featured grid + filters + search
  /directory/[userId]     Member profile (alumni get "Class of 20XX" badge)
  /profile                Own profile editor + milestone timeline + completeness banner
  /mentorship             Request board (open + claimed)
  /mentorship/new         New request; `?to=<userId>` = direct send
  /opportunities          Sorted by deadline, filter by type
  /shed                   Practice logging + streak + section pulse + who's-in-the-shed
  /shed/reflection        Private "Year in review" page

Admin only (drum_major + director):
  /admin                  Dashboard with counts
  /admin/approvals        Pending signup queue (approve / reject)
  /admin/members          Role management, deactivate, (director) force sign-out
  /admin/moderation       Reports queue + dismiss / hide / escalate / suspend / delete
  /admin/opportunities    CRUD
  /admin/featured         Pick featured members
  /admin/settings         Rotate invite code
```

### Event dispatcher

`src/lib/events.ts` is the single fanout point for signup approvals, mentor requests, featured adds, zero-tolerance reports, and onboarding completion. Each event:

- Creates an in-app notification if the category applies
- Sends an email via Resend (or stubs to audit_log if no key)
- Awards milestones where appropriate
- Captures a PostHog server event with hashed IDs

Adding a new trigger = add a handler in `events.ts` and call it from the relevant server action.

### Moderation

- **Report button** on every user-generated content surface (profile bio, mentor request). Reason picker, optional description. Reporter's identity is hidden from the target.
- **Auto-flagging on submission**: `bad-words` profanity filter triggers auto-report. Keywords for self-harm, threats, sexual content, and slurs bypass the queue and immediately email the director (`onZeroToleranceReport`). Flagged content is still saved but `hidden_at` is set so it doesn't render until reviewed.
- **Moderation queue** at `/admin/moderation`: dismiss, hide content, escalate (DM → director), suspend user (director), delete user (director). Every action logged in `audit_log`.
- **Rate limit**: max 5 open mentor requests per user at a time.

### COPPA / FERPA

- Grade 9 and 10 signups require a parent/guardian email. Status goes to `awaiting_parent_consent`.
- Parent gets an email with a one-click `/consent/[token]` link. Click → status flips to `pending` for a drum major to approve.
- 14-day expiry; if the parent doesn't respond, the account is auto-deleted (purge script in `src/lib/parent-consent.ts::purgeExpiredConsents` — hook this into a Vercel cron).
- The app does not store grades, test scores, or teacher evaluations. FERPA-covered data is out of scope by design.
- **Data rights**:
  - `/settings/data` → Download JSON export (profile, mentor activity, practice logs, milestones, notifications).
  - `/settings/data` → Delete account: soft-deleted immediately, permanently removed after 7 days. Signing back in during that window undoes it.

### Telemetry

- `posthog-js` on the client (init'd only inside the `(app)` layout, so public pages stay tracking-free).
- `posthog-node` on the server, invoked from `events.ts`.
- User IDs are SHA-256 hashed with a salted `TELEMETRY_SALT` before leaving the machine. No emails, no names, no free-text content.
- Disables session replay, autocapture, and identifies only logged-in users. Aggregate dashboards only — never inspect individual traces.

### Gamification — "Sheds"

The spec for this layer matters more than the implementation. Read `prompt2.md`'s Part 7 before changing anything here.

- Every `practice_logs` row is a **shed** in the UI. "Start a shed", "Hailey has shed 47 hours", "Today's shed."
- **Streaks are private.** Computed in `src/lib/sheds.ts::computeStreak`. A streak day is any day with a ≥15-minute shed. One "rest day" per rolling 7-day window doesn't break it. No notifications when streaks break. No shaming.
- **Milestones** (`src/lib/milestones.ts`) are text-only, rendered as a vertical timeline on the user's own profile. Examples: "First shed logged — welcome to the woodshed.", "Shed 100 hours lifetime", "Mentored your first student", "Reached 30-day shed streak".
- **Section pulse** (`thisWeekBySection`) — on `/shed`, shows total hours by section this week. Not a leaderboard. If color guard is at zero and woodwinds is at 142h, that's information.
- **Who's in the shed right now** (`inTheShedNow`) — count of unique members who logged a shed in the last 90 minutes. Click-through shows breakdown by section. No names.
- **Annual reflection** at `/shed/reflection` — private page rendered on demand, shows hours/streak/mentorship/milestones since signup (capped at 1 year back), closes with a rotating line.

### What the gamification explicitly does NOT do

- No points, no XP, no levels.
- No public leaderboards with names.
- No push-notifications to pull lapsed users back.
- No comparisons to "average user" or "top 10%".
- No streak-freeze purchases, no premium tier, nothing monetary.
- No cute mascot — the name is the personality.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run db:push` — sync Drizzle schema to SQLite (dev)
- `npm run db:generate` — emit a migration under `./drizzle/` (for prod)
- `npm run db:studio` — Drizzle Studio
- `npm run db:seed` — seed demo data (safe to re-run)

## Database

`src/db/schema.ts` covers everything. Key tables:

- `users` + `profiles` — accounts, bios, ensembles, achievements, mentor skills
- `sessions` — revocable per-device sessions
- `invite_codes` — one active at a time
- `notifications` + `notification_preferences`
- `reports` — moderation queue with zero-tolerance flag
- `milestones` — earned events, unique per (user, dedupe_key)
- `mentor_requests`, `opportunities`, `practice_logs` (sheds)
- `parent_consents` — token + expiry per grade 9–10 signup
- `signup_attempts` + `audit_log` — security audit trail

## Open placeholders — confirm before rollout

1. **Pieper colors** — `#4B2E83` / `#FFC72C` in `src/app/globals.css` and `src/app/manifest.webmanifest/route.ts`. Replace with official Pieper ISD hex.
2. **Sections** — `SECTIONS` array in `src/lib/constants.ts`. Verify with Hailey/Mr. Barry.
3. **Director's real name and email** — seed script uses "Mr. Barry" placeholder.
4. **PWA icons** — `public/icon.svg` is a minimal W mark. Export 192/512 PNGs for best home-screen appearance.
5. **Resend** — add a real `RESEND_API_KEY` and a verified sending domain for emails to actually send. Until then, they log to stdout.
6. **PostHog** — if you want telemetry, drop `NEXT_PUBLIC_POSTHOG_KEY` in `.env`. Default is US cloud.
7. **Graduation date** — `src/lib/graduation.ts` uses May 31. San Antonio ISD may differ; verify.
8. **Parent-consent cron** — `purgeExpiredConsents` exists but nothing calls it. Add a Vercel cron for daily purge at the same time you set up Turso prod.
9. **Soft-delete grace-period cron** — same idea for `users.status = 'deleted_pending'` + 7 days. Not yet wired.
10. **Zero-tolerance slur list** — starter list in `src/lib/moderation.ts`. Add patterns your moderators see in practice.

## Deploying to Vercel + Turso

```bash
turso db create woodshed
turso db show woodshed --url                    # → libsql://...turso.io
turso db tokens create woodshed --expiration none

DATABASE_URL="libsql://...turso.io" \
DATABASE_AUTH_TOKEN="eyJ..." \
npm run db:push

# Vercel env vars (at minimum):
#   DATABASE_URL, DATABASE_AUTH_TOKEN, SESSION_SECRET (openssl rand -base64 48)
#   NEXT_PUBLIC_APP_URL, TELEMETRY_SALT
# Optional but recommended:
#   RESEND_API_KEY, RESEND_FROM, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST

vercel --prod
```

After first deploy, hit `/setup` to create the director account, then rotate the invite code from Admin → Settings.

## Rules (from the product brief — don't drift)

- Nothing in the app should push users toward addiction, comparison, or shame. Default heuristic: "would this feel good at 2am on a bad night?" If no, cut it.
- Telemetry is for understanding product fit, never surveillance. Aggregate only.
- Every feature must be consistent with the founding culture goal — making serious musicianship feel normal and connected. If something here would make a struggling student feel worse, cut it.
- Don't duplicate BAND. If a feature overlaps with BAND's logistics role, stop and reconsider.
- No teen-social-app UX patterns: no streaks that shame (ours are private), no gamified badges, no notification bait.

## License

Unlicensed — internal to the Pieper Band of Warriors program.
