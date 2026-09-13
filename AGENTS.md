# CaseCraft contributor guide

## Architecture and directory map
- `src/app`: Next.js App Router shell and global design tokens.
- `src/components`: interactive product surfaces. Keep domain rules out of components.
- `src/lib/domain.ts`: core grading and validated CaseSpec types; `src/lib/pedagogy.ts`: learning stages, evidence dimensions, adaptive challenge, retry/review, daily planning, and holdout rules.
- `src/lib/seed.ts`: original, versioned demo content.
- `e2e`: browser journeys; `docs/BUILD_STATE.md`: concise current context.

## Commands
`npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run e2e`, `npm run build`.

## Conventions
Use strict TypeScript and Zod at trust boundaries. Prefer pure functions and accessible native controls. Never catch imports. Keep the credential-free demo path working. Use the repository UI Craft skill for surfaces and Vercel React guidance for React changes.

## CaseSpec invariants and leakage rules
Validate, reconcile, version, then deep-freeze every spec before play. A session pins `id + version`. Client-safe facts, hidden facts, unavailable information, exhibits, answers, and tolerances are distinct. Runtime—not an LLM—controls releases and transitions. Never include hidden facts, exact answers, or unreleased exhibits in an interviewer request. Wrong learner claims never mutate truth. Deterministic graders own numbers and units.

## AI architecture
AI providers are optional server-only adapters for natural interviewer phrasing and structured qualitative rubrics. They do not own state, facts, progression, or numeric grading. Store visible output, evidence references, structured scores, metadata, and errors—never private chain-of-thought. Independently re-evaluate only consequential low-confidence decisions.

## Testing and definition of completion
Any domain change needs behavior assertions; case changes need schema, arithmetic, reachability, and leakage tests. User-facing flows require Playwright interaction and console/network inspection. Completion requires lint, strict typecheck, tests, production build, credential-free usability, accessible states, updated BUILD_STATE, and no known hidden-answer leak.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Story Mode invariants
Story Mode owns authored activity order in `src/lib/story.ts`; never infer curriculum order from generic catalog position. Story, Today, and Reviews must launch an exact activity ID. Case Links are dedicated integrated segments, not links to a module landing page. Manual bypass is not mastery. Durable mastery requires the chapter-specific evidence gate; provisional competence may advance while retention is pending. Never expose expected insight IDs in Case Room.
