import React from "react";
import { 
  Mail, Lightbulb, Plus, MoreVertical, Edit, Search, 
  Settings, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, ChevronDown, Send
} from "lucide-react";

const Toggle = ({ checked }: { checked: boolean }) => (
  <div className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

export default function EmailTemplatesTab() {
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
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#E4F4E7] flex items-center justify-center text-[#148943]">
                <Mail size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Email Templates</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Create and manage email templates for different stages of the application process.<br/>Use variables to personalize emails.</p>
            </div>
          </div>
        </div>
        
        {/* Quick Tips sidebar */}
        <div className="w-[280px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Lightbulb size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">Quick Tips</h3>
          </div>
          <ul className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-disc list-inside">
            <li>Use variables like {"{{candidate_name}}"}</li>
            <li>Keep email content short and clear</li>
            <li>Maintain professional and friendly tone</li>
            <li>Test emails before going live</li>
          </ul>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-[6px]">
        {/* Left Column */}
        <div className="flex flex-col gap-[6px]">
          {/* Email Template List */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center justify-between mb-[6px]">
              <div className="flex items-center gap-[6px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <FileTextIcon />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">Email Template List</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage all email templates used in the career application workflow.</p>
                </div>
              </div>
              <button className="bg-[#148943] text-white px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold flex items-center gap-[4px] shadow-sm hover:bg-[#117639] transition-colors">
                <Plus size={10} /> Add New Template
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[20px_1.5fr_1.8fr_60px_60px_60px] gap-[8px] items-center mb-[4px] px-[4px] pb-[4px] border-b border-[#E1E6EC]">
              <div className="text-[9px] font-bold text-[#172762]">#</div>
              <div className="text-[9px] font-bold text-[#172762]">Template Name</div>
              <div className="text-[9px] font-bold text-[#172762]">Trigger / Purpose</div>
              <div className="text-[9px] font-bold text-[#172762]">Channel</div>
              <div className="text-[9px] font-bold text-[#172762] text-center">Status</div>
              <div className="text-[9px] font-bold text-[#172762] text-center">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-[1px]">
              {[
                { id: 1, name: "Application Acknowledgement", trigger: "Sent after candidate submits application", icon: "green-mail", active: true },
                { id: 2, name: "Eligible (Pass) Notification", trigger: "Candidate eligible for the position", icon: "teal-check", active: true },
                { id: 3, name: "Not Eligible (Fail) Notification", trigger: "Candidate not eligible", icon: "red-alert", active: true },
                { id: 4, name: "Incomplete Application", trigger: "Application not completed", icon: "blue-info", active: true },
                { id: 5, name: "Interview Invitation", trigger: "Invite shortlisted candidate for interview", icon: "purple-calendar", active: true },
                { id: 6, name: "Interview Reschedule", trigger: "Reschedule interview", icon: "purple-calendar", active: true },
                { id: 7, name: "Selection & Offer", trigger: "Candidate selected for the position", icon: "green-check", active: true },
                { id: 8, name: "Not Selected", trigger: "Candidate not selected", icon: "red-cross", active: true },
                { id: 9, name: "Application On Hold", trigger: "Application kept on hold", icon: "orange-pause", active: true },
                { id: 10, name: "Join Confirmation", trigger: "Candidate has joined", icon: "blue-check", active: true },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[20px_1.5fr_1.8fr_60px_60px_60px] gap-[8px] items-center py-[3px] px-[4px] hover:bg-[#F8FAFC] rounded-[4px] transition-colors border-b border-[#F1F5F9] last:border-0">
                  <div className="text-[9px] font-semibold text-[#506083]">{row.id}</div>
                  <div className="flex items-center gap-[6px] overflow-hidden">
                    <RowIcon type={row.icon} />
                    <span className="text-[9px] font-bold text-[#172762] truncate">{row.name}</span>
                  </div>
                  <div className="text-[8.5px] font-semibold text-[#506083] truncate">{row.trigger}</div>
                  <div className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762]">
                    <Mail size={10} className="text-[#2563EB]" /> Email
                  </div>
                  <div className="flex justify-center items-center gap-[4px]">
                    <Toggle checked={row.active} />
                    <span className="text-[8.5px] font-semibold text-[#148943]">Active</span>
                  </div>
                  <div className="flex justify-center items-center gap-[4px]">
                    <button className="text-[8px] font-bold text-[#2563EB] border border-[#D5E6FA] rounded-[4px] px-[6px] py-[2px] bg-white hover:bg-[#EEF4FF] transition-colors">Edit</button>
                    <button className="text-[#94A3B8] hover:text-[#506083]"><MoreVertical size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Variables */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <VariableIcon />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Available Variables</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Use these variables to personalize your email templates.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[6px]">
              {[
                { var: "{{candidate_name}}", desc: "Candidate's full name" },
                { var: "{{job_title}}", desc: "Job position title" },
                { var: "{{company_name}}", desc: "Bharat Organic Expo" },
                { var: "{{application_link}}", desc: "Link to application" },
                { var: "{{current_ctc}}", desc: "Current CTC (if provided)" },
                { var: "{{expected_ctc}}", desc: "Expected CTC (if provided)" },
                { var: "{{total_experience}}", desc: "Total work experience" },
                { var: "{{current_location}}", desc: "Current location" },
                { var: "{{interview_date}}", desc: "Interview date" },
                { var: "{{interview_time}}", desc: "Interview time" },
                { var: "{{interview_mode}}", desc: "Interview mode (Online/Office)" },
                { var: "{{hr_email}}", desc: "HR email address" },
              ].map((v, i) => (
                <div key={i} className="bg-white border border-[#D5E6FA] rounded-[4px] p-[6px] shadow-sm flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-[#172762] mb-[2px]">{v.var}</span>
                  <span className="text-[8px] font-semibold text-[#506083] leading-tight">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[6px]">
          {/* Template Editor */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Template Editor</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Create or edit email template content.</p>
              </div>
            </div>

            <div className="flex items-center gap-[8px] mb-[8px]">
              <label className="text-[9px] font-bold text-[#172762] w-[80px]">Select Template</label>
              <div className="relative flex-1">
                <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] appearance-none outline-none">
                  <option>Interview Invitation</option>
                </select>
                <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
              </div>
            </div>

            <div className="flex items-center gap-[8px] mb-[8px]">
              <label className="text-[9px] font-bold text-[#172762] w-[80px]">Subject <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                defaultValue="Interview Invitation - {{job_title}} | Bharat Organic Expo" 
                className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] outline-none" 
              />
            </div>

            <div className="border border-[#E1E6EC] rounded-[4px] flex-1 flex flex-col overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-[#E1E6EC] p-[4px] flex items-center justify-between">
                <div className="flex items-center gap-[2px]">
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><Bold size={12} /></button>
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><Italic size={12} /></button>
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><Underline size={12} /></button>
                  <div className="w-[1px] h-[12px] bg-[#CBD5E1] mx-[2px]"></div>
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><List size={12} /></button>
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><ListOrdered size={12} /></button>
                  <div className="w-[1px] h-[12px] bg-[#CBD5E1] mx-[2px]"></div>
                  <button className="p-[4px] hover:bg-[#E1E6EC] rounded-[2px] text-[#172762]"><LinkIcon size={12} /></button>
                </div>
                <div className="flex items-center gap-[4px] text-[8.5px] font-bold text-[#2563EB] cursor-pointer hover:underline">
                  Insert Variable <ChevronDown size={10} />
                </div>
              </div>
              <textarea 
                className="flex-1 p-[8px] text-[9.5px] font-medium text-[#172762] outline-none resize-none leading-[1.6] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                defaultValue={`Dear {{candidate_name}},

Congratulations! Your application for the position of "{{job_title}}" at Bharat Organic Expo has been shortlisted.

We would like to invite you for an interview.

Please find the details below:
• Date: {{interview_date}}
• Time: {{interview_time}}
• Mode: {{interview_mode}}

Please confirm your availability by replying to this email.

For any queries, feel free to contact us.

Best regards,
HR Team
Bharat Organic Expo`}
              />
            </div>
          </div>

          {/* Send Test Email */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Send size={12} className="ml-[-2px] mt-[1px] -rotate-45" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Send Test Email</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Send a test email to verify the template.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-[8px]">
              <span className="text-[9px] font-bold text-[#172762]">Send Test To</span>
              <div className="flex-1 flex gap-[4px]">
                <input type="text" placeholder="Enter email address" className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold placeholder-[#94A3B8] outline-none" />
                <button className="flex items-center gap-[4px] bg-white border border-[#D5E6FA] text-[#2563EB] px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors shadow-sm whitespace-nowrap">
                  <Send size={10} className="-mt-[1px] -rotate-45" /> Send Test Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const FileTextIcon = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.33333 1.33334H2.66667C1.93029 1.33334 1.33333 1.9303 1.33333 2.66668V13.3333C1.33333 14.0697 1.93029 14.6667 2.66667 14.6667H11.3333C12.0697 14.6667 12.6667 14.0697 12.6667 13.3333V4.66668L9.33333 1.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.33333 1.33334V4.66668H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VariableIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4M14 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4" />
    <path d="M12 10v4" />
  </svg>
);

const RowIcon = ({ type }: { type: string }) => {
  const getIcon = () => {
    switch (type) {
      case "green-mail": return { bg: "bg-[#E4F4E7]", color: "text-[#148943]", icon: <Mail size={12} /> };
      case "teal-check": return { bg: "bg-[#E0F2FE]", color: "text-[#0284C7]", icon: <Edit size={12} /> }; // substitute check
      case "red-alert": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <Search size={12} /> };
      case "blue-info": return { bg: "bg-[#E0F2FE]", color: "text-[#2563EB]", icon: <Mail size={12} /> };
      case "purple-calendar": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <Mail size={12} /> };
      case "green-check": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Mail size={12} /> };
      case "red-cross": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <Mail size={12} /> };
      case "orange-pause": return { bg: "bg-[#FFEDD5]", color: "text-[#EA580C]", icon: <Mail size={12} /> };
      case "blue-check": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <Mail size={12} /> };
      default: return { bg: "bg-[#F1F5F9]", color: "text-[#64748B]", icon: <Mail size={12} /> };
    }
  };
  const config = getIcon();
  return (
    <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
      {config.icon}
    </div>
  );
};
