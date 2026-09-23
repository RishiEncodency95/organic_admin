"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Eye,
  X,
  Calendar,
  ArrowRight,
  Settings,
} from "lucide-react";


import Image from "next/image";
import { jobsApi, type BackendJobStatus, type JobPosting } from "@/lib/careersApi";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
});

/** Styled replacement for window.prompt(). Returns the trimmed value, or null if cancelled/empty. */
/** Splits a comma-separated paste ("React, Next.js, Node.js") into individual tags, so
 * pasting a whole list doesn't create one giant run-on pill that overflows the layout.
 * Each tag is also capped so a single stray very-long entry can't do the same thing. */
function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 40 ? s.slice(0, 40).trim() : s));
}

async function askForText(title: string, placeholder = ""): Promise<string | null> {
  const { value } = await Swal.fire({
    title,
    input: "text",
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: "Add",
    confirmButtonColor: "#2563eb",
    background: "#1e2433",
    color: "#e2e8f0",
    width: 420,
    padding: "1.4rem",
    inputAttributes: { autocapitalize: "off" },
    customClass: {
      title: "!text-[15px] !mb-2",
      input: "!h-[36px] !text-[12.5px] !mt-1",
      confirmButton: "!text-[12px] !px-4 !py-2",
      cancelButton: "!text-[12px] !px-4 !py-2",
      actions: "!mt-3.5 !gap-2",
    },
  });
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || null;
}

/** Converts the rich-text editor's HTML (usually a <ul><li>) into a plain string
 * array — the shape the public careers site's Job model expects for bullet fields. */
