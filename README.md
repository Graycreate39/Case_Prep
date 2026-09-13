# CaseCraft

CaseCraft is an adaptive consulting interview coach. Its learning loop is **model → explain → complete → solve → vary → interleave → integrate → retry → space → assess unseen**. Story Mode uses a whole-task spine with targeted part-task repair. It models individual reasoning skills and uncertainty instead of presenting a case library or an opaque readiness score.

## What is included
- Story Mode’s 16-chapter spiral curriculum, active prediction examples, visible remediation branches, and an integrated Case Link in every chapter.
- Granular skill stages and separate acquisition, independent, transfer, retention, integration, fluency, hint, confidence, and human-practice evidence.
- Duration-safe daily sessions that combine due retrieval, targeted work, varied transfer, integration, and debrief rather than repeating one weak skill.
- Rewind & Retry 2.0: diagnose the root cause, give a minimal correction, redo the same segment, transfer immediately, then schedule delayed retrieval.
- Validated, version-frozen closed-world cases, training/transfer/readiness-holdout isolation, stage-safe disclosure, deterministic math tolerances, focused Case Room, and exhibits.
- Behavioral Story Bank, local verbal recording with no upload, human-practice transfer-gap detection, evidence-separated analytics, and uncertainty-aware readiness language.
- A parameterized seed catalog with 30 mental-math variants, 15 quantitative-setup exercises, 15 structures, and 10 each for exhibits, brainstorming, and synthesis.

## Architecture
Next.js and strict TypeScript render the application. Zod validates every `CaseSpec`; pure domain functions calculate priorities, gates, schedules, numeric grades, and case transitions. The demo store is versioned browser persistence so the complete core works without credentials. A production repository can implement the same typed entities in PostgreSQL/Prisma without moving rules into the database.

The governing principle is **deterministic simulation underneath; generative language on top**. A language model may phrase an interviewer response or apply a qualitative 1–5 anchored rubric, but may never create facts, grade known arithmetic, decide information release, or mutate case reality. Case answer keys stay behind server-only route handlers; client responses are produced by the explicit public projection and contain only released facts, released exhibits, prompts, and visible turns.

`InterviewTransport` keeps interview delivery replaceable, while curriculum verbal practice uses the browser MediaRecorder API. Recordings remain temporary object URLs in the current tab: they are not uploaded, persisted, or transcribed. Qualitative evaluations are schema-validated, evidence-backed 1–5 judgments, with second evaluation reserved for low-confidence or threshold-adjacent decisions.

## Local setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000`. No account, database, or paid API is required for demo mode. Copy `.env.example` to `.env.local` only when adding external adapters. Never prefix browser-visible variables with secrets.

## Local persistence and optional production schema
`prisma/schema.prisma` defines the PostgreSQL production model for users, preferences, skill evidence, attempts, review schedules, training plans, immutable case versions and snapshots, turns, evaluations, behavioral stories, human feedback, firm profiles, and model telemetry. The finished local mode uses versioned browser storage with JSON backup/restore and no external account. Do not place highly sensitive data in a shared browser profile. Demo case sessions are bound to an HttpOnly, SameSite identity cookie; production must replace that identity and the memory store with authenticated database repositories.

## Data, seeding, and scoring
Original seed cases and drills live in `src/lib/seed.ts`. Production seed jobs should pass every case through generate → normalize → calculate → validate → adversarial review → freeze. Qualitative judgments use understandable 1–5 behavioral anchors and include skill, confidence, evidence, errors, and one improvement; do not display spurious decimal precision.

Adaptive priority is approximately `(1 − mastery) × (1 + uncertainty) × due factor × transfer gap`, followed by diversity constraints. Mastery gates require repeated independent evidence, acceptable uncertainty, transfer, and consistency—not one successful attempt.

## AI and voice configuration
The shipped experience intentionally uses deterministic demo responses. No AI provider is required or configured. The adaptive engine, feedback rules, cases, and interview flow are deterministic and local-first. `InterviewTransport` implementations should keep text independent from voice; default to transcripts, with raw audio stored only after explicit opt-in.

## Test and deploy
```bash
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run e2e
npm run build
```
Deploy as a conventional Next.js application. Add production authentication, encrypted PostgreSQL persistence, rate limiting, server-side authorization, CSP, audit logging, and transcript retention controls before accepting real sensitive user data.

## Limitations
Local persistence is intentionally per-browser. Paid AI evaluation, live voice, hosted authentication, and a hosted database are intentionally excluded; deterministic coaching and all core local flows work without them. Firm formats change: recruiter instructions supersede editable firm profiles. Readiness is evidence with uncertainty, never a guarantee of interview success.

### Verify that the current learning engine is checked out

Before starting the local server after an update, run:

```bash
grep -n "casecraft-learner-v7" src/lib/learner.ts
test -f src/components/welcome-case.tsx && echo "CaseCraft v7 Welcome Case found"
```

Both commands must print a result. If they do not, the local checkout is an earlier pull-request revision; fetching that unchanged branch will not install the current build. Publish/check out the newest Codex pull request before running `npm run dev`.
