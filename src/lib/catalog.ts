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
  workedSolution?: string;
  minimumWords?: number;
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

const setupScenarios=[
 "A meal-kit service has $480k annual fixed costs, earns $12 contribution per order, and can fulfill 52,000 orders. Define the break-even-order equation, identify the relevant inputs, and state the result unit. Do not calculate yet.",
 "A regional airline is evaluating a route with 42,000 annual passengers, a $180 average fare, $95 variable cost per passenger, and $2.4m annual fixed cost. Define the annual-profit equation and units before calculating.",
 "A subscription product earns $30 monthly contribution per customer, retains customers for 20 months, and spends $240 to acquire one. Define the customer-lifetime-value equation, its inputs, and units.",
 "A clinic expects 1,800 visits per day. Current capacity is 1,500 visits, and a proposed shift adds 500. Define the capacity-sufficiency calculation and units, then explain what result would show sufficient capacity.",
 "A retailer raised price from $20 to $22 and weekly volume fell from 10,000 to 9,200 units. Define the price-elasticity equation, including which percentage changes belong in the numerator and denominator."
];
export const quantSetupExercises: Exercise[] = Array.from({ length: 15 }, (_, i) => ({
  id:`setup-${i+1}`, kind:"quant-setup", skill:"quant-setup", difficulty:(1+Math.floor(i/3) as 1|2|3|4|5), guidance:(i<3?3:i<9?2:1),
  prompt:setupScenarios[i%setupScenarios.length],
  answer:["Fixed costs ÷ contribution per order","Passengers × (fare − variable cost) − fixed cost","Monthly contribution × retained months − acquisition cost","Forecast demand compared with current capacity plus added capacity","% change in volume ÷ % change in price"][i%5],
  rationale:"Name the decision quantity, select only relevant inputs, write the equation, and carry units. Calculation comes afterward.",workedSolution:["Break-even orders = $480,000 fixed costs ÷ $12 contribution per order; dollars cancel to orders.","Annual route profit = 42,000 passengers × ($180 fare − $95 variable cost per passenger) − $2.4m fixed cost; result in dollars per year.","Customer lifetime value = $30 monthly contribution × 20 retained months − $240 acquisition cost; result in dollars per customer.","Total capacity = 1,500 + 500 = 2,000 visits/day; capacity gap = 2,000 − 1,800 = 200 visits/day, so the proposed shift is sufficient.","Price elasticity = percentage change in weekly volume ÷ percentage change in price; report the ratio and interpret the negative direction."][i%5],minimumWords:12,...metadata(i,15,contexts[i%contexts.length],"setup → execution → interpretation","quant-setup")
}));

