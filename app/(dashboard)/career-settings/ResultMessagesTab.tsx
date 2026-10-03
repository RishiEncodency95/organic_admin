import React, { useEffect, useRef, useState } from "react";
import {
  MessageSquare, Lightbulb, ChevronDown, CheckCircle,
  Eye, Info, AlertTriangle, Star, ArrowRight, Save, CircleDot
} from "lucide-react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import HRWorkflowTab from "./HRWorkflowTab";

type MessageType = "eligible" | "partial" | "notEligible" | "incomplete";
type Channel = "Web Page Message" | "Email Template" | "SMS Template" | "WhatsApp Template";
const CHANNELS: Channel[] = ["Web Page Message", "Email Template", "SMS Template", "WhatsApp Template"];
const CHANNEL_FIELD: Record<Exclude<Channel, "Web Page Message">, "email" | "sms" | "whatsapp"> = {
  "Email Template": "email",
  "SMS Template": "sms",
  "WhatsApp Template": "whatsapp",
};

interface ResultMessage {
  active: boolean;
  title: string;
  subtitle: string;
  web: string;
  email: string;
  sms: string;
  whatsapp: string;
}

type Messages = Record<MessageType, ResultMessage> & { supportEmail: string; supportPhone: string };

// One card per result the careers eligibility page can show.
const TYPES: {
  key: MessageType;
  label: string;
  hint: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  { key: "eligible", label: "Eligible (Pass)", hint: "Shown to candidates with a strong match (70% and above).", color: "#16A34A", icon: <Star size={14} /> },
  { key: "partial", label: "Partial Match", hint: "Shown to candidates close to the requirements (50–69%).", color: "#D97706", icon: <CircleDot size={14} /> },
  { key: "notEligible", label: "Not Eligible (Fail)", hint: "Shown to candidates below 50%.", color: "#DC2626", icon: <AlertTriangle size={14} /> },
  { key: "incomplete", label: "Incomplete Application", hint: "For candidates who have not completed the application.", color: "#2563EB", icon: <Info size={14} /> },
];

const VARIABLES = [
  { name: "{{candidate_name}}", desc: "Candidate's full name", sample: "Vansh Chaudhary" },
  { name: "{{first_name}}", desc: "Candidate's first name", sample: "Vansh" },
  { name: "{{job_title}}", desc: "Job position title", sample: "Full Stack Developer" },
  { name: "{{company_name}}", desc: "Bharat Organic Expo", sample: "Bharat Organic Expo" },
  { name: "{{current_ctc}}", desc: "Candidate's current CTC (if provided)", sample: "₹45,000 / month" },
  { name: "{{expected_ctc}}", desc: "Candidate's expected CTC (if provided)", sample: "₹55,000 / month" },
  { name: "{{total_experience}}", desc: "Total work experience", sample: "3 Years" },
  { name: "{{current_location}}", desc: "Candidate's current location", sample: "Delhi NCR" },
  { name: "{{application_link}}", desc: "Link to continue application", sample: "https://bharatorganicexpo.com/careers" },
  { name: "{{support_email}}", desc: "Support email (below)", sample: "" },
  { name: "{{support_phone}}", desc: "Support phone (below)", sample: "" },
];

const fillSample = (text: string, m: Messages) =>
  VARIABLES.reduce((out, v) => {
    const value = v.name === "{{support_email}}" ? m.supportEmail : v.name === "{{support_phone}}" ? m.supportPhone : v.sample;
    return out.split(v.name).join(value);
  }, text);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${checked ? "bg-[#148943]" : "bg-[#E1E6EC]"}`}
  >
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? "translate-x-[10px]" : "translate-x-0"}`} />
  </button>
);

const EditorTabs = ({ activeTab, onChange }: { activeTab: Channel; onChange: (tab: Channel) => void }) => (
  <div className="flex mb-[8px] border-b border-[#E1E6EC]">
    {CHANNELS.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={`flex-1 text-center pb-[4px] text-[8.5px] font-bold transition-colors relative ${
          activeTab === tab ? "text-[#172762]" : "text-[#506083] hover:text-[#172762]"
        }`}
      >
        {tab}
        {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2563EB]" />}
      </button>
    ))}
  </div>
);

