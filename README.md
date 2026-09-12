# CaseCraft

CaseCraft is an adaptive consulting interview coach. Its loop is **diagnose → prescribe → teach → drill → feedback → rewind → revisit → integrate → reassess**. It models individual reasoning skills and uncertainty instead of presenting a case library or an opaque readiness score.

## What is included
- Story Mode’s 16-chapter adaptive curriculum and visible remediation branches.
- Granular case and behavioral skill evidence with source, uncertainty, trend, difficulty, drill/case transfer, and review dates.
- Transparent daily planning based on weakness, uncertainty, importance, due review, and transfer gap, with interleaving.
- Immediate Rewind & Retry with retained attempts and analogous transfer practice.
- Validated, version-frozen closed-world cases, explicit runtime state, stage-safe disclosure, deterministic math tolerances, focused Case Room, and exhibits.
- Behavioral Story Bank, realistic follow-ups, ownership cue, human-practice attribution, analytics, and uncertainty-aware readiness language.

## Architecture
Next.js and strict TypeScript render the application. Zod validates every `CaseSpec`; pure domain functions calculate priorities, gates, schedules, numeric grades, and case transitions. The demo store is versioned browser persistence so the complete core works without credentials. A production repository can implement the same typed entities in PostgreSQL/Prisma without moving rules into the database.

The governing principle is **deterministic simulation underneath; generative language on top**. A language model may phrase an interviewer response or apply a qualitative 1–5 anchored rubric, but may never create facts, grade known arithmetic, decide information release, or mutate case reality.

## Local setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000`. No account, database, or paid API is required for demo mode. Copy `.env.example` to `.env.local` only when adding external adapters. Never prefix browser-visible variables with secrets.

## Data, seeding, and scoring
Original seed cases and drills live in `src/lib/seed.ts`. Production seed jobs should pass every case through generate → normalize → calculate → validate → adversarial review → freeze. Qualitative judgments use understandable 1–5 behavioral anchors and include skill, confidence, evidence, errors, and one improvement; do not display spurious decimal precision.

Adaptive priority is approximately `(1 − mastery) × (1 + uncertainty) × due factor × transfer gap`, followed by diversity constraints. Mastery gates require repeated independent evidence, acceptable uncertainty, transfer, and consistency—not one successful attempt.

## AI and voice configuration
The shipped experience intentionally uses deterministic demo responses. Optional server-only adapters may read `OPENAI_API_KEY` and workload-specific model variables. Verify current official API documentation before implementing a provider, use structured outputs, record model/token/latency/retry metadata, and degrade to demo behavior on failure. `InterviewTransport` implementations should keep text independent from voice; default to transcripts, with raw audio stored only after explicit opt-in.

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
Demo persistence is per-browser and not suitable for shared or sensitive accounts. AI qualitative evaluation, live voice, production auth/database, and a full editorial case catalog are integration boundaries rather than simulated capabilities. Firm formats change: recruiter instructions supersede editable firm profiles. Readiness is evidence with uncertainty, never a guarantee of interview success.
