import { NextResponse } from "next/server";
import { applyCaseAction,caseActionSchema,evaluateCompletedCase,projectPublicCase } from "@/lib/case-engine";
import { readCaseSession,saveCaseSession } from "@/lib/case-session-store";
import { assertMutationRequest,attachIdentity,requestIdentity } from "@/lib/request-security";

export async function PATCH(request:Request,{params}:{params:Promise<{sessionId:string}>}){
 try{assertMutationRequest(request);const identity=requestIdentity(request),{sessionId}=await params,current=readCaseSession(identity.id,sessionId);if(!current)return attachIdentity(NextResponse.json({error:"Session not found"},{status:404}),identity);const next=saveCaseSession(identity.id,applyCaseAction(current,caseActionSchema.parse(await request.json())));const view=projectPublicCase(next);return attachIdentity(NextResponse.json({view,evaluation:view.complete?evaluateCompletedCase(next):null}),identity)}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
