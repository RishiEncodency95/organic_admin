import React, { useState } from "react";
import { 
  MessageSquare, Lightbulb, ChevronDown, CheckCircle, 
  Type, Italic, Underline, List, Link, Eye, Info, AlertTriangle, Star, ArrowRight
} from "lucide-react";
import HRWorkflowTab from "./HRWorkflowTab";

const Toggle = ({ checked, disabled }: { checked: boolean, disabled?: boolean }) => (
  <div className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

const EditorTabs = ({ activeTab, onChange }: { activeTab: string, onChange: (tab: string) => void }) => (
  <div className="flex mb-[8px] border-b border-[#E1E6EC]">
    {["Web Page Message", "Email Template", "SMS Template", "WhatsApp Template"].map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`flex-1 text-center pb-[4px] text-[8.5px] font-bold transition-colors relative ${
          activeTab === tab ? 'text-[#172762]' : 'text-[#506083] hover:text-[#172762]'
        }`}
      >
        {tab}
        {activeTab === tab && (
          <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2563EB]" />
        )}
      </button>
    ))}
  </div>
);

const EditorToolbar = () => (
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
);

export default function ResultMessagesTab() {
  const [eligibleTab, setEligibleTab] = useState("Web Page Message");
  const [notEligibleTab, setNotEligibleTab] = useState("Web Page Message");
  const [incompleteTab, setIncompleteTab] = useState("Web Page Message");
  const [showNextPage, setShowNextPage] = useState(false);

  const variables = [
    { name: "{{candidate_name}}", desc: "Candidate's full name" },
    { name: "{{job_title}}", desc: "Job position title" },
    { name: "{{company_name}}", desc: "Bharat Organic Expo" },
    { name: "{{current_ctc}}", desc: "Candidate's current CTC (if provided)" },
    { name: "{{expected_ctc}}", desc: "Candidate's expected CTC (if provided)" },
    { name: "{{total_experience}}", desc: "Total work experience" },
    { name: "{{current_location}}", desc: "Candidate's current location" },
    { name: "{{application_link}}", desc: "Link to continue application" },
    { name: "{{support_email}}", desc: "careers@bharatorganicexpo.com" },
    { name: "{{support_phone}}", desc: "+91 11 1234 5678" },
  ];

  if (showNextPage) {
    return <HRWorkflowTab />;
  }

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
            </div>
          </div>
          <div className="relative mt-[4px]">
            <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[3px] text-[8.5px] font-bold text-[#172762] appearance-none outline-none bg-white pr-[20px]">
              <option>Eligible (Pass)</option>
            </select>
            <ChevronDown size={12} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-[6px]">
        {/* Left Column: Message Editors */}
        <div className="flex flex-col gap-[6px]">
          {/* Eligible */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden">
            <div className="p-[8px] flex items-center justify-between border-b border-[#E1E6EC] bg-[#F8FAFC]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[28px] h-[28px] rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-sm">
                  <Star size={14} />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#172762]">Eligible (Pass)</h3>
                  <p className="text-[8px] font-semibold text-[#506083]">Shown to candidates with score &gt;= set threshold.</p>
                </div>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="text-[9px] font-bold text-[#16A34A]">Active</span>
                <Toggle checked={true} />
              </div>
            </div>
            <div className="p-[8px]">
              <EditorTabs activeTab={eligibleTab} onChange={setEligibleTab} />
              <div className="border border-[#E1E6EC] rounded-[4px] overflow-hidden">
                <EditorToolbar />
                <div className="p-[8px] min-h-[90px] text-[8.5px] font-medium text-[#172762] space-y-[4px]">
                  <p>Dear {"{{candidate_name}}"},</p>
                  <p>Congratulations! Based on your information, you appear to be eligible for the position "{"{{job_title}}"}" at Bharat Organic Expo.</p>
                  <p>Please complete and submit the application form to proceed further.</p>
                  <p className="pt-[4px]">Best regards,<br/>Bharat Organic Expo Team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Not Eligible */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden">
            <div className="p-[8px] flex items-center justify-between border-b border-[#E1E6EC] bg-[#F8FAFC]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[28px] h-[28px] rounded-[4px] bg-[#F59E0B] flex items-center justify-center text-white shadow-sm">
                  <AlertTriangle size={14} fill="currentColor" className="text-white" />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#F59E0B]">Not Eligible (Fail)</h3>
                  <p className="text-[8px] font-semibold text-[#506083]">Shown to candidates with score &lt; set threshold.</p>
                </div>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="text-[9px] font-bold text-[#16A34A]">Active</span>
                <Toggle checked={true} />
              </div>
            </div>
            <div className="p-[8px]">
              <EditorTabs activeTab={notEligibleTab} onChange={setNotEligibleTab} />
              <div className="border border-[#E1E6EC] rounded-[4px] overflow-hidden">
                <EditorToolbar />
                <div className="p-[8px] min-h-[90px] text-[8.5px] font-medium text-[#172762] space-y-[4px]">
                  <p>Dear {"{{candidate_name}}"},</p>
                  <p>Thank you for your interest in "{"{{job_title}}"}".</p>
                  <p>Based on the information provided, you do not meet the eligibility criteria for this position at this time. We encourage you to explore other opportunities with us in the future.</p>
                  <p className="pt-[4px]">Best regards,<br/>Bharat Organic Expo Team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Incomplete Application */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden">
            <div className="p-[8px] flex items-center justify-between border-b border-[#E1E6EC] bg-[#F8FAFC]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[28px] h-[28px] rounded-full bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                  <Info size={14} />
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-[#2563EB]">Incomplete Application</h3>
                  <p className="text-[8px] font-semibold text-[#506083]">Shown to candidates who have not completed the application.</p>
                </div>
              </div>
              <div className="flex items-center gap-[6px]">
                <span className="text-[9px] font-bold text-[#16A34A]">Active</span>
                <Toggle checked={true} />
              </div>
            </div>
            <div className="p-[8px]">
              <EditorTabs activeTab={incompleteTab} onChange={setIncompleteTab} />
              <div className="border border-[#E1E6EC] rounded-[4px] overflow-hidden">
                <EditorToolbar />
                <div className="p-[8px] min-h-[90px] text-[8.5px] font-medium text-[#172762] space-y-[4px]">
                  <p>Dear {"{{candidate_name}}"},</p>
                  <p>Your application for "{"{{job_title}}"}" is incomplete.</p>
                  <p>Please provide the missing details to submit your application. You can continue from where you left off by clicking the link below.</p>
                  <p className="pt-[4px]">Best regards,<br/>Bharat Organic Expo Team</p>
                </div>
              </div>
            </div>
          </div>
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
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">See how the message will look to candidates on the website.</p>
              </div>
            </div>

            <div className="bg-[#F4FAF6] border border-[#DFF0E6] rounded-[6px] p-[12px] flex items-center gap-[12px]">
              <div className="w-[110px] flex-shrink-0">
                <img src="/hr.png" alt="Graphic" className="w-full h-auto object-contain" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-[13px] font-black text-[#148943] mb-[4px]">Great News!</h3>
                <p className="text-[8.5px] font-medium text-[#172762] leading-tight mb-[4px]">You appear to be eligible for the position <span className="font-bold">"Sales Manager - Domestic Exhibition Sales & Sponsorships"</span>.</p>
                <p className="text-[8.5px] font-medium text-[#172762] leading-tight mb-[8px]">Please complete and submit the application form to proceed further.</p>
                <div>
                  <button className="bg-[#148943] text-white px-[12px] py-[6px] rounded-[4px] text-[9px] font-bold flex items-center gap-[4px]">
                    Continue Application →
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                {variables.map((v, i) => (
                  <div key={i} className="grid grid-cols-[130px_1fr] p-[6px] items-center hover:bg-[#F8FAFC] transition-colors">
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
