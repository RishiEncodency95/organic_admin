import React, { useState } from "react";
import {
  X, Briefcase, Calendar, MapPin, HelpCircle,
  FileText, Upload, PieChart, ClipboardList, Info, Send, ChevronDown
} from "lucide-react";

// People the application can be forwarded to.
export const HR_RECIPIENTS = ["HR Team (General)", "Srujana Paidi (CHRO)", "Vijay Sharma (CHRO)"];

// Parts of the application the admin can choose to share (names match the backend list).
const SHARE_OPTIONS = [
  { label: "Application Form Details", icon: <FileText size={14} className="text-[#16A34A]" />, bg: "bg-[#DCFCE7]" },
  { label: "Uploaded CV (Resume)", icon: <Upload size={14} className="text-[#2563EB]" />, bg: "bg-[#E8F1FF]" },
  { label: "AI Analysis Result", icon: <PieChart size={14} className="text-[#06B6D4]" />, bg: "bg-[#CFFAFE]" },
  { label: "Screening Questions & Answers", icon: <ClipboardList size={14} className="text-[#2563EB]" />, bg: "bg-[#E8F1FF]" },
];
const ALL_SHARE = SHARE_OPTIONS.map((o) => o.label);

export interface ForwardToHRCandidate {
  name: string;
  avatarUrl?: string; // already resolved to a usable URL
  position: string;
  department?: string;
  jobCode?: string;
  experience?: string;
  location?: string;
  appliedOn?: string;
  aiScore: number;
  aiResult: string;
  aiSummary?: string;
}

interface ForwardToHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Without a candidate (e.g. opened from the sidebar shortcut) the form can't be submitted.
  candidate?: ForwardToHRCandidate | null;
  onSubmit?: (data: { recipients: string[]; note: string; share: string[] }) => Promise<void>;
}

const NOTE_LIMIT = 500;

const resultTone = (result: string) =>
  result === "Eligible"
    ? { ring: "border-[#16A34A]", text: "text-[#16A34A]", chip: "bg-[#DCFCE7] text-[#16A34A]" }
    : result === "Partial Match"
    ? { ring: "border-[#D97706]", text: "text-[#B45309]", chip: "bg-[#FEF3C7] text-[#B45309]" }
    : { ring: "border-[#DC2626]", text: "text-[#DC2626]", chip: "bg-[#FEE2E2] text-[#DC2626]" };

