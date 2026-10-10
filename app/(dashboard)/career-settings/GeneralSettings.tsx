import React from "react";
import { Settings, Brain, FileText, MessageSquare, Users, Bell, Edit, Check, AlertTriangle, Info, ChevronDown, Eye, Mail } from "lucide-react";

const Toggle2 = ({ checked }: { checked: boolean }) => (
  <div className={`w-[22px] h-[12px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[8px] h-[8px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

export default function GeneralSettings() {
  return (
    <div className="grid grid-cols-3 gap-[6px]">
      {/* Basic Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Basic Settings</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage general settings for the career module.</p>
          </div>
        </div>
        
        <div className="space-y-[6px] flex-1">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Career Module Status</span>
            <div className="flex-1 flex flex-col gap-[3px] items-start">
              <div className="flex items-center gap-[4px]">
                <Toggle2 checked={true} />
                <span className="text-[9px] font-bold text-[#172762]">Active</span>
              </div>
              <div className="bg-[#E4F4E7] text-[#148943] px-[6px] py-[2px] rounded-[3px] text-[8px] font-bold w-full">Career page is live on website.</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Career Page Title</span>
            <input type="text" defaultValue="Careers at Bharat Organic Expo" className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none" />
          </div>

          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px] pt-[4px]">Career Page URL Slug</span>
            <div className="flex-1 flex flex-col gap-[3px]">
              <input type="text" defaultValue="careers" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none" />
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#506083] truncate max-w-[120px]">https://bharatorganicexpo.com/careers</span>
                <button className="text-[8px] font-bold text-[#2563EB] flex items-center gap-[2px] hover:underline whitespace-nowrap"><Eye size={10} /> View Page</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Default From Email</span>
            <input type="text" defaultValue="careers@bharatorganicexpo.com" className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Reply To Email</span>
            <input type="text" defaultValue="hr@bharatorganicexpo.com" className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Application Auto<br/>Acknowledgement</span>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-[4px]">
                <Toggle2 checked={true} />
                <span className="text-[9px] font-bold text-[#172762]">Enable</span>
              </div>
              <button className="text-[9px] font-bold text-[#2563EB] border border-[#2563EB] rounded-[3px] px-[6px] py-[3px] flex items-center gap-[3px] hover:bg-[#EEF4FF] transition-colors whitespace-nowrap"><Mail size={10} /> Preview Email</button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Eligibility Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#F3E8FF] text-[#7550EF] flex items-center justify-center border border-[#E9D5FF]">
            <Brain size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">AI Eligibility Settings</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set eligibility criteria for AI screening and application.</p>
          </div>
        </div>
        
        <div className="space-y-[8px] flex-1">
          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum AI Eligibility Score (%)</label>
            <div className="relative">
              <input type="text" defaultValue="40" className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-bold text-[#172762] outline-none" />
              <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col cursor-pointer">
                <ChevronDown size={8} className="text-[#506083] rotate-180" />
                <ChevronDown size={8} className="text-[#506083]" />
              </div>
            </div>
            <p className="mt-[4px] text-[8px] font-semibold text-[#506083] leading-tight">Candidates with score 40% or above<br/>can proceed to application form.</p>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">AI Screening Areas</label>
            <div className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] p-[8px] space-y-[4px]">
              {['Skills Match', 'Experience Match', 'Education Match', 'Role Relevance', 'Industry Fit'].map(item => (
                <div key={item} className="flex items-center gap-[6px]">
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-[#2563EB] flex items-center justify-center text-white">
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#172762]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#E8F1FF] border border-[#D5E6FA] rounded-[4px] p-[8px] flex gap-[6px] items-start mt-[auto]">
            <div className="w-[12px] h-[12px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
              <Info size={8} />
            </div>
            <p className="text-[9px] font-semibold text-[#2563EB] leading-tight">Candidates below 40% will see a &quot;Not Eligible&quot; result page with guidance.</p>
          </div>
        </div>
      </div>

      {/* Documents & Application Form */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <FileText size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Documents & Application Form</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure required documents and form fields.</p>
          </div>
        </div>
        
        <div className="space-y-[10px] flex-1 flex flex-col">
          <div>
            <h4 className="text-[9px] font-bold text-[#172762] mb-[6px]">Required Documents</h4>
            <div className="space-y-[4px]">
              {[
                { label: 'Resume / CV', desc: 'PDF, DOC, DOCX (Max 5 MB)' },
                { label: 'Passport Size Photo', desc: 'JPG, PNG (Max 2 MB)' },
                { label: 'Educational Certificates (Optional)', desc: '' },
                { label: 'Experience Certificates (Optional)', desc: '' },
                { label: 'Additional Documents (Optional)', desc: '' },
              ].map(doc => (
                <div key={doc.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-[4px]">
                    <Toggle2 checked={true} />
                    <span className="text-[9px] font-semibold text-[#172762]">{doc.label}</span>
                  </div>
                  {doc.desc && <span className="text-[8px] font-semibold text-[#506083]">{doc.desc}</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[9px] font-bold text-[#172762] mb-[6px]">Application Form Fields</h4>
            <div className="grid grid-cols-2 gap-y-[4px] gap-x-[8px]">
              {[
                'Current Location', 'Expected CTC', 'Total Experience', 'Total Experience', 
                'Willing to Relocate', 'Current Company'
              ].map((field, i) => (
                <div key={i} className="flex items-center gap-[4px]">
                  <Toggle2 checked={true} />
                  <span className="text-[9px] font-semibold text-[#172762]">{field}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[4px] mt-[4px]">
              <Toggle2 checked={false} />
              <span className="text-[9px] font-semibold text-[#172762]">Portfolio / Work Samples <span className="text-[#506083]">(For specific roles)</span></span>
            </div>
          </div>
          
          <div className="flex justify-end mt-auto pt-[6px]">
            <button className="text-[9px] font-bold text-[#2563EB] border border-[#2563EB] rounded-[3px] px-[8px] py-[4px] flex items-center gap-[3px] hover:bg-[#EEF4FF] transition-colors">
              <Settings size={10} /> Configure Form Fields
            </button>
          </div>
        </div>
      </div>

      {/* Result Messages */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Result Messages</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set custom messages for candidate result screens.</p>
          </div>
        </div>

        <div className="space-y-[6px] flex-1">
          <div className="bg-[#E4F4E7] rounded-[4px] p-[8px] flex items-start justify-between border border-[#CDEBD4]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#148943] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <Check size={10} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#148943]">Eligible (Pass)</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message shown to candidates with score ≥ 40%.</p>
              </div>
            </div>
            <button className="bg-white border border-[#CDEBD4] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>

          <div className="bg-[#FFF1D8] rounded-[4px] p-[8px] flex items-start justify-between border border-[#FDE0A6]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#E29515] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <AlertTriangle size={10} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#E29515]">Not Eligible (Fail)</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message shown to candidates with score &lt; 40%.</p>
              </div>
            </div>
            <button className="bg-white border border-[#FDE0A6] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>

          <div className="bg-[#E8F1FF] rounded-[4px] p-[8px] flex items-start justify-between border border-[#D5E6FA]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <Info size={10} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#2563EB]">Incomplete Application</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message for incomplete or abandoned application.</p>
              </div>
            </div>
            <button className="bg-white border border-[#D5E6FA] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>
        </div>
      </div>

      {/* HR & Workflow Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">HR & Workflow Settings</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage HR recipients and application workflow.</p>
          </div>
        </div>

        <div className="space-y-[10px] flex-1">
          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Default HR Recipients</label>
            <div className="border border-[#E1E6EC] rounded-[4px] p-[4px] flex flex-wrap gap-[3px] relative">
              {['HR Team (General)', 'Srujana Paidi (CHRO)', 'Vijay Sharma (CHRO)'].map(chip => (
                <div key={chip} className="bg-[#E8F1FF] text-[#2563EB] text-[9px] font-bold px-[4px] py-[2px] rounded-[3px] flex items-center gap-[3px]">
                  {chip}
                  <button className="hover:text-blue-800 text-[10px]">&times;</button>
                </div>
              ))}
              <input type="text" className="outline-none text-[9px] min-w-[20px] flex-1 bg-transparent" />
              <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Application Workflow</label>
            <div className="space-y-[4px]">
              {[
                'Application Submitted (Auto)',
                'AI Analysis (Auto)',
                'Eligible -> Application Form (Auto)',
                'Sent to HR (Manual - by Website Team)',
                'HR Review (By HR)',
                'Shortlisted / Interview / Selected / Rejected (By HR)'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-[6px]">
                  <div className={`w-[12px] h-[12px] rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 ${i < 4 ? 'bg-[#E4F4E7] text-[#148943]' : 'bg-[#FFF1D8] text-[#E29515]'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[9px] font-semibold text-[#172762]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col relative">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#FFF1D8] text-[#E29515] flex items-center justify-center border border-[#FDE0A6]">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Notification Settings</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage email notifications for different stages.</p>
          </div>
        </div>

        <div className="space-y-[6px] flex-1">
          {[
            'Notify HR when application is forwarded',
            'Notify candidate when application is received',
            'Notify candidate on result (Eligible/Not Eligible)',
            'Notify HR on status updates (Shortlisted, Interview, etc.)',
          ].map(label => (
            <div key={label} className="flex items-center gap-[4px]">
              <Toggle2 checked={true} />
              <span className="text-[9px] font-semibold text-[#172762]">{label}</span>
            </div>
          ))}
          {[
            'Send daily application summary to HR',
            'Send weekly report to Admin'
          ].map(label => (
            <div key={label} className="flex items-center gap-[4px]">
              <Toggle2 checked={false} />
              <span className="text-[9px] font-semibold text-[#172762]">{label}</span>
            </div>
          ))}

          <div className="pt-[4px]">
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Notification Recipients (Admin)</label>
            <div className="border border-[#E1E6EC] rounded-[4px] p-[4px] flex flex-wrap gap-[3px] relative">
              <div className="bg-[#E8F1FF] text-[#2563EB] text-[9px] font-bold px-[4px] py-[2px] rounded-[3px] flex items-center gap-[3px]">
                vijay@bharatorganicexpo.com
                <button className="hover:text-blue-800 text-[10px]">&times;</button>
              </div>
              <input type="text" className="outline-none text-[9px] min-w-[20px] flex-1 bg-transparent" />
              <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
