import { z } from "zod";
import { CaseSpec, caseSpecSchema, gradeNumber } from "./domain";

export const caseModeSchema = z.enum(["practice", "strict", "pressure", "readiness"]);
export type CaseMode = z.infer<typeof caseModeSchema>;

export const caseActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("message"), text: z.string().trim().min(1).max(4_000) }),
  z.object({ type: z.literal("submit-insight"), insightId: z.string(), text: z.string().trim().min(20).max(4_000) }),
  z.object({ type: z.literal("submit-calculation"), calculationId: z.string(), answer: z.number().finite(), equation: z.string().max(500), unit: z.string().max(80) }),
  z.object({ type: z.literal("request-hint") }),
  z.object({ type: z.literal("advance") }),
  z.object({ type: z.literal("finish") }),
]);
export type CaseAction = z.infer<typeof caseActionSchema>;

export type CaseTurn = { id: string; role: "candidate" | "interviewer" | "system"; text: string; at: string; evidenceType?: "claim" | "calculation" | "insight" };
export type CalculationResult = { calculationId: string; answer: number; equation: string; unit: string; correct: boolean; score: number; expectedUnit: string };
export type FrozenCaseSession = {
  id: string; caseId: string; caseVersion: string; specSnapshot: Readonly<CaseSpec>; mode: CaseMode; stageId: string;
  revealedFactIds: string[]; revealedHiddenFactIds:string[]; availableExhibitIds: string[]; completedInsightIds: string[]; calculationResults: CalculationResult[];
  hintsUsed: number; startedAt: string; completedAt?: string; turns: CaseTurn[];
};

export type PublicCaseView = {
  sessionId: string; title: string; objective: string; stageId: string; stageObjective: string; mode: CaseMode; poolRole:CaseSpec["poolRole"];
  facts: { id:string;text:string }[]; exhibits: CaseSpec["exhibits"]; turns: CaseTurn[]; hintsUsed:number; complete:boolean;
  requiredInsightIds:string[]; completedInsightIds:string[]; calculations:{id:string;prompt:string}[];
};

const clone = <T>(value:T):T => structuredClone(value);
const freeze = <T>(value:T):Readonly<T> => { if(value && typeof value === "object"){ Object.freeze(value); Object.values(value as object).forEach(freeze); } return value; };
const turn = (role:CaseTurn["role"],text:string,evidenceType?:CaseTurn["evidenceType"]):CaseTurn => ({id:crypto.randomUUID(),role,text,at:new Date().toISOString(),evidenceType});

export function createCaseSession(specInput:unknown, mode:CaseMode="practice"):FrozenCaseSession {
  const spec=freeze(caseSpecSchema.parse(clone(specInput))) as Readonly<CaseSpec>;
  const stage=spec.stages[0];
  return {id:crypto.randomUUID(),caseId:spec.id,caseVersion:spec.version,specSnapshot:spec,mode,stageId:stage.id,
    revealedFactIds:spec.clientFacts.filter(f=>f.stage===stage.id).map(f=>f.id),availableExhibitIds:spec.exhibits.filter(e=>e.releaseStage===stage.id).map(e=>e.id),
    revealedHiddenFactIds:[],completedInsightIds:[],calculationResults:[],hintsUsed:0,startedAt:new Date().toISOString(),
    turns:[turn("interviewer",`${spec.context} ${spec.objective}`)]};
}

export function projectPublicCase(session:FrozenCaseSession):PublicCaseView {
  const spec=session.specSnapshot, stage=spec.stages.find(s=>s.id===session.stageId);
  if(!stage)throw new Error("Session references an unknown stage");
  const factIds=new Set(session.revealedFactIds), exhibitIds=new Set(session.availableExhibitIds);
  return {sessionId:session.id,title:spec.title,objective:spec.objective,stageId:stage.id,stageObjective:stage.objective,mode:session.mode,poolRole:spec.poolRole,
    facts:[...spec.clientFacts.filter(f=>factIds.has(f.id)),...spec.hiddenFacts.filter(f=>session.revealedHiddenFactIds.includes(f.id))].map(({id,text})=>({id,text})),exhibits:spec.exhibits.filter(e=>exhibitIds.has(e.id)),
    turns:session.turns,hintsUsed:session.hintsUsed,complete:Boolean(session.completedAt),requiredInsightIds:stage.requiredInsights,
    completedInsightIds:session.completedInsightIds,calculations:stage.id==="analysis"?spec.calculations.map(({id,prompt})=>({id,prompt})):[]};
}

function interviewerReply(session:FrozenCaseSession,text:string){
  const spec=session.specSnapshot, words=text.toLowerCase().split(/\W+/).filter(w=>w.length>3);
  const unavailable=spec.unavailable.find(item=>words.some(w=>item.toLowerCase().includes(w)));
  if(unavailable)return "That information is unavailable. Please work with the evidence provided.";
  const hidden=spec.hiddenFacts.find(f=>f.stage===session.stageId&&words.some(w=>f.id.toLowerCase()===w));
  if(hidden){session.revealedHiddenFactIds=[...new Set([...session.revealedHiddenFactIds,hidden.id])];return hidden.text}
  const available=spec.clientFacts.find(f=>session.revealedFactIds.includes(f.id)&&words.some(w=>f.id.toLowerCase()===w||f.text.toLowerCase().includes(w)));
  if(available)return available.text;
  if(spec.hiddenFacts.some(f=>words.some(w=>f.id.toLowerCase().includes(w)||f.text.toLowerCase().includes(w))))return "I don’t have additional information to share on that yet.";
  return session.mode==="practice"?"How would that help answer the client’s objective?":"Please continue.";
}

