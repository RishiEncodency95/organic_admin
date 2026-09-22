"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
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

/* Rich Editor matching 3 columns in Section 3 */
function RichEditorBlock({
  label,
  required = false,
  defaultValue = "",
  charCount = "0/2000"
}: {
  label: string;
  required?: boolean;
  defaultValue?: string;
  charCount?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, arg: string = "") => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col min-w-0">
      <label className="mb-1 text-[11px] font-bold text-[#1e293b]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
          <button type="button" onClick={() => exec("createLink", prompt("Enter URL") || "")} className="px-1 py-0.5 text-[10px] hover:bg-slate-200 rounded">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" /></svg>
          </button>
        </div>
        {/* Editable content area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="h-[120px] overflow-y-auto p-2 text-[10.5px] leading-relaxed text-[#334155] outline-none"
          dangerouslySetInnerHTML={{ __html: defaultValue }}
        />
      </div>
      <div className="mt-0.5 text-right text-[9.5px] font-medium text-[#94a3b8]">{charCount}</div>
    </div>
  );
}

export default function CreateJobPage() {
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
  const [reqSkills, setReqSkills] = useState([
    "B2B Sales",
    "Exhibition Sales",
    "Sponsorship Sales",
    "Lead Generation",
    "Client Meetings",
    "Negotiation",
    "Deal Closure",
    "CRM",
  ]);

  // Preferred Skills List
  const [prefSkills, setPrefSkills] = useState([
    "Key Account Management",
    "Revenue Generation",
    "Market Research",
    "Industry Networking",
    "Presentation Skills",
    "Relationship Management",
  ]);

  // Industry Segments List
  const [segments, setSegments] = useState([
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

  return (
    <div className="flex h-[calc(100vh-60px)] w-full flex-col bg-[#f8fafc] text-[#0f172a] overflow-hidden font-sans">
      {/* PAGE HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-2 shadow-2xs">
        <div>
          <h1 className="text-[18px] font-bold text-[#0f172a] tracking-tight">Add New Job</h1>
          <p className="text-[10.5px] font-medium text-[#64748b]">Complete all details to create and publish the job on your careers page.</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold italic text-[#15803d]">Together for a Healthier</div>
          <div className="flex items-center justify-end gap-1 text-[11px] font-bold italic text-[#15803d]">
            Greener Tomorrow
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 6-2 8-4s2.5-3.5 2.5-5a2.5 2.5 0 00-2.5-2.5c-.17 0-.34.02-.5.05V8z" /></svg>
          </div>
        </div>
      </div>

      {/* STEP TABS HEADER */}
      <div className="flex shrink-0 gap-3 border-b border-[#e2e8f0] bg-[#f1f5f9] px-5 py-1.5">
        {/* Tab 1 Active */}
        <div className="flex items-center gap-2 rounded-[6px] border border-[#2563eb] bg-[#2563eb] px-3 py-1.5 text-white shadow-2xs">
          <div className="grid h-5 w-5 place-items-center rounded-[4px] bg-white/20">
            <FileText className="h-3 w-3 text-white" />
          </div>
          <div>
            <div className="text-[11px] font-bold leading-tight">Job Information</div>
            <div className="text-[9px] font-medium text-blue-100">Job details, description, requirements, questions</div>
          </div>
        </div>

        {/* Tab 2 Inactive */}
        <div className="flex items-center gap-2 rounded-[6px] border border-[#cbd5e1] bg-white px-3 py-1.5 text-[#475569] hover:bg-slate-50">
          <div className="grid h-5 w-5 place-items-center rounded-[4px] bg-[#eff6ff] text-[#2563eb]">
            <Eye className="h-3 w-3" />
          </div>
          <div>
            <div className="text-[11px] font-bold leading-tight text-[#1e293b]">Preview & Publish</div>
            <div className="text-[9px] font-medium text-[#64748b]">Review and publish on website</div>
          </div>
        </div>
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
                <input type="text" defaultValue="Sales Manager – Domestic Exhibition Sales & Sponsorships" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Designation <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Sales Manager – Domestic Exhibition Sales & Sponsorships" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Company <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Namo Gange Wellness Pvt. Ltd." className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Project / Event <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Bharat Organic Expo" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Department <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Domestic Exhibition Sales" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Reporting To <span className="text-red-500">*</span></label>
                <input type="text" defaultValue="Business Head – Exhibitions" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#2563eb]" />
              </div>

              <div className="grid grid-cols-4 gap-2 col-span-2">
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Job Code</label>
                  <input type="text" defaultValue="BOE-SALES-001" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">No. of Positions <span className="text-red-500">*</span></label>
                  <input type="number" defaultValue={2} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Employment Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select defaultValue="Full Time" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>Full Time</option>
                      <option>Part Time</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Work Mode <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select defaultValue="On-site" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 col-span-2">
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Location <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select defaultValue="Delhi NCR" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>Delhi NCR</option>
                      <option>Mumbai</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Experience (Years) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1">
                    <input type="number" defaultValue={3} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-1.5 text-center text-[10.5px] font-semibold" />
                    <span className="text-[10px] font-medium text-slate-500">to</span>
                    <input type="number" defaultValue={6} className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-1.5 text-center text-[10.5px] font-semibold" />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Education <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select defaultValue="Graduate" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                      <option>Graduate</option>
                      <option>Post Graduate</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Preferred Education</label>
                  <input type="text" defaultValue="MBA/PGDM – Sales & Marketing" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none" />
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
                  <input type="text" defaultValue="40,000" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-semibold" />
                  <span className="text-[10px] font-medium text-slate-500">to</span>
                  <input type="text" defaultValue="50,000" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-semibold" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Salary Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select defaultValue="CTC (Cost to Company)" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
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
                  <select defaultValue="Performance Based" className="h-[30px] w-full appearance-none rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-semibold text-[#1e293b] outline-none">
                    <option>Performance Based</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: JOB DESCRIPTION */}
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
                label="About Project / Company"
                required
                defaultValue={`<ul><li>Bharat Organic Expo is a B2B exhibition platform connecting manufacturers, brands, suppliers, buyers, government bodies, industry associations and professionals across the organic and allied industries.</li></ul><p><br>The exhibition covers:<br>• Organic Food & Nutrition<br>• AYUSH, Herbal & Wellness<br>• Organic Agriculture<br>• Natural Living & Personal Care<br>• GreenTech & Sustainability</p>`}
                charCount="0/2000"
              />

              <RichEditorBlock
                label="Role Objective"
                required
                defaultValue={`<p>The Sales Manager – Domestic Exhibition Sales & Sponsorships will be responsible for generating business from the Indian market through exhibition stall/space sales, exhibitor acquisition and sponsorship sales for Bharat Organic Expo.<br><br>The candidate will manage the complete sales cycle from lead generation and client meetings to proposal, negotiation, booking and payment realization.</p>`}
                charCount="0/2000"
              />

              <div>
                <RichEditorBlock
                  label="Key Responsibilities"
                  required
                  defaultValue={`<ul><li>Generate revenue through domestic exhibition stall/space sales and sponsorship sales.</li><li>Identify and acquire prospective exhibitors from across India.</li><li>Develop business across target segments.</li><li>Generate qualified leads through databases, calling, email, LinkedIn, references.</li><li>Present participation opportunities to prospective exhibitors.</li></ul>`}
                  charCount="0/2000"
                />
                <button type="button" className="mt-0.5 text-[10.5px] font-bold text-[#2563eb] hover:underline">+ Add More Points</button>
              </div>
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

            <div className="grid grid-cols-2 gap-3">
              {/* Left Box: Required & Preferred Skills */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Required Skills <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white p-1.5 min-h-[36px]">
                    {reqSkills.map((sk, idx) => (
                      <SkillPill key={sk} label={sk} onRemove={() => setReqSkills(reqSkills.filter((_, i) => i !== idx))} />
                    ))}
                    <AddPillButton onClick={() => { const s = prompt("Add skill:"); if (s) setReqSkills([...reqSkills, s]); }} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Preferred Skills</label>
                  <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-[#cbd5e1] bg-white p-1.5 min-h-[36px]">
                    {prefSkills.map((sk, idx) => (
                      <SkillPill key={sk} label={sk} onRemove={() => setPrefSkills(prefSkills.filter((_, i) => i !== idx))} />
                    ))}
                    <AddPillButton onClick={() => { const s = prompt("Add skill:"); if (s) setPrefSkills([...prefSkills, s]); }} />
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
                    <AddPillButton label="+ Add Segment" onClick={() => { const s = prompt("Add segment:"); if (s) setSegments([...segments, s]); }} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold text-[#1e293b]">Specific Experience (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Direct exhibition / trade show sales experience preferred"
                    className="h-[32px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2.5 text-[10.5px] font-medium text-[#334155] outline-none"
                  />
                  <div className="mt-0.5 text-right text-[9.5px] font-medium text-[#94a3b8]">0/300</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="flex w-[290px] shrink-0 flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>

          {/* CARD 1: APPLICATION & AI SCREENING */}
          <div className="rounded-[8px] border border-[#cbd5e1] bg-white p-3 shadow-2xs">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-[#2563eb] text-white">
                <FileText className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-[11.5px] font-bold text-[#0f172a]">Application & AI Screening</h3>
                <p className="text-[9px] font-medium text-[#64748b]">Set application form and screening rules.</p>
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
                <input type="number" defaultValue={50} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-bold text-[#1e293b]" />
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Partial Match Range (%) <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1.5">
                  <input type="number" defaultValue={50} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-bold" />
                  <span className="text-[10px] font-medium text-slate-500">to</span>
                  <input type="number" defaultValue={69} className="h-[28px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-center text-[10.5px] font-bold" />
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
                  <input type="text" defaultValue="17 Sep 2026" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 pr-7 text-[10.5px] font-semibold text-[#1e293b]" />
                  <Calendar className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Application Closing Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" defaultValue="17 Oct 2026" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 pr-7 text-[10.5px] font-semibold text-[#1e293b]" />
                  <Calendar className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold text-[#1e293b]">Tags (Optional)</label>
                <input type="text" placeholder="e.g. Sales, Exhibition, Delhi NCR" className="h-[30px] w-full rounded-[5px] border border-[#cbd5e1] bg-white px-2 text-[10.5px] font-medium text-[#334155] outline-none" />
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
          <button type="button" className="h-[32px] rounded-[5px] border border-[#cbd5e1] bg-white px-3.5 text-[11px] font-bold text-[#334155] hover:bg-slate-50 transition-colors">
            Save as Draft
          </button>

          <button type="button" className="h-[32px] rounded-[5px] border border-[#cbd5e1] bg-white px-3.5 text-[11px] font-bold text-[#334155] hover:bg-slate-50 transition-colors">
            Preview Job
          </button>

          <button type="button" className="flex h-[32px] items-center gap-1.5 rounded-[5px] bg-[#059669] px-4 text-[11px] font-bold text-white hover:bg-[#047857] transition-colors shadow-2xs">
            Publish Job
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
