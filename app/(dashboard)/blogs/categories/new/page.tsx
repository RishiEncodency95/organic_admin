"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight,
  Edit3, Eye, ExternalLink, FileText, FolderClosed, Headphones, Heart,
  Image as ImageIcon, Import, Lightbulb, Link2, List, Mail, Maximize2,
  Monitor, PackageOpen, Phone, Plus, Search, Send, Settings, Share2,
  Tag, Trash2, Upload, UsersRound, X,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;
type Visibility = "Published" | "Hidden";

type FormState = {
  name: string;
  slug: string;
  parentCategory: string;
  shortDescription: string;
  description: string;
  displayInNavigation: boolean;
  menuLabel: string;
  parentMenuPosition: string;
  order: string;
  featured: boolean;
  color: string;
  visibility: Visibility;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  schemaEnabled: boolean;
  socialTitle: string;
  socialDescription: string;
};

const steps = [
  { step: 1, title: "Category Details", subtitle: "Basic information" },
  { step: 2, title: "Display & Settings", subtitle: "How it will appear" },
  { step: 3, title: "SEO Settings", subtitle: "Search optimization" },
  { step: 4, title: "Review & Save", subtitle: "Confirm and publish" },
] as const;

const recent = [
  ["Moksha Sewa Stories", "moksha-sewa-stories", "Awareness", "Published", "31 May 2026"],
  ["Community Support", "community-support", "Awareness", "Published", "28 May 2026"],
  ["Rituals & Traditions", "rituals-traditions", "Guidance", "Published", "25 May 2026"],
  ["Volunteer Stories", "volunteer-stories", "-", "Published", "20 May 2026"],
  ["News & Updates", "news-updates", "-", "Hidden", "18 May 2026"],
];

function FieldLabel({ children, required, optional }: { children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label className="mb-[6px] block text-[9px] font-semibold text-[#192A65]">
      {children}{required ? <span className="ml-[2px] text-[#df3e3e]">*</span> : null}
      {optional ? <span className="font-semibold text-[#6c7890]"> (Optional)</span> : null}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`relative h-[24px] w-[42px] rounded-full transition ${checked ? "bg-[#087342]" : "bg-[#d7dde6]"}`}>
      <span className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition ${checked ? "left-[20px]" : "left-[2px]"}`} />
    </button>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[9px] border border-[#e6e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,.025)] ${className}`}>
      <h3 className="text-[13.5px] font-semibold text-[#17234a]">{title}</h3>
      <div className="mt-[12px]">{children}</div>
    </section>
  );
}

