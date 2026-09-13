import type { SkillId } from "./domain";
import type { ExerciseLearningFunction, PoolRole } from "./pedagogy";

export type GuidanceLevel = 0 | 1 | 2 | 3 | 4;
export type ExerciseKind = "mental-math" | "quant-setup" | "structure" | "exhibit" | "brainstorm" | "synthesis";
export type Exercise = {
  id: string;
  kind: ExerciseKind;
  skill: SkillId;
  difficulty: 1 | 2 | 3 | 4 | 5;
  guidance: GuidanceLevel;
  prompt: string;
  answer: number | string;
  tolerance?: number;
  unit?: string;
  rationale: string;
  learningFunction: ExerciseLearningFunction;
  secondarySkills: SkillId[];
  deepPrinciple: string;
  problemFamily: string;
  industry: string;
  surfaceContext: string;
  transferDistance: 0 | 1 | 2 | 3;
  noveltyGroup: string;
  poolRole: PoolRole;
  estimatedDuration: number;
  assessmentEligibility: boolean;
  difficultyDimensions: { numericComplexity:number; ambiguity:number; informationNoise:number; simultaneousSkills:number };
};

const functionFor=(index:number,count:number):ExerciseLearningFunction=>["WORKED_EXAMPLE","PREDICTION_EXAMPLE","COMPLETION_PROBLEM","GUIDED_PRACTICE","INDEPENDENT_PRACTICE","NEAR_TRANSFER","FAR_TRANSFER","DISCRIMINATION","INTEGRATED_CASE_SEGMENT","RETENTION_REVIEW","ASSESSMENT"][Math.min(10,Math.floor(index/Math.max(1,count/11)))] as ExerciseLearningFunction;
function metadata(index:number,count:number,context:string,principle:string,kind:ExerciseKind):Pick<Exercise,"learningFunction"|"secondarySkills"|"deepPrinciple"|"problemFamily"|"industry"|"surfaceContext"|"transferDistance"|"noveltyGroup"|"poolRole"|"estimatedDuration"|"assessmentEligibility"|"difficultyDimensions">{
 const learningFunction=functionFor(index,count), transferDistance=(learningFunction==="FAR_TRANSFER"?3:learningFunction==="NEAR_TRANSFER"||learningFunction==="INTEGRATED_CASE_SEGMENT"?2:learningFunction==="DISCRIMINATION"?1:0) as 0|1|2|3;
 return {learningFunction,secondarySkills:kind==="mental-math"?["quant-interpretation"]:kind==="quant-setup"?["arithmetic-accuracy","quant-interpretation"]:kind==="synthesis"?["concise-communication"]:[],deepPrinciple:principle,problemFamily:index>count*.7?"ambiguous decision":"foundational analysis",industry:context,surfaceContext:context,transferDistance,noveltyGroup:`${kind}-${index%5}`,poolRole:learningFunction==="ASSESSMENT"?"TRANSFER":"TRAINING",estimatedDuration:kind==="mental-math"?4:kind==="quant-setup"?7:10,assessmentEligibility:["INDEPENDENT_PRACTICE","FAR_TRANSFER","ASSESSMENT"].includes(learningFunction),difficultyDimensions:{numericComplexity:kind==="mental-math"?1+Math.floor(index/6):1,ambiguity:kind==="mental-math"?1:1+Math.floor(index/4),informationNoise:learningFunction==="DISCRIMINATION"?3:1,simultaneousSkills:learningFunction==="INTEGRATED_CASE_SEGMENT"?3:1}};
}

const contexts = ["subscription software", "regional airline", "specialty retailer", "clinic network", "parcel operator"];
const mentalSeeds = [
  { name: "margin", a: 48, b: 36, solve: (a:number,b:number)=>(a-b)/a*100, unit:"%", prompt:(a:number,b:number)=>`Revenue is $${a}m and costs are $${b}m. What is the operating margin?` },
  { name: "growth", a: 80, b: 100, solve: (a:number,b:number)=>(b-a)/a*100, unit:"%", prompt:(a:number,b:number)=>`Customers increase from ${a}k to ${b}k. What is the percentage growth?` },
  { name: "breakeven", a: 600, b: 12, solve: (a:number,b:number)=>a/b, unit:"units", prompt:(a:number,b:number)=>`Fixed costs are $${a}k and contribution is $${b}k per unit. What is break-even volume?` },
  { name: "weighted", a: 60, b: 40, solve: (a:number,b:number)=>(a*.7+b*.3), unit:"points", prompt:(a:number,b:number)=>`Two segments score ${a} and ${b}, weighted 70% and 30%. What is the weighted score?` },
  { name: "utilization", a: 72, b: 90, solve: (a:number,b:number)=>a/b*100, unit:"%", prompt:(a:number,b:number)=>`A plant makes ${a}k units against ${b}k capacity. What is utilization?` },
  { name: "share", a: 15, b: 60, solve: (a:number,b:number)=>a/b*100, unit:"%", prompt:(a:number,b:number)=>`Client sales are $${a}m in a $${b}m market. What is market share?` },
];

