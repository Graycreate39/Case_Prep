export type BehavioralStoryInput={context:string;objective:string;actions:string;result:string;learning:string};
export type BehavioralDiagnostic={score:1|2|3|4|5;ownershipRatio:number;hasQuantifiedImpact:boolean;flags:string[];improvement:string};
export function diagnoseBehavioralStory(story:BehavioralStoryInput):BehavioralDiagnostic{
 const words=`${story.context} ${story.objective} ${story.actions} ${story.result} ${story.learning}`.trim().split(/\s+/).filter(Boolean),first=(story.actions.match(/\b(I|my|me)\b/gi)??[]).length,collective=(story.actions.match(/\b(we|our|us)\b/gi)??[]).length;
 const ownershipRatio=first+collective?first/(first+collective):0,hasQuantifiedImpact=/\b\d+(?:[.,]\d+)?\s*(?:%|percent|hours?|days?|weeks?|months?|years?|\$|people|customers?|points?)?\b/i.test(story.result);
 const flags=[...(ownershipRatio<.55?["ownership-unclear"]:[]),...(!hasQuantifiedImpact?["impact-not-quantified"]:[]),...(words.length<60?["insufficient-specificity"]:[]),...(!story.learning.trim()?["learning-missing"]:[])];
 const score=Math.max(1,Math.min(5,5-flags.length)) as 1|2|3|4|5,improvement=flags[0]==="ownership-unclear"?"Replace collective language with the specific decisions and actions you personally owned.":flags[0]==="impact-not-quantified"?"Add a measurable result or a concrete observable outcome.":flags[0]==="insufficient-specificity"?"Add the pivotal action, obstacle, and stakeholder response.":flags[0]==="learning-missing"?"Explain what you learned and how your behavior changed.":"Test the story against a challenging follow-up question.";
 return {score,ownershipRatio,hasQuantifiedImpact,flags,improvement};
}
