import { NextResponse } from "next/server";
import { caseModeSchema,createCaseSession,projectPublicCase } from "@/lib/case-engine";
import { saveCaseSession } from "@/lib/case-session-store";
import { cases } from "@/lib/seed";
import { z } from "zod";

export const dynamic="force-dynamic";
const startSchema=z.object({caseId:z.string(),mode:caseModeSchema});
export async function GET(){return NextResponse.json({cases:cases.map(({id,version,title,industry,difficulty,targetMinutes,objective})=>({id,version,title,industry,difficulty,targetMinutes,objective}))})}
export async function POST(request:Request){
 try{const input=startSchema.parse(await request.json()),spec=cases.find(c=>c.id===input.caseId);if(!spec)return NextResponse.json({error:"Case not found"},{status:404});const session=saveCaseSession(createCaseSession(spec,input.mode));return NextResponse.json({view:projectPublicCase(session)},{status:201})}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Invalid request"},{status:400})}
}
