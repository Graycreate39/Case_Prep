import {describe,expect,it} from "vitest";
import {GET,POST} from "../app/api/cases/route";

describe("case API isolation",()=>{
 it("lists only public case metadata",async()=>{const response=await GET(),body=await response.json();expect(body.cases.length).toBeGreaterThanOrEqual(8);expect(body.cases[0]).not.toHaveProperty("hiddenFacts");expect(body.cases[0]).not.toHaveProperty("calculations")});
 it("never returns the frozen answer key when starting a case",async()=>{const response=await POST(new Request("http://local/api/cases",{method:"POST",body:JSON.stringify({caseId:"northline",mode:"strict"})}));const text=await response.text();expect(response.status).toBe(201);expect(text).not.toContain("2160000");expect(text).not.toContain("Incremental contribution")});
 it("validates mode and case identity",async()=>{const badMode=await POST(new Request("http://local/api/cases",{method:"POST",body:JSON.stringify({caseId:"northline",mode:"easy"})}));expect(badMode.status).toBe(400);const missing=await POST(new Request("http://local/api/cases",{method:"POST",body:JSON.stringify({caseId:"missing",mode:"practice"})}));expect(missing.status).toBe(404)});
});
