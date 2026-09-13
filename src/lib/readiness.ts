import type { SkillId,SkillState } from "./domain";
import { reliabilityWeight } from "./evaluation";

export type FirmProfile={id:string;name:string;controlStyle:"interviewer-led"|"candidate-led"|"hybrid";typicalMinutes:number;behavioralFormat:string;emphasis:SkillId[];specialFormats:string[];digitalAssessmentNotes:string;source:string;lastVerified:string};
export type SimulationEvidence={caseId:string;industry:string;unseen:boolean;completedAt:string;criticalSkillScore:number;hintCount:number;timingMet:boolean};
export type HumanEvidence={evaluatorType:string;overallScore:number;skillRatings:Partial<Record<SkillId,number>>};
export type ReadinessResult={skillMastery:number;simulationConsistency:number|null;firmSpecific:number|null;confidence:"low"|"moderate"|"high";label:string;uncertainty:number;highestLeverage:{skill:SkillId;reason:string}[];evidenceNeeded:string[]};

export const firmProfiles:FirmProfile[]=[
 {id:"mckinsey",name:"McKinsey",controlStyle:"interviewer-led",typicalMinutes:30,behavioralFormat:"Personal Experience Interview",emphasis:["problem-definition","structuring","synthesis","personal-ownership"],specialFormats:["Interviewer-led case"],digitalAssessmentNotes:"Recruiter instructions supersede this profile.",source:"Editable starter profile",lastVerified:"2026-09-01"},
 {id:"bcg",name:"BCG",controlStyle:"hybrid",typicalMinutes:35,behavioralFormat:"Experience and motivation discussion",emphasis:["structuring","business-judgment","exhibit-interpretation","recommendation"],specialFormats:["Potential digital case"],digitalAssessmentNotes:"Format varies by office.",source:"Editable starter profile",lastVerified:"2026-09-01"},
 {id:"bain",name:"Bain",controlStyle:"candidate-led",typicalMinutes:35,behavioralFormat:"Experience interview",emphasis:["case-leadership","business-judgment","concise-communication","recommendation"],specialFormats:[],digitalAssessmentNotes:"Format varies by role and office.",source:"Editable starter profile",lastVerified:"2026-09-01"},
 ...["EY-Parthenon","Strategy&","Oliver Wyman","Kearney","Deloitte"].map((name,i):FirmProfile=>({id:name.toLowerCase().replace(/[^a-z]+/g,"-"),name,controlStyle:i%2?"candidate-led":"hybrid",typicalMinutes:35,behavioralFormat:"Experience and motivation discussion",emphasis:["structuring","quant-setup","business-judgment","recommendation"],specialFormats:[],digitalAssessmentNotes:"Confirm current format with the recruiter.",source:"Editable starter profile",lastVerified:"2026-09-01"}))
];
const critical:SkillId[]=["problem-definition","structuring","prioritization","quant-setup","arithmetic-accuracy","exhibit-interpretation","quant-interpretation","business-judgment","synthesis","recommendation","case-leadership","concise-communication"];
export function calculateReadiness(skills:SkillState[],simulations:SimulationEvidence[],human:HumanEvidence[],firm?:FirmProfile):ReadinessResult{
 const byId=new Map(skills.map(s=>[s.id,s])),states=critical.map(id=>byId.get(id)).filter((x):x is SkillState=>Boolean(x));
 const skillMastery=states.length?states.reduce((sum,s)=>sum+s.mastery,0)/states.length:0,skillUncertainty=states.length?states.reduce((sum,s)=>sum+s.uncertainty,0)/states.length:1;
 const recent=[...simulations].filter(s=>s.unseen).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)).slice(0,5);
 const simulationConsistency=recent.length>=3?recent.reduce((sum,s)=>sum+s.criticalSkillScore*(s.hintCount?0.9:1)*(s.timingMet?1:.9),0)/recent.length:null;
 const profileStates=firm?.emphasis.map(id=>byId.get(id)).filter((x):x is SkillState=>Boolean(x))??[],firmSpecific=firm&&profileStates.length?profileStates.reduce((a,s)=>a+s.mastery,0)/profileStates.length:null;
 const humanWeight=human.reduce((sum,h)=>sum+reliabilityWeight("human",h.evaluatorType),0),evidenceCount=states.reduce((sum,s)=>sum+s.observations,0)+recent.length*4+humanWeight;
 const uncertainty=Math.min(1,skillUncertainty+(recent.length<3?.18:0)+(human.length===0?.05:0)),confidence=evidenceCount>70&&uncertainty<.22?"high":evidenceCount>35&&uncertainty<.4?"moderate":"low";
 const composite=skillMastery*.6+(simulationConsistency??skillMastery*.75)*.3+(firmSpecific??skillMastery)*.1;
 const label=composite>=.78&&recent.length>=3&&confidence!=="low"?"Strong evidence of interview readiness":composite>=.62?"Readiness evidence is developing":"Foundational gaps remain";
 const highestLeverage=[...states].sort((a,b)=>(1-b.mastery)*(1+b.uncertainty)-(1-a.mastery)*(1+a.uncertainty)).slice(0,3).map(s=>({skill:s.id,reason:s.observations<3?"Needs more independent evidence":s.drill-s.case>.15?"Drill performance is not yet transferring to cases":"Weakness and uncertainty create high learning value"}));
 const evidenceNeeded=[...(recent.length<3?[`${3-recent.length} more recent unseen simulation${3-recent.length===1?"":"s"}`]:[]),...(human.length===0?["Calibrated human feedback"]:[]),...(states.some(s=>s.observations<3)?["Repeated independent skill observations"]:[])];
 return {skillMastery,simulationConsistency,firmSpecific,confidence,label,uncertainty,highestLeverage,evidenceNeeded};
}