export const mentalMathExercises: Exercise[] = mentalSeeds.flatMap((seed, seedIndex) =>
  Array.from({ length: 5 }, (_, variant) => {
    const a = seed.a + variant * (seedIndex % 2 ? 5 : 12);
    const b = seed.b + variant * (seedIndex % 2 ? 4 : 6);
    return { id:`math-${seed.name}-${variant+1}`, kind:"mental-math" as const, skill:"arithmetic-accuracy" as const,
      difficulty:(Math.min(5,variant+1) as 1|2|3|4|5), guidance:variant<1?3:variant<3?2:1,
      prompt:seed.prompt(a,b), answer:Number(seed.solve(a,b).toFixed(2)), tolerance:.1, unit:seed.unit,
      rationale:"Set up the relationship, preserve units, calculate, then connect the result to the decision.", ...metadata(seedIndex*5+variant,30,contexts[(seedIndex+variant)%contexts.length],seed.name,"mental-math") };
  })
);

export const quantSetupExercises: Exercise[] = Array.from({ length: 15 }, (_, i) => ({
  id:`setup-${i+1}`, kind:"quant-setup", skill:"quant-setup", difficulty:(1+Math.floor(i/3) as 1|2|3|4|5), guidance:(i<3?3:i<9?2:1),
  prompt:`For a ${contexts[i%contexts.length]}, define the equation needed to ${["calculate break-even volume","estimate annual profit","compare customer lifetime value","test capacity sufficiency","measure price elasticity"][i%5]}. State inputs and units before calculating.`,
  answer:["Fixed costs ÷ contribution per unit","Revenue − variable costs − fixed costs","Contribution per customer × retention periods − acquisition cost","Forecast demand ÷ available capacity","% change in volume ÷ % change in price"][i%5],
  rationale:"A correct setup names the decision quantity, uses only relevant inputs, and carries consistent units.",...metadata(i,15,contexts[i%contexts.length],"setup → execution → interpretation","quant-setup")
}));

function qualitative(kind:ExerciseKind, count:number, skill:SkillId, actions:string[]):Exercise[]{return Array.from({length:count},(_,i)=>({
  id:`${kind}-${i+1}`,kind,skill,difficulty:(1+Math.floor(i/(count/5)) as 1|2|3|4|5),guidance:(i<2?3:i<count/2?2:1),
  prompt:`${actions[i%actions.length]} Context: ${contexts[i%contexts.length]}; objective and constraints differ from the previous exercise.`,
  answer:"Evaluated with the behaviorally anchored rubric and evidence references.",
  rationale:"Strong responses are tailored, decision-relevant, prioritized, and explicit about uncertainty.",...metadata(i,count,contexts[i%contexts.length],kind==="structure"?"decision-led decomposition":kind==="exhibit"?"finding → implication":kind==="brainstorm"?"structured creativity":"finding → implication → next step",kind)
}))}
export const structureExercises=qualitative("structure",15,"structuring",["Build a first-principles issue tree.","Repair an overlapping structure.","Compare two structures and prioritize a branch."]);
export const exhibitExercises=qualitative("exhibit",10,"exhibit-interpretation",["Orient, identify the pattern, and state its implication.","Separate signal from distracting data."]);
export const brainstormExercises=qualitative("brainstorm",10,"brainstorming",["Generate three structured options and prioritize one.","Develop operational and commercial ideas."]);
export const synthesisExercises=qualitative("synthesis",10,"synthesis",["State finding, implication, updated hypothesis, and next step.","Deliver a 60-second recommendation with risk and next step."]);
export const exerciseCatalog=[...mentalMathExercises,...quantSetupExercises,...structureExercises,...exhibitExercises,...brainstormExercises,...synthesisExercises];
