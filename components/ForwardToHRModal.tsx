import React from "react";
import { 
  X, Briefcase, Calendar, MapPin, Search, Bot, HelpCircle,
  FileText, Upload, PieChart, ClipboardList, Info, Send, ChevronDown
} from "lucide-react";

interface ForwardToHRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForwardToHRModal({ isOpen, onClose }: ForwardToHRModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[780px] bg-white rounded-[16px] shadow-2xl flex flex-col relative" style={{ maxHeight: '98vh' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
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
        <div className="p-[12px] flex flex-col gap-[10px]">
          
          {/* Candidate Profile Card - Removed Box Shadow as requested */}
          <div className="bg-white border border-[#E1E6EC] rounded-[10px] p-[10px] flex items-center gap-[12px]">
            <div className="w-[46px] h-[46px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=priya" alt="Priya Sharma" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-[#172762] leading-tight mb-[2px]">Priya Sharma</h3>
              <p className="text-[10px] font-semibold text-[#172762] mb-[4px]">Sales Manager – Domestic Exhibition Sales & Sponsorships</p>
              
              <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[2px]">
                <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                  <Briefcase size={10} />
                  BOE-SALES-001
                </div>
                <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                  <Calendar size={10} />
                  5 Years Exp
                </div>
                <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                  <MapPin size={10} />
                  Delhi NCR
                </div>
              </div>
              <div className="flex items-center gap-[12px] mt-[2px]">
                <div className="flex items-center gap-[4px] text-[9px] font-semibold text-[#506083]">
                  <Calendar size={10} />
                  Applied on 17 Oct 2028, 11:24 AM
                </div>
                <div className="text-[9px] font-semibold text-[#506083] border-l border-[#E1E6EC] pl-[12px]">
                  Source: Career Page
                </div>
              </div>
            </div>

            {/* AI Score */}
            <div className="flex items-center gap-[10px] pl-[12px] border-l border-[#E1E6EC]">
              <div className="w-[64px] h-[64px] rounded-full border-[5px] border-[#16A34A] flex items-center justify-center flex-shrink-0">
                <span className="text-[18px] font-black text-[#16A34A]">92%</span>
              </div>
              <div className="max-w-[180px]">
                <div className="inline-block px-[6px] py-[2px] bg-[#DCFCE7] text-[#16A34A] text-[9px] font-bold rounded-[4px] mb-[2px]">
                  Eligible Match
                </div>
                <p className="text-[8px] font-medium text-[#506083] leading-tight">
                  Strong match for the role based on skills, experience and industry background.
                </p>
              </div>
            </div>
          </div>

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
                <div className="border border-[#2563EB] rounded-[6px] p-[4px] flex flex-wrap items-center gap-[4px] bg-white cursor-pointer hover:border-[#1d4ed8] transition-colors relative">
                  <div className="flex items-center gap-[4px] bg-[#E8F1FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[10px] font-bold border border-[#D5E6FA]">
                    HR Team (General)
                    <X size={10} className="cursor-pointer hover:text-black" />
                  </div>
                  <div className="flex items-center gap-[4px] bg-[#E8F1FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[10px] font-bold border border-[#D5E6FA]">
                    Srujana Paidi (CHRO)
                    <X size={10} className="cursor-pointer hover:text-black" />
                  </div>
                  <div className="flex items-center gap-[4px] bg-[#E8F1FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[10px] font-bold border border-[#D5E6FA]">
                    Vijay Sharma (CHRO)
                    <X size={10} className="cursor-pointer hover:text-black" />
                  </div>
                  <div className="flex-1 min-w-[50px]"></div>
                  <ChevronDown size={14} className="text-[#506083] absolute right-[8px] top-1/2 -translate-y-1/2" />
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
                  <div className="text-[8px] font-medium text-[#506083]">0/500</div>
                </div>
                
                {/* Textarea */}
                <textarea 
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
                  <h4 className="text-[11px] font-semibold text-[#172762]">What to Share with HR</h4>
                  <p className="text-[8px] font-medium text-[#506083]">The following information will be shared with the selected HR team members.</p>
                </div>
                
                {/* Cards Grid */}
                <div className="grid grid-cols-4 gap-[6px]">
                  {[
                    { label: "Application Form Details", icon: <FileText size={14} className="text-[#16A34A]" />, bg: "bg-[#DCFCE7]" },
                    { label: "Uploaded CV (Resume)", icon: <Upload size={14} className="text-[#2563EB]" />, bg: "bg-[#E8F1FF]" },
                    { label: "AI Analysis Result", icon: <PieChart size={14} className="text-[#06B6D4]" />, bg: "bg-[#CFFAFE]" },
                    { label: "Screening Questions & Answers", icon: <ClipboardList size={14} className="text-[#2563EB]" />, bg: "bg-[#E8F1FF]" },
                  ].map((card, idx) => (
                    <div key={idx} className="border border-[#16A34A] rounded-[6px] p-[6px] relative bg-[#F4FAF6]">
                      <div className="absolute top-[4px] right-[4px] w-[12px] h-[12px] bg-[#16A34A] rounded-full flex items-center justify-center">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex flex-col items-center text-center gap-[4px]">
                        <div className={`w-[24px] h-[24px] rounded-[4px] ${card.bg} flex items-center justify-center`}>
                          {card.icon}
                        </div>
                        <span className="text-[9px] font-bold text-[#172762] leading-tight">{card.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] p-[6px] flex items-start gap-[6px]">
              <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[2px]">
                <Info size={10} />
              </div>
              <p className="text-[9px] font-medium text-[#1E3A8A] leading-relaxed">
                After forwarding, this candidate will be marked as "Sent to HR" and HR will be able to view all details. Any status updates by HR will be visible in the applications list.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#E1E6EC] p-[10px] px-[16px] bg-[#F8FAFC] flex items-center justify-between rounded-b-[16px]">
          <button 
            onClick={onClose}
            className="px-[16px] py-[6px] bg-white border border-[#E1E6EC] text-[#172762] text-[12px] font-bold rounded-[6px] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-[16px] py-[6px] bg-[#148943] text-white text-[12px] font-bold rounded-[6px] hover:bg-[#117639] transition-colors flex items-center gap-[4px]"
          >
            <Send size={12} className="ml-[-2px]" />
            Forward to HR
          </button>
        </div>

      </div>
    </div>
  );
}
