# Story Mode architecture

Story Mode is the curriculum orchestrator; Skill Lab is free practice, Today is time-based prescription, and Case Room is the closed-world simulation engine.

## Plans and activities
`src/lib/story.ts` owns one explicit `StoryChapterPlan` per chapter. A plan contains an ordered set of stable `StoryActivitySpec` records. Activities declare their learning function, exact exercise or dedicated Case Link, skills, prerequisites, guidance, difficulty, transfer distance, duration, evidence type, and gate contribution. Generic catalog position never defines Story order.

`getNextStoryActivity` selects the next executable step. It resumes the first unmet prerequisite, but a required remediation record takes priority. Remediation preserves the activity target, increases scaffolding, and avoids reducing conceptual difficulty for an isolated arithmetic slip.

## Execution and return
`StoryMode` launches content and dedicated Case Links inside the Story surface. Exact catalog exercises reuse `SkillLab` with an explicit `exerciseId`. Completion returns to the same chapter and immediately recomputes the next activity. Today uses the same exact-exercise entry point; manual Skill Lab remains learner-directed.

## Evidence and gates
Activity records are persisted separately from attempts. Gate activities also emit ordinary learner evidence. Chapter gates define independent, transfer, integration, retention, and minimum-score requirements. Independence + transfer + integration allows provisional competence and forward progress; delayed retrieval upgrades it to durable mastery. A manual bypass is always labeled evidence-incomplete.

## Case Links
Early Case Links are authored client segments with natural learner responses; they are not generic Skill Lab redirects. The full Case Room never exposes expected insight IDs. Its server maps a substantive response to the current stage requirement while exact answers and hidden facts remain server-only. Readiness holdouts are never consumed by Story.

## Authoring
1. Add a stable plan to `storyChapterPlans`.
2. Give every activity a stable `chapter:id`, explicit predecessor, purpose, duration, guidance, and evidence type.
3. Reference a real catalog ID for an exercise, or author a dedicated natural-response Case Link.
4. Define chapter-specific gate counts.
5. Add selection, remediation, routing, and gate assertions in `story.test.ts`.

## Placement diagnostic
After self-report onboarding, a five-task 8–15 minute performance sample uses the shared exact-exercise runner for arithmetic, setup, structure, exhibit interpretation, and synthesis. Results create independent evidence but never grant mastery or bypass a chapter gate from one response.
