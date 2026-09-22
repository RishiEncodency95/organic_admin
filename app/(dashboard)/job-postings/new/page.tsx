"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  ClipboardCheck,
  Eye,
  FileText,
  KeyRound,
  Plus,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { EditorToolbar } from "@/components/pages-cms/fields";

/* =========================================================
   TOAST HELPER
========================================================= */

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
});

/* =========================================================
   FORM STATE
========================================================= */

interface JobForm {
  jobTitle: string;
  designation: string;
  company: string;
  projectEvent: string;
  department: string;
  reportingTo: string;
  jobCode: string;
  positions: string;
  employmentType: string;
  workMode: string;
  location: string;
  experienceFrom: string;
  experienceTo: string;
  education: string;
  preferredEducation: string;
  ctcFrom: string;
  ctcTo: string;
  salaryType: string;
  performanceIncentive: boolean;
  incentiveType: string;
  specificExperience: string;
  minPassingScore: string;
  partialMatchFrom: string;
  partialMatchTo: string;
  jobVisibility: string;
  featuredJob: boolean;
  openDate: string;
  closingDate: string;
  tags: string;
  acceptOnlineApplications: boolean;
  aiCvScreening: boolean;
  cvUploadMandatory: boolean;
  candidatePhotoMandatory: boolean;
  allowFresherCandidates: boolean;
  allowCurrentlyNotEmployed: boolean;
  allowCvReplacement: boolean;
}

const INITIAL_FORM: JobForm = {
  jobTitle: "",
  designation: "",
  company: "Namo Gange Wellness Pvt. Ltd.",
  projectEvent: "Bharat Organic Expo",
  department: "",
  reportingTo: "",
  jobCode: "",
  positions: "1",
  employmentType: "Full Time",
  workMode: "On-site",
  location: "",
  experienceFrom: "",
  experienceTo: "",
  education: "",
  preferredEducation: "",
  ctcFrom: "",
  ctcTo: "",
  salaryType: "CTC (Cost to Company)",
  performanceIncentive: false,
  incentiveType: "Performance Based",
  specificExperience: "",
  minPassingScore: "50",
  partialMatchFrom: "50",
  partialMatchTo: "69",
  jobVisibility: "Show in Career Page Menu",
  featuredJob: false,
  openDate: "",
  closingDate: "",
  tags: "",
  acceptOnlineApplications: true,
  aiCvScreening: true,
  cvUploadMandatory: true,
  candidatePhotoMandatory: true,
  allowFresherCandidates: false,
  allowCurrentlyNotEmployed: true,
  allowCvReplacement: true,
};

function notImplemented(action: string) {
  Toast.fire({ icon: "info", iconColor: "#38bdf8", title: `${action} — coming soon` });
}

/* =========================================================
   SMALL UI PRIMITIVES
========================================================= */

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-[5px] block text-[12px] font-semibold text-[#1e293b]">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[38px] w-full rounded-[7px] border border-[#dbe0e6] bg-white px-[12px] text-[12.5px] text-[#1e293b] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
    />
  );
}

function SelectFieldBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[38px] w-full cursor-pointer rounded-[7px] border border-[#dbe0e6] bg-white px-[12px] text-[12.5px] text-[#1e293b] outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

function RangeField({
  from,
  to,
  onFromChange,
  onToChange,
  placeholderFrom,
  placeholderTo,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  placeholderFrom?: string;
  placeholderTo?: string;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <TextField value={from} onChange={onFromChange} placeholder={placeholderFrom} />
      <span className="shrink-0 text-[11px] font-semibold text-[#94a3b8]">to</span>
      <TextField value={to} onChange={onToChange} placeholder={placeholderTo} />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#1d4ed8]" : "bg-[#cbd5e1]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? "left-[21px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-[10px] py-[8px]">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-[#1e293b]">{label}</p>
        {description && <p className="mt-0.5 text-[10.5px] text-[#8b929c]">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function TagInput({
  values,
  onChange,
  tone = "blue",
  addLabel,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  tone?: "blue" | "teal";
  addLabel: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const val = draft.trim();
    if (val && !values.includes(val)) {
      onChange([...values, val]);
    }
    setDraft("");
    setAdding(false);
  };

  const chipClass =
    tone === "blue"
      ? "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]"
      : "bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]";

  return (
    <div className="flex flex-wrap items-center gap-[6px]">
      {values.map((v) => (
        <span key={v} className={`flex items-center gap-[5px] rounded-[5px] px-[9px] py-[5px] text-[11px] font-semibold ${chipClass}`}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-current opacity-70 hover:opacity-100">
            <X className="h-[10px] w-[10px]" />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          onBlur={commit}
          placeholder="Type and press Enter..."
          className="h-[28px] w-[160px] rounded-[5px] border border-[#dbe0e6] px-[8px] text-[11px] outline-none focus:border-[#2563eb]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-[4px] rounded-[5px] border border-dashed border-[#cbd5e1] px-[9px] py-[5px] text-[11px] font-semibold text-[#475569] hover:border-[#94a3b8] hover:bg-slate-50"
        >
          <Plus className="h-[10px] w-[10px]" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

function RichTextField({
  value,
  onChange,
  maxLen = 2000,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLen?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const exec = (command: string, cmdValue?: string | null) => {
    document.execCommand(command, false, cmdValue ?? undefined);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerText);
  };

  return (
    <div className="overflow-hidden rounded-[7px] border border-[#dbe0e6]">
      <EditorToolbar targetRef={ref} onCommand={exec} />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerText)}
        data-placeholder={placeholder}
        className="min-h-[110px] bg-white p-[10px] text-[12px] leading-relaxed text-[#334155] outline-none empty:before:text-[#94a3b8] empty:before:content-[attr(data-placeholder)]"
      />
      <div className="border-t border-[#f1f5f9] bg-slate-50 px-[10px] py-[4px] text-right text-[10px] font-semibold text-[#94a3b8]">
        {Math.min(value.length, maxLen)}/{maxLen}
      </div>
    </div>
  );
}

function SectionCard({
  number,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  number: number;
  icon: typeof Briefcase;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[#e5e7eb] bg-white p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-[16px] flex items-center gap-[10px] border-b border-[#f1f5f9] pb-[12px]">
        <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[#2563eb] text-[12px] font-bold text-white">
          {number}
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-[6px] text-[14px] font-bold text-[#0f172a]">
            <Icon className="h-[14px] w-[14px] text-[#2563eb]" />
            {title}
          </h2>
          <p className="text-[10.5px] font-medium text-[#8b929c]">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-[14px]">{children}</div>
    </section>
  );
}

function SidebarPanel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[#e5e7eb] bg-white p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-[10px] flex items-start gap-[9px]">
        <span className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-[7px] bg-[#eff6ff] text-[#2563eb]">
          <Icon className="h-[14px] w-[14px]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-bold text-[#0f172a]">{title}</h3>
          {subtitle && <p className="text-[10px] font-medium text-[#8b929c]">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col divide-y divide-[#f1f5f9]">{children}</div>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AddNewJobPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "preview">("info");
  const [form, setForm] = useState<JobForm>(INITIAL_FORM);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "B2B Sales",
    "Exhibition Sales",
    "Sponsorship Sales",
    "Lead Generation",
    "Client Meetings",
    "Negotiation",
    "Deal Closure",
    "CRM",
  ]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    "Key Account Management",
    "Revenue Generation",
    "Market Research",
    "Industry Networking",
    "Presentation Skills",
    "Relationship Management",
  ]);
  const [targetSegments, setTargetSegments] = useState<string[]>([
    "Organic Food & Beverages",
    "Nutraceuticals",
    "Ayurveda",
    "Herbal Products",
    "Wellness",
    "Organic Farming",
    "Seeds",
    "Natural Beauty & Personal Care",
    "AgriTech",
    "GreenTech",
    "Certification & Testing",
    "Export/Import",
  ]);

  const [aboutProject, setAboutProject] = useState("");
  const [roleObjective, setRoleObjective] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState("");

  const updateField = <K extends keyof JobForm>(key: K, value: JobForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid = useMemo(
    () => form.jobTitle.trim() !== "" && form.department.trim() !== "" && form.location.trim() !== "",
    [form.jobTitle, form.department, form.location]
  );

  const handleSaveDraft = () => {
    Toast.fire({ icon: "success", title: "Job saved as draft" });
    router.push("/job-postings");
  };

  const handlePublish = () => {
    if (!isValid) {
      Toast.fire({ icon: "warning", iconColor: "#f59e0b", title: "Fill Job Title, Department and Location first" });
      return;
    }
    Toast.fire({ icon: "success", title: "Job published to careers page" });
    router.push("/job-postings");
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full bg-[#f8fafc] px-[18px] pb-[80px] pt-[14px] text-[#18233b]">
      {/* HEADER */}
      <div className="mb-[16px]">
        <h1 className="text-[20px] font-bold leading-[1.15] tracking-[-0.018em] text-[#0f172a]">
          Add New Job
        </h1>
        <p className="mt-0.5 text-[11px] font-medium text-[#6c7587]">
          Complete all details to create and publish the job on your careers page.
        </p>
      </div>

      {/* TABS */}
      <div className="mb-[16px] grid grid-cols-1 gap-[10px] sm:grid-cols-2 sm:max-w-[560px]">
        <button
          type="button"
          onClick={() => setTab("info")}
          className={`flex items-center gap-[10px] rounded-[8px] px-[14px] py-[10px] text-left transition ${
            tab === "info" ? "bg-[#2563eb] text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]" : "border border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#94a3b8]"
          }`}
        >
          <FileText className="h-[16px] w-[16px] shrink-0" />
          <span>
            <span className="block text-[12px] font-bold">Job Information</span>
            <span className={`block text-[10px] ${tab === "info" ? "text-blue-100" : "text-[#8b929c]"}`}>
              Job details, description, requirements, questions
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`flex items-center gap-[10px] rounded-[8px] px-[14px] py-[10px] text-left transition ${
            tab === "preview" ? "bg-[#2563eb] text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]" : "border border-[#e2e8f0] bg-white text-[#0f172a] hover:border-[#94a3b8]"
          }`}
        >
          <Eye className="h-[16px] w-[16px] shrink-0" />
          <span>
            <span className="block text-[12px] font-bold">Preview & Publish</span>
            <span className={`block text-[10px] ${tab === "preview" ? "text-blue-100" : "text-[#8b929c]"}`}>
              Review and publish on website
            </span>
          </span>
        </button>
      </div>

      {tab === "preview" ? (
        <section className="rounded-[10px] border border-[#e5e7eb] bg-white p-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="mb-[6px] text-[10.5px] font-bold uppercase tracking-wide text-[#2563eb]">
            {form.department || "Department"} · {form.location || "Location"}
          </p>
          <h2 className="text-[20px] font-bold text-[#0f172a]">{form.jobTitle || "Untitled Job"}</h2>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {form.employmentType} · {form.workMode} · {form.positions} opening{form.positions === "1" ? "" : "s"}
          </p>
          <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#94a3b8]">CTC Range</p>
              <p className="text-[12.5px] font-semibold text-[#0f172a]">₹{form.ctcFrom || "—"} - ₹{form.ctcTo || "—"} ({form.salaryType})</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#94a3b8]">Experience</p>
              <p className="text-[12.5px] font-semibold text-[#0f172a]">{form.experienceFrom || "—"} to {form.experienceTo || "—"} years</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#94a3b8]">Application Window</p>
              <p className="text-[12.5px] font-semibold text-[#0f172a]">{form.openDate || "—"} to {form.closingDate || "—"}</p>
            </div>
          </div>
          {aboutProject && (
            <div className="mt-[18px]">
              <p className="mb-1 text-[11px] font-bold text-[#0f172a]">About Project / Company</p>
              <p className="whitespace-pre-line text-[12px] text-[#334155]">{aboutProject}</p>
            </div>
          )}
          {requiredSkills.length > 0 && (
            <div className="mt-[18px]">
              <p className="mb-2 text-[11px] font-bold text-[#0f172a]">Required Skills</p>
              <div className="flex flex-wrap gap-[6px]">
                {requiredSkills.map((s) => (
                  <span key={s} className="rounded-[5px] bg-[#eff6ff] px-[9px] py-[4px] text-[11px] font-semibold text-[#1d4ed8]">{s}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
      <div className="grid grid-cols-1 gap-[14px] xl:grid-cols-[minmax(0,2.4fr)_minmax(280px,1fr)]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-[14px]">
          <SectionCard number={1} icon={Briefcase} title="Basic Information" subtitle="Enter the key details for this job position.">
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              <div>
                <Label required>Job Title</Label>
                <TextField value={form.jobTitle} onChange={(v) => updateField("jobTitle", v)} placeholder="e.g. Sales Manager – Domestic Exhibition Sales & Sponsorships" />
              </div>
              <div>
                <Label required>Designation</Label>
                <TextField value={form.designation} onChange={(v) => updateField("designation", v)} placeholder="Official designation" />
              </div>
              <div>
                <Label required>Company</Label>
                <TextField value={form.company} onChange={(v) => updateField("company", v)} />
              </div>
              <div>
                <Label required>Project / Event</Label>
                <TextField value={form.projectEvent} onChange={(v) => updateField("projectEvent", v)} />
              </div>
              <div>
                <Label required>Department</Label>
                <TextField value={form.department} onChange={(v) => updateField("department", v)} placeholder="e.g. Domestic Exhibition Sales" />
              </div>
              <div>
                <Label required>Reporting To</Label>
                <TextField value={form.reportingTo} onChange={(v) => updateField("reportingTo", v)} placeholder="e.g. Business Head – Exhibitions" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[14px] sm:grid-cols-4">
              <div>
                <Label>Job Code</Label>
                <TextField value={form.jobCode} onChange={(v) => updateField("jobCode", v)} placeholder="BOE-SALES-001" />
              </div>
              <div>
                <Label required>No. of Positions</Label>
                <TextField type="number" value={form.positions} onChange={(v) => updateField("positions", v)} />
              </div>
              <div>
                <Label required>Employment Type</Label>
                <SelectFieldBox value={form.employmentType} onChange={(v) => updateField("employmentType", v)} options={["Full Time", "Part Time", "Contract", "Freelance", "Internship"]} />
              </div>
              <div>
                <Label required>Work Mode</Label>
                <SelectFieldBox value={form.workMode} onChange={(v) => updateField("workMode", v)} options={["On-site", "Remote", "Hybrid"]} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-4">
              <div>
                <Label required>Location</Label>
                <TextField value={form.location} onChange={(v) => updateField("location", v)} placeholder="e.g. Delhi NCR" />
              </div>
              <div className="sm:col-span-1">
                <Label required>Experience (Years)</Label>
                <RangeField from={form.experienceFrom} to={form.experienceTo} onFromChange={(v) => updateField("experienceFrom", v)} onToChange={(v) => updateField("experienceTo", v)} placeholderFrom="3" placeholderTo="6" />
              </div>
              <div>
                <Label required>Education</Label>
                <TextField value={form.education} onChange={(v) => updateField("education", v)} placeholder="Graduate" />
              </div>
              <div>
                <Label>Preferred Education</Label>
                <TextField value={form.preferredEducation} onChange={(v) => updateField("preferredEducation", v)} placeholder="MBA/PGDM – Sales & Marketing" />
              </div>
            </div>
          </SectionCard>

          <SectionCard number={2} icon={KeyRound} title="Compensation" subtitle="Enter salary details and incentives.">
            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-4">
              <div className="sm:col-span-1">
                <Label required>Monthly CTC (INR)</Label>
                <RangeField from={form.ctcFrom} to={form.ctcTo} onFromChange={(v) => updateField("ctcFrom", v)} onToChange={(v) => updateField("ctcTo", v)} placeholderFrom="40,000" placeholderTo="50,000" />
              </div>
              <div>
                <Label required>Salary Type</Label>
                <SelectFieldBox value={form.salaryType} onChange={(v) => updateField("salaryType", v)} options={["CTC (Cost to Company)", "Gross Salary", "In-hand Salary"]} />
              </div>
              <div>
                <Label>Performance Incentive</Label>
                <div className="flex h-[38px] items-center gap-[8px]">
                  <Toggle checked={form.performanceIncentive} onChange={(v) => updateField("performanceIncentive", v)} />
                  <span className="text-[11px] font-semibold text-[#475569]">Applicable</span>
                </div>
              </div>
              <div>
                <Label>Incentive Type (Optional)</Label>
                <SelectFieldBox value={form.incentiveType} onChange={(v) => updateField("incentiveType", v)} options={["Performance Based", "Fixed Bonus", "Commission Based"]} />
              </div>
            </div>
          </SectionCard>

          <SectionCard number={3} icon={FileText} title="Job Description" subtitle="Provide a clear and detailed description of the role.">
            <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-3">
              <div>
                <Label required>About Project / Company</Label>
                <RichTextField value={aboutProject} onChange={setAboutProject} placeholder="Describe the project or company..." />
              </div>
              <div>
                <Label required>Role Objective</Label>
                <RichTextField value={roleObjective} onChange={setRoleObjective} placeholder="Summarise the objective of this role..." />
              </div>
              <div>
                <Label required>Key Responsibilities</Label>
                <RichTextField value={keyResponsibilities} onChange={setKeyResponsibilities} placeholder="List the key responsibilities..." />
              </div>
            </div>
          </SectionCard>

          <SectionCard number={4} icon={ClipboardCheck} title="Candidate Requirements" subtitle="Define the skills, experience and industry preference for AI matching.">
            <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-2">
              <div>
                <Label required>Required Skills</Label>
                <TagInput values={requiredSkills} onChange={setRequiredSkills} tone="blue" addLabel="Add Skill" />
              </div>
              <div>
                <Label>Target Industry Segments</Label>
                <TagInput values={targetSegments} onChange={setTargetSegments} tone="teal" addLabel="Add Segment" />
              </div>
              <div>
                <Label>Preferred Skills</Label>
                <TagInput values={preferredSkills} onChange={setPreferredSkills} tone="blue" addLabel="Add Skill" />
              </div>
              <div>
                <Label>Specific Experience (Optional)</Label>
                <textarea
                  value={form.specificExperience}
                  onChange={(e) => updateField("specificExperience", e.target.value.slice(0, 300))}
                  placeholder="e.g. Direct exhibition / trade show sales experience preferred"
                  rows={3}
                  className="w-full resize-none rounded-[7px] border border-[#dbe0e6] bg-white px-[12px] py-[8px] text-[12.5px] text-[#1e293b] outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
                />
                <p className="mt-1 text-right text-[10px] font-semibold text-[#94a3b8]">{form.specificExperience.length}/300</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="flex flex-col gap-[14px]">
          <SidebarPanel icon={Sparkles} title="Application & AI Screening" subtitle="Set application form and screening rules.">
            <ToggleRow label="Accept Online Applications" description="Enable job application on website" checked={form.acceptOnlineApplications} onChange={(v) => updateField("acceptOnlineApplications", v)} />
            <ToggleRow label="AI CV Screening" description="Automatically analyse CV and show match result" checked={form.aiCvScreening} onChange={(v) => updateField("aiCvScreening", v)} />
            <ToggleRow label="CV Upload Mandatory" checked={form.cvUploadMandatory} onChange={(v) => updateField("cvUploadMandatory", v)} />
            <ToggleRow label="Candidate Photo Mandatory" description="If CV does not have a photo" checked={form.candidatePhotoMandatory} onChange={(v) => updateField("candidatePhotoMandatory", v)} />
            <ToggleRow label="Allow Fresher Candidates" checked={form.allowFresherCandidates} onChange={(v) => updateField("allowFresherCandidates", v)} />
            <ToggleRow label="Allow Currently Not Employed" checked={form.allowCurrentlyNotEmployed} onChange={(v) => updateField("allowCurrentlyNotEmployed", v)} />
            <ToggleRow label="Allow CV Replacement" description="Candidate can update CV after re-check" checked={form.allowCvReplacement} onChange={(v) => updateField("allowCvReplacement", v)} />
          </SidebarPanel>

          <SidebarPanel icon={Sparkles} title="AI Matching Rules">
            <div className="py-[8px]">
              <Label>Minimum Passing Score (%)</Label>
              <TextField type="number" value={form.minPassingScore} onChange={(v) => updateField("minPassingScore", v)} />
            </div>
            <div className="py-[8px]">
              <Label>Partial Match Range (%)</Label>
              <RangeField from={form.partialMatchFrom} to={form.partialMatchTo} onFromChange={(v) => updateField("partialMatchFrom", v)} onToChange={(v) => updateField("partialMatchTo", v)} />
            </div>
            <div className="py-[8px]">
              <p className="mb-[8px] text-[12px] font-semibold text-[#1e293b]">Application Questions</p>
              <p className="mb-[8px] text-[10.5px] text-[#8b929c]">Predefined questions from JD (10)</p>
              <button
                type="button"
                onClick={() => notImplemented("Manage Questions")}
                className="flex w-full items-center justify-center gap-[6px] rounded-[7px] border border-[#bfdbfe] bg-[#eff6ff] py-[9px] text-[11.5px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe]"
              >
                Manage Questions
                <span aria-hidden>→</span>
              </button>
            </div>
          </SidebarPanel>

          <SidebarPanel icon={Settings2} title="Additional Settings">
            <div className="py-[8px]">
              <Label>Job Visibility on Website</Label>
              <SelectFieldBox value={form.jobVisibility} onChange={(v) => updateField("jobVisibility", v)} options={["Show in Career Page Menu", "Hidden (Direct Link Only)"]} />
            </div>
            <ToggleRow label="Featured Job" description="Show at top of career page" checked={form.featuredJob} onChange={(v) => updateField("featuredJob", v)} />
            <div className="py-[8px]">
              <Label required>Application Open Date</Label>
              <div className="relative">
                <TextField type="date" value={form.openDate} onChange={(v) => updateField("openDate", v)} />
                <Calendar className="pointer-events-none absolute right-[12px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#94a3b8]" />
              </div>
            </div>
            <div className="py-[8px]">
              <Label required>Application Closing Date</Label>
              <div className="relative">
                <TextField type="date" value={form.closingDate} onChange={(v) => updateField("closingDate", v)} />
                <Calendar className="pointer-events-none absolute right-[12px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#94a3b8]" />
              </div>
            </div>
            <div className="py-[8px]">
              <Label>Tags (Optional)</Label>
              <TextField value={form.tags} onChange={(v) => updateField("tags", v)} placeholder="e.g. Sales, Exhibition, Delhi NCR" />
              <p className="mt-1 text-[10px] text-[#8b929c]">Add keywords to improve search on career page.</p>
            </div>
          </SidebarPanel>
        </div>
      </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-[10px] border-t border-[#e5e7eb] bg-white px-[24px] py-[12px] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] lg:left-[218px]">
        <button
          type="button"
          onClick={() => router.push("/job-postings")}
          className="rounded-[7px] border border-[#fecaca] bg-[#fff1f2] px-[16px] py-[9px] text-[12px] font-bold text-[#dc2626] hover:bg-[#ffe4e6]"
        >
          Cancel
        </button>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-[7px] border border-[#dbe0e6] bg-white px-[16px] py-[9px] text-[12px] font-bold text-[#334155] hover:bg-slate-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className="rounded-[7px] border border-[#bfdbfe] bg-[#eff6ff] px-[16px] py-[9px] text-[12px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe]"
          >
            Preview Job
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-[7px] bg-[#16a34a] px-[18px] py-[9px] text-[12px] font-bold text-white shadow-[0_4px_10px_rgba(22,163,74,0.25)] hover:bg-[#15803d]"
          >
            Publish Job
          </button>
        </div>
      </div>
    </div>
  );
}
