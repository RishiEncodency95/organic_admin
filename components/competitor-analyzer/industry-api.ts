"use client";
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/components/infrastructure/lib/client';
export type ProfileId='general-v1'|'expo-v1'|'expo-organic-v1';
export interface CrawlBudget {maxPagesPerSite:number;maxPagesPerRun:number;concurrency:number;maxHttpRequests:number}
export interface IndustrySettings {primaryWebsite:string;defaultProfile:ProfileId;domainProfiles:Record<string,ProfileId>;crawlBudget:CrawlBudget}
export const PROFILE_OPTIONS:{id:ProfileId;label:string}[]=[{id:'general-v1',label:'General website'},{id:'expo-v1',label:'Exhibition and trade event'},{id:'expo-organic-v1',label:'Expo & Organic Industry Intelligence'}];
export const industryApi={
 get:()=>apiClient.request<IndustrySettings>({method:'GET',path:'/competitor-analyzer/industry-settings'}),
 save:({primaryWebsite,defaultProfile,domainProfiles,crawlBudget}:IndustrySettings)=>apiClient.request<IndustrySettings>({method:'PATCH',path:'/competitor-analyzer/industry-settings',body:{primaryWebsite,defaultProfile,domainProfiles,crawlBudget}}),
 retry:(id:string)=>apiClient.request({method:'POST',path:`/competitor-analyzer/discovery/${encodeURIComponent(id)}/retry`,body:{}}),
 stop:(id:string)=>apiClient.request({method:'POST',path:`/competitor-analyzer/discovery/${encodeURIComponent(id)}/stop`,body:{}}),
};
export const useIndustrySettings=()=>useQuery({queryKey:['analyzer-industry-settings'],queryFn:industryApi.get,staleTime:60_000,retry:false});
export function useSaveIndustrySettings(){const cache=useQueryClient();return useMutation({mutationFn:industryApi.save,onSuccess:()=>cache.invalidateQueries({queryKey:['analyzer-industry-settings']})});}
