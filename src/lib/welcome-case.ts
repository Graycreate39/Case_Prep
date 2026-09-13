import type { SkillId } from "./domain";

export const northstarTruth = {
  weekdayTransactions: 600,
  weekendTransactions: 350,
  weekdays: 5,
  weekendDays: 2,
  weeks: 52,
  averageTicket: 8,
  variableCostRate: 0.35,
  fixedCosts: 650_000,
  profitTarget: 200_000,
  weeklyTransactions: 3_700,
  annualTransactions: 192_400,
  annualRevenue: 1_539_200,
  variableCosts: 538_720,
  contribution: 1_000_480,
  operatingProfit: 350_480,
  targetSurplus: 150_480,
} as const;

export const welcomeStageLabels = [
  "The Client Question", "Clarify the Objective", "Structure the Problem", "Prioritize",
  "Set Up the Analysis", "Calculate", "Read the Exhibit", "Synthesize", "Recommend",
  "Debrief + Enter Story Mode",
] as const;

export type WelcomeSignal = { skillId: SkillId; quality: 0 | 1 | 2; hinted?: boolean };
export type WelcomeCaseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
export type WelcomeCaseState = {
  status: WelcomeCaseStatus;
  stage: number;
  step: number;
  phase: "QUESTION" | "FEEDBACK";
  draft: string;
  answers: Record<string, string>;
  attempts: Record<string, number>;
  signals: WelcomeSignal[];
  startedAt?: string;
  completedAt?: string;
};

export const initialWelcomeCase = (): WelcomeCaseState => ({
  status: "NOT_STARTED", stage: 0, step: 0, phase: "QUESTION", draft: "", answers: {}, attempts: {}, signals: [],
});

export function parseNumber(value: string) {
  const normalized = value.toLowerCase().replaceAll(",", "").replaceAll("$", "").replaceAll("k", "000").replaceAll("%", "").trim();
  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

export function isNumericAnswer(value: string, expected: number, tolerance = 0.5) {
  const number = parseNumber(value);
  return number !== null && Math.abs(number - expected) <= tolerance;
}

const has = (text: string, terms: string[]) => terms.some(term => text.toLowerCase().includes(term));
export function assessWelcomeResponse(kind: "clarify" | "priority" | "setup" | "implication" | "observation" | "exhibit-implication" | "synthesis" | "recommendation", text: string): 0 | 1 | 2 {
  const checks: Record<typeof kind, boolean[]> = {
    clarify: [has(text,["success","target","objective","profit"]), has(text,["time","stabil","annual","constraint"])],
    priority: [has(text,["economic","revenue","profit","financial"]), has(text,["target","threshold","viable","first"])],
    setup: [has(text,["week","52","annual transaction"]), has(text,["ticket","revenue"]), has(text,["variable","35%","0.35"]), has(text,["fixed","650"]), has(text,["profit","operating"])],
    implication: [has(text,["350","351"]), has(text,["200","target"]), has(text,["150","above","exceed"]), has(text,["open","proceed","attractive","support"])],
    observation: [has(text,["downtown"]), has(text,["most","highest","390"]), has(text,["350"]), has(text,["close","below","similar","reasonab"])],
    "exhibit-implication": [has(text,["credible","plausible","support","confidence"]), has(text,["comparable","downtown","benchmark"])],
    synthesis: [has(text,["350","profit"]), has(text,["200","target","above"]), has(text,["open","support","proceed"]), has(text,["office","traffic","occupancy","risk","validate"])],
    recommendation: [has(text,["open","proceed","yes"]), has(text,["350","150","target","profit"]), has(text,["office","traffic","occupancy","risk"]), has(text,["validate","stress","foot traffic","lease"])],
  };
  const count = checks[kind].filter(Boolean).length;
  return count >= Math.max(2, checks[kind].length - 1) ? 2 : count ? 1 : 0;
}

export function welcomeObservations(signals: WelcomeSignal[]) {
  const observations: { label: string; text: string }[] = [];
  if (signals.some(x => ["quant-interpretation","recommendation"].includes(x.skillId) && x.quality === 2)) observations.push({label:"Strong start",text:"You connected evidence to Northstar's decision rather than stopping at the numbers."});
  if (signals.some(x => x.skillId === "quant-setup" && (x.quality < 2 || x.hinted))) observations.push({label:"We'll build this",text:"Your quantitative setup needed support before the equation was complete."});
  if (signals.some(x => ["problem-definition","structuring"].includes(x.skillId) && x.quality < 2)) observations.push({label:"Coming next",text:"Story Mode will strengthen how you define and structure client problems."});
  if (!observations.length) observations.push({label:"Early signal",text:"This guided case is only a starting point. Story Mode will gather stronger evidence through independent practice."});
  return observations.slice(0, 3);
}
