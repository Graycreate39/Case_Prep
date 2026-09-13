import type { SkillId } from "./domain";

export const learningFunctions = ["WORKED_EXAMPLE","PREDICTION_EXAMPLE","COMPLETION_PROBLEM","GUIDED_PRACTICE","INDEPENDENT_PRACTICE","DISCRIMINATION","NEAR_TRANSFER","FAR_TRANSFER","INTEGRATED_CASE_SEGMENT","RETENTION_REVIEW","ASSESSMENT"] as const;
export type ExerciseLearningFunction = typeof learningFunctions[number];
export type SkillLearningStage = "NOT_INTRODUCED"|"MODELED"|"GUIDED"|"INDEPENDENT"|"TRANSFER"|"RETAINED"|"MASTERED";
export type SkillClass = "RECURRENT"|"JUDGMENT_HEAVY";
export type PoolRole = "TRAINING"|"TRANSFER"|"READINESS_HOLDOUT";
export type EvidenceType = "ACQUISITION"|"INDEPENDENT"|"TRANSFER"|"RETENTION"|"INTEGRATION"|"FLUENCY";
export const errorTags = ["CONCEPT","PROCESS","SETUP","ARITHMETIC","UNIT","DATA_SELECTION","INTERPRETATION","PRIORITIZATION","ASSUMPTION","LOGIC","STRUCTURE","COMMUNICATION","SYNTHESIS","RECOMMENDATION","TIME_MANAGEMENT","HINT_DEPENDENCE"] as const;
export type RootErrorTag = typeof errorTags[number];
export type ConfidenceJudgment = "LOW"|"MEDIUM"|"HIGH";

export type SkillEvidence = {
  id:string; skillId:SkillId; attemptId:string; evidenceType:EvidenceType; context:string;
  difficulty:number; independent:boolean; transferDistance:0|1|2|3; delayed:boolean;
  integrated:boolean; score:number; confidence?:ConfidenceJudgment; guidanceLevel:0|1|2|3|4;
  hintsUsed:number; errorTag?:RootErrorTag; timestamp:string;
};

export type LearningProfile = { stage:SkillLearningStage; acquisition:number|null; independent:number|null; transfer:number|null; retention:number|null; integration:number|null; fluency:number|null; hintDependence:number; uncertainty:number; contexts:number };
const average=(items:number[])=>items.length?items.reduce((a,b)=>a+b,0)/items.length:null;
const scored=(e:SkillEvidence[],type:EvidenceType)=>average(e.filter(x=>x.evidenceType===type).slice(-5).map(x=>x.score));
export function classifySkill(id:SkillId):SkillClass{return (["arithmetic-accuracy","arithmetic-speed","data-extraction"] as SkillId[]).includes(id)?"RECURRENT":"JUDGMENT_HEAVY"}
export function learningProfile(skillId:SkillId,evidence:SkillEvidence[]):LearningProfile{
 const e=evidence.filter(x=>x.skillId===skillId), acquisition=scored(e,"ACQUISITION"), independent=scored(e,"INDEPENDENT"), transfer=scored(e,"TRANSFER"), retention=scored(e,"RETENTION"), integration=scored(e,"INTEGRATION"), fluency=scored(e,"FLUENCY");
 const contexts=new Set(e.map(x=>x.context)).size, hints=e.length?e.filter(x=>x.hintsUsed>0||x.guidanceLevel>1).length/e.length:0;
 const independentPass=e.filter(x=>x.independent&&x.score>=.7), transferPass=e.filter(x=>x.transferDistance>=1&&x.score>=.7), retainedPass=e.filter(x=>x.delayed&&x.score>=.7), integratedPass=e.filter(x=>x.integrated&&x.score>=.7);
 const major=classifySkill(skillId)==="JUDGMENT_HEAVY";
 let stage:SkillLearningStage="NOT_INTRODUCED";
 if(e.length)stage="MODELED"; if(e.some(x=>x.guidanceLevel>=2&&x.score>=.6))stage="GUIDED";
 if(independentPass.length>=2&&new Set(independentPass.map(x=>x.context)).size>=2)stage="INDEPENDENT";
 if(stage==="INDEPENDENT"&&transferPass.length)stage="TRANSFER";
 if((stage==="TRANSFER"||stage==="INDEPENDENT")&&retainedPass.length)stage="RETAINED";
 if(stage==="RETAINED"&&(!major||integratedPass.length>0)&&!e.slice(-3).some(x=>x.errorTag&&x.score<.5))stage="MASTERED";
 return {stage,acquisition,independent,transfer,retention,integration,fluency,hintDependence:hints,uncertainty:Math.max(.08,1-Math.min(1,e.length/8)),contexts};
}

export type Challenge={guidanceLevel:0|1|2|3|4;difficulty:number;transferDistance:0|1|2|3;reason?:string};
export function adaptChallenge(current:Challenge,recent:SkillEvidence[]):Challenge{
 const last=recent.slice(-3), strong=last.slice(-2).length===2&&last.slice(-2).every(x=>x.independent&&x.score>=.8&&x.hintsUsed===0);
 if(strong)return {guidanceLevel:Math.max(0,current.guidanceLevel-1) as Challenge["guidanceLevel"],difficulty:Math.min(5,current.difficulty+1),transferDistance:Math.min(3,current.transferDistance+1) as Challenge["transferDistance"],reason:"Two strong independent performances: reduce support and vary the context."};
 const causeFailures=last.filter(x=>x.score<.5&&x.errorTag&&x.errorTag!=="ARITHMETIC");
 if(causeFailures.length>=2)return {guidanceLevel:Math.min(4,current.guidanceLevel+1) as Challenge["guidanceLevel"],difficulty:Math.max(1,current.difficulty-1),transferDistance:Math.max(0,current.transferDistance-1) as Challenge["transferDistance"],reason:"Repeated conceptual failure: restore scaffolding at lower complexity."};
 if(last.length&&last.at(-1)?.errorTag==="ARITHMETIC")return {...current,reason:"Isolated arithmetic slip: keep the conceptual challenge stable."};
 return {...current,reason:"Mixed evidence: maintain challenge and change the surface context."};
}