function Header({ step }: { step: Step }) {
  const router = useRouter();
  return (
    <>
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#075b33]">Add New Category</h1>
            <nav className="mt-[9px] flex items-center gap-[8px] text-[11.5px] font-semibold text-[#1d2b58]">
              <Link href="/" className="hover:text-[#075b33]">Dashboard</Link>
              <span className="text-[#7b8597]">›</span>
              <Link href="/blogs/categories" className="hover:text-[#075b33]">Categories</Link>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33] font-semibold">Add New Category</span>
              {step === 5 ? <><span className="text-[#7b8597]">›</span><span>Success</span></> : null}
            </nav>
          </div>
          <button onClick={() => router.push("/blogs/categories")} className="inline-flex h-[36px] items-center gap-[8px] rounded-[6px] border border-[#dce3ea] bg-white px-[14px] text-[11px] font-semibold text-[#24345e] hover:bg-slate-50 transition">
            <ArrowLeft className="h-[14px] w-[14px]" />Back to Categories
          </button>
        </div>
      </header>

      {step !== 5 ? (
        <section className="mt-[16px] rounded-[9px] border border-[#e6e9ec] bg-white px-[18px] py-[14px]">
          <div className="grid grid-cols-4 gap-[12px]">
            {steps.map((item, i) => {
              const done = step > item.step;
              const active = step === item.step;
              return (
                <div key={item.step} className="flex items-center">
                  <div className="flex min-w-0 items-center gap-[10px]">
                    <div className={`grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full text-[11.5px] font-semibold ${done || active ? "bg-[#075b33] text-white" : "bg-[#eef1f6] text-[#34425e]"}`}>
                      {done ? <Check className="h-[15px] w-[15px]" /> : item.step}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate text-[11.5px] font-semibold ${active ? "text-[#075b33]" : "text-[#1d2b58]"}`}>{item.title}</p>
                      <p className="mt-[3px] truncate text-[9.5px] font-semibold text-[#65728b]">{item.subtitle}</p>
                    </div>
                  </div>
                  {i < 3 ? <span className="mx-[12px] h-px flex-1 bg-[#dce1e7]" /> : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}

function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[8px]">
      <span className="mt-[1px] grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full bg-[#0b6a3b] text-white"><Check className="h-[10px] w-[10px]" /></span>
      <span className="text-[10px] font-semibold leading-[1.45] text-[#53617c]">{children}</span>
    </div>
  );
}

function HelpCard({ blue = false }: { blue?: boolean }) {
  return (
    <section className={`rounded-[9px] border px-[18px] py-[16px] ${blue ? "border-[#dce8f6] bg-[#f7faff]" : "border-[#f0e5c8] bg-[#fffaf0]"}`}>
      <div className="flex items-start gap-[12px]">
        <Headphones className={`h-[24px] w-[24px] shrink-0 ${blue ? "text-[#1d65dc]" : "text-[#9a651c]"}`} />
        <div>
          <h3 className={`text-[13px] font-semibold ${blue ? "text-[#1d3d89]" : "text-[#78501c]"}`}>Need Help?</h3>
          <p className="mt-[5px] text-[10px] font-semibold text-[#53617c]">For any assistance, contact our team.</p>
          <div className="mt-[12px] space-y-[9px]">
            <div className="flex items-center gap-[9px]"><Phone className="h-[14px] w-[14px] text-[#147044]" /><span className="text-[11px] font-semibold text-[#087342]">+91 98765 43210</span></div>
            <div className="flex items-center gap-[9px]"><Mail className="h-[14px] w-[14px] text-[#147044]" /><span className="text-[10.5px] font-semibold text-[#1f3270]">support@mokshasewa.org</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ name, description, published }: { name: string; description: string; published: boolean }) {
  return (
    <Card title="Category Preview">
      <div className="flex items-center gap-[14px]">
        <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-[#eef7f1] text-[#075b33]"><FolderClosed className="h-[30px] w-[30px]" /></div>
        <div>
          <p className="text-[11px] font-semibold text-[#18264a]">{name || "Category Name"}</p>
          <p className="mt-[5px] text-[9px] font-semibold text-[#68758d]">{description || "Short description will appear here."}</p>
          <span className={`mt-[8px] inline-flex rounded-[4px] px-[8px] py-[3px] text-[9px] font-semibold ${published ? "bg-emerald-100 text-emerald-700" : "bg-[#eef1f5] text-[#58657c]"}`}>{published ? "Published" : "Draft"}</span>
        </div>
      </div>
    </Card>
  );
}

function QuickActions({ second = false }: { second?: boolean }) {
  const items = second
    ? [["View All Categories", UsersRound], ["Manage Menus", Settings], ["Category Order", Import], ["Help & Support", PackageOpen]]
    : [["View All Categories", UsersRound], ["Category Order", Settings], ["Import Categories", Import], ["Export Categories", PackageOpen]];
  return (
    <Card title="Quick Actions">
      <div className="divide-y divide-[#edf0f2]">
        {items.map(([label, Icon]) => {
          const I = Icon as typeof UsersRound; return (
            <button key={String(label)} className="flex h-[38px] w-full items-center justify-between">
              <span className="flex items-center gap-[10px]"><I className="h-[14px] w-[14px] text-[#294d88]" /><span className="text-[9px] font-semibold text-[#34425e]">{String(label)}</span></span>
              <ChevronRight className="h-[13px] w-[13px] text-[#294d88]" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function AddNewCategoryWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    name: "", slug: "", parentCategory: "", shortDescription: "", description: "",
    displayInNavigation: true, menuLabel: "", parentMenuPosition: "", order: "0",
    featured: false, color: "#0B7A4B", visibility: "Published", seoTitle: "",
    seoDescription: "", seoKeywords: "", canonicalUrl: "https://www.mokshasewa.org/category/",
    schemaEnabled: true, socialTitle: "", socialDescription: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(v => ({ ...v, [key]: value }));
  const next = () => setStep(v => Math.min(5, v + 1) as Step);
  const back = () => setStep(v => Math.max(1, v - 1) as Step);

  const finalName = form.name || "Moksha Sewa Stories";
  const finalSlug = form.slug || "moksha-sewa-stories";
  const finalParent = form.parentCategory || "Awareness";
  const finalShort = form.shortDescription || "Real stories of dignity, compassion and humanity from our sewa journey.";
  const finalDescription = form.description || "This section shares inspiring stories, real experiences and meaningful moments from Moksha Sewa — highlighting the impact of community support, volunteers and partners in ensuring a dignified final journey for every individual.";
  const finalSeoTitle = form.seoTitle || "Moksha Sewa Stories | Real Stories of Dignity & Humanity";
  const finalSeoDescription = form.seoDescription || "Read inspiring stories from Moksha Sewa — real experiences of compassion, dignity and support for unclaimed and underprivileged individuals.";
  const finalKeywords = form.seoKeywords || "moksha sewa stories, real stories, dignity, final journey, cremation support, humanity, volunteers";

  return (
    <main style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[16px] py-[12px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <Header step={step} />

      {step === 1 && (
        <>
          <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_315px]">
            <section className="overflow-hidden rounded-[9px] border border-[#e6e9ec] bg-white">
              <div className="flex min-h-[72px] items-center gap-[12px] bg-[linear-gradient(90deg,#eef7f1,#f8fbf8)] px-[18px]">
                <div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#dff1e5] text-[#087342]"><FolderClosed className="h-[24px] w-[24px]" /></div>
                <div><h2 className="text-[14px] font-semibold text-[#175b37]">1. Category Details</h2><p className="mt-[4px] text-[9.5px] font-semibold text-[#52617a]">Provide basic information about the new category.</p></div>
              </div>
              <div className="p-[18px]">
                <div className="grid grid-cols-2 gap-x-[22px] gap-y-[16px]">
                  <div><FieldLabel required>Category Name</FieldLabel><input value={form.name} onChange={e => update("name", e.target.value.slice(0, 100))} placeholder="Enter category name" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><p className="mt-[6px] text-right text-[10px] font-semibold text-[#718096]">{form.name.length} / 100</p></div>
                  <div><FieldLabel>Parent Category</FieldLabel><select value={form.parentCategory} onChange={e => update("parentCategory", e.target.value)} className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold text-[#42506b] outline-none"><option value="">Select Parent Category</option><option>Awareness</option><option>Guidance</option><option>Moksha Sewa</option><option>Stories</option></select><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Choose a parent category (if applicable).</p></div>
                  <div><FieldLabel required>Slug (URL Friendly)</FieldLabel><input value={form.slug} onChange={e => update("slug", e.target.value.slice(0, 100))} placeholder="enter-category-slug" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><div className="mt-[6px] flex justify-between"><p className="text-[10px] font-semibold text-[#718096]">Use lowercase letters, numbers and hyphens only.</p><span className="text-[10px] font-semibold text-[#718096]">{form.slug.length} / 100</span></div></div>
                  <div><FieldLabel>Short Description</FieldLabel><textarea value={form.shortDescription} onChange={e => update("shortDescription", e.target.value.slice(0, 160))} placeholder="Enter short description" className="h-[72px] w-full resize-none rounded-[6px] border border-[#dfe4e8] px-[12px] py-[10px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><div className="mt-[6px] flex justify-between"><p className="text-[10px] font-semibold text-[#718096]">A brief description to display with the category.</p><span className="text-[10px] font-semibold text-[#718096]">{form.shortDescription.length} / 160</span></div></div>
                  <div className="col-span-2"><FieldLabel>Category Description</FieldLabel><div className="overflow-hidden rounded-[6px] border border-[#dfe4e8] bg-white"><div className="flex h-[38px] items-center gap-[14px] border-b border-[#e8ebee] px-[12px] text-[#33415d]"><button className="text-[10.5px] font-semibold">Paragraph</button><span>B</span><i>I</i><u>U</u><List className="h-[14px] w-[14px]" /><Link2 className="h-[14px] w-[14px]" /><ImageIcon className="h-[14px] w-[14px]" /><Maximize2 className="h-[14px] w-[14px]" /></div><textarea value={form.description} onChange={e => update("description", e.target.value.slice(0, 2000))} placeholder="Enter detailed description about this category..." className="h-[96px] w-full resize-none px-[12px] py-[10px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><div className="flex h-[24px] items-center justify-end px-[10px] text-[9.5px] font-semibold text-[#718096]">{form.description.length} / 2000</div></div></div>
                  {["Category Icon", "Category Image"].map((label, i) => <div key={label}><FieldLabel optional>{label}</FieldLabel><button className="flex h-[115px] w-full items-center justify-center gap-[16px] rounded-[7px] border border-[#dfe4e8] bg-white">{i === 0 ? <Upload className="h-[34px] w-[34px] text-[#087342]" /> : <ImageIcon className="h-[34px] w-[34px] text-[#087342]" />}<div className="text-left"><p className="text-[11px] font-semibold text-[#43516a]">Drag & drop a {i === 0 ? "icon" : "image"} here or click to upload</p><p className="mt-[4px] text-[10px] font-semibold text-[#718096]">{i === 0 ? "SVG, PNG or JPG" : "JPG, PNG or WEBP"} (Max 2MB)</p><span className="mt-[9px] inline-flex h-[32px] items-center rounded-[5px] border border-[#dfe4e8] px-[12px] text-[10px] font-semibold text-[#26344f]">Choose File</span></div></button></div>)}
                </div>
              </div>
            </section>

            <aside className="space-y-[12px]">
              <section className="rounded-[9px] border border-[#dfe9e2] bg-[#f8fcf9] px-[18px] py-[16px]"><div className="flex items-center gap-[10px]"><Lightbulb className="h-[21px] w-[21px] text-[#d5a31d]" /><h3 className="text-[9px] font-semibold text-[#1b633e]">Tips for Categories</h3></div><div className="mt-[14px] space-y-[10px]"><CheckLine>Use a clear and relevant name.</CheckLine><CheckLine>Organize using parent categories.</CheckLine><CheckLine>Write a short and meaningful description.</CheckLine><CheckLine>Add an icon and image for better visual appeal.</CheckLine><CheckLine>Use SEO-friendly slug (short & keyword-rich).</CheckLine></div></section>
              <PreviewCard name={form.name} description={form.shortDescription} published={false} /><QuickActions /><HelpCard />
            </aside>
          </section>
          <footer className="sticky bottom-0 z-20 mt-[14px] flex min-h-[58px] items-center justify-between border-t border-[#edf0f2] bg-[#fffefb]/95 px-[6px] py-[8px] backdrop-blur-sm"><button onClick={() => router.push("/blogs/categories")} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655] hover:bg-slate-50"><X className="h-[14px] w-[14px]" />Cancel</button><button onClick={next} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[#075b33] px-[22px] text-[10px] font-semibold text-white">Next<ArrowRight className="h-[14px] w-[14px]" /></button></footer>
        </>
      )}

      {step === 2 && (
        <>
          <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_315px]">
            <section className="overflow-hidden rounded-[9px] border border-[#e6e9ec] bg-white">
              <div className="flex min-h-[72px] items-center gap-[12px] bg-[linear-gradient(90deg,#eef7f1,#f8fbf8)] px-[18px]"><div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#dff1e5] text-[#087342]"><Monitor className="h-[24px] w-[24px]" /></div><div><h2 className="text-[14px] font-semibold text-[#175b37]">2. Display & Settings</h2><p className="mt-[4px] text-[10.5px] font-semibold text-[#52617a]">Configure how this category will appear on your website.</p></div></div>
              <div className="grid grid-cols-2 divide-x divide-[#edf0f2] p-[18px]">
                <div className="pr-[22px]">
                  <div className="flex justify-between gap-[14px]"><div><p className="text-[11.5px] font-semibold text-[#24345e]">Display in Navigation Menu</p><p className="mt-[5px] text-[10px] font-semibold text-[#6d7890]">Show this category in the main navigation menu.</p></div><Toggle checked={form.displayInNavigation} onChange={() => update("displayInNavigation", !form.displayInNavigation)} /></div>
                  <div className="mt-[16px]"><FieldLabel optional>Menu Label</FieldLabel><input value={form.menuLabel} onChange={e => update("menuLabel", e.target.value)} placeholder="Enter menu label (leave blank to use category name)" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /></div>
                  <div className="mt-[16px]"><FieldLabel>Parent Menu Position</FieldLabel><select value={form.parentMenuPosition} onChange={e => update("parentMenuPosition", e.target.value)} className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold text-[#526078] outline-none"><option value="">Select position</option><option>Blog & Awareness</option><option>About Us</option><option>Our Services</option></select><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Choose where it should appear in the menu (if applicable).</p></div>
                  <div className="my-[18px] h-px bg-[#edf0f2]" />
                  <FieldLabel>Category Order</FieldLabel><input value={form.order} onChange={e => update("order", e.target.value)} className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none" /><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Lower numbers appear first in the menu and category listing.</p>
                  <div className="my-[18px] h-px bg-[#edf0f2]" />
                  <FieldLabel>Category Visibility</FieldLabel><div className="space-y-[12px]">{(["Published", "Hidden"] as Visibility[]).map(v => <button key={v} onClick={() => update("visibility", v)} className="flex w-full items-start gap-[10px] text-left"><span className={`mt-[1px] h-[17px] w-[17px] rounded-full border ${form.visibility === v ? "border-[#087342] shadow-[inset_0_0_0_4px_#087342]" : "border-[#cbd3dd]"}`} /><div><p className="text-[11px] font-semibold text-[#24345e]">{v}</p><p className="mt-[3px] text-[10px] font-semibold text-[#6d7890]">{v === "Published" ? "Visible on the website." : "Not visible on the website (can be used later)."}</p></div></button>)}</div>
                </div>
                <div className="pl-[22px]">
                  <div className="flex justify-between gap-[14px]"><div><p className="text-[11.5px] font-semibold text-[#24345e]">Featured Category</p><p className="mt-[5px] text-[10px] font-semibold leading-[1.5] text-[#6d7890]">Mark as featured to highlight this category on the website (e.g. homepage, blog section).</p></div><Toggle checked={form.featured} onChange={() => update("featured", !form.featured)} /></div>
                  <div className="mt-[18px]"><FieldLabel optional>Category Color</FieldLabel><div className="flex h-[40px] items-center rounded-[6px] border border-[#dfe4e8]"><input type="color" value={form.color} onChange={e => update("color", e.target.value.toUpperCase())} className="h-full w-[62px] border-0 bg-transparent p-[4px]" /><span className="px-[12px] text-[11px] font-semibold text-[#4b5870]">{form.color}</span></div><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Used for category labels, badges and UI elements.</p></div>
                  <div className="mt-[20px]"><FieldLabel optional>Category Banner/Image</FieldLabel><button className="flex h-[118px] w-full items-center justify-center gap-[16px] rounded-[7px] border border-[#dfe4e8]"><ImageIcon className="h-[36px] w-[36px] text-[#087342]" /><div className="text-left"><p className="text-[11px] font-semibold text-[#43516a]">Drag & drop a banner image here or click to upload</p><p className="mt-[4px] text-[10px] font-semibold text-[#718096]">JPG, PNG or WEBP (Recommended size: 1200x300px)</p><span className="mt-[10px] inline-flex h-[32px] items-center rounded-[5px] border border-[#dfe4e8] px-[12px] text-[10px] font-semibold text-[#26344f]">Choose File</span></div></button><div className="relative mt-[12px] h-[145px] overflow-hidden rounded-[7px] border border-[#dfe4e8] bg-[linear-gradient(180deg,#f6eac5,#cbd7b5)]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,215,117,.75),transparent_30%),linear-gradient(to_top,rgba(38,93,59,.45),transparent_55%)]" /><div className="absolute inset-x-0 top-[48px] text-center text-[24px] font-semibold italic text-[#315f41]">Dignity for Every Life</div><span className="absolute right-[10px] top-[10px] rounded-full bg-white/85 px-[10px] py-[4px] text-[9.5px] font-semibold text-[#3d4b60]">Preview</span></div><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Recommended size: 1200x300px. This will be used on the category archive page.</p></div>
                </div>
              </div>
            </section>
            <aside className="space-y-[12px]"><section className="rounded-[9px] border border-[#dfe9e2] bg-[#f8fcf9] px-[18px] py-[16px]"><div className="flex items-center gap-[10px]"><Lightbulb className="h-[21px] w-[21px] text-[#d5a31d]" /><h3 className="text-[13px] font-semibold text-[#1b633e]">Tips for Display Settings</h3></div><div className="mt-[14px] space-y-[10px]"><CheckLine>Use clear and simple menu labels.</CheckLine><CheckLine>Featured categories get more visibility.</CheckLine><CheckLine>Choose a relevant color and banner.</CheckLine><CheckLine>Set the correct display order.</CheckLine><CheckLine>You can change these settings anytime.</CheckLine></div></section><PreviewCard name={form.name} description={form.shortDescription} published={form.visibility === "Published"} /><QuickActions second /><HelpCard /></aside>
          </section>
          <footer className="sticky bottom-0 z-20 mt-[14px] flex min-h-[58px] items-center justify-between border-t border-[#edf0f2] bg-[#fffefb]/95 px-[6px] py-[8px] backdrop-blur-sm"><button onClick={back} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"><ArrowLeft className="h-[14px] w-[14px]" />Back</button><div className="flex gap-[10px]"><button className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"><FileText className="h-[14px] w-[14px]" />Save as Draft</button><button onClick={next} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[#075b33] px-[22px] text-[10.5px] font-semibold text-white">Next<ArrowRight className="h-[14px] w-[14px]" /></button></div></footer>
        </>
      )}

      {step === 3 && (
        <>
          <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_315px]">
            <section className="overflow-hidden rounded-[9px] border border-[#e6e9ec] bg-white">
              <div className="flex min-h-[72px] items-center gap-[12px] bg-[linear-gradient(90deg,#eef7f1,#f8fbf8)] px-[18px]"><div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#dff1e5] text-[#087342]"><Search className="h-[24px] w-[24px]" /></div><div><h2 className="text-[14px] font-semibold text-[#175b37]">3. SEO Settings</h2><p className="mt-[4px] text-[10.5px] font-semibold text-[#52617a]">Optimize this category for better visibility on search engines.</p></div></div>
              <div className="grid grid-cols-2 divide-x divide-[#edf0f2] p-[18px]">
                <div className="pr-[22px] space-y-[18px]">
                  <div><FieldLabel required>SEO Meta Title</FieldLabel><input value={form.seoTitle} onChange={e => update("seoTitle", e.target.value.slice(0, 60))} placeholder="Enter SEO title for this category" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><div className="mt-[6px] flex justify-between"><span className="text-[10px] font-semibold text-[#718096]">Recommended length: 50–60 characters</span><span className="text-[10px] font-semibold text-[#718096]">{form.seoTitle.length} / 60</span></div></div>
                  <div><FieldLabel required>SEO Meta Description</FieldLabel><textarea value={form.seoDescription} onChange={e => update("seoDescription", e.target.value.slice(0, 160))} placeholder="Enter SEO meta description for this category" className="h-[112px] w-full resize-none rounded-[6px] border border-[#dfe4e8] px-[12px] py-[10px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><div className="mt-[6px] flex justify-between"><span className="text-[10px] font-semibold text-[#718096]">Recommended length: 150–160 characters</span><span className="text-[10px] font-semibold text-[#718096]">{form.seoDescription.length} / 160</span></div></div>
                  <div><FieldLabel optional>SEO Keywords</FieldLabel><input value={form.seoKeywords} onChange={e => update("seoKeywords", e.target.value)} placeholder="Enter keywords separated by commas" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Example: moksha sewa, final journey, rituals, volunteer</p></div>
                  <div><FieldLabel optional>Canonical URL</FieldLabel><input value={form.canonicalUrl} onChange={e => update("canonicalUrl", e.target.value)} className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-[#f1f4f5] px-[12px] text-[11.5px] font-semibold text-[#66738b] outline-none" /><p className="mt-[6px] text-[10px] font-semibold text-[#718096]">Leave blank to use the default URL.</p></div>
                  <div><FieldLabel>Schema Markup</FieldLabel><button onClick={() => update("schemaEnabled", !form.schemaEnabled)} className="flex items-start gap-[10px] text-left"><span className={`mt-[1px] grid h-[16px] w-[16px] place-items-center rounded-[3px] border ${form.schemaEnabled ? "border-[#087342] bg-[#087342] text-white" : "border-[#cbd3dd]"}`}><Check className="h-[10px] w-[10px]" /></span><div><p className="text-[11px] font-semibold text-[#24345e]">Enable structured data (Category Schema)</p><p className="mt-[3px] text-[10px] font-semibold text-[#6d7890]">Helps search engines understand your content better.</p></div></button></div>
                </div>
                <div className="pl-[22px]">
                  <h3 className="text-[13px] font-semibold text-[#17234a]">Social Media Preview (Open Graph)</h3><p className="mt-[4px] text-[10px] font-semibold text-[#66738b]">This image and content will be used when the category is shared on social media.</p>
                  <div className="mt-[16px]"><FieldLabel optional>Social Image</FieldLabel><button className="flex h-[112px] w-full items-center justify-center gap-[16px] rounded-[7px] border border-[#dfe4e8]"><ImageIcon className="h-[36px] w-[36px] text-[#087342]" /><div className="text-left"><p className="text-[11px] font-semibold text-[#43516a]">Drag & drop an image here or click to upload</p><p className="mt-[4px] text-[10px] font-semibold text-[#718096]">JPG, PNG or WEBP (Recommended size: 1200x630px)</p><span className="mt-[9px] inline-flex h-[32px] items-center rounded-[5px] border border-[#dfe4e8] px-[12px] text-[10px] font-semibold text-[#26344f]">Choose File</span></div></button></div>
                  <div className="mt-[16px]"><FieldLabel optional>Social Title</FieldLabel><input value={form.socialTitle} onChange={e => update("socialTitle", e.target.value.slice(0, 60))} placeholder="Enter social media title" className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] px-[12px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><p className="mt-[6px] text-right text-[10px] font-semibold text-[#718096]">{form.socialTitle.length} / 60</p></div>
                  <div className="mt-[14px]"><FieldLabel optional>Social Description</FieldLabel><textarea value={form.socialDescription} onChange={e => update("socialDescription", e.target.value.slice(0, 160))} placeholder="Enter social media description" className="h-[76px] w-full resize-none rounded-[6px] border border-[#dfe4e8] px-[12px] py-[10px] text-[9px] font-semibold outline-none placeholder:text-[#8d97aa]" /><p className="mt-[6px] text-right text-[10px] font-semibold text-[#718096]">{form.socialDescription.length} / 160</p></div>
                  <div className="mt-[18px] rounded-[8px] border border-[#e3e7eb] p-[14px]"><div className="flex items-center gap-[9px]"><Share2 className="h-[17px] w-[17px] text-[#2e65d0]" /><h3 className="text-[9px] font-semibold text-[#17234a]">Google Search Preview</h3></div><p className="mt-[12px] text-[10px] font-semibold text-[#66738b]">https://www.mokshasewa.org › category › {finalSlug}</p><p className="mt-[7px] text-[16px] font-semibold text-[#2343a3]">{form.seoTitle || "Category Title Will Appear Here"}</p><p className="mt-[5px] text-[10.5px] font-semibold leading-[1.5] text-[#526078]">{form.seoDescription || "This is how your category may appear on Google search results. Write a clear and engaging meta description to get better visibility."}</p></div>
                </div>
              </div>
            </section>
            <aside className="space-y-[12px]"><section className="rounded-[9px] border border-[#dfe9e2] bg-[#f8fcf9] px-[18px] py-[16px]"><div className="flex items-center gap-[10px]"><Lightbulb className="h-[21px] w-[21px] text-[#d5a31d]" /><h3 className="text-[13px] font-semibold text-[#1b633e]">SEO Best Practices</h3></div><div className="mt-[14px] space-y-[10px]"><CheckLine>Use a clear and relevant meta title.</CheckLine><CheckLine>Write a unique and engaging description.</CheckLine><CheckLine>Include important keywords.</CheckLine><CheckLine>Add an attractive social media image.</CheckLine><CheckLine>Keep it relevant to the category content.</CheckLine><CheckLine>Preview how it looks in search results.</CheckLine></div></section><Card title="Category Progress"><div className="space-y-[12px]">{steps.map(s => <div key={s.step} className="flex items-center gap-[10px]"><span className={`grid h-[23px] w-[23px] place-items-center rounded-full text-[10px] font-semibold ${step > s.step ? "bg-[#075b33] text-white" : step === s.step ? "bg-[#18a84f] text-white" : "bg-[#e8ebf1] text-[#68758d]"}`}>{step > s.step ? <Check className="h-[12px] w-[12px]" /> : s.step}</span><div><p className="text-[10.5px] font-semibold text-[#24345e]">{s.title}</p><span className={`mt-[3px] inline-flex rounded-[4px] px-[7px] py-[3px] text-[9px] font-semibold ${step > s.step ? "bg-emerald-100 text-emerald-700" : step === s.step ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{step > s.step ? "Completed" : step === s.step ? "In Progress" : "Pending"}</span></div></div>)}</div></Card><HelpCard blue /></aside>
          </section>
          <footer className="sticky bottom-0 z-20 mt-[14px] flex min-h-[58px] items-center justify-between border-t border-[#edf0f2] bg-[#fffefb]/95 px-[6px] py-[8px] backdrop-blur-sm"><button onClick={back} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"><ArrowLeft className="h-[14px] w-[14px]" />Back</button><div className="flex gap-[10px]"><button className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"><FileText className="h-[14px] w-[14px]" />Save as Draft</button><button onClick={next} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[#075b33] px-[22px] text-[10.5px] font-semibold text-white">Next<ArrowRight className="h-[14px] w-[14px]" /></button></div></footer>
        </>
      )}

      {step === 4 && (
        <>
          <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_315px]">
            <section className="overflow-hidden rounded-[9px] border border-[#e6e9ec] bg-white">
              <div className="flex min-h-[72px] items-center justify-between gap-[16px] bg-[linear-gradient(90deg,#eef7f1,#f8fbf8)] px-[18px]"><div className="flex items-center gap-[12px]"><div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#dff1e5] text-[#087342]"><FileText className="h-[24px] w-[24px]" /></div><div><h2 className="text-[14px] font-semibold text-[#175b37]">4. Review & Save</h2><p className="mt-[4px] text-[9.5px] font-semibold text-[#52617a]">Please review all the information before publishing the category.</p></div></div><button onClick={() => setStep(1)} className="inline-flex h-[36px] items-center gap-[8px] rounded-[6px] bg-white px-[14px] text-[9px] font-semibold text-[#31405a] shadow-sm"><Edit3 className="h-[13px] w-[13px] text-[#3557bd]" />Edit Details</button></div>
              <div className="grid grid-cols-2 gap-[14px] p-[18px]">
                <Card title="Category Details"><div className="space-y-[8px]">{[["Category Name", finalName], ["Slug (URL Friendly)", finalSlug], ["Parent Category", finalParent], ["Short Description", finalShort]].map(([a, b]) => <div key={a} className="grid grid-cols-[135px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">{a}</span><span className="text-[9px] font-semibold text-[#34425e]">{b}</span></div>)}<div className="grid grid-cols-[135px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Description</span><span className="text-[9px] font-semibold leading-[1.5] text-[#34425e]">{finalDescription}</span></div><div className="grid grid-cols-[135px_1fr] items-center gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Category Icon</span><span className="flex items-center gap-[8px] text-[9px] font-semibold text-[#34425e]"><Heart className="h-[18px] w-[18px] text-[#087342]" />heart (icon)</span></div></div></Card>
                <Card title="Display & Settings"><div className="space-y-[8px]">{[["Display in Navigation Menu", form.displayInNavigation ? "Yes" : "No"], ["Menu Label", form.menuLabel || "Stories"], ["Parent Menu Position", form.parentMenuPosition || "Blog & Awareness"], ["Display Order", form.order], ["Featured Category", form.featured ? "Yes" : "No"]].map(([a, b]) => <div key={a} className="grid grid-cols-[145px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">{a}</span><span className="text-[9px] font-semibold text-[#34425e]">{b}</span></div>)}<div className="grid grid-cols-[145px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Category Visibility</span><span><span className="rounded-[4px] bg-emerald-100 px-[8px] py-[3px] text-[9px] font-semibold text-emerald-700">{form.visibility}</span></span></div><div className="grid grid-cols-[145px_1fr] items-center gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Category Color</span><span className="flex items-center gap-[8px] text-[9px] font-semibold text-[#34425e]"><span className="h-[16px] w-[16px] rounded-full" style={{ backgroundColor: form.color }} />{form.color}</span></div><div className="grid grid-cols-[145px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Category Banner</span><div className="relative h-[78px] overflow-hidden rounded-[6px] bg-[linear-gradient(180deg,#f6eac5,#cbd7b5)]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,215,117,.75),transparent_30%),linear-gradient(to_top,rgba(38,93,59,.45),transparent_55%)]" /><div className="absolute inset-x-0 top-[26px] text-center text-[17px] font-semibold italic text-[#315f41]">Stories That Inspire</div></div></div></div></Card>
                <Card title="SEO Settings"><div className="space-y-[8px]">{[["SEO Meta Title", finalSeoTitle], ["SEO Meta Description", finalSeoDescription], ["SEO Keywords", finalKeywords], ["Canonical URL", `${form.canonicalUrl}${finalSlug}/`]].map(([a, b]) => <div key={a} className="grid grid-cols-[135px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">{a}</span><span className="text-[9px] font-semibold leading-[1.45] text-[#34425e]">{b}</span></div>)}<div className="grid grid-cols-[135px_1fr] gap-[12px]"><span className="text-[9px] font-semibold text-[#66738b]">Schema Markup</span><span className="flex items-center gap-[7px] text-[9px] font-semibold text-[#34425e]"><span className="grid h-[16px] w-[16px] place-items-center rounded-[3px] bg-[#087342] text-white"><Check className="h-[10px] w-[10px]" /></span>Enabled</span></div></div></Card>
                <Card title="Social Media Preview"><div className="relative h-[104px] overflow-hidden rounded-[7px] bg-[linear-gradient(180deg,#f6eac5,#cbd7b5)]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,215,117,.75),transparent_30%),linear-gradient(to_top,rgba(38,93,59,.45),transparent_55%)]" /><div className="absolute inset-x-0 top-[36px] text-center text-[21px] font-semibold italic text-[#315f41]">Stories That Inspire</div></div><p className="mt-[8px] text-[9px] font-semibold text-[#66738b]">mokshasewa.org</p><p className="mt-[4px] text-[10px] font-semibold text-[#1f2f57]">{finalSeoTitle}</p><p className="mt-[4px] line-clamp-2 text-[9px] font-semibold leading-[1.45] text-[#66738b]">{finalSeoDescription}</p></Card>
              </div>
            </section>
            <aside className="space-y-[12px]"><section className="rounded-[9px] border border-[#dfe9e2] bg-[#f8fcf9] px-[18px] py-[16px]"><div className="flex items-center gap-[10px]"><CheckCircle2 className="h-[21px] w-[21px] text-[#087342]" /><h3 className="text-[12px] font-semibold text-[#1b633e]">Checklist</h3></div><div className="mt-[14px] space-y-[10px]"><CheckLine>Category details added</CheckLine><CheckLine>Display settings configured</CheckLine><CheckLine>SEO settings completed</CheckLine><CheckLine>All information reviewed</CheckLine><CheckLine>Ready to publish</CheckLine></div></section><Card title="What Happens Next?"><div className="space-y-[11px]">{["The category will be saved and published.", "It will appear in the navigation menu (if enabled).", "You can now add posts under this category.", "You can edit or update the category anytime."].map((t, i) => <div key={t} className="flex items-start gap-[10px]"><span className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-[#dff1e5] text-[9px] font-semibold text-[#25633f]">{i + 1}</span><p className="pt-[4px] text-[9px] font-semibold leading-[1.4] text-[#53617c]">{t}</p></div>)}</div></Card><HelpCard blue /></aside>
          </section>
          <footer className="sticky bottom-0 z-20 mt-[14px] flex min-h-[58px] items-center justify-between border-t border-[#edf0f2] bg-[#fffefb]/95 px-[6px] py-[8px] backdrop-blur-sm"><button onClick={back} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655]"><ArrowLeft className="h-[14px] w-[14px]" />Back</button><div className="flex gap-[10px]"><button className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655]"><FileText className="h-[14px] w-[14px]" />Save as Draft</button><button onClick={next} className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[#075b33] px-[22px] text-[10px] font-semibold text-white"><Send className="h-[14px] w-[14px]" />Publish Category</button></div></footer>
        </>
      )}

      {step === 5 && (
        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_315px]">
          <div className="space-y-[14px]">
            <section className="overflow-hidden rounded-[9px] border border-[#dfe9e2] bg-[linear-gradient(135deg,#f4fbf6,#fbfdfb)] px-[22px] py-[30px] text-center"><div className="mx-auto grid h-[110px] w-[110px] place-items-center rounded-full bg-[linear-gradient(135deg,#26b943,#3ca837)] text-white"><Check className="h-[58px] w-[58px]" strokeWidth={3.4} /></div><h2 className="mt-[20px] text-[29px] font-semibold tracking-[-0.03em] text-[#075b33]">Category Added Successfully!</h2><p className="mt-[9px] text-[12px] font-semibold text-[#2e3d68]">“{finalName}” has been added to your blog & awareness categories.</p><p className="mt-[6px] text-[10px] font-semibold text-[#5f6c82]">You can now create and publish posts under this category.</p><div className="mt-[28px] flex flex-wrap justify-center gap-[12px]"><button onClick={() => setStep(1)} className="inline-flex h-[46px] items-center gap-[9px] rounded-[7px] bg-[#075b33] px-[22px] text-[10px] font-semibold text-white"><Plus className="h-[15px] w-[15px]" />Add Another Category</button><button onClick={() => router.push("/blogs/new")} className="inline-flex h-[46px] items-center gap-[9px] rounded-[7px] border border-[#a9c8b6] bg-white px-[22px] text-[10px] font-semibold text-[#1d5d3c] hover:bg-emerald-50/50"><FileText className="h-[15px] w-[15px]" />Create a New Post</button><button onClick={() => router.push("/blogs/categories")} className="inline-flex h-[46px] items-center gap-[9px] rounded-[7px] border border-[#a9c8b6] bg-white px-[22px] text-[10px] font-semibold text-[#1d5d3c] hover:bg-emerald-50/50"><List className="h-[15px] w-[15px]" />View All Categories</button><button onClick={() => router.push("/blogs")} className="inline-flex h-[46px] items-center gap-[9px] rounded-[7px] border border-[#a9c8b6] bg-white px-[22px] text-[10px] font-semibold text-[#1d5d3c] hover:bg-emerald-50/50"><ExternalLink className="h-[15px] w-[15px]" />Blog Dashboard</button></div></section>
            <Card title="Category Summary"><div className="grid grid-cols-4 gap-[10px]">{[["Total Categories", "13", "+1 from last entry", BookOpen, "bg-emerald-50 text-emerald-700"], ["Published Categories", "11", "", FileText, "bg-violet-50 text-violet-700"], ["Hidden Categories", "2", "", Eye, "bg-amber-50 text-amber-700"], ["Total Posts", "92", "Across all categories", FileText, "bg-blue-50 text-blue-700"]].map(([label, value, note, Icon, tone]) => { const I = Icon as typeof BookOpen; return <div key={String(label)} className="flex min-h-[92px] items-center gap-[12px] rounded-[8px] border border-[#edf0f2] px-[12px]"><div className={`grid h-[46px] w-[46px] place-items-center rounded-full ${String(tone)}`}><I className="h-[22px] w-[22px]" /></div><div><p className="text-[9px] font-semibold text-[#66738b]">{String(label)}</p><p className="mt-[4px] text-[20px] font-semibold text-[#142347]">{String(value)}</p>{note ? <p className="mt-[4px] text-[9px] font-semibold text-[#66738b]">{String(note)}</p> : null}</div></div> })}</div></Card>
            <Card title="Recently Added Categories"><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="h-[36px] border-b border-[#edf0f2] text-[9px] font-semibold uppercase tracking-[0.04em] text-[#536078]"><th className="px-[8px]">#</th><th className="px-[8px]">Category Name</th><th className="px-[8px]">Slug</th><th className="px-[8px]">Parent Category</th><th className="px-[8px]">Status</th><th className="px-[8px]">Date</th><th className="px-[8px] text-center">Actions</th></tr></thead><tbody>{recent.map((r, i) => <tr key={r[0]} className="h-[44px] border-b border-[#f0f2f4] last:border-b-0"><td className="px-[8px] text-[9px] font-semibold text-[#35445f]">{i + 1}</td><td className="px-[8px] text-[9px] font-semibold text-[#1e2d52]">{r[0]}</td><td className="px-[8px] text-[9px] font-semibold text-[#53617c]">{r[1]}</td><td className="px-[8px] text-[9px] font-semibold text-[#365b9e]">{r[2]}</td><td className="px-[8px]"><span className={`rounded-[4px] px-[8px] py-[3px] text-[9px] font-semibold ${r[3] === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r[3]}</span></td><td className="px-[8px] text-[9px] font-semibold text-[#53617c]">{r[4]}</td><td className="px-[8px]"><div className="flex justify-center gap-[12px]"><Eye className="h-[13px] w-[13px] text-[#2e3f73]" /><Edit3 className="h-[13px] w-[13px] text-[#2e3f73]" /><Trash2 className="h-[13px] w-[13px] text-[#d64242]" /></div></td></tr>)}</tbody></table></div></Card>
          </div>
          <aside className="space-y-[12px]"><section className="rounded-[9px] border border-[#dfe9e2] bg-[#f8fcf9] px-[18px] py-[20px]"><div className="flex items-start gap-[12px]"><Heart className="h-[32px] w-[32px] shrink-0 text-[#2b774b]" /><div><h3 className="text-[18px] font-semibold leading-[1.35] text-[#17613d]">Small Step.<br />A Bigger Impact.</h3><p className="mt-[18px] text-[11px] font-semibold leading-[1.55] text-[#30406b]">Your content helps spread awareness and brings dignity, compassion and humanity to more people.</p><div className="my-[18px] h-px bg-[#dce5df]" /><p className="text-[13px] font-semibold italic leading-[1.45] text-[#387451]">“Information creates awareness,<br />Awareness creates compassion.”</p></div></div></section><Card title="What Would You Like to Do Next?"><div className="divide-y divide-[#edf0f2]">{[["Add Another Category", UsersRound], ["Manage All Categories", Settings], ["Add New Post", FileText], ["Manage Tags", Tag], ["Go to Dashboard", PackageOpen]].map(([label, Icon]) => { const I = Icon as typeof UsersRound; return <button key={String(label)} className="flex h-[42px] w-full items-center justify-between"><span className="flex items-center gap-[10px]"><I className="h-[14px] w-[14px] text-[#314b91]" /><span className="text-[9px] font-semibold text-[#34425e]">{String(label)}</span></span><ArrowRight className="h-[13px] w-[13px] text-[#314b91]" /></button> })}</div></Card><HelpCard /></aside>
        </section>
      )}
    </main>
  );
}
