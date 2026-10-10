import React, { useState } from "react";
import { 
  Bell, Lightbulb, Mail, MessageSquare, Edit, 
  Send, ChevronDown, Check, Clock, User, Users,
  CheckCircle, XCircle, AlertCircle, Calendar,
  Play, Pause, Briefcase, FileText, Smartphone, Settings
} from "lucide-react";

const Toggle = ({ checked, disabled }: { checked: boolean, disabled?: boolean }) => (
  <div className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

export default function NotificationsTab() {
  const [previewTab, setPreviewTab] = useState("Email Preview");

  return (
    <>
      {/* Top Section: Banner & Quick Tips */}
      <div className="flex items-stretch gap-[8px] mb-[6px]" style={{ height: '132.1px' }}>
        {/* Banner Card */}
        <div 
          className="flex-1 bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden relative bg-no-repeat"
          style={{
            backgroundImage: "url('/notification.png')",
            backgroundPosition: "right center",
            backgroundSize: "contain",
          }}
        >
          <div className="flex items-center gap-[10px] relative z-10 w-full h-full py-[4px] px-[10px] bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
                <Bell size={20} fill="currentColor" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Notification Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure automatic notifications for candidates, HR team and admin.</p>
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
            <li>Keep messages clear and concise</li>
            <li>Use candidate name and job title</li>
            <li>Enable only relevant notifications</li>
            <li>Test messages before going live</li>
          </ul>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-[6px] mb-[6px]">
        {/* Left Column: Notification Triggers */}
        <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col">
          <div className="flex items-center gap-[6px] mb-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Settings size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Triggers</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select events and channels for automatic notifications.</p>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_90px_130px_30px] gap-[8px] items-end mb-[4px] px-[4px] pb-[4px] border-b border-[#E1E6EC]">
            <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Event / Trigger</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[30px] pb-[2px]">Email</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[30px] pb-[2px]">SMS</div>
            <div className="text-[9px] font-bold text-[#172762] text-center w-[60px] pb-[2px]">WhatsApp</div>
            <div className="text-[9px] font-bold text-[#172762] text-center pb-[2px]">Notify</div>
            <div className="text-[9px] font-bold text-[#172762] pb-[2px]">Template</div>
            <div></div>
          </div>

          {/* Table Rows */}
          <div className="space-y-[1px] flex-1 overflow-y-auto">
            {[
              { name: "Application Submitted\n(Thank You)", icon: "green-send", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Submission Acknowledgement" },
              { name: "AI Result - Eligible (Pass)", icon: "purple-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Eligible - Next Steps" },
              { name: "AI Result - Not Eligible (Fail)", icon: "red-alert", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Not Eligible - Thank You" },
              { name: "Application Forwarded to HR", icon: "blue-user", email: true, sms: false, whatsapp: false, notify: "HR Team", template: "New Application for Review" },
              { name: "HR Status - Shortlisted", icon: "green-user", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Shortlisted - Next Steps" },
              { name: "HR Status - Interview", icon: "purple-calendar", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Interview Invitation" },
              { name: "HR Status - Selected", icon: "green-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Selection & Offer Process" },
              { name: "HR Status - Rejected", icon: "red-cross", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Not Selected - Thank You" },
              { name: "HR Status - On Hold", icon: "orange-pause", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Application On Hold" },
              { name: "HR Status - Joined", icon: "blue-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Welcome to the Team" },
              { name: "No Response (Auto Follow-up)", icon: "gray-clock", email: true, sms: false, whatsapp: false, notify: "Candidate", template: "Follow-up Reminder" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_90px_130px_30px] gap-[8px] items-center py-[2px] px-[4px] hover:bg-[#F8FAFC] rounded-[4px] transition-colors border-b border-[#F1F5F9] last:border-0">
                <div className="flex items-center gap-[6px] overflow-hidden">
                  <RowIcon type={row.icon} />
                  <span className="text-[9px] font-semibold text-[#172762] whitespace-pre-wrap leading-tight">{row.name}</span>
                </div>
                <div className="w-[30px] flex justify-center"><Toggle checked={row.email} disabled={row.email === false && i === 3} /></div>
                <div className="w-[30px] flex justify-center"><Toggle checked={row.sms} disabled={row.sms === false} /></div>
                <div className="w-[60px] flex justify-center"><Toggle checked={row.whatsapp} disabled={row.whatsapp === false} /></div>
                
                <div className="relative">
                  <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white">
                    <option>{row.notify}</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
                </div>
                
                <div className="relative">
                  <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[2px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white truncate pr-[16px]">
                    <option>{row.template}</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
                </div>

                <div className="flex justify-center">
                  <button className="text-[#2563EB] border border-[#D5E6FA] rounded-[4px] p-[3px] bg-white hover:bg-[#EEF4FF] transition-colors">
                    <Edit size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Message Preview */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <EyeIcon />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Message Preview</h3>
            </div>
          </div>

          <div className="flex mb-[8px] border-b border-[#E1E6EC]">
            {["Email Preview", "SMS Preview", "WhatsApp Preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={`flex-1 text-center pb-[4px] text-[9px] font-bold transition-colors relative ${
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

          <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-[8px] shadow-sm flex-1 overflow-y-auto">
            <div className="text-[8.5px] font-bold text-[#172762] mb-[6px] pb-[6px] border-b border-[#E1E6EC]">
              Subject: Congratulations! You are eligible for the position at Bharat Organic Expo
            </div>
            
            <div className="mb-[8px] rounded-[4px] overflow-hidden h-[45px]">
              <img src="/notific2.png" alt="Banner" className="w-full h-full object-cover object-center" />
            </div>

            <div className="text-[8.5px] font-medium text-[#172762] leading-[1.6] space-y-[6px]">
              <p>Dear {"{{candidate_name}}"},</p>
              <p>Congratulations! Based on your information, you appear to be eligible for the position of &quot;{"{{job_title}}"}&quot; at Bharat Organic Expo.</p>
              <p>Please complete and submit the application form to proceed further.</p>
              <button className="bg-[#148943] text-white px-[12px] py-[6px] rounded-[4px] text-[9px] font-bold mt-[4px]">
                Continue Application →
              </button>
              <div className="pt-[6px]">
                <p>Best regards,</p>
                <p>Bharat Organic Expo Team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Columns */}
      <div className="grid grid-cols-3 gap-[6px]">
        {/* Notification Recipients */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Users size={12} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Recipients (Internal)</h3>
              <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Configure who will receive notifications.</p>
            </div>
          </div>

          <div className="space-y-[6px]">
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">HR Notification Email</label>
              <div className="flex flex-col gap-[2px]">
                <input type="text" defaultValue="hr@bharatorganicexpo.com" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
                <span className="text-[7px] text-[#94A3B8]">Multiple emails can be added (comma separated)</span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">CC to Admin (Optional)</label>
              <input type="text" defaultValue="info@bharatorganicexpo.com" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px] pt-[2px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Notify on New Application</label>
              <div className="flex items-center gap-[6px]">
                <Toggle checked={true} />
                <span className="text-[7.5px] text-[#506083]">Send email to HR when a new application is submitted.</span>
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-[6px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Daily Summary Report</label>
              <div className="flex items-center gap-[6px]">
                <Toggle checked={true} />
                <span className="text-[7.5px] text-[#506083]">Send daily summary of applications to HR/admin.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
          <div className="flex items-center gap-[6px] mb-[8px]">
            <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Clock size={12} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Schedule</h3>
              <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Control timing and frequency of notifications.</p>
            </div>
          </div>

          <div className="space-y-[6px]">
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Follow-up after no response</label>
              <div className="flex items-center gap-[4px]">
                <input type="text" defaultValue="7" className="w-[40px] text-center border border-[#E1E6EC] rounded-[4px] px-[4px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
                <span className="text-[8.5px] text-[#506083]">days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Daily summary time</label>
              <div className="relative w-[120px]">
                <input type="text" defaultValue="10:00 AM" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
                <Clock size={10} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[8.5px] font-semibold text-[#172762]">Time Zone</label>
              <div className="relative w-[140px]">
                <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8px] font-semibold text-[#172762] appearance-none outline-none bg-white">
                  <option>(GMT+05:30) India Standard Time</option>
                </select>
                <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-[2px]">
              <label className="text-[8.5px] font-semibold text-[#172762]">Send only on working days</label>
              <Toggle checked={true} />
            </div>
          </div>
        </div>

        {/* Test Notification */}
        <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Send size={12} className="ml-[-2px] mt-[1px] -rotate-45" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Test Notification</h3>
                <p className="text-[7.5px] font-semibold text-[#506083] mt-[1px]">Send a test message to verify the settings.</p>
              </div>
            </div>

            <div className="space-y-[6px]">
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Select Template</label>
                <div className="relative">
                  <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-semibold text-[#172762] appearance-none outline-none bg-white">
                    <option>Eligible - Next Steps</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-[4px] top-1/2 -translate-y-1/2 text-[#506083]" />
                </div>
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Send Test To</label>
                <input type="text" defaultValue="vijay@namogange.org" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-medium text-[#172762] outline-none" />
              </div>
              <div className="grid grid-cols-[60px_1fr] items-center gap-[6px]">
                <label className="text-[8.5px] font-semibold text-[#172762]">Channel</label>
                <div className="flex items-center justify-between pr-[10px]">
                  <label className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762] cursor-pointer">
                    <input type="radio" name="channel" className="w-[10px] h-[10px] accent-[#2563EB]" defaultChecked />
                    Email
                  </label>
                  <label className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762] cursor-pointer">
                    <input type="radio" name="channel" className="w-[10px] h-[10px] accent-[#2563EB]" />
                    SMS
                  </label>
                  <label className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762] cursor-pointer">
                    <input type="radio" name="channel" className="w-[10px] h-[10px] accent-[#2563EB]" />
                    WhatsApp
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-[6px] flex justify-end">
            <button className="flex items-center gap-[4px] bg-white border border-[#D5E6FA] text-[#2563EB] px-[12px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors shadow-sm w-[130px] justify-center">
              <Send size={10} className="-mt-[1px] -rotate-45" /> Send Test Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LeafIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#148943" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C12 22 4 16 4 10C4 6.7 6.7 4 10 4C11.5 4 12.8 4.6 13.8 5.6C14.7 4.6 16.1 4 17.5 4C20.8 4 23.5 6.7 23.5 10C23.5 16 15.5 22 15.5 22H12Z" />
  </svg>
);

const RowIcon = ({ type }: { type: string }) => {
  const getIcon = () => {
    switch (type) {
      case "green-send": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Send size={12} className="-rotate-45 ml-[-2px] mt-[2px]" /> };
      case "purple-check": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <CheckCircle size={12} /> };
      case "red-alert": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <AlertCircle size={12} /> };
      case "blue-user": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <User size={12} /> };
      case "green-user": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Users size={12} /> };
      case "purple-calendar": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <Calendar size={12} /> };
      case "green-check": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <CheckCircle size={12} /> };
      case "red-cross": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <XCircle size={12} /> };
      case "orange-pause": return { bg: "bg-[#FFEDD5]", color: "text-[#EA580C]", icon: <Pause size={12} /> };
      case "blue-check": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <Briefcase size={12} /> };
      case "gray-clock": return { bg: "bg-[#F1F5F9]", color: "text-[#64748B]", icon: <Clock size={12} /> };
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
