# Build state

## Architecture
Next.js App Router UI with a versioned browser demo store. Pure TypeScript domain modules own the skill graph, adaptive planning, spaced review, immutable `CaseSpec` validation, runtime transitions, and deterministic grading. AI is an optional server-side adapter layered above those rules.

## Decisions
- A credential-free seeded demo is the primary local path; production persistence can replace the store behind the same typed boundary.
- Case truth is validated and deep-frozen before a session; the conversational layer receives only stage-safe facts.
- Mastery is evidence by skill/source/difficulty, never a single opaque score.
- Visual direction: editorial ivory, ink, and restrained signal green; dense enough for professional work without dashboard clutter.

## Completed phases
- Project architecture, premium responsive design foundation, and credential-free onboarding.
- Granular skill graph, transparent daily planner, Story Mode map, deterministic drills, mastery gates, spaced review, and Rewind & Retry attempt retention.
- Validated/version-frozen CaseSpec model, stage-safe runtime, deterministic numeric grading, original seed cases, and focused text Case Room.
- Progress analytics, uncertainty/readiness language, behavioral Story Bank, and attributed human feedback log.
- Unit and browser-flow test suites, CI, contributor guide, and deployment documentation.

## Current phase
Core demo milestone complete; production integrations are clearly bounded.

## Unresolved technical issues
- Production authentication/database, complete editorial content targets, live qualitative AI, and voice providers remain integration boundaries; demo behavior is fully local.
- Playwright browser download is blocked by the current CDN policy (HTTP 403); the E2E journey is authored but could not execute in this environment.

## Next high-level task
Add authenticated PostgreSQL persistence, then expand validated case/exercise catalogs through the editorial pipeline.