function insightHasMinimumEvidence(insightId:string,text:string){
 const rules:Record<string,RegExp>={objective:/\b(client|decision|decide|should|objective)\b/i,economics:/[$%]|\b(cost|revenue|profit|margin|capacity|volume|payback|break-even)\b/i,recommendation:/\b(recommend|should|because|risk|next step|pilot)\b/i};
 return text.trim().split(/\s+/).length>=5&&(rules[insightId]?.test(text)??true);
}

export function applyCaseAction(current:FrozenCaseSession,input:unknown):FrozenCaseSession {
  if(current.completedAt)throw new Error("Completed sessions are immutable");
  const action=caseActionSchema.parse(input), session=clone(current), spec=session.specSnapshot;
  if(spec.id!==session.caseId||spec.version!==session.caseVersion)throw new Error("Case snapshot identity mismatch");
  const stage=spec.stages.find(s=>s.id===session.stageId); if(!stage)throw new Error("Unknown current stage");
  if(action.type==="message")session.turns.push(turn("candidate",action.text,"claim"),turn("interviewer",interviewerReply(session,action.text)));
  if(action.type==="submit-insight"){
    if(!stage.requiredInsights.includes(action.insightId))throw new Error("Insight is not valid for this stage");
    if(!insightHasMinimumEvidence(action.insightId,action.text))throw new Error("Insight needs decision-relevant reasoning and supporting evidence");
    session.completedInsightIds=[...new Set([...session.completedInsightIds,action.insightId])]; session.turns.push(turn("candidate",action.text,"insight"));
    if(session.mode==="practice")session.turns.push(turn("interviewer","Noted. Connect that finding to the client decision before moving on."));
  }
  if(action.type==="submit-calculation"){
    const calculation=spec.calculations.find(c=>c.id===action.calculationId); if(!calculation)throw new Error("Unknown calculation");
    const numeric=gradeNumber(action.answer,calculation.answer,calculation.tolerance), unitsMatch=action.unit.trim().toLowerCase()===calculation.unit.toLowerCase();
    session.calculationResults.push({calculationId:calculation.id,answer:action.answer,equation:action.equation,unit:action.unit,correct:numeric.correct&&unitsMatch,score:unitsMatch?numeric.score:1,expectedUnit:calculation.unit});
    session.turns.push(turn("candidate",`${action.equation} = ${action.answer} ${action.unit}`,"calculation"));
    if(session.mode==="practice")session.turns.push(turn("interviewer",numeric.correct&&unitsMatch?"The calculation is correct. What does it imply?":"Check the equation, arithmetic, and units before continuing."));
  }
  if(action.type==="request-hint"){
    session.hintsUsed++; session.turns.push(turn("system",session.mode==="strict"||session.mode==="readiness"?"Hint recorded. Strict mode does not provide coaching during the case.":`Focus on the stage objective: ${stage.objective}`));
  }
  if(action.type==="advance"){
    const missing=stage.requiredInsights.filter(i=>!session.completedInsightIds.includes(i));
    if(missing.length&&session.mode!=="practice")throw new Error("Stage requirements are incomplete");
    if(missing.length)session.turns.push(turn("interviewer",`Before moving on, address: ${missing.join(", ")}.`));
    else { const nextId=stage.next[0]; if(!nextId)session.completedAt=new Date().toISOString(); else {session.stageId=nextId;session.revealedFactIds=[...new Set([...session.revealedFactIds,...spec.clientFacts.filter(f=>f.stage===nextId).map(f=>f.id)])];session.availableExhibitIds=[...new Set([...session.availableExhibitIds,...spec.exhibits.filter(e=>e.releaseStage===nextId).map(e=>e.id)])];session.turns.push(turn("interviewer",spec.stages.find(s=>s.id===nextId)!.objective));} }
  }
  if(action.type==="finish"){session.completedAt=new Date().toISOString();session.turns.push(turn("system","Case completed. Evaluation is now available."));}
  session.specSnapshot=freeze(session.specSnapshot) as Readonly<CaseSpec>;
  return session;
}

export function evaluateCompletedCase(session:FrozenCaseSession){
  if(!session.completedAt)throw new Error("Case must be completed before evaluation");
  const calculations=session.calculationResults, accuracy=calculations.length?calculations.filter(c=>c.correct).length/calculations.length:null;
  const required=session.specSnapshot.stages.flatMap(s=>s.requiredInsights), insightCoverage=required.length?required.filter(i=>session.completedInsightIds.includes(i)).length/required.length:1;
  return {caseId:session.caseId,title:session.specSnapshot.title,industry:session.specSnapshot.industry,completedAt:session.completedAt,caseVersion:session.caseVersion,mode:session.mode,calculationAccuracy:accuracy,insightCoverage,hintsUsed:session.hintsUsed,
    poolRole:session.specSnapshot.poolRole,
    strictFeedbackReleased:session.mode!=="strict"||Boolean(session.completedAt),evidenceTurnIds:session.turns.filter(t=>t.role==="candidate").map(t=>t.id)};
}
