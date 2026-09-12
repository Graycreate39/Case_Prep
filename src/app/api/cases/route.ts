import { NextResponse } from "next/server";
import { caseModeSchema,createCaseSession,projectPublicCase } from "@/lib/case-engine";
import { saveCaseSession } from "@/lib/case-session-store";
import { cases } from "@/lib/seed";
import { z } from "zod";
import { assertMutationRequest,attachIdentity,requestIdentity } from "@/lib/request-security";

export const dynamic="force-dynamic";
const startSchema=z.object({caseId:z.string(),mode:caseModeSchema});
export async function GET(request:Request){const identity=requestIdentity(request);return attachIdentity(NextResponse.json({cases:cases.map(({id,version,title,industry,difficulty,targetMinutes,objective,poolRole})=>poolRole==="READINESS_HOLDOUT"?{id,version,title:"Unseen readiness assessment",industry:"Industry hidden",difficulty,targetMinutes,objective:"Complete an unseen, unassisted simulation.",poolRole}:{id,version,title,industry,difficulty,targetMinutes,objective,poolRole})}),identity)}
export async function POST(request:Request){
 try{assertMutationRequest(request);const identity=requestIdentity(request),input=startSchema.parse(await request.json()),spec=cases.find(c=>c.id===input.caseId);if(!spec)return attachIdentity(NextResponse.json({error:"Case not found"},{status:404}),identity);if((spec.poolRole==="READINESS_HOLDOUT")!==(input.mode==="readiness"))return attachIdentity(NextResponse.json({error:"Case pool is not available in this mode"},{status:403}),identity);const session=saveCaseSession(identity.id,createCaseSession(spec,input.mode));return attachIdentity(NextResponse.json({view:projectPublicCase(session)},{status:201}),identity)}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
