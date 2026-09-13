import {describe,expect,it} from "vitest";
import {applyDiagnostic,initialLearner,loadLearner} from "./learner";
describe("first-run placement",()=>{
 it("keeps self-report separate from evidence and starts the welcome case",()=>{const state=applyDiagnostic(initialLearner(),"Alex",30,{experience:"experienced",mathComfort:5,structureComfort:5});expect(state.onboarded).toBe(true);expect(state.welcomeCase.status).toBe("NOT_STARTED");expect(state.skills.every(skill=>skill.observations===0)).toBe(true)});
 it("migrates a fresh earlier profile into the welcome case without fabricated evidence",()=>{const legacy={...initialLearner(),version:5,welcomeCase:undefined,diagnosticComplete:undefined};const loaded=loadLearner(JSON.stringify(legacy)).state;expect(loaded.welcomeCase.status).toBe("NOT_STARTED");expect(loaded.skills.every(skill=>skill.observations===0)).toBe(true)});
});
