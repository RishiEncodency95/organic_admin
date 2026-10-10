import React, { useState } from "react";
import { 
  Bell, Lightbulb, Mail, MessageSquare, Edit, 
  Send, ChevronDown, Check, Clock, User, Users,
  CheckCircle, XCircle, AlertCircle, Calendar,
  Play, Pause, Briefcase, FileText, Smartphone, Settings,
  Eye, Type, Italic, Underline, List, Link, Send as SendIcon
} from "lucide-react";

const Toggle = ({ checked, disabled }: { checked: boolean, disabled?: boolean }) => (
  <div className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

export default function HRWorkflowTab() {
  const [editorTab, setEditorTab] = useState("Web Page Message");
  const [previewTab, setPreviewTab] = useState("Web Page View");

  const hrStatuses = [
    { status: "Shortlisted", desc: "Candidate shortlisted for interview", toggle: true, template: "Shortlisted - Next Steps", color: "text-[#16A34A]", bg: "bg-[#DCFCE7]" },
    { status: "Interview", desc: "Interview scheduled", toggle: true, template: "Interview Invitation", color: "text-[#2563EB]", bg: "bg-[#DBEAFE]" },
    { status: "Selected", desc: "Candidate selected for the position", toggle: true, template: "Selection & Offer Process", color: "text-[#9333EA]", bg: "bg-[#F3E8FF]" },
    { status: "Rejected", desc: "Not selected for the position", toggle: true, template: "Not Selected - Thank You", color: "text-[#DC2626]", bg: "bg-[#FEE2E2]" },
    { status: "On Hold", desc: "Application kept on hold", toggle: true, template: "Application On Hold", color: "text-[#EA580C]", bg: "bg-[#FFEDD5]" },
    { status: "Joined", desc: "Candidate has joined", toggle: true, template: "Welcome to the Team", color: "text-[#475569]", bg: "bg-[#F1F5F9]" },
    { status: "No Response", desc: "Auto follow-up after X days", toggle: true, template: "Follow-up Reminder", color: "text-[#475569]", bg: "bg-[#F1F5F9]" },
  ];

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
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#E8F1FF] flex items-center justify-center text-[#2563EB]">
                <SendIcon size={20} fill="currentColor" className="mt-[2px] ml-[-2px] -rotate-45" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Next Message Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure automated next step message to candidates based on HR status and workflow.</p>
            </div>
          </div>
        </div>
        
        {/* Quick Tips sidebar */}
        <div className="w-[320px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Lightbulb size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">Quick Tips</h3>
          </div>
          <ul className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-disc list-inside">
            <li>Use clear and friendly language</li>
            <li>Mention next steps and timeline</li>
            <li>Keep messages short and professional</li>
            <li>Use variables for dynamic information</li>
          </ul>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-[6px]">
        {/* Left Column */}
        <div className="flex flex-col gap-[6px]">
          {/* HR Status Based Next Message */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">HR Status Based Next Message</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set the message that will be sent to candidates when HR updates the application status.</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[80px_1fr_40px_130px_30px] gap-[8px] items-end mb-[4px] px-[4px] pb-[4px] border-b border-[#E1E6EC]">
              <div className="text-[9px] font-bold text-[#172762] pb-[2px]">HR Status</div>
              <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Send Next Message</div>
              <div className="text-[9px] font-bold text-[#172762] pb-[2px] text-center">Active</div>
              <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Message Template</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-[4px]">
              {hrStatuses.map((row, i) => (
                <div key={i} className="grid grid-cols-[80px_1fr_40px_130px_30px] gap-[8px] items-center py-[2px] px-[4px]">
                  <div>
                    <span className={`inline-block px-[8px] py-[2px] rounded-[12px] text-[8.5px] font-bold ${row.bg} ${row.color}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="text-[8.5px] font-semibold text-[#506083] pr-[4px]">{row.desc}</div>
                  <div className="flex justify-center"><Toggle checked={row.toggle} /></div>
                  <div className="relative">
                    <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white truncate pr-[16px]">
                      <option>{row.template}</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
                  </div>
                  <div className="flex justify-center">
                    <button className="text-[#2563EB] border border-[#D5E6FA] rounded-[4px] px-[6px] py-[2px] bg-white hover:bg-[#EEF4FF] transition-colors text-[8.5px] font-bold">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={12} />
              </div>
              <h3 className="text-[10px] font-bold text-[#172762]">Additional Settings</h3>
            </div>

            <div className="space-y-[8px]">
              <div className="flex items-center justify-between">
                <label className="text-[8.5px] font-semibold text-[#172762]">Send next message automatically when HR updates status</label>
                <Toggle checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[8.5px] font-semibold text-[#172762]">CC HR team in candidate communication</label>
                <Toggle checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[8.5px] font-semibold text-[#172762]">Include job title in message</label>
                <Toggle checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[8.5px] font-semibold text-[#172762]">Include company name (Bharat Organic Expo)</label>
                <Toggle checked={true} />
              </div>
              <div className="flex items-center justify-between pt-[4px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Auto send after (days) if no HR update</label>
                <div className="flex items-center gap-[4px]">
                  <input type="text" defaultValue="7" className="w-[40px] text-center border border-[#E1E6EC] rounded-[4px] px-[4px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
                  <span className="text-[8.5px] text-[#506083]">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[6px]">
          {/* Message Template Editor */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={12} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Message Template Editor</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Customize the message content for selected status.</p>
              </div>
            </div>

            <div className="flex items-center gap-[8px] mb-[12px]">
              <label className="text-[9px] font-bold text-[#172762]">Select Status</label>
              <div className="relative flex-1">
                <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] appearance-none outline-none bg-white">
                  <option>Shortlisted</option>
                </select>
                <ChevronDown size={12} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
              </div>
            </div>

            <div className="flex mb-[8px] border-b border-[#E1E6EC]">
              {["Web Page Message", "Email Template", "SMS Template", "WhatsApp Template"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEditorTab(tab)}
                  className={`flex-1 text-center pb-[4px] text-[8.5px] font-bold transition-colors relative ${
                    editorTab === tab ? 'text-[#172762]' : 'text-[#506083] hover:text-[#172762]'
                  }`}
                >
                  {tab}
                  {editorTab === tab && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2563EB]" />
                  )}
                </button>
              ))}
            </div>

            <div className="border border-[#E1E6EC] rounded-[4px] overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-[#E1E6EC] p-[4px] flex items-center justify-between">
                <div className="flex items-center gap-[8px] px-[4px]">
                  <button className="text-[#506083] hover:text-[#172762]"><Type size={12} /></button>
                  <button className="text-[#506083] hover:text-[#172762]"><Italic size={12} /></button>
                  <button className="text-[#506083] hover:text-[#172762]"><Underline size={12} /></button>
                  <button className="text-[#506083] hover:text-[#172762]"><List size={12} /></button>
                  <button className="text-[#506083] hover:text-[#172762]"><Link size={12} /></button>
                </div>
                <div className="relative">
                  <select className="border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#2563EB] appearance-none outline-none bg-white pr-[20px]">
                    <option>Insert Variable</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#2563EB]" />
                </div>
              </div>
              <div className="p-[8px] min-h-[120px] text-[9px] font-medium text-[#172762] space-y-[6px]">
                <p>Dear {"{{candidate_name}}"},</p>
                <p>Congratulations! You have been shortlisted for the position of &quot;{"{{job_title}}"}&quot; at Bharat Organic Expo.</p>
                <p>Our HR team will shortly share the next steps and interview details with you.</p>
                <p className="pt-[4px]">Best regards,<br/>Bharat Organic Expo Team</p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Eye size={12} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Live Preview</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">See how the message will look to candidates.</p>
              </div>
            </div>

            <div className="flex mb-[8px] border-b border-[#E1E6EC]">
              {["Web Page View", "Email View", "SMS View", "WhatsApp View"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`flex-1 text-center pb-[4px] text-[8.5px] font-bold transition-colors relative ${
                    previewTab === tab ? 'text-[#172762]' : 'text-[#506083] hover:text-[#172762]'
                  }`}
                >
                  {tab}
                  {previewTab === tab && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2563EB]" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-[12px] flex-1 flex gap-[12px] shadow-sm">
              <div className="w-[100px] flex-shrink-0">
                <img src="/hr.png" alt="Graphic" className="w-full h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-[12px] font-black text-[#148943] mb-[4px]">Great News!</h3>
                <p className="text-[8.5px] font-medium text-[#172762] leading-tight mb-[4px]">You have been shortlisted for the position of <span className="font-bold">&quot;Business Development Executive&quot;</span> at <span className="font-bold">Bharat Organic Expo</span>.</p>
                <p className="text-[8.5px] font-medium text-[#506083] leading-tight mb-[8px]">Our HR team will shortly share the next steps and interview details with you.</p>
                <div>
                  <button className="bg-[#148943] text-white px-[12px] py-[6px] rounded-[4px] text-[9px] font-bold flex items-center gap-[4px]">
                    ← Back to Career Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