const structurePrompts=[
 "A subscription software company has rising revenue but falling cash flow. Structure an analysis to identify the cause and recommend a response. Name the branch you would test first and why.",
 "A regional airline must choose between adding flight frequency and using a larger aircraft on one constrained route. Build a decision-led structure and prioritize the first analysis.",
 "A specialty retailer is considering a smaller-format store in commuter stations. Structure whether it should pilot the concept, including demand, economics, and feasibility.",
 "A clinic network wants to reduce patient wait times without adding clinicians. Build a tailored structure and identify the highest-value first branch.",
 "A parcel operator expects demand to exceed sorting capacity next year. Structure the options and tests needed to decide whether to add a night shift."
];
const exhibitPrompts=[
 "An exhibit shows software retention: Enterprise 94%→93%, Mid-market 90%→88%, SMB 88%→78%. Orient to the data, identify the most decision-relevant pattern, and explain its implication and next analysis.",
 "An airline exhibit shows route load factor rising 72%→89% while on-time performance falls 91%→76%. Explain the important relationship, what it may imply, and what you would test next.",
 "A retailer exhibit shows visits +12%, conversion 31%→24%, and average basket unchanged at $46. Distinguish observation from implication and connect the result to the growth objective.",
 "A clinic exhibit shows morning demand at 55% of visits but only 38% of staff hours; afternoons have 15% of visits and 28% of staff hours. Identify the operational signal and decision implication.",
 "A parcel exhibit shows daily demand of 18k today, 23k forecast, 19k current capacity, and 25k capacity with a new shift. State what matters, calculate the gap if useful, and explain the investment implication."
];
const brainstormPrompts=[
 "A software company needs to reduce SMB churn without broad discounting. Generate distinct categories of action, give specific ideas in each, and prioritize one with a commercial rationale.",
 "A regional airline wants to improve a route's economics without abandoning it. Generate revenue and cost options, note tradeoffs, and prioritize the first action to test.",
 "A specialty retailer wants profitable commuter-station growth. Generate customer, format, partnership, and operating ideas, then prioritize one based on impact and feasibility.",
 "A clinic network must reduce waits without adding clinicians. Generate demand-shaping and capacity-management options, state assumptions, and prioritize one.",
 "A parcel operator needs peak capacity for eight weeks per year. Generate flexible and permanent options, compare tradeoffs, and recommend what to test first."
];
const synthesisPrompts=[
 "Software revenue grew 18%, but SMB retention fell from 88% to 78%; enterprise retention stayed stable. Synthesize the finding, implication, updated hypothesis, and next step.",
 "An airline route has 54 unmet passengers daily, but adding frequency costs more than using a larger aircraft. Give an interim synthesis that states what is known, the remaining risk, and next analysis.",
 "A new store format has strong foot traffic but 24% conversion versus 31% in existing stores. Give a recommendation supported by evidence, a caveat, and a practical next step.",
 "Clinic mornings contain 55% of visits but 38% of staffing; afternoons contain 15% of visits and 28% of staffing. Provide a concise synthesis and update the operating hypothesis.",
 "Forecast parcel demand exceeds capacity by 4,000 per day, and a proposed shift adds 6,000 capacity at positive contribution. Recommend a decision with evidence, risk, and next step."
];
const structureSolutions=["Start with the cash-flow bridge: revenue growth by segment, gross margin, operating costs, and working capital. Prioritize the largest recent cash deterioration, then test customer economics and corrective options.","Structure the decision around customer schedule value, demand by departure, economics of each option, and operating constraints. Prioritize demand by time slot because it determines whether frequency creates value beyond seats.","Test commuter demand and mission, store-level economics, operating feasibility, and cannibalization. Prioritize demand and conversion in a low-cost pilot.","Separate arrival-pattern mismatch, process time, scheduling, and staffing allocation. Prioritize hourly demand versus clinician capacity because the constraint may be allocation rather than total labor.","Assess demand timing, current bottlenecks, temporary versus permanent capacity options, economics, and service risk. Prioritize the forecast capacity gap and its duration."];
const exhibitSolutions=["SMB retention deteriorated ten points while other segments were broadly stable. The problem is concentrated, so prioritize SMB churn drivers rather than company-wide acquisition.","Higher load factor coincides with materially worse punctuality. Capacity pressure may be damaging service; test whether delays are concentrated on full flights before adding more demand.","Traffic rose, but lower conversion erased part of the benefit while basket size stayed flat. Investigate customer mix and in-store conversion rather than relying on traffic growth alone.","Staffing is misaligned with arrivals: mornings are understaffed relative to demand and afternoons overstaffed. Reallocate shifts before adding labor.","Forecast demand exceeds current capacity by 4,000 parcels/day, while the shift creates 2,000 parcels/day of buffer. The shift solves capacity, subject to positive economics and execution risk."];
const brainstormSolutions=["Organize actions around product value, onboarding and adoption, service recovery, and contract design. Prioritize diagnosing the SMB churn trigger before offering targeted retention interventions.","Consider pricing and ancillary revenue, aircraft and schedule choices, distribution, and operating productivity. Prioritize the option that improves contribution while preserving schedule value.","Generate format and assortment, commuter convenience, partnerships, pricing, and operating-model options. Prioritize a limited station pilot with measurable conversion and contribution targets.","Use appointment smoothing, triage, process redesign, flexible scheduling, and staffing reallocation. Prioritize reallocating existing capacity toward peak arrival windows.","Compare overtime, temporary labor, third-party capacity, flexible shifts, automation, and permanent expansion. Prioritize reversible seasonal capacity before fixed investment."];
const synthesisSolutions=["Finding: growth masks a concentrated ten-point SMB retention decline. Implication: future growth and cash quality are at risk. Hypothesis: SMB churn is the core issue. Next: isolate churn by cohort and cause.","The route needs 54 seats, and a larger aircraft is currently cheaper than added frequency. Favor the larger aircraft provisionally; test whether customers place enough value on schedule frequency to overturn the economics.","Do not scale yet: traffic is strong, but conversion trails existing stores by seven points. The key risk is format-market fit; run a targeted pilot to diagnose conversion and confirm contribution.","Waits appear driven by a staffing-time mismatch, not necessarily insufficient total labor. Reallocate afternoon capacity to mornings and test the impact before adding staff.","Add the night shift provisionally: it covers the 4,000-parcel gap and leaves buffer with positive contribution. Validate demand durability and implementation risk in a staged pilot."];
function qualitative(kind:ExerciseKind,count:number,skill:SkillId,prompts:string[],solutions:string[]):Exercise[]{return Array.from({length:count},(_,i)=>({
  id:`${kind}-${i+1}`,kind,skill,difficulty:(1+Math.floor(i/(count/5)) as 1|2|3|4|5),guidance:(i<2?3:i<count/2?2:1),prompt:prompts[i%prompts.length],
  answer:"Evaluated with the behaviorally anchored rubric and evidence references.",
  rationale:"A strong response is tailored to the stated client decision, logically organized, explicit about implications, and clear about what to prioritize next.",workedSolution:solutions[i%solutions.length],minimumWords:kind==="brainstorm"||kind==="structure"?30:20,...metadata(i,count,contexts[i%contexts.length],kind==="structure"?"decision-led decomposition":kind==="exhibit"?"finding → implication":kind==="brainstorm"?"structured creativity":"finding → implication → next step",kind)
}))}
export const structureExercises=qualitative("structure",15,"structuring",structurePrompts,structureSolutions);
export const exhibitExercises=qualitative("exhibit",10,"exhibit-interpretation",exhibitPrompts,exhibitSolutions);
export const brainstormExercises=qualitative("brainstorm",10,"brainstorming",brainstormPrompts,brainstormSolutions);
export const synthesisExercises=qualitative("synthesis",10,"synthesis",synthesisPrompts,synthesisSolutions);
export const exerciseCatalog=[...mentalMathExercises,...quantSetupExercises,...structureExercises,...exhibitExercises,...brainstormExercises,...synthesisExercises];
