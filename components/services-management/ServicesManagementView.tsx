"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Amphora, ArrowDownToLine, Box, ChevronLeft, ChevronRight, Eye, FileText, Filter, Flame,
  Flower2, Grid2X2, HeartHandshake, MoreVertical, PackageOpen, Pencil, Plus, RefreshCw,
  Search, SlidersHorizontal, Tag, Truck, UsersRound, X,
} from "lucide-react";

type Service = {
  id: number; name: string; description: string; category: "Transport" | "Cremation" | "Rituals" | "Support";
  status: "Published" | "Draft"; views: number; requests: number; image: string;
  serviceIcon: typeof Truck; iconTone: string;
};

const SERVICES: Service[] = [
  { id: 1, name: "Final Journey & Transport", description: "Dignified transportation for last journey with care and respect.", category: "Transport", status: "Published", views: 856, requests: 312, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165188/moksha-sewa/assets/how-we-help/one.png", serviceIcon: Truck, iconTone: "bg-emerald-50 text-emerald-600" },
  { id: 2, name: "Cremation & Last Rites", description: "Complete cremation arrangements with essential items.", category: "Cremation", status: "Published", views: 1024, requests: 428, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165198/moksha-sewa/assets/how-we-help/two.png", serviceIcon: Flame, iconTone: "bg-orange-50 text-orange-500" },
  { id: 3, name: "Ritual & Priest Support", description: "Pandit ji and all required rituals as per tradition.", category: "Rituals", status: "Published", views: 642, requests: 198, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165189/moksha-sewa/assets/how-we-help/pandit.png", serviceIcon: Flower2, iconTone: "bg-violet-50 text-violet-600" },
  { id: 4, name: "Family & On-Ground Support", description: "Emotional support and on-ground assistance to families.", category: "Support", status: "Published", views: 726, requests: 218, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165195/moksha-sewa/assets/how-we-help/three.png", serviceIcon: HeartHandshake, iconTone: "bg-emerald-50 text-emerald-600" },
  { id: 5, name: "Asthi Collection & Visarjan", description: "Asthi collection and holy immersion with proper guidance.", category: "Rituals", status: "Published", views: 312, requests: 96, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164996/moksha-sewa/assets/about-optimized/cremation-ritual.webp", serviceIcon: Amphora, iconTone: "bg-indigo-50 text-indigo-600" },
  { id: 6, name: "Documentation Support", description: "Help with necessary documents and formalities.", category: "Support", status: "Draft", views: 156, requests: 32, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp", serviceIcon: FileText, iconTone: "bg-slate-100 text-slate-600" },
  { id: 7, name: "Sewa Essentials", description: "Providing essential items required during last rites.", category: "Support", status: "Published", views: 201, requests: 48, image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165018/moksha-sewa/assets/about-optimized/samagri.webp", serviceIcon: Box, iconTone: "bg-slate-100 text-emerald-700" },
];

const categoryTone = { Transport: "bg-blue-50 text-blue-600", Cremation: "bg-orange-50 text-orange-600", Rituals: "bg-violet-50 text-violet-600", Support: "bg-emerald-50 text-emerald-600" };

function MetricCard({ icon: Icon, tone, surface, valueTone, label, value, note }: { icon: typeof Grid2X2; tone: string; surface: string; valueTone: string; label: string; value: string; note: string }) {
  return (
    <div className={`relative flex h-[56px] min-w-0 items-center gap-[10px] overflow-hidden rounded-[7px] border px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)] ${surface}`}>
      <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-white/80 ring-1 ring-inset ring-black/5 ${tone}`}>
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
        <p className="break-words text-[9px] font-semibold leading-[11px] text-slate-800">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className={`text-[17px] font-semibold leading-none tracking-[-.03em] ${valueTone}`}>{value}</span>
          <span className={`truncate text-[8.5px] font-semibold leading-none ${note.startsWith("↑") ? "text-emerald-700" : "text-[#536987]"}`}>{note}</span>
        </div>
      </div>
    </div>
  );
}

export default function ServicesManagementView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [category, setCategory] = useState("All Categories");
  const rows = useMemo(() => SERVICES.filter((service) => {
    const matchesQuery = `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "All Status" || service.status === status) && (category === "All Categories" || service.category === category);
  }), [query, status, category]);

  const clear = () => { setQuery(""); setStatus("All Status"); setCategory("All Categories"); };
  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} className="min-h-screen bg-[#F8FAF9] px-4 pb-8 pt-3 text-slate-800 antialiased sm:px-5">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-[22px] font-semibold leading-none tracking-[-.03em] text-[#123E2D]">Services Management</h1><div className="mt-2 flex items-center gap-1.5 text-[9.5px] font-semibold text-slate-500"><span>Dashboard</span><ChevronRight size={10} /><span className="text-slate-700">Services Management</span></div></div>
          <Link href="/services/new" className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#075D3D] px-4 text-[11px] font-semibold text-white shadow-sm hover:bg-[#064B32]"><Plus size={14} /> Add New Service</Link>
        </div>

        <div className="mt-2 grid w-full items-stretch gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard icon={Grid2X2} tone="text-emerald-700" surface="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/55" valueTone="text-emerald-800" label="Total Services" value="12" note="Published: 10" />
          <MetricCard icon={Pencil} tone="text-blue-600" surface="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100/60" valueTone="text-blue-800" label="Active Services" value="10" note="Visible on Website" />
          <MetricCard icon={Eye} tone="text-amber-600" surface="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100/70" valueTone="text-amber-800" label="Total Views" value="3,248" note="↑ 18.6% this month" />
          <MetricCard icon={PackageOpen} tone="text-violet-600" surface="border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-100/65" valueTone="text-violet-800" label="Total Requests" value="1,156" note="↑ 24.3% this month" />
          <MetricCard icon={UsersRound} tone="text-orange-600" surface="border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100/70" valueTone="text-orange-800" label="Inactive Services" value="2" note="Hidden from Website" />
        </div>

        <div className="mt-1.5 grid gap-1.5 text-[11px] xl:grid-cols-[minmax(0,1fr)_280px] [&_input]:!text-[11.5px] [&_select]:!text-[11.5px] [&_button]:!text-[10.5px] [&_thead]:!text-[9.5px] [&_tbody]:!text-[10.5px] [&_tbody_p]:!text-[10.5px] [&_aside_h2]:!text-[11.5px] [&_aside_p]:!text-[10px]">
          <div className="min-w-0 overflow-hidden">
            <div className="mb-1.5 grid items-center gap-1.5 sm:grid-cols-[minmax(230px,1fr)_130px_145px_auto_auto]">
              <label className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services by name or keyword..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-[11px] outline-none focus:border-emerald-500" />{query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>}</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[10.5px] font-semibold outline-none"><option>All Status</option><option>Published</option><option>Draft</option></select>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-[10.5px] font-semibold outline-none"><option>All Categories</option>{Object.keys(categoryTone).map((item) => <option key={item}>{item}</option>)}</select>
              <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-[10.5px] font-semibold text-emerald-700"><Filter size={14} /> More Filters</button>
              <button onClick={clear} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10.5px] font-semibold"><RefreshCw size={13} /> Clear</button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead><tr className="h-10 border-b border-slate-200 bg-slate-50/80 text-[8.5px] font-semibold uppercase tracking-[.06em] text-slate-500"><th className="w-10 px-3 text-center"><input type="checkbox" /></th><th className="px-2">Service</th><th className="px-2">Category</th><th className="px-2 text-center">Icon</th><th className="px-2">Status</th><th className="px-2 text-center">Views</th><th className="px-2 text-center">Requests</th><th className="px-2 text-center">Order</th><th className="px-3 text-center">Actions</th></tr></thead>
                  <tbody>{rows.map((service) => { const Icon = service.serviceIcon; return <tr key={service.id} className="h-[64px] border-b border-slate-100 align-middle last:border-0 hover:bg-slate-50/60"><td className="px-3 text-center"><input type="checkbox" /></td><td className="px-2"><div className="flex min-w-[235px] items-center gap-2.5"><img src={service.image} alt="" className="h-10 w-[54px] rounded-md border border-slate-200 object-cover" /><div><p className="text-[10px] font-semibold leading-tight text-slate-900">{service.name}</p><p className="mt-1 max-w-[205px] text-[8.5px] leading-[1.35] text-slate-500">{service.description}</p></div></div></td><td className="px-2"><span className={`inline-flex rounded-md px-2 py-1 text-[8.5px] font-semibold ${categoryTone[service.category]}`}>{service.category}</span></td><td className="px-2 text-center"><span className={`mx-auto grid size-8 place-items-center rounded-full ${service.iconTone}`}><Icon size={14} strokeWidth={1.8} /></span></td><td className="px-2"><span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[8.5px] font-semibold ${service.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}><span className={`size-1.5 rounded-full ${service.status === "Published" ? "bg-emerald-500" : "bg-slate-400"}`} />{service.status}</span></td><td className="px-2 text-center text-[9.5px] font-semibold tabular-nums">{service.views.toLocaleString()}</td><td className="px-2 text-center text-[9.5px] font-semibold tabular-nums">{service.requests}</td><td className="px-2 text-center text-[9.5px] font-semibold tabular-nums">{service.id}</td><td className="px-3"><div className="flex items-center justify-center gap-1.5"><button className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white"><Pencil size={11} /></button><Link href="/services/preview" title="Preview Service" className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50"><Eye size={11} /></Link><button className="grid size-7 place-items-center rounded-md border border-slate-200 bg-white"><MoreVertical size={11} /></button></div></td></tr>; })}</tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[9.5px] text-slate-500"><span>Showing 1 to {rows.length} of 12 services</span><div className="flex items-center gap-1.5"><button className="grid size-8 place-items-center rounded-md border border-slate-200"><ChevronLeft size={13} /></button><button className="grid size-8 place-items-center rounded-md bg-[#075D3D] font-semibold text-white">1</button><button className="grid size-8 place-items-center rounded-md border border-slate-200 font-semibold">2</button><button className="grid size-8 place-items-center rounded-md border border-slate-200"><ChevronRight size={13} /></button></div><select className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[9.5px] font-semibold"><option>10 / page</option></select></div>
            </div>
          </div>

          <aside className="space-y-1.5">
            <section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-[11px] font-semibold text-slate-900">Service Overview</h2><div className="mt-4 flex items-center gap-5"><div className="grid size-24 shrink-0 place-items-center rounded-full" style={{ background: "conic-gradient(#087345 0 83.3%, #f59e0b 83.3% 100%)" }}><div className="grid size-[68px] place-items-center rounded-full bg-white text-center"><div><span className="block text-lg text-slate-950">12</span><span className="text-[8px] text-slate-500">Total Services</span></div></div></div><div className="min-w-0 flex-1 space-y-3 text-[9px]"><p className="flex items-center justify-between gap-2"><span><i className="mr-2 inline-block size-2 rounded-full bg-emerald-600" />Published (10)</span><span>83.3%</span></p><p className="flex items-center justify-between"><span><i className="mr-2 inline-block size-2 rounded-full bg-amber-500" />Draft (2)</span><span>16.7%</span></p><p className="flex items-center justify-between"><span><i className="mr-2 inline-block size-2 rounded-full bg-slate-300" />Inactive (0)</span><span>0%</span></p></div></div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-3"><h2 className="mb-2 text-[10.5px] font-semibold">Quick Actions</h2><div className="space-y-1.5">{[[Plus,"Add New Service"],[Tag,"Manage Categories"],[ArrowDownToLine,"Service Order"],[SlidersHorizontal,"Bulk Actions"]].map(([ItemIcon,label]) => { const ActionIcon=ItemIcon as typeof Plus; return <button key={label as string} className="flex h-8 w-full items-center gap-2 rounded-md border border-slate-200 px-3 text-[9.5px] font-semibold"><ActionIcon size={12} />{label as string}</button>; })}</div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-3"><h2 className="mb-2 text-[10.5px] font-semibold">Top Performing Services</h2>{SERVICES.slice().sort((a,b)=>b.views-a.views).slice(0,3).map((item,index)=><div key={item.id} className="flex items-center gap-2 py-1.5 text-[9px]"><span className="text-[13px]">{index+1}</span><span className="min-w-0 flex-1 truncate font-semibold">{item.name}</span><Eye size={10} className="text-slate-400"/><span>{item.views.toLocaleString()} views</span></div>)}</section>
            <section className="relative min-h-[92px] overflow-hidden rounded-xl bg-[#075D3D] px-4 py-3 text-white"><p className="max-w-[180px] text-[10.5px] font-semibold leading-4">Add more services to help more families in need.</p><button className="mt-2 rounded-md bg-white px-3 py-1.5 text-[9px] font-semibold text-[#075D3D]">Add New Service →</button><HeartHandshake className="absolute -bottom-3 right-2 text-emerald-300/30" size={62} /></section>
          </aside>
        </div>
      </div>
    </div>
  );
}
