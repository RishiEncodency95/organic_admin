import Image from "next/image";
import { ArrowUpRight, BookOpen, CheckCheck, Globe2, ScanSearch } from "lucide-react";

const steps = [
  { icon: Globe2, title: "Read websites", detail: "Public services, pricing and contact pages." },
  { icon: ScanSearch, title: "Check the evidence", detail: "Save the page and the exact supporting quote." },
  { icon: CheckCheck, title: "Compare fairly", detail: "See strengths, gaps and shared services." },
  { icon: ArrowUpRight, title: "Choose an action", detail: "Review priorities, improve, then re-check." },
];

export function AnalyzerIntro({ aiReady }: { aiReady: boolean }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#dce5de] bg-[#f6f5ef]">
      <div className="grid items-center md:grid-cols-[1fr_1.05fr]">
        <div className="p-5 md:p-6">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#557565]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Moksha Voyage / Research workspace</p>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[#183e30] lg:text-[30px]">Know the landscape.<br />Improve with evidence.</h1>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-[#68776e]">Compare your website with the right competitors. Every useful difference starts with a page you can actually verify.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#37624d]">
            <span className="rounded-full border border-[#d8e1d9] bg-white/70 px-2.5 py-1.5">3 competitors by default</span>
            <span className="rounded-full border border-[#d8e1d9] bg-white/70 px-2.5 py-1.5">Up to 4 in one study</span>
            <span className={`rounded-full px-2.5 py-1.5 ${aiReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{aiReady ? "AI research ready" : "Measured analysis available"}</span>
          </div>
        </div>
        <figure className="min-w-0 px-3 pb-2 md:p-3">
          <Image src="/images/competitor-analyzer/evidence-workflow.png" alt="Illustration of four stages: reading websites, verifying page quotes, comparing websites and preparing an action checklist" width={2172} height={724} sizes="(max-width: 768px) 100vw, 50vw" className="h-auto w-full mix-blend-multiply" preload />
          <figcaption className="mt-1 text-center text-[9px] uppercase tracking-widest text-[#829083]">The process, illustrated · your reports use real page evidence</figcaption>
        </figure>
      </div>
      <div className="grid gap-1 border-t border-[#e2e6dc] bg-white/55 p-1 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, i) => <div key={step.title} className="flex items-start gap-2 rounded-xl p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dce5db] bg-[#f4f6ef] text-[#53705c]"><step.icon size={15} /></span><div><p className="text-xs font-semibold text-[#294b38]"><span className="mr-1 text-[#8b9b8b]">0{i + 1}</span>{step.title}</p><p className="mt-0.5 text-[10px] leading-relaxed text-[#7a857c]">{step.detail}</p></div></div>)}
      </div>
    </section>
  );
}

export function ChartReadingGuide() {
  return (
    <details className="group overflow-hidden rounded-2xl border border-[#e1e7e3] bg-[#f7f7f1]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-xs font-semibold text-[#32543f]"><span className="flex items-center gap-2"><BookOpen size={15} /> A quick guide to reading this report</span><span className="text-lg font-normal text-slate-400 group-open:rotate-45">+</span></summary>
      <div className="grid gap-1 border-t border-[#e3e7dc] p-1 md:grid-cols-[220px_1fr]">
        <Image src="/images/competitor-analyzer/chart-reading-guide.png" alt="Illustration of a radar chart, comparison bars and a verified source document" width={1536} height={1024} sizes="220px" className="h-36 w-full rounded-xl object-contain mix-blend-multiply" />
        <div className="grid content-center gap-1 p-3 sm:grid-cols-3">
          {[['01 / Compare the shape', 'The radar shows website strengths by area. A missing score means insufficient evidence, not zero.'], ['02 / Read the difference', 'Bars compare the same metric on a 0–100 scale. Colours always follow the same website.'], ['03 / Open the proof', 'Head-to-head quotes link to their source pages. A higher website score is not proof of better real-world service.']].map(([title, detail]) => <div key={title} className="rounded-xl bg-white/70 p-3"><p className="mb-1 text-xs font-semibold text-[#31533d]">{title}</p><p className="text-[11px] leading-relaxed text-slate-500">{detail}</p></div>)}
        </div>
      </div>
    </details>
  );
}