function htmlToLines(html: string): string[] {
  if (typeof window === "undefined") return [];
  const container = document.createElement("div");
  container.innerHTML = html;

  const items = Array.from(container.querySelectorAll("li"))
    .map((li) => li.textContent?.trim() || "")
    .filter(Boolean);
  if (items.length > 0) return items;

  // Plain-text paragraphs: contentEditable puts each visual line in its own
  // <div>/<p>, but textContent joins siblings with no separator at all — so
  // without this, "line 1" + "line 2" reads back as "line 1line 2". Insert an
  // explicit newline at every block/line boundary before reading it out.
  container.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  container.querySelectorAll("div, p").forEach((el) => el.append("\n"));

  const text = container.textContent || "";
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

/** Converts the "The Opportunity" editor's HTML into a single plain-text paragraph —
 * the public careers site renders job.description as plain text (no dangerouslySetInnerHTML),
 * so any markup would show up as literal tags on the site. */
function htmlToPlainText(html: string): string {
  if (typeof window === "undefined") return html;
  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
  container.querySelectorAll("div, p, li").forEach((el) => el.append("\n"));
  return (container.textContent || "").replace(/\n{2,}/g, "\n").trim();
}

/** Reverse of htmlToLines, for loading an existing job's responsibilities back into the editor. */
function linesToHtml(lines?: string[]): string {
  if (!lines || lines.length === 0) return "<ul><li></li></ul>";
  return `<ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>`;
}

/** Formats an ISO date string into the "DD Mon YYYY" text the date inputs use. */
function formatDateInput(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function GreenToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? "bg-[#10b981]" : "bg-[#cbd5e1]"
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-[16px]" : "translate-x-0"
          }`}
      />
    </button>
  );
}

/* Custom Skill / Tag Pills matching screenshot soft-blue pills with X */
function SkillPill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#eff6ff] px-2 py-0.5 text-[10.5px] font-medium text-[#1d4ed8] border border-[#dbeafe]">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 text-[#3b82f6] hover:text-[#1d4ed8]">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

/* Add Skill button */
function AddPillButton({ label = "+ Add Skill", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-[4px] border border-dashed border-[#60a5fa] bg-[#eff6ff] px-2 py-0.5 text-[10.5px] font-semibold text-[#2563eb] hover:bg-[#dbeafe]"
    >
      {label}
    </button>
  );
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** The careers page card only ever shows the first bullet/line of Key Responsibilities
 * (see frontend CareersClientContent.tsx: description = responsibilities[0]) — so the
 * word cap has to track just that first line, not the whole multi-bullet content. */
function getFirstLineText(container: HTMLElement): string {
  const firstLi = container.querySelector("li");
  if (firstLi) return firstLi.textContent || "";
  const firstBlock = container.querySelector("div, p");
  if (firstBlock) return firstBlock.textContent || "";
  return (container.textContent || "").split("\n")[0];
}

/* Rich Editor matching 3 columns in Section 3 */
function RichEditorBlock({
  label,
  required = false,
  defaultValue = "",
  maxChars = 2000,
  maxWords,
  wordLabel = "Words",
  wordScope = "full",
  hint,
  onChange,
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  maxChars?: number;
  /** When set, shows a live word counter (e.g. first bullet shown on the public site) instead of/alongside the char count. */
  maxWords?: number;
  /** Label shown before the word counter, e.g. "First bullet" or "Words". Defaults to "Words". */
  wordLabel?: string;
  /** "firstLine" caps just the first bullet/line (e.g. Key Responsibilities, whose first
   * line alone is shown on the public site); "full" (default) counts the whole content. */
  wordScope?: "full" | "firstLine";
  hint?: string;
  onChange?: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const getInitialContainer = () => {
    const el = document.createElement("div");
    el.innerHTML = defaultValue;
    return el;
  };
  const wordText = (source: HTMLElement) => (wordScope === "firstLine" ? getFirstLineText(source) : source.textContent || "");
  const [charLength, setCharLength] = useState(() => {
    if (typeof window === "undefined") return 0;
    return (getInitialContainer().textContent || "").length;
  });
  const [wordLength, setWordLength] = useState(() => {
    if (typeof window === "undefined") return 0;
    return countWords(wordText(getInitialContainer()));
  });

  const syncCount = () => {
    const el = editorRef.current;
    if (!el) return;
    setCharLength((el.textContent || "").length);
    setWordLength(countWords(wordText(el)));
  };

  const exec = (cmd: string, arg: string = "") => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    onChange?.(editorRef.current?.innerHTML || "");
    syncCount();
  };

  // Applies the initial content exactly once, on mount. This must NOT re-run when
  // `defaultValue` changes later (e.g. because it's wired to live state for edit-mode
  // loading) — re-assigning innerHTML while the user is typing wipes the cursor
  // position back to the start on every keystroke.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = defaultValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-w-0">
      <label className="mb-1 text-[11px] font-bold text-[#1e293b]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="-mt-0.5 mb-1 text-[9px] font-medium text-[#94a3b8]">{hint}</p>}
      <div className="flex flex-col rounded-[6px] border border-[#cbd5e1] bg-white overflow-hidden shadow-2xs">
        {/* Editor Toolbar */}
        <div className="flex items-center gap-1 border-b border-[#e2e8f0] bg-[#f8fafc] px-2 py-1 text-[#475569]">
          <button type="button" onClick={() => exec("bold")} className="px-1 py-0.5 text-[11px] font-bold hover:bg-slate-200 rounded">B</button>
          <button type="button" onClick={() => exec("italic")} className="px-1 py-0.5 text-[11px] italic hover:bg-slate-200 rounded">I</button>
          <button type="button" onClick={() => exec("underline")} className="px-1 py-0.5 text-[11px] underline hover:bg-slate-200 rounded">U</button>
          <div className="h-3 w-px bg-slate-300 mx-0.5" />
          <button type="button" onClick={() => exec("insertUnorderedList")} className="px-1 py-0.5 text-[10px] hover:bg-slate-200 rounded">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="2" cy="12" r="1.5" /><path d="M5 4h9M5 8h9M5 12h9" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button type="button" onClick={() => exec("insertOrderedList")} className="px-1 py-0.5 text-[10px] hover:bg-slate-200 rounded">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12M2 7h12M2 11h12" /></svg>
          </button>
          <button type="button" onClick={() => exec("justifyLeft")} className="px-1 py-0.5 text-[10px] hover:bg-slate-200 rounded">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12M2 7h8M2 11h10" /></svg>
          </button>
          <div className="h-3 w-px bg-slate-300 mx-0.5" />
          <button type="button" onClick={async () => exec("createLink", (await askForText("Enter URL", "https://")) || "")} className="px-1 py-0.5 text-[10px] hover:bg-slate-200 rounded">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" /></svg>
          </button>
        </div>
        {/* Editable content area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            onChange?.(editorRef.current?.innerHTML || "");
            syncCount();
          }}
          onBlur={() => onChange?.(editorRef.current?.innerHTML || "")}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            onChange?.(editorRef.current?.innerHTML || "");
            syncCount();
          }}
          className="h-[120px] overflow-y-auto p-2 text-[10.5px] leading-relaxed text-[#334155] outline-none"
        />
      </div>
      <div className="mt-0.5 flex items-center justify-end gap-2 text-[9.5px] font-medium text-[#94a3b8]">
        {maxWords != null && (
          <span className={wordLength > maxWords ? "font-bold text-red-600" : "font-semibold text-[#334155]"}>
            {wordLabel}: {wordLength}/{maxWords} words
          </span>
        )}
        <span className={charLength > maxChars ? "font-bold text-red-600" : ""}>{charLength}/{maxChars} chars</span>
      </div>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-60px)] w-full items-center justify-center bg-[#f8fafc]">
          <p className="text-[12px] font-semibold text-[#64748b]">Loading…</p>
        </div>
      }
    >
      <CreateJobForm />
    </Suspense>
  );
}

function CreateJobForm() {
  const [activeTab, setActiveTab] = useState<"info" | "preview">("info");
  const [toggles, setToggles] = useState({
    acceptOnline: true,
    aiScreening: true,
    cvUpload: true,
    photoMandatory: true,
    fresher: false,
    currentlyNotEmployed: false,
    cvReplacement: true,
    showScore: true,
    showBreakdown: true,
    performanceIncentive: true,
    featuredJob: false,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  // Required Skills List
  const [reqSkills, setReqSkills] = useState<string[]>([]);

  // Preferred Skills List
  const [prefSkills, setPrefSkills] = useState<string[]>([]);

  // Industry Segments List
  const [segments, setSegments] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [submitting, setSubmitting] = useState(false);
  const [loadingJob, setLoadingJob] = useState(Boolean(editId));
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fields, setFields] = useState({
    title: "",
    designation: "",
    company: "",
    projectEvent: "",
    department: "",
    jobCode: "",
    employmentType: "Full Time",
    workplaceType: "On-site (Office)",
    totalOpenings: "1",
    location: "Ghaziabad / Delhi NCR",
    experienceMin: "",
    experienceMax: "",
    educationRequirements: "Graduate",
    ctcMin: "",
    ctcMax: "",
    salaryType: "CTC (Cost to Company)",
    incentiveType: "Performance Based",
    specificExperience: "",
    minPassingScore: "40",
    partialMatchMin: "50",
    partialMatchMax: "69",
    applicationOpenDate: "",
    applicationClosingDate: "",
    tags: "",
  });

  const updateField =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const DESCRIPTION_DEFAULT = "";
  const RESP_DEFAULT = "";
  const WHO_DEFAULT = "";

  const [descriptionHtml, setDescriptionHtml] = useState(DESCRIPTION_DEFAULT);
  const [respHtml, setRespHtml] = useState(RESP_DEFAULT);
  const [whoCanApplyHtml, setWhoCanApplyHtml] = useState(WHO_DEFAULT);

  useEffect(() => {
    if (!editId) return;
    let active = true;

    (async () => {
      try {
        const job: JobPosting = await jobsApi.getById(editId);
        if (!active) return;

        setFields({
          title: job.title || "",
          designation: job.designation || "",
          company: job.company || "",
          projectEvent: job.projectEvent || "",
          department: job.department || "",
          jobCode: job.jobCode || "",
          employmentType: job.employmentType || "Full Time",
          workplaceType: job.workplaceType || "On-site (Office)",
          totalOpenings: String(job.totalOpenings ?? 1),
          location: job.location || "",
          experienceMin: String(job.experienceMin ?? 0),
          experienceMax: String(job.experienceMax ?? 0),
          educationRequirements: job.educationRequirements || "Graduate",
          ctcMin: job.ctcMin != null ? job.ctcMin.toLocaleString("en-IN") : "",
          ctcMax: job.ctcMax != null ? job.ctcMax.toLocaleString("en-IN") : "",
          salaryType: job.salaryType || "CTC (Cost to Company)",
          incentiveType: job.incentiveType || "Performance Based",
          specificExperience: job.specificExperience || "",
          minPassingScore: String(job.eligibilityThreshold ?? 40),
          partialMatchMin: String(job.partialMatchMin ?? 50),
          partialMatchMax: String(job.partialMatchMax ?? 69),
          applicationOpenDate: formatDateInput(job.applicationOpenDate),
          applicationClosingDate: formatDateInput(job.applicationClosingDate),
          tags: (job.tags || []).join(", "),
        });

        setToggles({
          acceptOnline: job.acceptOnlineApplications ?? true,
          aiScreening: job.aiCvScreening ?? true,
          cvUpload: job.cvUploadMandatory ?? true,
          photoMandatory: job.candidatePhotoMandatory ?? true,
          fresher: job.allowFresherCandidates ?? false,
          currentlyNotEmployed: job.allowCurrentlyNotEmployed ?? false,
          cvReplacement: job.allowCvReplacement ?? true,
          showScore: job.showMatchScoreToCandidate ?? true,
          showBreakdown: job.showMatchBreakdown ?? true,
          performanceIncentive: job.performanceIncentiveApplicable ?? false,
          featuredJob: job.featuredJob ?? false,
        });

        setReqSkills(job.skills || []);
        setPrefSkills(job.preferredSkills || []);
        setSegments(job.targetIndustrySegments || []);

        setDescriptionHtml(job.description || DESCRIPTION_DEFAULT);
        setRespHtml(linesToHtml(job.responsibilities));
        setWhoCanApplyHtml(linesToHtml(job.requirements));
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : "Failed to load this job posting.");
      } finally {
        if (active) setLoadingJob(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleSubmit = async (status: BackendJobStatus) => {
    if (!fields.title.trim() || !fields.department.trim() || !fields.location.trim()) {
      Toast.fire({ icon: "warning", iconColor: "#fbbf24", title: "Job title, department and location are required." });
      return;
    }

    setSubmitting(true);
    try {
      const parseMoney = (v: string) => {
        const n = parseFloat(v.replace(/,/g, ""));
        return Number.isFinite(n) ? n : undefined;
      };
      const parseDate = (v: string) => {
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
      };

      const payload = {
        title: fields.title,
        designation: fields.designation,
        company: fields.company,
        projectEvent: fields.projectEvent,
        department: fields.department,
        jobCode: fields.jobCode,
        employmentType: fields.employmentType,
        workplaceType: fields.workplaceType,
        totalOpenings: Number(fields.totalOpenings) || 1,
        location: fields.location,
        experienceMin: Number(fields.experienceMin) || 0,
        experienceMax: Number(fields.experienceMax) || 0,
        educationRequirements: fields.educationRequirements,

        ctcMin: parseMoney(fields.ctcMin),
        ctcMax: parseMoney(fields.ctcMax),
        salaryType: fields.salaryType,
        performanceIncentiveApplicable: toggles.performanceIncentive,
        incentiveType: toggles.performanceIncentive ? fields.incentiveType : undefined,

        description: htmlToPlainText(descriptionHtml),
        skills: reqSkills,
        preferredSkills: prefSkills,
        targetIndustrySegments: segments,
        specificExperience: fields.specificExperience,
        responsibilities: htmlToLines(respHtml),
        requirements: htmlToLines(whoCanApplyHtml),

        acceptOnlineApplications: toggles.acceptOnline,
        aiCvScreening: toggles.aiScreening,
        cvUploadMandatory: toggles.cvUpload,
        candidatePhotoMandatory: toggles.photoMandatory,
        allowFresherCandidates: toggles.fresher,
        allowCurrentlyNotEmployed: toggles.currentlyNotEmployed,
        allowCvReplacement: toggles.cvReplacement,
        eligibilityThreshold: Number(fields.minPassingScore) || 40,
        partialMatchMin: Number(fields.partialMatchMin) || undefined,
        partialMatchMax: Number(fields.partialMatchMax) || undefined,
        showMatchScoreToCandidate: toggles.showScore,
        showMatchBreakdown: toggles.showBreakdown,

        featuredJob: toggles.featuredJob,
        applicationOpenDate: parseDate(fields.applicationOpenDate),
        applicationClosingDate: parseDate(fields.applicationClosingDate),
        tags: fields.tags.split(",").map((t) => t.trim()).filter(Boolean),

        status,
      };

      if (editId) {
        await jobsApi.update(editId, payload);
        Toast.fire({ icon: "success", iconColor: "#34d399", title: status === "DRAFT" ? "Saved as draft" : "Job updated" });
      } else {
        await jobsApi.create(payload);
        Toast.fire({ icon: "success", iconColor: "#34d399", title: status === "DRAFT" ? "Saved as draft" : "Job published" });
      }
      router.push("/job-postings");
    } catch (err) {
      Toast.fire({ icon: "error", iconColor: "#f87171", title: err instanceof Error ? err.message : "Failed to save job" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex h-[calc(100vh-60px)] w-full items-center justify-center bg-[#f8fafc]">
        <p className="text-[12px] font-semibold text-[#64748b]">Loading job posting…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-[calc(100vh-60px)] w-full flex-col items-center justify-center gap-3 bg-[#f8fafc]">
        <p className="text-[12px] font-semibold text-red-600">{loadError}</p>
        <Link href="/job-postings" className="text-[11px] font-bold text-[#2563eb] hover:underline">
          Back to Job Postings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] w-full flex-col bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-2 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/job-postings"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#cbd5e1] bg-white text-[#334155] hover:bg-slate-100 transition-colors shadow-2xs"
            title="Back to Job Postings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold text-[#0f172a] tracking-tight">{editId ? "Edit Job" : "Add New Job"}</h1>
            <p className="text-[10.5px] font-medium text-[#64748b]">
              {editId ? "Update the details for this job posting." : "Complete all details to create and publish the job on your careers page."}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Image
            src="/assets/greener-tomorrow-text.png"
            alt="Together for a Healthier Greener Tomorrow"
            width={320}
            height={65}
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>

      {/* STEP TABS HEADER */}
      <div className="flex shrink-0 gap-3 border-b border-[#e2e8f0] bg-[#f1f5f9] px-5 py-1.5">
        {/* Tab 1 Active / Inactive */}
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 rounded-[6px] border px-3 py-1.5 transition-all text-left ${
            activeTab === "info"
              ? "border-[#2563eb] bg-[#2563eb] text-white shadow-2xs"
              : "border-[#cbd5e1] bg-white text-[#475569] hover:bg-slate-50"
          }`}
        >
          <div className={`grid h-5 w-5 place-items-center rounded-[4px] ${activeTab === "info" ? "bg-white/20 text-white" : "bg-[#eff6ff] text-[#2563eb]"}`}>
            <FileText className="h-3 w-3" />
          </div>
          <div>
            <div className={`text-[11px] font-bold leading-tight ${activeTab === "info" ? "text-white" : "text-[#1e293b]"}`}>Job Information</div>
            <div className={`text-[9px] font-medium ${activeTab === "info" ? "text-blue-100" : "text-[#64748b]"}`}>Job details, description, requirements, questions</div>
          </div>
        </button>

        {/* Tab 2 Active / Inactive */}
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 rounded-[6px] border px-3 py-1.5 transition-all text-left ${
            activeTab === "preview"
              ? "border-[#2563eb] bg-[#2563eb] text-white shadow-2xs"
              : "border-[#cbd5e1] bg-white text-[#475569] hover:bg-slate-50"
          }`}
        >
          <div className={`grid h-5 w-5 place-items-center rounded-[4px] ${activeTab === "preview" ? "bg-white/20 text-white" : "bg-[#eff6ff] text-[#2563eb]"}`}>
            <Eye className="h-3 w-3" />
          </div>
          <div>
            <div className={`text-[11px] font-bold leading-tight ${activeTab === "preview" ? "text-white" : "text-[#1e293b]"}`}>Preview & Publish</div>
            <div className={`text-[9px] font-medium ${activeTab === "preview" ? "text-blue-100" : "text-[#64748b]"}`}>Review and publish on website</div>
          </div>
        </button>
      </div>

      {/* MAIN BODY (TWO COLUMNS LAYOUT) */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden px-5 py-3">
        {/* LEFT FORM COLUMN */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>

          {/* SECTION 1: BASIC INFORMATION */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#2563eb] text-[10px] font-bold text-white">1</span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[12px] font-bold text-[#0f172a]">Basic Information</h2>
                <span className="text-[10px] font-medium text-[#64748b]">• Enter the key details for this job position.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Job Title <span className="text-red-500">*</span></label>
                <input type="text" value={fields.title} onChange={updateField("title")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Designation <span className="text-red-500">*</span></label>
                <input type="text" value={fields.designation} onChange={updateField("designation")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Company <span className="text-red-500">*</span></label>
                <input type="text" value={fields.company} onChange={updateField("company")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Project / Event <span className="text-red-500">*</span></label>
                <input type="text" value={fields.projectEvent} onChange={updateField("projectEvent")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Department <span className="text-red-500">*</span></label>
                <input type="text" value={fields.department} onChange={updateField("department")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Job Code / Reference ID</label>
                <input type="text" value={fields.jobCode} onChange={updateField("jobCode")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Employment Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={fields.employmentType} onChange={updateField("employmentType")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Workplace Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={fields.workplaceType} onChange={updateField("workplaceType")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]">
                    <option>On-site (Office)</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-4 gap-3">
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Total Openings <span className="text-red-500">*</span></label>
                  <input type="number" value={fields.totalOpenings} onChange={updateField("totalOpenings")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b]" />
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Job Location <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={fields.location} onChange={updateField("location")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>Ghaziabad / Delhi NCR</option>
                      <option>Delhi NCR</option>
                      <option>Mumbai</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Experience (Years) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={fields.experienceMin} onChange={updateField("experienceMin")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-1.5 text-center text-[10.5px] font-semibold" />
                    <span className="text-[10px] font-medium text-slate-500">to</span>
                    <input type="number" value={fields.experienceMax} onChange={updateField("experienceMax")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-1.5 text-center text-[10.5px] font-semibold" />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Education <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={fields.educationRequirements} onChange={updateField("educationRequirements")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>Graduate</option>
                      <option>Post Graduate</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPENSATION */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#2563eb] text-[10px] font-bold text-white">2</span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[12px] font-bold text-[#0f172a]">Compensation</h2>
                <span className="text-[10px] font-medium text-[#64748b]">• Enter salary details and incentives.</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Monthly CTC (INR) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1">
                  <input type="text" value={fields.ctcMin} onChange={updateField("ctcMin")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-semibold" />
                  <span className="text-[10px] font-medium text-slate-500">to</span>
                  <input type="text" value={fields.ctcMax} onChange={updateField("ctcMax")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-semibold" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Salary Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={fields.salaryType} onChange={updateField("salaryType")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                    <option>CTC (Cost to Company)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Performance Incentive</label>
                <div className="flex items-center gap-2 h-[30px]">
                  <GreenToggle checked={toggles.performanceIncentive} onChange={() => toggle("performanceIncentive")} />
                  <span className="text-[10.5px] font-bold text-[#334155]">Applicable</span>
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Incentive Type (Optional)</label>
                <div className="relative">
                  <select value={fields.incentiveType} onChange={updateField("incentiveType")} className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                    <option>Performance Based</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: JOB DESCRIPTION — mirrors the three sections shown on the
              careers page job detail view: The Opportunity, Key Responsibilities,
              Who Can Apply (see frontend/app/components/careers/uploade_cv/page.tsx). */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#2563eb] text-[10px] font-bold text-white">3</span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[12px] font-bold text-[#0f172a]">Job Description</h2>
                <span className="text-[10px] font-medium text-[#64748b]">• Provide a clear and detailed description of the role.</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <RichEditorBlock
                label="The Opportunity"
                required
                defaultValue={descriptionHtml}
                onChange={setDescriptionHtml}
                maxWords={25}
              />

              <RichEditorBlock
                label="Key Responsibilities"
                required
                defaultValue={respHtml}
                onChange={setRespHtml}
                maxChars={300}
              />

              <RichEditorBlock
                label="Who Can Apply"
                required
                defaultValue={whoCanApplyHtml}
                onChange={setWhoCanApplyHtml}
                maxChars={200}
              />
            </div>
          </div>

          {/* SECTION 4: CANDIDATE REQUIREMENTS */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#2563eb] text-[10px] font-bold text-white">4</span>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[12px] font-bold text-[#0f172a]">Candidate Requirements</h2>
                <span className="text-[10px] font-medium text-[#64748b]">• Define the skills, experience and industry preference for AI matching.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Box: Required & Preferred Skills */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Required Key Skills <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white p-1.5 min-h-[36px]">
                    {reqSkills.map((sk, idx) => (
                      <SkillPill key={sk} label={sk} onRemove={() => setReqSkills(reqSkills.filter((_, i) => i !== idx))} />
                    ))}
                    <AddPillButton onClick={async () => {
                      const s = await askForText("Add required skill(s)", "e.g. B2B Sales, Negotiation, CRM");
                      if (!s) return;
                      const tags = parseTags(s).filter((t) => !reqSkills.includes(t));
                      if (tags.length) setReqSkills([...reqSkills, ...tags]);
                    }} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Preferred Skills (Optional)</label>
                  <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white p-1.5 min-h-[36px]">
                    {prefSkills.map((sk, idx) => (
                      <SkillPill key={sk} label={sk} onRemove={() => setPrefSkills(prefSkills.filter((_, i) => i !== idx))} />
                    ))}
                    <AddPillButton onClick={async () => {
                      const s = await askForText("Add preferred skill(s)", "e.g. Key Account Management, Market Research");
                      if (!s) return;
                      const tags = parseTags(s).filter((t) => !prefSkills.includes(t));
                      if (tags.length) setPrefSkills([...prefSkills, ...tags]);
                    }} />
                  </div>
                </div>
              </div>

              {/* Right Box: Target Industry Segments & Specific Experience */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Target Industry Segments</label>
                  <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white p-1.5 min-h-[36px]">
                    {segments.map((sg, idx) => (
                      <SkillPill key={sg} label={sg} onRemove={() => setSegments(segments.filter((_, i) => i !== idx))} />
                    ))}
                    <AddPillButton label="+ Add Segment" onClick={async () => {
                      const s = await askForText("Add industry segment(s)", "e.g. Organic Food & Beverages, Ayurveda");
                      if (!s) return;
                      const tags = parseTags(s).filter((t) => !segments.includes(t));
                      if (tags.length) setSegments([...segments, ...tags]);
                    }} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Specific Experience (Optional)</label>
                  <input
                    type="text"
                    value={fields.specificExperience}
                    onChange={updateField("specificExperience")}
                    placeholder="e.g. Direct exhibition / trade show sales experience preferred"
                    className="h-[32px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-medium text-[#334155] outline-none"
                  />
                  <div className="mt-0.5 text-right text-[9.5px] font-medium text-[#94a3b8]">{fields.specificExperience.length}/300</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="flex w-[290px] shrink-0 flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>

          {/* CARD 1: APPLICATION & AI SCREENING */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-start gap-2">
              <div className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-[#2563eb] text-white mt-0.5">
                <FileText className="h-3 w-3" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[11.5px] font-bold leading-snug text-[#0f172a]">Application & AI Screening</h3>
                <p className="text-[9px] font-medium leading-tight text-[#64748b]">Set application form and screening rules.</p>
              </div>
            </div>

            <div className="space-y-2 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10.5px] font-bold text-[#1e293b]">Accept Online Applications</div>
                  <div className="text-[9px] font-medium text-[#64748b]">Enable job application on website</div>
                </div>
                <GreenToggle checked={toggles.acceptOnline} onChange={() => toggle("acceptOnline")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div>
                  <div className="text-[10.5px] font-bold text-[#1e293b]">AI CV Screening</div>
                  <div className="text-[9px] font-medium text-[#64748b]">Automatically analyse CV and show match result</div>
                </div>
                <GreenToggle checked={toggles.aiScreening} onChange={() => toggle("aiScreening")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div className="text-[10.5px] font-bold text-[#1e293b]">CV Upload Mandatory</div>
                <GreenToggle checked={toggles.cvUpload} onChange={() => toggle("cvUpload")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div>
                  <div className="text-[10.5px] font-bold text-[#1e293b]">Candidate Photo Mandatory</div>
                  <div className="text-[9px] font-medium text-[#64748b]">If CV does not have a photo</div>
                </div>
                <GreenToggle checked={toggles.photoMandatory} onChange={() => toggle("photoMandatory")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div className="text-[10.5px] font-bold text-[#1e293b]">Allow Fresher Candidates</div>
                <GreenToggle checked={toggles.fresher} onChange={() => toggle("fresher")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div className="text-[10.5px] font-bold text-[#1e293b]">Allow Currently Not Employed</div>
                <GreenToggle checked={toggles.currentlyNotEmployed} onChange={() => toggle("currentlyNotEmployed")} />
              </div>

              <div className="flex items-center justify-between pt-1.5">
                <div>
                  <div className="text-[10.5px] font-bold text-[#1e293b]">Allow CV Replacement</div>
                  <div className="text-[9px] font-medium text-[#64748b]">Candidate can update CV after re-check</div>
                </div>
                <GreenToggle checked={toggles.cvReplacement} onChange={() => toggle("cvReplacement")} />
              </div>
            </div>
          </div>

          {/* CARD 2: AI MATCHING RULES */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <h3 className="mb-2 text-[11.5px] font-bold text-[#0f172a]">AI Matching Rules</h3>
            <div className="space-y-2">
              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Minimum Passing Score (%) <span className="text-red-500">*</span></label>
                <input type="number" value={fields.minPassingScore} onChange={updateField("minPassingScore")} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-bold text-[#1e293b]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Partial Match Range (%) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1.5">
                  <input type="number" value={fields.partialMatchMin} onChange={updateField("partialMatchMin")} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-bold" />
                  <span className="text-[10px] font-medium text-slate-500">to</span>
                  <input type="number" value={fields.partialMatchMax} onChange={updateField("partialMatchMax")} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-bold" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10.5px] font-bold text-[#1e293b]">Show Match Score to Candidate</span>
                <GreenToggle checked={toggles.showScore} onChange={() => toggle("showScore")} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-[#1e293b]">Show Match Breakdown</span>
                <GreenToggle checked={toggles.showBreakdown} onChange={() => toggle("showBreakdown")} />
              </div>
            </div>
          </div>

          {/* CARD 3: APPLICATION QUESTIONS */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <h3 className="text-[11.5px] font-bold text-[#0f172a]">Application Questions</h3>
            <p className="mt-0.5 text-[9px] font-medium text-[#64748b]">Predefined questions from JD (10)</p>
            <button type="button" className="mt-2 flex h-[30px] w-full items-center justify-between rounded-[5px] border border-[#2563eb] bg-white px-2.5 text-[10.5px] font-bold text-[#2563eb] hover:bg-blue-50">
              <span>Manage Questions</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* CARD 4: ADDITIONAL SETTINGS */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center gap-1.5">
              <div className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#2563eb] text-white">
                <Settings className="h-3 w-3" />
              </div>
              <h3 className="text-[11.5px] font-bold text-[#0f172a]">Additional Settings</h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Job Visibility on Website</label>
                <div className="relative">
                  <select defaultValue="Show in Career Page Menu" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-bold text-[#1e293b] outline-none">
                    <option>Show in Career Page Menu</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <div className="text-[10.5px] font-bold text-[#1e293b]">Featured Job</div>
                  <div className="text-[9px] font-medium text-[#64748b]">Show at top of career page</div>
                </div>
                <GreenToggle checked={toggles.featuredJob} onChange={() => toggle("featuredJob")} />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Application Open Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={fields.applicationOpenDate} onChange={updateField("applicationOpenDate")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 pr-7 text-[10.5px] font-semibold text-[#1e293b]" />
                  <Calendar className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Application Closing Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={fields.applicationClosingDate} onChange={updateField("applicationClosingDate")} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 pr-7 text-[10.5px] font-semibold text-[#1e293b]" />
                  <Calendar className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Tags (Optional)</label>
                <input type="text" value={fields.tags} onChange={updateField("tags")} placeholder="e.g. Sales, Exhibition, Delhi NCR" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-medium text-[#334155] outline-none" />
                <p className="mt-0.5 text-[9px] font-medium text-[#94a3b8]">Add keywords to improve search on career page.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM FIXED ACTION BAR */}
      <div className="flex shrink-0 items-center justify-between border-t border-[#e2e8f0] bg-white px-5 py-2 shadow-md">
        <Link
          href="/job-postings"
          className="flex h-[32px] items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white px-3 text-[11px] font-bold text-[#334155] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Cancel
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("DRAFT")}
            className="h-[32px] rounded-[5px] border border-[#cbd5e1] bg-white px-3.5 text-[11px] font-bold text-[#334155] hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => Toast.fire({ icon: "info", iconColor: "#38bdf8", title: "Preview — coming soon" })}
            className="h-[32px] rounded-[5px] border border-[#cbd5e1] bg-white px-3.5 text-[11px] font-bold text-[#334155] hover:bg-slate-50 transition-colors"
          >
            Preview Job
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit("OPEN")}
            className="flex h-[32px] items-center gap-1.5 rounded-[5px] bg-[#059669] px-4 text-[11px] font-bold text-white hover:bg-[#047857] transition-colors shadow-2xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : editId ? "Update Job" : "Publish Job"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
