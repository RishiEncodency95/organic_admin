"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import PreviewServiceView from "./PreviewServiceView";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, ChevronDown, ChevronRight, Eye, FileImage,
  Grid2X2, Image as ImageIcon, Italic, Link2, List, ListOrdered, Plus, Quote,
  Redo2, Save, Send, Strikethrough, Trash2, Underline, Undo2, Upload, X,
} from "lucide-react";

const fieldClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11.5px] font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

function Section({ number, title, note, children, className = "" }: { number: number; title: string; note: string; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.025)] ${className}`}><div className="mb-4"><h2 className="text-[14px] font-semibold text-slate-950">{number}. {title}</h2><p className="mt-1 text-[11.5px] text-slate-500">{note}</p></div>{children}</section>;
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10.5px] font-semibold text-slate-800">{label}{required && <span className="ml-1 text-red-500">*</span>}</span>{children}{hint && <small className="mt-1.5 block text-[9.5px] text-slate-500">{hint}</small>}</label>;
}

export default function AddServiceView() {
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [features, setFeatures] = useState(["", "", ""]);
  const [benefit, setBenefit] = useState("");
  const [benefits, setBenefits] = useState(["Compassionate Support", "Dignity & Respect", "Hassle-free Arrangements"]);
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const chooseImage = (file?: File) => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    setImage((old) => { if (old) URL.revokeObjectURL(old); return next; });
  };
  const updateTitle = (value: string) => { setTitle(value.slice(0, 150)); setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); };
  const addBenefit = () => { if (benefit.trim()) { setBenefits((old) => [...old, benefit.trim()]); setBenefit(""); } };

  if (showPreview) {
    return <PreviewServiceView />;
  }

  return (
    <div style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} className="min-h-screen bg-[#F8FAF9] px-4 pb-8 pt-3 text-slate-800 antialiased sm:px-5 [&_section_h2]:!text-[14px] [&_section_label>span]:!text-[11.5px] [&_section_input]:!text-[12.5px] [&_section_textarea]:!text-[12.5px] [&_section_select]:!text-[12px] [&_section_small]:!text-[10.5px] [&_section_button]:!text-[11px]">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-[23px] font-semibold leading-none tracking-[-.03em] text-[#123E2D]">Add New Service</h1><div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500"><span>Dashboard</span><ChevronRight size={10} /><Link href="/services">Services Management</Link><ChevronRight size={10} /><span className="text-slate-700">Add New Service</span></div></div>
          <div className="flex gap-2"><Link href="/services" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10.5px] font-semibold text-slate-700">← Back to Services</Link><button type="button" onClick={() => setShowPreview(true)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-50"><Eye size={14} /> Preview Service</button><button className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#075D3D] px-4 text-[10.5px] font-semibold text-white shadow-sm"><Save size={14} /> Save as Draft</button></div>
        </header>

        <div className="mt-2 grid items-start gap-1.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,1fr)]">
          <Section number={1} title="Service Information" note="Provide the basic details of the service.">
            <div className="space-y-3.5">
              <Field label="Service Title" required><div className="relative"><input value={title} onChange={(e) => updateTitle(e.target.value)} placeholder="Enter service title" className={`${fieldClass} pr-16`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9.5px] text-slate-500">{title.length}/150</span></div></Field>
              <Field label="Service Slug (URL)" required hint="Use lowercase letters, numbers and hyphens only."><div className="flex"><span className="flex h-10 shrink-0 items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-[10.5px] text-slate-500">https://mokshasewa.org/services/</span><input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="enter-service-slug" className={`${fieldClass} rounded-l-none`} /></div></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Service Category" required><select className={fieldClass} defaultValue=""><option value="" disabled>Select Category</option><option>Transport</option><option>Cremation</option><option>Rituals</option><option>Support</option></select></Field><Field label="Service Icon (Optional)"><div className="flex"><select className={`${fieldClass} rounded-r-none border-r-0`}><option>Select an icon</option><option>Transport</option><option>Flame</option><option>Lotus</option><option>Heart</option></select><button className="grid h-10 w-11 place-items-center rounded-r-lg border border-slate-200 bg-white"><Grid2X2 size={14} /></button></div></Field></div>
              <Field label="Short Description (For Cards/Listing)" required hint="This will be displayed in service cards and listings."><div className="relative"><textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value.slice(0, 200))} rows={3} placeholder="Write a short summary of this service..." className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11.5px] outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="absolute bottom-2 right-3 text-[9.5px] text-slate-500">{shortDescription.length}/200</span></div></Field>
              <Field label="Detailed Description" required><div className="overflow-hidden rounded-lg border border-slate-200"><div className="flex min-h-9 flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2"><select className="mr-2 h-7 border-0 bg-transparent text-[10px] font-semibold outline-none"><option>Paragraph</option></select>{[Bold, Italic, Underline, Strikethrough, Quote, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, ImageIcon, Undo2, Redo2].map((Icon, index) => <button key={index} type="button" className="grid size-7 place-items-center rounded hover:bg-white"><Icon size={13} /></button>)}</div><textarea rows={5} placeholder="Write detailed description of the service..." className="w-full resize-none border-0 px-3 py-3 text-[11.5px] outline-none" /><div className="border-t border-slate-100 px-3 py-1.5 text-[9px] text-slate-500">Word count: 0</div></div></Field>
              <Field label="Key Benefits (Bullet Points)"><div className="flex gap-2"><input value={benefit} onChange={(e) => setBenefit(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }} placeholder="Add benefit and press Enter" className={fieldClass} /><button onClick={addBenefit} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[10.5px] font-semibold"><Plus size={13} /> Add</button></div><div className="mt-2 flex flex-wrap gap-2">{benefits.map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9.5px] font-semibold">{item}<button onClick={() => setBenefits((old) => old.filter((x) => x !== item))}><X size={11} /></button></span>)}</div></Field>
            </div>
          </Section>

          <div className="space-y-1 [&>section]:!p-3 [&>section>div:first-child]:!mb-2.5">
            <Section number={2} title="Service Image" note="Upload a representative image for this service.">
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseImage(e.dataTransfer.files[0]); }} className="grid min-h-[228px] place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
                {image ? <div className="relative h-[205px] w-full"><img src={image} alt="Service preview" className="h-full w-full object-cover" /><button onClick={() => setImage(null)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white shadow"><X size={14} /></button></div> : <div><FileImage size={42} className="mx-auto text-[#075D3D]" /><p className="mt-3 text-[11.5px] font-semibold">Drag &amp; drop image here</p><p className="my-1 text-[10px] text-slate-500">or</p><button onClick={() => fileRef.current?.click()} className="rounded-lg bg-[#075D3D] px-4 py-2 text-[10.5px] font-semibold text-white">Browse Files</button><p className="mt-3 text-[9px] leading-4 text-slate-500">Recommended size: 1200 × 675 px (JPG, PNG, WebP)<br />Max file size: 2 MB</p></div>}
                <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => chooseImage(e.target.files?.[0])} />
              </div>
            </Section>
            <Section number={3} title="Service Features" note="Highlight the key features of this service."><div className="space-y-2">{features.map((feature, index) => <div key={index} className="flex items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">✓</span><input value={feature} onChange={(e) => setFeatures((old) => old.map((x, i) => i === index ? e.target.value : x))} placeholder="Enter feature" className={fieldClass} /><button onClick={() => setFeatures((old) => old.filter((_, i) => i !== index))} className="grid size-9 shrink-0 place-items-center text-red-500"><Trash2 size={14} /></button></div>)}<button onClick={() => setFeatures((old) => [...old, ""])} className="mx-auto flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-[10px] font-semibold"><Plus size={13} /> Add More Features</button></div></Section>
            <Section number={4} title="Display Settings" note="Control how this service appears on the website."><div className="grid gap-3 sm:grid-cols-2"><Field label="Status" required><select className={fieldClass}><option>Draft</option><option>Published</option><option>Inactive</option></select></Field><Field label="Display on Website" required><select className={fieldClass}><option>Yes</option><option>No</option></select></Field><Field label="Display Order" hint="Lower numbers appear first."><input type="number" defaultValue={0} className={fieldClass} /></Field></div></Section>
          </div>
        </div>

        <Section number={5} title="SEO Settings (Optional)" note="Improve how this service appears in search results." className="mt-1.5"><div className="grid gap-3 md:grid-cols-3"><Field label="Meta Title"><div className="relative"><input placeholder="Enter meta title" className={`${fieldClass} pr-12`} /><span className="absolute right-3 top-3 text-[9px] text-slate-400">0/60</span></div></Field><Field label="Meta Description"><div className="relative"><input placeholder="Enter meta description" className={`${fieldClass} pr-12`} /><span className="absolute right-3 top-3 text-[9px] text-slate-400">0/160</span></div></Field><Field label="Focus Keyword"><input placeholder="Enter focus keyword" className={fieldClass} /></Field></div></Section>
      </div>

      <footer className="mx-auto mt-1.5 max-w-[1440px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,.035)]"><div className="flex items-center justify-between gap-3"><Link href="/services" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-5 text-[10.5px] font-semibold"><X size={14} /> Cancel</Link><div className="flex gap-2"><button type="button" onClick={() => setShowPreview(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[10.5px] font-semibold hover:bg-slate-50 transition-colors"><Eye size={14} /> Preview Service</button><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075D3D] px-5 text-[10.5px] font-semibold text-white"><Send size={14} /> Publish Service <ChevronDown size={13} /></button></div></div></footer>
    </div>
  );
}
