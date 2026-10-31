import { CompetitorStudyPage } from '@/components/competitor-analyzer/study-page';
export default async function Page({params}:{params:Promise<{studyId:string}>}) { const {studyId}=await params; return <CompetitorStudyPage id={studyId}/>; }
