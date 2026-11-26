export interface BusinessFinding {id:string;label:string;quote:string;url:string;observedAt:string;kind:'fact'|'website_claim'|'ai_interpretation';confidence:'high'|'medium'|'low';method:string}
export interface BusinessSection {id:string;title:string;sites:{domain:string;status:'observed'|'not_observed'|'inaccessible';findings:BusinessFinding[];metrics:Record<string,unknown>;warnings:string[]}[]}
export interface BusinessIntelligence {version:string;profileId:string;observedAt:string;summary:string;sections:BusinessSection[];
 swot:{strengths:BusinessFinding[];weaknesses:string[];opportunities:string[];threats:string[]};
 roadmap:{priority:'high'|'medium'|'low';action:string;reason:string;kind:'interpretation'|'ai_interpretation';evidence:BusinessFinding[]}[];
 changes:{domain:string;section:string;message:string;added:string[];notObserved:string[]}[];methodology:{rule:string;scoringVersion:string;businessProfileVersion:string;budget:unknown;traffic:null;revenue:null;leads:null;conversionRate:null}}
