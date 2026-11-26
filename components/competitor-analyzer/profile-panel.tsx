import type { ProfileResults } from './api';
import { SourceLink } from './ui';
export function ProfilePanel({results}:{results?:ProfileResults}) {
  if(!results || results.version === 'general-v1') return null;
  return <details className="rounded-xl border border-[#E6EBF4] bg-white p-4 normal-case">
    <summary className="cursor-pointer text-sm font-semibold text-[#111C3A]">Detailed capability checks ({results.sites.length} websites)</summary>
    <p className="mt-3 text-sm font-medium">{results.label}</p>
    <p className="mt-1 text-xs text-slate-500">Observed capabilities · {results.version}. These scores are separate from the website comparison. Page claims do not verify completed registrations or conversions.</p>
    <div className="mt-3 grid gap-3 md:grid-cols-2">{results.sites.map(site=><article key={site.domain} className="rounded-lg border border-slate-200 p-3">
      <h3 className="text-sm font-semibold">{site.domain} <span className="text-blue-700">{site.observedCapabilityScore ?? '—'}/100</span></h3>
      <p className="text-xs text-slate-500">Crawl coverage: {site.coverage}</p>
      <ul className="mt-2 space-y-2">{site.rules.map(rule=><li key={rule.key} className="text-xs"><span className="font-medium">{rule.label}</span>: {rule.state === 'present' ? `Observed · ${rule.confidence} confidence` : 'Not observed'}
        {rule.evidence.length?<details className="mt-1"><summary className="cursor-pointer text-blue-700">View sources</summary>{rule.evidence.map(source=><div key={source.url} className="mt-1 text-slate-500"><SourceLink url={source.url}/><p>“{source.snippet}”</p></div>)}</details>:null}
      </li>)}</ul>
      {site.journeys?.map(journey=><details key={journey.key} className="mt-3 rounded border border-slate-200 p-2 text-xs">
        <summary className="cursor-pointer font-medium">{journey.label}: {journey.state === 'observed_form'?'Form observed':journey.state==='entry_page_only'?'Entry page observed':'Not observed'}</summary>
        <p className="mt-1 text-slate-500">Form submission and later steps were not tested.</p>
        {journey.pages.map(page=><div key={page.url} className="mt-2 space-y-1"><SourceLink url={page.url}/>
          <p>{page.forms} forms · {page.fields} form fields · {page.requiredFields} required · {page.labelledFields} with associated labels</p>
          <p>{page.https?'HTTPS':'HTTP'} · CAPTCHA: {page.captchaObserved?'observed':'not observed'} · Privacy notice: {page.privacyNoticeObserved?'observed':'not observed'} · {page.method}</p>
          {page.externalFormDestination?<p className="text-amber-700">A form declares a destination on another origin; its submission was not tested.</p>:null}
        </div>)}
      </details>)}
    </article>)}</div>
  </details>;
}
