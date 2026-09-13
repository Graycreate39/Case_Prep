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
- Parameterized exercise catalog meeting the initial content floors, evidence-backed qualitative evaluator schema, selective second-evaluation policy, and text/voice transport boundary.
- Frozen session snapshots, safe public case projection, strict-mode feedback isolation, deterministic case actions/evaluation, case selection, exhibit release, and PostgreSQL production schema.
- Server-only case session routes: the browser receives public metadata, released facts/exhibits, prompts, and visible turns, but never hidden facts, answer keys, or tolerances.
- Demo session ownership is isolated with an HttpOnly SameSite cookie; mutation routes enforce ownership, body-size limits, same-origin checks, and runtime schemas.
- Exercise attempts now update only their targeted skill evidence, uncertainty, trend, drill transfer signal, error tags, and next review date; retries carry less mastery weight.
- Readiness now separates critical skill mastery, unseen-simulation consistency, and firm-specific evidence; eight editable-source firm profiles and deterministic behavioral story diagnostics are seeded.
- Versioned local learner storage now migrates legacy data and supports backup/restore; onboarding creates cautious diagnostic evidence; case completions feed readiness; Story gates derive from skill evidence.
- Behavioral stories include structured context/actions/results/learning with immediate diagnostics and deletion; human logs preserve case/date/evaluator attribution.
- Every Story chapter now has concept teaching, a worked example, a guided-to-independent practice sequence, and an evidence gate. Skill Lab serves all six exercise families with transparent deterministic feedback and transfer retries.
- Case progression requires learner-authored, minimally supported reasoning; stage-relevant hidden facts can be elicited by legitimate questions, while premature facts and answer keys remain isolated.
- New learners begin with zero mastery and zero observations; diagnostic self-report does not masquerade as demonstrated progress. Legacy synthetic demo evidence is removed automatically, and duration options persist as numeric values without producing `NaN`.

## Current phase
Pedagogical-engine redesign complete for the local-first scope; full verification performed except browser execution blocked by the environment CDN.

## Unresolved technical issues
- Hosted authentication/database, paid qualitative AI, and live voice are intentionally out of scope for the local-only product.
- Playwright browser download is blocked by the current CDN policy (HTTP 403); the E2E journey is authored but could not execute in this environment.
- Local Prisma schema-engine download is blocked by the same proxy; CI now validates the schema with a non-secret placeholder connection URL.

## Completed pedagogical milestone
- Added typed learning functions, skill stages, evidence dimensions, recurrent/judgment classification, root-cause errors, adaptive challenge, review ladders, retry sequencing, and holdout rules.
- Enriched every exercise with deep/surface structure, transfer, novelty, duration, difficulty dimensions, assessment eligibility, and pool role.
- Added active prediction examples and integrated Case Links throughout Story Mode; mastery now requires independence, context variation, transfer, retention, and integration.
- Added duration-safe daily sessions, local-only verbal recording, confidence calibration, evidence-separated analytics, and human-practice transfer-gap detection.
- Masked readiness holdouts during normal practice and permanently exclude attempted holdouts from unseen readiness selection.
- Added behavior tests and expanded the Playwright journey. Browser execution remains environment-blocked because Chromium downloads return HTTP 403.

## Next high-level task
Run the authored browser journey when Chromium is available; paid AI, cloud auth, and cloud audio remain intentionally excluded.

## 2026-09-12 learner-state integrity fix
- Local store v4 rebuilds every displayed skill summary from auditable attempts and completed cases; persisted/demo percentages are never trusted.
- Legacy manual chapter markers are cleared during migration, preventing untouched profiles from showing completed chapters.
- The header identifies learning engine v4 so a stale local checkout/bundle is immediately visible.

- Turbopack is pinned to the repository working directory so an unrelated parent `package-lock.json` cannot make Next.js select the wrong project root.

## Story orchestration milestone
- Story Mode now owns explicit executable plans for all 16 chapters and launches exact activities rather than generic module landing pages.
- Chapter 0 is a stage-by-stage worked mini-case; Chapters 1–7 have authored discrimination, completion, independent, transfer, Case Link, and gate steps.
- Dedicated early Case Links remain inside Story, and Case Room no longer exposes internal expected-insight identifiers.
- Story records, remediation, provisional competence, and retention-pending states persist in learner store v5.

- Added a compact five-skill performance diagnostic after onboarding; self-report remains context only and sampled results cannot grant chapter mastery.

## Numeric feedback correction
- Numeric grading accepts mathematically valid rounding at the precision the learner supplied (for example, 35.71% entered as 36%).
- Learner-facing feedback no longer exposes internal 1–5 evidence scores for deterministic numeric answers.
- Prediction-example reveals now show the actual formula, result, rounding guidance, and decision implication instead of generic exercise rationale.

- The shared deterministic number grader now owns rounding semantics for Skill Lab and Case Room; case submissions preserve the learner's entered precision.


## Exercise content audit
- Replaced vague generated setup and judgment prompts with self-contained client situations, concrete evidence, an explicit task, and specific worked solutions.
- Added content-quality tests that reject placeholder context and require worked solutions for every open-response exercise.
- Diagnostic activities now remount between questions so feedback from one task cannot appear on the next task.
