import { SharedReportPage } from '@/components/competitor-analyzer/shared-report-page';
import { AnalyzerRoot } from '@/components/competitor-analyzer/root';
export default async function Page({params}:{params:Promise<{token:string}>}) { const {token}=await params; return <AnalyzerRoot shared><SharedReportPage token={token}/></AnalyzerRoot>; }
