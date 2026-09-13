import { z } from "zod";
import type { EvidenceSource, SkillId } from "./domain";

export const qualitativeEvaluationSchema=z.object({
  skill:z.string(),score:z.number().int().min(1).max(5),confidence:z.number().min(0).max(1),reasoning:z.string().min(1),
  evidence:z.array(z.object({turnId:z.string(),excerpt:z.string().max(240)})).min(1),errorTags:z.array(z.string()),improvement:z.string().min(1),source:z.enum(["ai","human"])
});
export type QualitativeEvaluation=z.infer<typeof qualitativeEvaluationSchema>;
export const rubricAnchors={1:"Unusable or largely irrelevant",2:"Major omissions or generic reasoning",3:"Workable but incomplete or weakly prioritized",4:"Strong, tailored, logical, and useful",5:"Exceptional, insightful, and highly decision-useful"} as const;
export function normalizedAnchor(score:1|2|3|4|5){return (score-1)/4}
export function shouldSecondEvaluate(e:QualitativeEvaluation,threshold=.68){const normalized=normalizedAnchor(e.score as 1|2|3|4|5);return e.confidence<.65||Math.abs(normalized-threshold)<.08;}
export function reliabilityWeight(source:EvidenceSource,evaluator?:string){if(source==="deterministic")return 1;if(source==="ai")return .72;return evaluator==="former-interviewer"?.95:evaluator==="consultant"?.85:.6;}
export type SkillJudgment={skill:SkillId;normalized:number;weight:number;source:EvidenceSource};
