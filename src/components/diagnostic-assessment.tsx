"use client";
import {useState} from "react";
import {Check,Clock3} from "lucide-react";
import type {Attempt} from "@/lib/domain";
import {SkillLab} from "./skill-lab";

const tasks=[
 {id:"math-margin-4",label:"Arithmetic",why:"Separate calculation accuracy from setup quality."},
 {id:"setup-4",label:"Quantitative setup",why:"Check whether you define the equation and units before calculating."},
 {id:"structure-4",label:"Structuring",why:"Check decision-led decomposition without beginner scaffolding."},
 {id:"exhibit-4",label:"Exhibit interpretation",why:"Check whether you move from observation to implication."},
 {id:"synthesis-4",label:"Synthesis",why:"Check whether findings change the hypothesis and next step."},
] as const;
export function DiagnosticAssessment({onAttempt,onComplete}:{onAttempt:(attempt:Attempt)=>void;onComplete:()=>void}){
 const [index,setIndex]=useState(-1),[results,setResults]=useState<boolean[]>([]);
 if(index!==-1){const task=tasks[index];return <SkillLab exerciseId={task.id} onAttempt={onAttempt} onFinished={correct=>{const next=[...results,correct];setResults(next);if(index===tasks.length-1)onComplete();else setIndex(index+1)}}/>}
 return <main className="diagnostic-intro"><section><p className="kicker">8–15 minute placement check</p><h1>Start with demonstrated evidence.</h1><p>This compact diagnostic samples five different skills. It places your starting guidance and identifies calibration needs; one response never grants mastery or skips a chapter gate.</p><div className="diagnostic-list">{tasks.map(task=><div key={task.id}><Check size={16}/><span><strong>{task.label}</strong><small>{task.why}</small></span></div>)}</div><button className="primary" onClick={()=>setIndex(0)}><Clock3 size={16}/>Begin diagnostic</button></section></main>
}
