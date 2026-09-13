import type { CaseSpec, Runtime } from "./domain";
export type InterviewReply={text:string;modelRunId?:string;degraded:boolean};
export interface InterviewTransport { reply(input:{message:string;runtime:Runtime;safeContext:Pick<CaseSpec,"id"|"version"|"objective"|"clientFacts"|"unavailable">}):Promise<InterviewReply> }
export class TextInterviewTransport implements InterviewTransport {
 async reply({message,runtime,safeContext}:Parameters<InterviewTransport["reply"]>[0]){
  const lower=message.toLowerCase();
  const unavailable=safeContext.unavailable.find(x=>lower.includes(x.toLowerCase().split(" ")[0]));
  if(unavailable)return {text:"That information is unavailable. Please continue with the evidence provided.",degraded:false};
  const fact=safeContext.clientFacts.find(x=>runtime.revealed.includes(x.id)&&lower.split(/\W+/).some(word=>word.length>4&&x.text.toLowerCase().includes(word)));
  return {text:fact?.text??"Please explain how that would help answer the client’s objective.",degraded:false};
 }
}
export class VoiceInterviewTransport implements InterviewTransport {
 constructor(private readonly fallback:InterviewTransport=new TextInterviewTransport()){}
 async reply(input:Parameters<InterviewTransport["reply"]>[0]){const reply=await this.fallback.reply(input);return {...reply,degraded:true,text:`${reply.text} Voice is unavailable; continuing in text mode.`};}
}
