import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, Briefcase, Calendar,
  MapPin, Phone, Mail, FileText, Printer, ArrowRight, Download, UserCircle,
  FileBadge2, Award, Clock, BriefcaseBusiness, ShieldCheck, MessageSquareText
} from 'lucide-react';

export interface CandidateDetailsData {
  name: string;
  avatarUrl?: string; // already resolved to a usable URL
  position: string;
  department?: string;
  jobCode?: string;
  appliedOn?: string;
  phone?: string;
  email?: string;
  location?: string;
  source?: "application" | "cv";
  stage: string;
  aiScore: number;
  aiResult: string;
  aiSummary?: string;
  strengths?: string[];
  gaps?: string[];
  skills?: string[];
  hrStatus: string;
  updatedByHrOn?: string;
  experience?: string;
  currentCompany?: string;
  currentDesignation?: string;
  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  willingToRelocate?: string;
  whyInterested?: string;
  notes?: string;
  cvFileName?: string;
}

export interface CandidateActivity {
  id: string;
  title: string;
  when: string;
  by?: string;
}

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Without a candidate (e.g. opened from the sidebar shortcut) a hint is shown instead.
  candidate?: CandidateDetailsData | null;
  activity?: CandidateActivity[];
  onPrev?: () => void;
  onNext?: () => void;
  onForwardToHr?: () => void;
  onDownloadCv?: () => void;
  onAddNote?: () => void;
}

type Tab = "Overview" | "Application Form" | "AI Analysis" | "CV Preview" | "HR Status" | "Activity Log";
const TABS: Tab[] = ["Overview", "Application Form", "AI Analysis", "CV Preview", "HR Status", "Activity Log"];

const CARD = "bg-white border border-[#e2e8f0] rounded-[4px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-[10px]";
const HEADING = "text-[8.5px] font-bold text-[#23471d] mb-[6px]";

const resultTone = (result: string) =>
  result === "Eligible"
    ? { ring: "border-[#15803d]", text: "text-[#15803d]", chip: "bg-[#E4F4E7] text-[#23714a] border-[#CDEBD4]" }
    : result === "Partial Match"
    ? { ring: "border-[#d97706]", text: "text-[#b45309]", chip: "bg-[#FEF3C7] text-[#b45309] border-[#FDE68A]" }
    : { ring: "border-[#dc2626]", text: "text-[#dc2626]", chip: "bg-[#FEE2E2] text-[#c62828] border-[#FECACA]" };

const dash = (v?: string) => (v && v.trim() ? v : "—");

function InfoRow({ icon: Icon, label, value, iconClass = "" }: { icon: React.ElementType; label: string; value?: React.ReactNode; iconClass?: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center">
      <div className="flex items-center gap-[6px] text-[#64748b]">
        <Icon size={12} className={iconClass} />
        <span className="text-[8.5px] font-bold">{label}</span>
      </div>
      <span className="text-[8.5px] font-bold text-[#19274a] truncate">{value === undefined || value === "" ? "—" : value}</span>
    </div>
  );
}

// Pipeline steps derived from where the candidate actually is.
const buildTimeline = (c: CandidateDetailsData) => {
  const hr = c.hrStatus;
  const forwarded = hr !== "Not Forwarded";
  const reviewed = ["Under Review", "Shortlisted", "Interview", "Selected", "Rejected", "On Hold"].includes(hr);
  const interviewed = ["Interview", "Selected"].includes(hr);
  const final = hr === "Selected" || hr === "Rejected";
  return [
    { label: c.stage === "CV Uploaded" ? "CV Uploaded" : c.stage === "Incomplete" ? "Started" : "Submitted", sub: c.appliedOn || "-", done: true },
    { label: "AI Analysis", sub: "Completed", done: true },
    { label: c.aiResult, sub: `(${c.aiScore}%)`, done: true, tone: resultTone(c.aiResult).text },
    { label: "Forwarded to HR", sub: forwarded ? "Sent" : "Not Yet", done: forwarded },
    { label: "HR Review", sub: reviewed ? hr : forwarded ? "Pending" : "-", done: reviewed },
    { label: "Interview", sub: interviewed ? (hr === "Interview" ? "In progress" : "Done") : "-", done: interviewed },
    { label: "Final Status", sub: final ? hr : "-", done: final },
  ];
};