export type PracticePhase="ACQUISITION"|"VARIATION"|"DISCRIMINATION"|"INTEGRATION"|"RETENTION";
export function practicePhase(profile:LearningProfile):PracticePhase{return profile.stage==="NOT_INTRODUCED"||profile.stage==="MODELED"?"ACQUISITION":profile.stage==="GUIDED"?"VARIATION":profile.stage==="INDEPENDENT"?"DISCRIMINATION":profile.stage==="TRANSFER"?"INTEGRATION":"RETENTION"}

export type ReviewItem={id:string;skillId:SkillId;underlyingErrorPattern:RootErrorTag;sourceAttemptId:string;stage:number;intervalDays:number;nextReview:string;transferContext:string};
const REVIEW_LADDER=[0,1,3,7,14,30,60];
export function scheduleReview(input:Omit<ReviewItem,"stage"|"intervalDays"|"nextReview">,now=new Date()):ReviewItem{return {...input,stage:0,intervalDays:0,nextReview:now.toISOString().slice(0,10)}}
export function updateReview(item:ReviewItem,success:boolean,now=new Date()):ReviewItem{const stage=success?Math.min(REVIEW_LADDER.length-1,item.stage+1):Math.max(1,item.stage-1),intervalDays=REVIEW_LADDER[stage];const next=new Date(now);next.setUTCDate(next.getUTCDate()+intervalDays);return {...item,stage,intervalDays,nextReview:next.toISOString().slice(0,10)}}

export type RetryStep="ATTEMPT_A"|"DIAGNOSE"|"MINIMAL_CORRECTION"|"ATTEMPT_B"|"TRANSFER_C"|"DELAYED_TRANSFER_D"|"COMPLETE";
export function nextRetryStep(step:RetryStep,successful=false):RetryStep{if(step==="ATTEMPT_A")return "DIAGNOSE";if(step==="DIAGNOSE")return "MINIMAL_CORRECTION";if(step==="MINIMAL_CORRECTION")return "ATTEMPT_B";if(step==="ATTEMPT_B")return successful?"TRANSFER_C":"MINIMAL_CORRECTION";if(step==="TRANSFER_C")return successful?"DELAYED_TRANSFER_D":"MINIMAL_CORRECTION";if(step==="DELAYED_TRANSFER_D")return "COMPLETE";return "COMPLETE"}

export type HoldoutRecord={caseId:string;poolRole:PoolRole;firstSeenAt?:string;seenCount:number};
export const isUnseenHoldout=(record:HoldoutRecord)=>record.poolRole==="READINESS_HOLDOUT"&&record.seenCount===0&&!record.firstSeenAt;
export function markCaseSeen(record:HoldoutRecord,at:string):HoldoutRecord{return {...record,firstSeenAt:record.firstSeenAt??at,seenCount:record.seenCount+1}}
export function readinessEvidence(evidence:SkillEvidence[],holdoutUnseenAtStart:boolean){const valid=evidence.filter(x=>x.evidenceType==="INTEGRATION"&&x.independent&&x.guidanceLevel===0&&x.hintsUsed===0);return holdoutUnseenAtStart?average(valid.map(x=>x.score)):null}

export type SessionCandidate={id:string;skillId:SkillId;title:string;minutes?:number;type:"RETRIEVAL"|"TARGETED"|"TRANSFER"|"INTEGRATED"|"DEBRIEF";priority:number;why:string;noveltyGroup:string};
export function safeMinutes(value:unknown,fallback=8){const n=typeof value==="number"?value:Number(value);return Number.isFinite(n)&&n>0?Math.round(n):fallback}
export function buildDailySession(candidates:SessionCandidate[],requested:unknown){const target=[15,30,45,60,90].includes(Number(requested))?Number(requested):30;const ordered=[...candidates].sort((a,b)=>b.priority-a.priority),picked:SessionCandidate[]=[];let total=0;
 for(const candidate of ordered){const minutes=safeMinutes(candidate.minutes);if(picked.some(x=>x.noveltyGroup===candidate.noveltyGroup&&x.type===candidate.type))continue;if(total+minutes>target&&picked.length)continue;picked.push({...candidate,minutes});total+=minutes;if(total>=target-3)break;}
 if(!picked.length)picked.push({id:"diagnostic",skillId:"problem-definition",title:"Compact diagnostic",minutes:Math.min(15,target),type:"TARGETED",priority:1,why:"Establish demonstrated evidence before prescribing weaknesses.",noveltyGroup:"diagnostic"});
 return {targetMinutes:target,totalMinutes:picked.reduce((sum,x)=>sum+safeMinutes(x.minutes),0),items:picked};
}

export function calibration(confidence:ConfidenceJudgment|undefined,score:number){if(confidence==="HIGH"&&score<.5)return "OVERCONFIDENT" as const;if(confidence==="LOW"&&score>=.8)return "CONFIDENCE_LAG" as const;return "CALIBRATED" as const}
export function humanTransferGap(appScore:number|null,humanRatings:number[]){if(appScore===null||!humanRatings.length)return null;const human=humanRatings.reduce((a,b)=>a+b,0)/humanRatings.length/5;return appScore-human>=.2?{gap:appScore-human,message:"Isolated practice is stronger than human-case performance. Prescribe realistic case segments, not more isolated drills."}:null}
