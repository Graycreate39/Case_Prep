"use client";
import {useEffect,useRef,useState} from "react";
import {Mic,Pause,Square} from "lucide-react";

export function VerbalPractice(){const [recording,setRecording]=useState(false),[seconds,setSeconds]=useState(0),[url,setUrl]=useState<string>();const recorder=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]);
 useEffect(()=>{if(!recording)return;const timer=setInterval(()=>setSeconds(x=>x+1),1000);return()=>clearInterval(timer)},[recording]);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url]);
 async function start(){if(!navigator.mediaDevices||typeof MediaRecorder==="undefined")return;const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks.current=[];const next=new MediaRecorder(stream);next.ondataavailable=e=>chunks.current.push(e.data);next.onstop=()=>{setUrl(old=>{if(old)URL.revokeObjectURL(old);return URL.createObjectURL(new Blob(chunks.current,{type:next.mimeType}))});stream.getTracks().forEach(track=>track.stop())};next.start();recorder.current=next;setSeconds(0);setRecording(true)}
 function stop(){recorder.current?.stop();setRecording(false)}
 return <section className="verbal"><div><strong><Mic size={16}/> Answer aloud</strong><p>Optional local recording. Audio stays in this tab and is never uploaded.</p></div><div className="verbal-actions">{recording?<button onClick={stop}><Square size={15}/> Stop · {seconds}s</button>:<button onClick={()=>void start()}><Mic size={15}/> Record response</button>}{url?<audio controls src={url} aria-label="Playback of your local response"/>:null}</div><small><Pause size={13}/> Take 30 seconds to prepare, then target a concise 60-second answer. Enter a written summary below for deterministic feedback.</small></section>
}