export default function ForwardToHRModal({ isOpen, onClose, candidate, onSubmit }: ForwardToHRModalProps) {
  const [recipients, setRecipients] = useState<string[]>(HR_RECIPIENTS);
  const [share, setShare] = useState<string[]>(ALL_SHARE);
  const [note, setNote] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  if (!isOpen) return null;

  const tone = resultTone(candidate?.aiResult || "");
  const remaining = HR_RECIPIENTS.filter((r) => !recipients.includes(r));
  const canSubmit = !!candidate && !!onSubmit && recipients.length > 0 && share.length > 0 && !submitting;
  const initials =
    (candidate?.name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";

  const close = () => {
    if (submitting) return;
    setNote("");
    setRecipients(HR_RECIPIENTS);
    setShare(ALL_SHARE);
    setPickerOpen(false);
    setAvatarFailed(false);
    onClose();
  };

  const submit = async () => {
    if (!canSubmit || !onSubmit) return;
    setSubmitting(true);
    try {
      // Keep the option order stable regardless of the order they were ticked in.
      await onSubmit({ recipients, note: note.trim(), share: ALL_SHARE.filter((x) => share.includes(x)) });
      setNote("");
      setRecipients(HR_RECIPIENTS);
      setShare(ALL_SHARE);
      setPickerOpen(false);
      setAvatarFailed(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[780px] bg-white rounded-[16px] shadow-2xl flex flex-col relative" style={{ maxHeight: '98vh' }}>

        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-[16px] right-[16px] z-20 text-gray-500 hover:text-black hover:bg-gray-100 p-[4px] rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="relative border-b border-[#E1E6EC] bg-[#FCFCFD]">
          {/* Specific area for f_w_h.png on the right */}
          <div
            className="absolute top-0 right-0 h-full w-[350px] bg-contain bg-right bg-no-repeat pointer-events-none"
            style={{ backgroundImage: "url('/f_w_h.png')" }}
          ></div>

          <div className="flex items-center p-[12px] px-[16px] relative z-10">
            <div className="w-[36px] h-[36px] rounded-full bg-[#16A34A] flex items-center justify-center text-white mr-[10px] flex-shrink-0">
              <Send size={18} className="ml-[-1px] mt-[1px]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#172762] mb-[1px]">Forward to HR</h2>
              <p className="text-[11px] font-medium text-[#506083]">Send this candidate to HR for further review and hiring process.</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-[12px] flex flex-col gap-[10px] overflow-y-auto">

          {/* Candidate Profile Card */}
          {candidate ? (
            <div className="bg-white border border-[#E1E6EC] rounded-[10px] p-[10px] flex items-center gap-[12px]">
              <div className="w-[46px] h-[46px] rounded-full bg-[#e8f5e9] flex-shrink-0 overflow-hidden flex items-center justify-center text-[#1b5e20] font-bold text-[13px]">
                {candidate.avatarUrl && !avatarFailed ? (
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    onError={() => setAvatarFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-[#172762] leading-tight mb-[2px]">{candidate.name}</h3>
                <p className="text-[10px] font-semibold text-[#172762] mb-[4px]">
                  {candidate.position}
                  {candidate.department ? ` · ${candidate.department}` : ""}
                </p>

                <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[2px]">
                  {candidate.jobCode && (
                    <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                      <Briefcase size={10} />
                      {candidate.jobCode}
                    </div>
                  )}
                  {candidate.experience && (
                    <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                      <Calendar size={10} />
                      {candidate.experience} Exp
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                      <MapPin size={10} />
                      {candidate.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-[12px] mt-[2px]">
                  {candidate.appliedOn && (
                    <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                      <Calendar size={10} />
                      Applied on {candidate.appliedOn}
                    </div>
                  )}
                  <div className="text-[9px] font-semibold text-[#506083] border-l border-[#E1E6EC] pl-[12px]">
                    Source: Career Page
                  </div>
                </div>
              </div>

              {/* AI Score */}
              <div className="flex items-center gap-[10px] pl-[12px] border-l border-[#E1E6EC]">
                <div className={`w-[64px] h-[64px] rounded-full border-[5px] ${tone.ring} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-[18px] font-black ${tone.text}`}>{candidate.aiScore}%</span>
                </div>
                <div className="max-w-[180px]">
                  <div className={`inline-block px-[6px] py-[2px] ${tone.chip} text-[9px] font-bold rounded-[4px] mb-[2px]`}>
                    {candidate.aiResult}
                  </div>
                  {candidate.aiSummary && (
                    <p className="text-[8px] font-medium text-[#506083] leading-tight line-clamp-4">{candidate.aiSummary}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[10px] p-[10px] text-[11px] font-semibold text-[#C2410C]">
              Select a candidate in Applications &amp; AI Response, then use &quot;Forward to HR&quot; there.
            </div>
          )}

          {/* Form Steps */}
          <div className="flex flex-col gap-[6px]">

            {/* Step 1 */}
            <div className="flex gap-[10px]">
              <div className="w-[20px] h-[20px] rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-[2px]">1</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#172762]">Select HR Recipient(s) <span className="text-[#DC2626]">*</span></h4>
                    <p className="text-[8px] font-medium text-[#506083]">Choose HR team members who should receive this application.</p>
                  </div>
                  <div className="flex items-center gap-[4px] max-w-[300px]">
                    <HelpCircle size={14} className="text-[#2563EB] flex-shrink-0" />
                    <p className="text-[8px] font-medium text-[#506083] leading-tight">HR recipients will receive complete candidate details, including CV, application and AI analysis.</p>
                  </div>
                </div>

                {/* Select Input */}
                <div className="relative">
                  <div
                    onClick={() => remaining.length > 0 && setPickerOpen((v) => !v)}
                    className={`border rounded-[6px] p-[4px] pr-[26px] flex flex-wrap items-center gap-[4px] bg-white cursor-pointer transition-colors min-h-[28px] ${
                      recipients.length === 0 ? "border-[#DC2626]" : "border-[#2563EB] hover:border-[#1d4ed8]"
                    }`}
                  >
                    {recipients.length === 0 && (
                      <span className="text-[10px] font-medium text-[#94a3b8] px-[4px]">Select at least one HR recipient</span>
                    )}
                    {recipients.map((r) => (
                      <div key={r} className="flex items-center gap-[4px] bg-[#E8F1FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[10px] font-bold border border-[#D5E6FA]">
                        {r}
                        <X
                          size={10}
                          className="cursor-pointer hover:text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecipients((prev) => prev.filter((x) => x !== r));
                          }}
                        />
                      </div>
                    ))}
                    <ChevronDown size={14} className="text-[#506083] absolute right-[8px] top-1/2 -translate-y-1/2" />
                  </div>
                  {pickerOpen && remaining.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-[2px] z-30 bg-white border border-[#E1E6EC] rounded-[6px] shadow-lg py-[2px]">
                      {remaining.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setRecipients((prev) => [...prev, r]);
                            setPickerOpen(false);
                          }}
                          className="block w-full text-left px-[8px] py-[4px] text-[10px] font-semibold text-[#172762] hover:bg-[#E8F1FF]"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-[10px]">
              <div className="w-[20px] h-[20px] rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-[2px]">2</div>
              <div className="flex-1">
                <div className="mb-[4px] flex justify-between items-end">
                  <div>
                    <h4 className="text-[11px] font-semibold text-[#172762]">Add a Note to HR <span className="text-[#506083] font-normal">(Optional)</span></h4>
                    <p className="text-[8px] font-medium text-[#506083]">You can add any specific information or recommendation for the HR team.</p>
                  </div>
                  <div className="text-[8px] font-medium text-[#506083]">{note.length}/{NOTE_LIMIT}</div>
                </div>

                {/* Textarea */}
                <textarea
                  value={note}
                  maxLength={NOTE_LIMIT}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-[#E1E6EC] rounded-[6px] p-[6px] text-[10px] font-medium text-[#172762] resize-none outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] min-h-[40px]"
                  placeholder="Add a note for HR (e.g. why forwarding, key strengths, specific skills, etc.)"
                ></textarea>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-[10px]">
              <div className="w-[20px] h-[20px] rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-[2px]">3</div>
              <div className="flex-1">
                <div className="mb-[4px]">
                  <h4 className="text-[11px] font-semibold text-[#172762]">What to Share with HR <span className="text-[#DC2626]">*</span></h4>
                  <p className={`text-[8px] font-medium ${share.length === 0 ? "text-[#DC2626]" : "text-[#506083]"}`}>
                    {share.length === 0
                      ? "Tick at least one item to share with HR."
                      : "Only the ticked information will be shared with the selected HR team members."}
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-4 gap-[6px]">
                  {SHARE_OPTIONS.map((card) => {
                    const checked = share.includes(card.label);
                    return (
                      <button
                        type="button"
                        key={card.label}
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() =>
                          setShare((prev) =>
                            prev.includes(card.label) ? prev.filter((x) => x !== card.label) : [...prev, card.label]
                          )
                        }
                        className={`rounded-[6px] p-[6px] relative border transition-colors cursor-pointer ${
                          checked ? "border-[#16A34A] bg-[#F4FAF6]" : "border-[#E1E6EC] bg-white opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div
                          className={`absolute top-[4px] right-[4px] w-[12px] h-[12px] rounded-full flex items-center justify-center ${
                            checked ? "bg-[#16A34A]" : "border border-[#CBD5E1] bg-white"
                          }`}
                        >
                          {checked && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col items-center text-center gap-[4px]">
                          <div className={`w-[24px] h-[24px] rounded-[4px] ${card.bg} flex items-center justify-center`}>
                            {card.icon}
                          </div>
                          <span className="text-[9px] font-bold text-[#172762] leading-tight">{card.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-[6px] flex items-start gap-[6px]">
              <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[2px]">
                <Info size={10} />
              </div>
              <p className="text-[9px] font-medium text-[#1E3A8A] leading-relaxed">
                After forwarding, this candidate will be marked as &quot;Sent to HR&quot; and HR will be able to view all details. Any status updates by HR will be visible in the applications list.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#E1E6EC] p-[10px] px-[16px] bg-[#F8FAFC] flex items-center justify-between rounded-b-[16px]">
          <button
            onClick={close}
            disabled={submitting}
            className="px-[16px] py-[6px] bg-white border border-[#E1E6EC] text-[#172762] text-[12px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="px-[16px] py-[6px] bg-[#148943] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#117639] transition-colors flex items-center gap-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={12} className="ml-[-2px]" />
            {submitting ? "Forwarding..." : "Forward to HR"}
          </button>
        </div>

      </div>
    </div>
  );
}