const inputCls =
  "w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[8.5px] font-medium text-[#172762] outline-none focus:border-[#2563EB] bg-white";

function MessageCard({
  type,
  value,
  onChange,
}: {
  type: (typeof TYPES)[number];
  value: ResultMessage;
  onChange: (patch: Partial<ResultMessage>) => void;
}) {
  const [channel, setChannel] = useState<Channel>("Web Page Message");
  // Last focused field, so "Insert Variable" drops the variable at the cursor.
  const lastField = useRef<{ field: keyof ResultMessage; el: HTMLInputElement | HTMLTextAreaElement } | null>(null);

  const bodyField: keyof ResultMessage = channel === "Web Page Message" ? "web" : CHANNEL_FIELD[channel];

  const insertVariable = (variable: string) => {
    const target = lastField.current;
    const field = target?.field ?? bodyField;
    const current = String(value[field] ?? "");
    const el = target?.el;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    onChange({ [field]: current.slice(0, start) + variable + current.slice(end) } as Partial<ResultMessage>);
  };

  // Called from onFocus handlers only, never during render.
  const remember = (field: keyof ResultMessage, el: HTMLInputElement | HTMLTextAreaElement) => {
    lastField.current = { field, el };
  };

  return (
    <div className={`bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden ${value.active ? "" : "opacity-70"}`}>
      <div className="p-[8px] flex items-center justify-between border-b border-[#E1E6EC] bg-[#F8FAFC]">
        <div className="flex items-center gap-[8px]">
          <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white shadow-sm" style={{ background: type.color }}>
            {type.icon}
          </div>
          <div>
            <h3 className="text-[11px] font-bold" style={{ color: type.key === "eligible" ? "#172762" : type.color }}>
              {type.label}
            </h3>
            <p className="text-[8px] font-semibold text-[#506083]">{type.hint}</p>
          </div>
        </div>
        <div className="flex items-center gap-[6px]">
          <span className={`text-[9px] font-bold ${value.active ? "text-[#16A34A]" : "text-[#94A3B8]"}`}>
            {value.active ? "Active" : "Off"}
          </span>
          <Toggle checked={value.active} onChange={() => onChange({ active: !value.active })} />
        </div>
      </div>
      <div className="p-[8px]">
        <EditorTabs
          activeTab={channel}
          onChange={(c) => {
            setChannel(c);
            lastField.current = null;
          }}
        />
        <div className="border border-[#E1E6EC] rounded-[4px] overflow-hidden">
          <div className="bg-[#F8FAFC] border-b border-[#E1E6EC] p-[4px] flex items-center justify-between">
            <span className="px-[4px] text-[8px] font-semibold text-[#506083]">
              {channel === "Web Page Message" ? "Shown on the careers eligibility result" : `Saved ${channel.toLowerCase()}`}
            </span>
            <div className="relative">
              <select
                value=""
                onChange={(e) => e.target.value && insertVariable(e.target.value)}
                className="border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#2563EB] appearance-none outline-none bg-white pr-[20px] cursor-pointer"
              >
                <option value="">Insert Variable</option>
                {VARIABLES.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#2563EB] pointer-events-none" />
            </div>
          </div>
          <div className="p-[8px] space-y-[6px]">
            {channel === "Web Page Message" && (
              <>
                <div>
                  <label className="block text-[8px] font-bold text-[#506083] mb-[2px]">Heading</label>
                  <input value={value.title} onFocus={(e) => remember("title", e.currentTarget)} onChange={(e) => onChange({ title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-[#506083] mb-[2px]">Sub-heading</label>
                  <input value={value.subtitle} onFocus={(e) => remember("subtitle", e.currentTarget)} onChange={(e) => onChange({ subtitle: e.target.value })} className={inputCls} />
                </div>
              </>
            )}
            <div>
              {channel === "Web Page Message" && <label className="block text-[8px] font-bold text-[#506083] mb-[2px]">Message</label>}
              <textarea
                value={String(value[bodyField] ?? "")}
                onFocus={(e) => remember(bodyField, e.currentTarget)}
                onChange={(e) => onChange({ [bodyField]: e.target.value } as Partial<ResultMessage>)}
                rows={channel === "Email Template" ? 7 : 4}
                className={`${inputCls} resize-y leading-[1.5]`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultMessagesTab() {
  const [showNextPage, setShowNextPage] = useState(false);
  const [messages, setMessages] = useState<Messages | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewType, setPreviewType] = useState<MessageType>("eligible");

  useEffect(() => {
    let active = true;
    api
      .get<Messages>(`/careers/admin/result-messages?_=${Date.now()}`)
      .then((data) => active && setMessages(data))
      .catch((err) => active && setLoadError((err as Error)?.message || "Could not load messages"));
    return () => {
      active = false;
    };
  }, []);

  const update = (type: MessageType, patch: Partial<ResultMessage>) =>
    setMessages((prev) => (prev ? { ...prev, [type]: { ...prev[type], ...patch } } : prev));

  const save = async () => {
    if (!messages) return;
    setSaving(true);
    try {
      const saved = await api.put<Messages>("/careers/admin/result-messages", messages);
      if (saved) setMessages(saved);
      Swal.fire({ icon: "success", title: "Result messages saved", text: "Candidates will see the new messages on the careers page.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  if (showNextPage) {
    return <HRWorkflowTab />;
  }

  const preview = messages?.[previewType];
  const previewColor = TYPES.find((t) => t.key === previewType)?.color || "#148943";

  return (
    <>
      {/* Top Section: Banner & Quick Tips */}
      <div className="flex items-stretch gap-[8px] mb-[6px]" style={{ height: '132.1px' }}>
        {/* Banner Card */}
        <div
          className="flex-1 bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden relative bg-no-repeat"
          style={{
            backgroundImage: "url('/apli_f.png')",
            backgroundPosition: "right center",
            backgroundSize: "contain",
          }}
        >
          <div className="flex items-center gap-[10px] relative z-10 w-full h-full py-[4px] px-[10px] bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                <MessageSquare size={20} fill="currentColor" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Result Messages</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Set custom messages for different application results and candidate communication.</p>
              <button
                type="button"
                onClick={save}
                disabled={!messages || saving}
                className="mt-[8px] inline-flex items-center gap-[4px] bg-[#148943] text-white px-[10px] py-[5px] rounded-[4px] text-[9px] font-bold hover:bg-[#117639] transition-colors disabled:opacity-50"
              >
                <Save size={11} />
                {saving ? "Saving..." : "Save Messages"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowNextPage(true)}
            title="Next Message Settings"
            className="absolute top-[8px] right-[10px] bg-[#2563EB] text-white p-[6px] rounded-[6px] shadow-sm z-20 hover:bg-[#1d4ed8] transition-colors flex items-center justify-center"
          >
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Quick Tips sidebar */}
        <div className="w-[320px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] p-[8px] flex flex-col justify-between flex-shrink-0">
          <div className="flex items-start gap-[6px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white mt-[2px] flex-shrink-0">
              <Lightbulb size={8} />
            </div>
            <div>
              <h3 className="text-[9.5px] font-bold text-[#2563EB]">Tips for Better Messages</h3>
              <div className="flex items-center gap-[4px] mt-[2px]">
                <CheckCircle size={8} className="text-[#148943]" />
                <span className="text-[8px] font-semibold text-[#506083]">Keep messages short and positive.</span>
              </div>
              <div className="flex items-center gap-[4px] mt-[2px]">
                <CheckCircle size={8} className="text-[#148943]" />
                <span className="text-[8px] font-semibold text-[#506083]">Turning a message off shows the built-in default text.</span>
              </div>
            </div>
          </div>
          <div className="relative mt-[4px]">
            <select
              value={previewType}
              onChange={(e) => setPreviewType(e.target.value as MessageType)}
              className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[3px] text-[8.5px] font-bold text-[#172762] appearance-none outline-none bg-white pr-[20px] cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.key} value={t.key}>Preview: {t.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-[6px]">
        {/* Left Column: Message Editors */}
        <div className="flex flex-col gap-[6px]">
          {!messages ? (
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[12px] text-[9px] font-semibold text-[#506083]">
              {loadError ? `Could not load messages: ${loadError}` : "Loading messages..."}
            </div>
          ) : (
            TYPES.map((t) => <MessageCard key={t.key} type={t} value={messages[t.key]} onChange={(patch) => update(t.key, patch)} />)
          )}
        </div>

        {/* Right Column: Previews and Variables */}
        <div className="flex flex-col gap-[6px]">
          {/* Live Preview */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Eye size={12} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Live Preview (Web Page)</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">How the message looks to candidates on the website (sample values).</p>
              </div>
            </div>

            {messages && preview && (
              <div className="bg-[#F4FAF6] border border-[#DFF0E6] rounded-[6px] p-[12px] flex items-center gap-[12px]">
                <div className="w-[110px] flex-shrink-0">
                  <img src="/hr.png" alt="Graphic" className="w-full h-auto object-contain" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  {!preview.active && (
                    <span className="mb-[4px] self-start rounded-[4px] bg-[#FEF3C7] px-[6px] py-[1px] text-[7.5px] font-bold text-[#B45309]">
                      Off — the website shows its built-in text
                    </span>
                  )}
                  <h3 className="text-[13px] font-black mb-[2px]" style={{ color: previewColor }}>
                    {fillSample(preview.title, messages)}
                  </h3>
                  {preview.subtitle && (
                    <p className="text-[9px] font-bold mb-[4px]" style={{ color: previewColor }}>
                      {fillSample(preview.subtitle, messages)}
                    </p>
                  )}
                  <p className="text-[8.5px] font-medium text-[#172762] leading-tight mb-[6px] whitespace-pre-wrap">
                    {fillSample(preview.web, messages)}
                  </p>
                  <p className="text-[8px] italic text-[#164232] mb-[8px]">— Talent Acquisition Team, Bharat Organic Expo</p>
                  {previewType !== "notEligible" && (
                    <div>
                      <span className="inline-flex bg-[#148943] text-white px-[12px] py-[6px] rounded-[4px] text-[9px] font-bold items-center gap-[4px]">
                        Continue Application →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Support contact used by {{support_email}} / {{support_phone}} */}
          {messages && (
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] grid grid-cols-2 gap-[6px]">
              <div>
                <label className="block text-[8px] font-bold text-[#506083] mb-[2px]">Support Email</label>
                <input
                  value={messages.supportEmail}
                  onChange={(e) => setMessages((p) => (p ? { ...p, supportEmail: e.target.value } : p))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[#506083] mb-[2px]">Support Phone</label>
                <input
                  value={messages.supportPhone}
                  onChange={(e) => setMessages((p) => (p ? { ...p, supportPhone: e.target.value } : p))}
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* Available Variables */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center border border-[#E1E6EC]">
                <span className="text-[12px] font-black">{"{}"}</span>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Available Variables</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Use these variables in your messages. They will be replaced automatically.</p>
              </div>
            </div>

            <div className="border border-[#E1E6EC] rounded-[6px] overflow-hidden flex-1">
              <div className="grid grid-cols-[130px_1fr] bg-[#F8FAFC] border-b border-[#E1E6EC] p-[6px]">
                <div className="text-[8.5px] font-bold text-[#172762]">Variable</div>
                <div className="text-[8.5px] font-bold text-[#172762]">Replaced With</div>
              </div>
              <div className="divide-y divide-[#E1E6EC]">
                {VARIABLES.map((v) => (
                  <div key={v.name} className="grid grid-cols-[130px_1fr] p-[6px] items-center hover:bg-[#F8FAFC] transition-colors">
                    <div className="text-[8.5px] font-medium text-[#2563EB]">{v.name}</div>
                    <div className="text-[8.5px] font-medium text-[#506083]">{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
