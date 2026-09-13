import {describe,expect,it} from "vitest";
import {mentalMathExercises,quantSetupExercises,structureExercises} from "./catalog";
import {evaluateExercise} from "./exercise-engine";
describe("exercise evaluator",()=>{
 it("grades deterministic numeric answers and identifies arithmetic execution",()=>{const e=mentalMathExercises[0];expect(evaluateExercise(e,String(e.answer)).correct).toBe(true);expect(evaluateExercise(e,"22").errorTags).toContain("ARITHMETIC");expect(evaluateExercise(e,"not a number").errorTags).toContain("PROCESS")});
 it("distinguishes setup and unit errors from arithmetic",()=>{const result=evaluateExercise(quantSetupExercises[0],"I would use the available figures.");expect(result.errorTags).toContain("SETUP");expect(result.errorTags).toContain("UNIT");expect(result.errorTags).not.toContain("ARITHMETIC")});
 it("uses transparent qualitative signals",()=>{const e=structureExercises[0],weak=evaluateExercise(e,"Customers and costs.");expect(weak.score).toBeLessThan(4);expect(weak.errorTags).toContain("PRIORITIZATION");const strong=evaluateExercise(e,"First, I would assess customer demand by segment and willingness to pay. Second, I would test unit economics through price, variable cost, and acquisition cost. Third, I would evaluate competitive response and our delivery capabilities. I would prioritize customer demand because it determines whether the opportunity exists; therefore, the client should validate that branch before investing.");expect(strong.score).toBeGreaterThanOrEqual(4);expect(strong.evidence).toContain("Priority stated")});
});
