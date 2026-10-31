import type { ReactNode } from 'react';
import { AnalyzerRoot } from '@/components/competitor-analyzer/root';
export default function Layout({children}:{children:ReactNode}) { return <AnalyzerRoot>{children}</AnalyzerRoot>; }
