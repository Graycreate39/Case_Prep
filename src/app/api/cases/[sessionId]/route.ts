import { NextResponse } from "next/server";
import { applyCaseAction,caseActionSchema,evaluateCompletedCase,projectPublicCase } from "@/lib/case-engine";
import { readCaseSession,saveCaseSession } from "@/lib/case-session-store";

export async function PATCH(request:Request,{params}:{params:Promise<{sessionId:string}>}){
 try{const {sessionId}=await params,current=readCaseSession(sessionId);if(!current)return NextResponse.json({error:"Session not found"},{status:404});const next=saveCaseSession(applyCaseAction(current,caseActionSchema.parse(await request.json())));const view=projectPublicCase(next);return NextResponse.json({view,evaluation:view.complete?evaluateCompletedCase(next):null})}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