export default function CandidateDetailsModal({
  isOpen, onClose, candidate, activity = [], onPrev, onNext, onForwardToHr, onDownloadCv, onAddNote,
}: CandidateDetailsModalProps) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [failedAvatar, setFailedAvatar] = useState("");

  if (!isOpen) return null;

  const close = () => {
    setTab("Overview");
    onClose();
  };

  if (!candidate) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px] pl-[260px]">
        <div className="bg-white rounded-[8px] shadow-[0_12px_32px_rgba(15,23,42,0.18)] w-[420px] p-[16px] relative">
          <button onClick={close} className="absolute top-[10px] right-[10px] text-[#19274a] hover:bg-gray-100 p-[4px] rounded-full">
            <X size={16} strokeWidth={2.5} />
          </button>
          <h2 className="text-[13px] font-bold text-[#19274a] mb-[6px]">Candidate Details</h2>
          <p className="text-[9.5px] font-semibold text-[#64748b]">
            Open a candidate from Applications &amp; AI Response (eye icon in the Actions column) to see their details here.
          </p>
        </div>
      </div>
    );
  }

  const c = candidate;
  const tone = resultTone(c.aiResult);
  const timeline = buildTimeline(c);
  const lastDone = timeline.reduce((acc, step, i) => (step.done ? i : acc), 0);
  const applied = c.source !== "cv";
  const showAvatar = !!c.avatarUrl && failedAvatar !== c.avatarUrl;
  const initials = c.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  const avatar = (size: string, rounded: string) => (
    <div className={`${size} ${rounded} overflow-hidden border-2 border-[#e2e8f0] flex-shrink-0 bg-[#e8f5e9] flex items-center justify-center text-[#1b5e20] font-bold text-[12px]`}>
      {showAvatar ? (
        <img src={c.avatarUrl} alt={c.name} onError={() => setFailedAvatar(c.avatarUrl || "")} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );

  const actionBtn = "flex items-center justify-center gap-[6px] w-[118px] h-[28px] rounded-[4px] text-[8.5px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const outlineBtn = `${actionBtn} bg-white border border-[#1d4ed8] text-[#1d4ed8] hover:bg-[#EEF4FF]`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px] pl-[260px]">
      {/* Modal Container */}
      <div className="bg-white rounded-[8px] shadow-[0_12px_32px_rgba(15,23,42,0.18)] w-[900px] max-w-[95vw] max-h-[94vh] flex flex-col font-sans relative overflow-hidden">

        {/* Header */}
        <div className="px-[20px] py-[10px] flex items-center justify-between border-b border-[#e2e8f0] bg-white z-20">
          <h2 className="text-[13px] font-bold text-[#19274a] tracking-[-0.4px]">Candidate Details</h2>

          <div className="flex items-center gap-[12px]">
            <div className="flex items-center gap-[4px]">
              <button
                onClick={onPrev}
                disabled={!onPrev}
                title="Previous candidate"
                className="w-[28px] h-[28px] rounded-[4px] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button
                onClick={onNext}
                disabled={!onNext}
                title="Next candidate"
                className="w-[28px] h-[28px] rounded-[4px] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div className="w-[1px] h-[20px] bg-[#e2e8f0]"></div>

            <button onClick={close} className="text-[#19274a] hover:bg-gray-100 p-[4px] rounded-full transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 bg-[#F8FAFC] overflow-y-auto">

          {/* Top Section Wrapper (White Background) */}
          <div className="bg-white px-[20px] pt-[12px] pb-[0px]">

            {/* Candidate Card */}
            <div className="flex items-start justify-between gap-[12px]">
              <div className="flex items-start gap-[16px] min-w-0">
                <div className="mt-[2px]">{avatar("w-[48px] h-[48px]", "rounded-full")}</div>

                <div className="mt-[2px] min-w-0">
                  <div className="flex items-center gap-[8px]">
                    <h3 className="text-[13px] font-bold text-[#19274a] leading-tight truncate">{c.name}</h3>
                    <div className={`px-[8px] py-[3px] rounded-[4px] text-[8.5px] font-bold border leading-none whitespace-nowrap ${tone.chip}`}>
                      {c.aiResult} ({c.aiScore}%)
                    </div>
                  </div>
                  <p className="text-[9.5px] font-bold text-[#19274a] leading-tight">
                    {c.position}
                    {c.department ? ` · ${c.department}` : ""}
                  </p>

                  <div className="grid grid-cols-2 gap-x-[24px] gap-y-[2px] mt-[4px]">
                    <div className="flex items-center gap-[6px] text-[8.5px] font-semibold">
                      <Briefcase size={12} className="text-[#293681]" strokeWidth={2.5} />
                      <span className="text-[#293681] font-bold">{dash(c.jobCode)}</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[8.5px] font-semibold">
                      <Calendar size={12} className="text-[#293681]" strokeWidth={2.5} />
                      <span className="text-[#293681] font-bold">{c.appliedOn ? `Applied on ${c.appliedOn}` : "—"}</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[8.5px] font-semibold">
                      <Phone size={12} className="text-[#1d4ed8]" strokeWidth={2.5} />
                      <span className="text-[#1d4ed8] font-bold">{dash(c.phone)}</span>
                    </div>
                    <div className="flex items-center gap-[24px] min-w-0">
                      <div className="flex items-center gap-[6px] text-[8.5px] font-semibold min-w-0">
                        <Mail size={12} className="text-[#1d4ed8] shrink-0" strokeWidth={2.5} />
                        <span className="text-[#1d4ed8] font-bold truncate">{dash(c.email)}</span>
                      </div>
                      {c.location && (
                        <div className="flex items-center gap-[6px] text-[8.5px] font-semibold whitespace-nowrap">
                          <MapPin size={12} className="text-[#293681]" strokeWidth={2.5} />
                          <span className="text-[#293681] font-bold">{c.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[6px] shrink-0">
                <button
                  onClick={onForwardToHr}
                  disabled={!onForwardToHr || !applied}
                  title={applied ? "Forward to HR" : "Only a CV check — no application yet"}
                  className={`${actionBtn} bg-[#15803d] text-white hover:bg-[#166534] shadow-sm`}
                >
                  <ArrowRight size={12} strokeWidth={3} />
                  Forward to HR
                </button>
                <button onClick={onDownloadCv} disabled={!onDownloadCv} className={outlineBtn}>
                  <Download size={12} strokeWidth={2.5} />
                  Download CV
                </button>
                <button
                  onClick={onAddNote}
                  disabled={!onAddNote || !applied}
                  title={applied ? "Add a note" : "Only a CV check — no application yet"}
                  className={outlineBtn}
                >
                  <FileText size={12} strokeWidth={2.5} />
                  Add Note
                </button>
                <button onClick={() => window.print()} className={outlineBtn}>
                  <Printer size={12} strokeWidth={2.5} />
                  Print
                </button>
              </div>
            </div>

            {/* Timeline Box */}
            <div className="mt-[10px] border border-[#E2E8F0] rounded-[6px] py-[8px] bg-[#FAFAFA]">
              <div className="relative flex justify-between items-start px-[24px]">
                {/* Connecting Line: solid up to the last completed step, dashed after */}
                <div className="absolute top-[8px] left-[45px] right-[45px] h-[2px] z-0 flex">
                  {timeline.slice(1).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 ${i < lastDone ? "bg-[#15803d]" : "border-t-[2px] border-dashed border-[#CBD5E1]"}`}
                    ></div>
                  ))}
                </div>

                {timeline.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    {step.done ? (
                      <div className="w-[16px] h-[16px] bg-[#15803d] rounded-full flex items-center justify-center text-white mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : i === lastDone + 1 ? (
                      <div className="w-[16px] h-[16px] bg-white border-[2px] border-[#1d4ed8] rounded-full flex items-center justify-center text-[#1d4ed8] mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                        <ArrowRight size={8} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-[16px] h-[16px] bg-white border-[3px] border-[#CBD5E1] rounded-full mb-[4px] shadow-[0_0_0_4px_#FAFAFA]"></div>
                    )}
                    <div className={`text-[8.5px] font-bold leading-tight whitespace-nowrap ${step.tone || (step.done ? "text-[#19274a]" : "text-[#64748b]")}`}>
                      {step.label}
                    </div>
                    <div className={`text-[7.5px] font-semibold mt-[2px] leading-tight whitespace-nowrap ${step.tone || (step.done ? "text-[#64748b]" : "text-[#94A3B8]")}`}>
                      {step.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-[10px] border-b border-[#e2e8f0] mt-[16px]">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-[9px] font-bold pb-[8px] px-[4px] transition-colors ${
                    tab === t ? "text-[#1d4ed8] border-b-2 border-[#1d4ed8]" : "text-[#64748b] hover:text-[#19274a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === "Overview" && (
            <div className="px-[20px] pb-[16px] pt-[8px] grid grid-cols-[1fr_1.15fr_0.85fr] gap-[10px]">
              {/* Column 1 */}
              <div className="flex flex-col gap-[10px] h-full">
                <div className={CARD}>
                  <h4 className={HEADING}>Application Details</h4>
                  <div className="space-y-[2px]">
                    <InfoRow icon={Briefcase} label="Job Position" value={c.position} />
                    <InfoRow icon={FileBadge2} label="Job Code" value={c.jobCode} />
                    <InfoRow icon={Calendar} label="Application Date" value={c.appliedOn} />
                    <InfoRow
                      icon={Clock}
                      label="Application Stage"
                      value={
                        <span className="inline-block bg-[#E9F2FF] text-[#1d4ed8] px-[8px] py-[3px] rounded-[4px] text-[7.5px] font-bold border border-[#D5E6FA]">
                          {c.stage}
                        </span>
                      }
                    />
                    <InfoRow icon={Award} label="Source" value="Career Page" />
                    <InfoRow
                      icon={Check}
                      label="Current Status (AI)"
                      value={
                        <span className={`inline-block px-[8px] py-[3px] rounded-[4px] text-[7.5px] font-bold border ${tone.chip}`}>
                          {c.aiResult} ({c.aiScore}%)
                        </span>
                      }
                    />
                  </div>
                </div>

                <div className={`${CARD} flex-1 flex flex-col`}>
                  <h4 className={HEADING}>Personal Information</h4>
                  <div className="flex-1 flex flex-col justify-between gap-[2px]">
                    <InfoRow icon={UserCircle} label="Full Name" value={c.name} />
                    <InfoRow icon={Mail} label="Email" value={c.email} />
                    <InfoRow icon={Phone} label="Mobile" value={c.phone} />
                    <InfoRow icon={MapPin} label="Location" value={c.location} />
                    <InfoRow icon={Check} label="Willing to Relocate" value={c.willingToRelocate} />
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-[10px] h-full">
                <div className={CARD}>
                  <h4 className={HEADING}>AI Analysis Result</h4>
                  <div className="flex items-start gap-[10px]">
                    <div className={`w-[48px] h-[48px] rounded-full border-[4px] ${tone.ring} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-[11px] font-extrabold ${tone.text}`}>{c.aiScore}%</span>
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-[9.5px] font-bold ${tone.text}`}>{c.aiResult} Match</h5>
                      <p className="text-[8.5px] font-semibold text-[#64748b] mt-[2px] leading-tight line-clamp-4">
                        {c.aiSummary || "No AI summary recorded."}
                      </p>
                      <button
                        onClick={() => setTab("AI Analysis")}
                        className="mt-[4px] px-[8px] py-[3px] border border-[#1d4ed8] text-[#1d4ed8] rounded-[4px] text-[8.5px] font-bold flex items-center gap-[4px] hover:bg-[#EEF4FF] transition-colors"
                      >
                        View Detailed Analysis
                        <ArrowRight size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={CARD}>
                  <h4 className={HEADING}>Key Skills</h4>
                  {(c.skills?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-[4px]">
                      {c.skills!.map((skill) => (
                        <span key={skill} className="bg-[#E6F8ED] text-[#148943] px-[8px] py-[4px] rounded-[4px] text-[8.5px] font-semibold whitespace-nowrap">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8.5px] font-semibold text-[#94A3B8]">No skills recorded.</p>
                  )}
                </div>

                <div className={`${CARD} flex-1`}>
                  <h4 className={HEADING}>Work Experience</h4>
                  <div className="space-y-[2px]">
                    <InfoRow icon={Calendar} iconClass="text-[#1d4ed8]" label="Total Experience" value={c.experience} />
                    <InfoRow icon={Briefcase} iconClass="text-[#1d4ed8]" label="Current Company" value={c.currentCompany} />
                    <InfoRow icon={BriefcaseBusiness} iconClass="text-[#1d4ed8]" label="Current Designation" value={c.currentDesignation} />
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-[10px] h-full">
                <div className={CARD}>
                  <h4 className={HEADING}>Candidate Photo</h4>
                  <div className="flex items-center gap-[8px]">
                    {avatar("w-[36px] h-[36px]", "rounded-[4px]")}
                    {showAvatar ? (
                      <a href={c.avatarUrl} download={`${c.name}-photo`} className="flex items-center gap-[4px] text-[#1d4ed8] text-[8.5px] font-bold hover:underline">
                        <Download size={12} />
                        Download Photo
                      </a>
                    ) : (
                      <span className="text-[8.5px] font-semibold text-[#94A3B8]">No photo added</span>
                    )}
                  </div>
                </div>

                <div className={CARD}>
                  <h4 className={HEADING}>Compensation &amp; Availability</h4>
                  <div className="space-y-[2px]">
                    <InfoRow icon={Calendar} label="Current CTC" value={c.currentCtc} />
                    <InfoRow icon={Calendar} label="Expected CTC" value={c.expectedCtc} />
                    <InfoRow icon={Clock} label="Notice Period" value={c.noticePeriod} />
                  </div>
                </div>

                <div className={`${CARD} flex-1 flex flex-col`}>
                  <h4 className={HEADING}>Why Interested</h4>
                  <p className="text-[8.5px] font-semibold text-[#19274a] leading-snug whitespace-pre-line">
                    {c.whyInterested || <span className="text-[#94A3B8]">The candidate didn&apos;t add an answer.</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "Application Form" && (
            <div className="px-[20px] pb-[16px] pt-[8px] grid grid-cols-2 gap-[10px]">
              <div className={CARD}>
                <h4 className={HEADING}>Submitted Details</h4>
                <div className="space-y-[2px]">
                  <InfoRow icon={UserCircle} label="Full Name" value={c.name} />
                  <InfoRow icon={Mail} label="Email" value={c.email} />
                  <InfoRow icon={Phone} label="Mobile" value={c.phone} />
                  <InfoRow icon={MapPin} label="Location" value={c.location} />
                  <InfoRow icon={Calendar} label="Total Experience" value={c.experience} />
                  <InfoRow icon={Briefcase} label="Current Company" value={c.currentCompany} />
                  <InfoRow icon={BriefcaseBusiness} label="Designation" value={c.currentDesignation} />
                  <InfoRow icon={Calendar} label="Expected CTC" value={c.expectedCtc} />
                  <InfoRow icon={Clock} label="Notice Period" value={c.noticePeriod} />
                  <InfoRow icon={Check} label="Willing to Relocate" value={c.willingToRelocate} />
                </div>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className={CARD}>
                  <h4 className={HEADING}>Why Interested</h4>
                  <p className="text-[8.5px] font-semibold text-[#19274a] whitespace-pre-line">{dash(c.whyInterested)}</p>
                </div>
                <div className={CARD}>
                  <h4 className={HEADING}>Notes</h4>
                  <p className="text-[8.5px] font-semibold text-[#19274a] whitespace-pre-line">{c.notes || "No notes yet."}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "AI Analysis" && (
            <div className="px-[20px] pb-[16px] pt-[8px] grid grid-cols-2 gap-[10px]">
              <div className={`${CARD} col-span-2`}>
                <h4 className={HEADING}>Summary</h4>
                <p className="text-[8.5px] font-semibold text-[#19274a] leading-snug">{c.aiSummary || "No AI summary recorded."}</p>
              </div>
              <div className={CARD}>
                <h4 className={HEADING}>Strengths</h4>
                {(c.strengths?.length ?? 0) > 0 ? (
                  <ul className="list-disc list-inside space-y-[2px] text-[8.5px] font-semibold text-[#15803d]">
                    {c.strengths!.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p className="text-[8.5px] font-semibold text-[#94A3B8]">None recorded.</p>
                )}
              </div>
              <div className={CARD}>
                <h4 className={HEADING}>Gaps</h4>
                {(c.gaps?.length ?? 0) > 0 ? (
                  <ul className="list-disc list-inside space-y-[2px] text-[8.5px] font-semibold text-[#c62828]">
                    {c.gaps!.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p className="text-[8.5px] font-semibold text-[#94A3B8]">None recorded.</p>
                )}
              </div>
            </div>
          )}

          {tab === "CV Preview" && (
            <div className="px-[20px] pb-[16px] pt-[8px]">
              <div className={`${CARD} flex items-center justify-between`}>
                <div className="flex items-center gap-[8px] min-w-0">
                  <FileText size={18} className="text-[#1d4ed8] shrink-0" />
                  <span className="text-[9px] font-bold text-[#19274a] truncate">{c.cvFileName || "Candidate CV"}</span>
                </div>
                <button onClick={onDownloadCv} disabled={!onDownloadCv} className={outlineBtn}>
                  <Download size={12} strokeWidth={2.5} />
                  Open CV
                </button>
              </div>
            </div>
          )}

          {tab === "HR Status" && (
            <div className="px-[20px] pb-[16px] pt-[8px]">
              <div className={CARD}>
                <h4 className={HEADING}>HR Status</h4>
                <div className="space-y-[2px]">
                  <InfoRow icon={ShieldCheck} label="Current Status" value={c.hrStatus} />
                  <InfoRow icon={Clock} label="Last Updated" value={c.updatedByHrOn || "Not updated by HR yet"} />
                </div>
                {!applied && (
                  <p className="mt-[6px] text-[8.5px] font-semibold text-[#b45309]">
                    This candidate only checked their CV and hasn&apos;t applied yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "Activity Log" && (
            <div className="px-[20px] pb-[16px] pt-[8px]">
              <div className={CARD}>
                <h4 className={HEADING}>Activity Log</h4>
                {activity.length === 0 ? (
                  <div className="border-l-2 border-[#1d4ed8] pl-[8px] py-[2px]">
                    <p className="text-[8.5px] font-bold text-[#19274a]">{applied ? "Application received" : "CV checked by AI"}</p>
                    <p className="text-[7.5px] font-semibold text-[#94A3B8]">{c.appliedOn}</p>
                  </div>
                ) : (
                  <div className="space-y-[6px]">
                    {activity.map((a) => (
                      <div key={a.id} className="border-l-2 border-[#1d4ed8] pl-[8px] py-[2px] flex items-start gap-[6px]">
                        <MessageSquareText size={11} className="text-[#1d4ed8] mt-[1px] shrink-0" />
                        <div>
                          <p className="text-[8.5px] font-bold text-[#19274a]">{a.title}</p>
                          <p className="text-[7.5px] font-semibold text-[#94A3B8]">
                            {a.when}
                            {a.by ? ` • ${a.by}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
