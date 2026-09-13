import {describe,expect,it} from "vitest";
import {applyDiagnostic,initialLearner,loadLearner} from "./learner";
describe("performance diagnostic placement",()=>{
 it("requires demonstrated tasks after self-report onboarding",()=>{const state=applyDiagnostic(initialLearner(),"Alex",30,{experience:"experienced",mathComfort:5,structureComfort:5});expect(state.onboarded).toBe(true);expect(state.diagnosticComplete).toBe(false);expect(state.skills.every(skill=>skill.observations===0)).toBe(true)});
 it("migrates earlier profiles into the placement check without fabricating evidence",()=>{const legacy={...initialLearner(),version:5,diagnosticComplete:undefined};const loaded=loadLearner(JSON.stringify(legacy)).state;expect(loaded.diagnosticComplete).toBe(false);expect(loaded.skills.every(skill=>skill.observations===0)).toBe(true)});
});
