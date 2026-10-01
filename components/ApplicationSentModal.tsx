import React from 'react';
import { 
  X, 
  Check, 
  Briefcase, 
  Calendar, 
  Users,
  Info,
  ArrowRight
} from 'lucide-react';

interface ApplicationSentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationSentModal({ isOpen, onClose }: ApplicationSentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px]">
      {/* Modal Container */}
      <div className="bg-white rounded-[12px] shadow-2xl w-[720px] max-w-[95vw] max-h-[90vh] overflow-y-auto font-sans relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Header */}
        <div className="p-[20px] flex items-start gap-[12px] border-b border-transparent relative z-10">
          <div className="w-[32px] h-[32px] bg-[#00893B] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(0,137,59,0.3)] mt-[2px]">
            <Check size={18} className="text-white" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-semibold text-[#172762] tracking-[-0.4px]">Application Sent to HR</h2>
            <p className="text-[9.5px] font-semibold text-[#344574] mt-[2px]">This candidate has been successfully forwarded to the selected HR team members.</p>
          </div>
          <button onClick={onClose} className="text-[#172762] hover:bg-gray-100 p-[4px] rounded-full transition-colors mt-[-4px] mr-[-4px]">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        {/* Content */}
        <div className="px-[20px] pb-[20px] space-y-[16px]">
          {/* Candidate Card & Graphic Section */}
          <div className="flex items-stretch justify-between relative overflow-visible">
            
            {/* Candidate Info Card */}
            <div className="border border-[#E0E5EB] rounded-[8px] px-[16px] py-[12px] flex items-center gap-[16px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] z-10 w-[65%]">
              {/* Avatar */}
              <div className="w-[64px] h-[64px] rounded-full overflow-hidden border border-[#E0E5EB] flex-shrink-0 bg-gray-100">
                <img src="https://i.pravatar.cc/150?img=47" alt="Priya Sharma" className="w-full h-full object-cover" />
              </div>
              {/* Info */}
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-[#172762] leading-tight">Priya Sharma</h3>
                <p className="text-[9.5px] font-bold text-[#172762] mt-[4px] leading-tight">Sales Manager – Domestic Exhibition Sales & Sponsorships</p>
                
                <div className="flex items-center gap-[10px] mt-[6px] text-[#506083] text-[9.5px] font-semibold leading-none">
                  <div className="flex items-center gap-[4px]">
                    <Briefcase size={11} className="text-[#344574]" strokeWidth={2.5} />
                    <span className="text-[#344574] font-bold">BOE-SALES-001</span>
                  </div>
                  <div className="w-[1px] h-[10px] bg-[#CBD5E1]"></div>
                  <div className="flex items-center gap-[4px]">
                    <Calendar size={11} className="text-[#344574]" strokeWidth={2.5} />
                    <span className="text-[#344574] font-bold">Applied on 17 Oct 2026</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-[8px] mt-[10px]">
                  <div className="bg-[#F0FDF4] text-[#166534] px-[8px] py-[4px] rounded-[6px] text-[11px] font-extrabold shadow-sm border border-[#DCFCE7]">
                    92%
                  </div>
                  <div className="bg-[#F0FDF4] text-[#166534] px-[8px] py-[4px] rounded-[6px] text-[10px] font-bold shadow-sm border border-[#DCFCE7]">
                    Eligible Match
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="absolute right-[-20px] top-[-30px] bottom-[-20px] w-[60%] flex justify-end z-0 pointer-events-none">
              <img src="/apli_fo.png" alt="Application Sent" className="w-full h-full object-contain object-right" />
            </div>
          </div>

          {/* Sent to HR Team */}
          <div className="bg-[#F4FAF6] border border-[#DFF0E6] rounded-[8px] p-[16px] flex items-center justify-between relative z-10">
            <div className="flex items-start gap-[12px] flex-1 overflow-hidden">
              <div className="mt-0.5 text-[#00893B]">
                <Users size={20} fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-bold text-[#172762]">Sent to HR Team</h3>
                <p className="text-[9.5px] font-semibold text-[#344574] mt-[2px] leading-tight">The complete candidate application, CV and AI analysis have been shared with the following members.</p>
                
                {/* HR Members Tags */}
                <div className="flex items-center gap-[4px] mt-[12px] flex-nowrap">
                  <div className="flex items-center gap-[4px] bg-white border border-[#E0E5EB] rounded-[6px] px-[6px] py-[4px] shadow-sm flex-shrink-0">
                    <Users size={12} className="text-[#2563EB]" fill="currentColor" />
                    <span className="text-[8px] font-bold text-[#172762] whitespace-nowrap">HR Team (General)</span>
                  </div>
                  <div className="flex items-center gap-[4px] bg-white border border-[#E0E5EB] rounded-[6px] px-[6px] py-[4px] shadow-sm flex-shrink-0">
                    <div className="w-[14px] h-[14px] bg-[#9B51E0] text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                      S
                    </div>
                    <span className="text-[8px] font-bold text-[#172762] whitespace-nowrap">Srujana Paidi (CHRO)</span>
                  </div>
                  <div className="flex items-center gap-[4px] bg-white border border-[#E0E5EB] rounded-[6px] px-[6px] py-[4px] shadow-sm flex-shrink-0">
                    <div className="w-[14px] h-[14px] bg-[#2563EB] text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                      V
                    </div>
                    <span className="text-[8px] font-bold text-[#172762] whitespace-nowrap">Vijay Sharma (CHRO)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="flex items-start gap-[12px] pl-[16px] border-l border-[#DFF0E6] ml-[16px] flex-shrink-0">
              <Calendar size={16} className="text-[#2872CE] mt-[1px]" />
              <div>
                <p className="text-[9.5px] font-semibold text-[#506083] leading-tight">Sent on</p>
                <p className="text-[10.5px] font-bold text-[#172762] mt-[1px] leading-tight">17 Oct 2026, 12:05 PM</p>
                <p className="text-[9.5px] font-semibold text-[#506083] mt-[2px] leading-tight">By Rishi Kumar</p>
              </div>
            </div>
          </div>

          {/* Application Journey */}
          <div className="border border-[#E0E5EB] rounded-[8px] p-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] bg-white">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <Users size={12} className="text-[#172762]" />
              <h3 className="text-[10px] font-bold text-[#172762]">Application Journey</h3>
            </div>
            
            {/* Timeline */}
            <div className="relative flex justify-between items-start px-[16px] pb-[4px]">
              {/* Connecting Line */}
              <div className="absolute top-[9px] left-[40px] right-[40px] h-[2px] z-0 flex">
                <div className="h-full bg-[#00893B] flex-1"></div>
                <div className="h-full bg-[#00893B] flex-1"></div>
                <div className="h-full bg-[#00893B] flex-1"></div>
                <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
                <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
                <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
              </div>

              {/* Steps */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[6px] shadow-[0_0_0_4px_white]">
                  <Check size={10} strokeWidth={3} />
                </div>
                <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">Submitted</div>
                <div className="text-[8.5px] font-semibold text-[#506083] mt-[1px] leading-tight whitespace-nowrap">17 Oct 11:24 AM</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[6px] shadow-[0_0_0_4px_white]">
                  <Check size={10} strokeWidth={3} />
                </div>
                <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">AI Analysis</div>
                <div className="text-[8.5px] font-semibold text-[#506083] mt-[1px] leading-tight whitespace-nowrap">Completed</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[6px] shadow-[0_0_0_4px_white]">
                  <Check size={10} strokeWidth={3} />
                </div>
                <div className="text-[9.5px] font-bold text-[#00893B] leading-tight whitespace-nowrap">Eligible</div>
                <div className="text-[9.5px] font-bold text-[#00893B] mt-[1px] leading-tight whitespace-nowrap">(92%)</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[6px] shadow-[0_0_0_4px_white]">
                  <Check size={10} strokeWidth={3} />
                </div>
                <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">Sent to HR</div>
                <div className="text-[8.5px] font-semibold text-[#506083] mt-[1px] leading-tight whitespace-nowrap">17 Oct 12:05 PM</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-white border-[3px] border-[#94A3B8] rounded-full flex items-center justify-center mb-[6px] shadow-[0_0_0_4px_white]">
                </div>
                <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">HR Review</div>
                <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[1px] leading-tight whitespace-nowrap">Pending</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-white border-[3px] border-[#CBD5E1] rounded-full flex items-center justify-center mb-[6px] shadow-[0_0_0_4px_white]">
                </div>
                <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">Interview</div>
                <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[1px] leading-tight whitespace-nowrap">-</div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-[18px] h-[18px] bg-white border-[3px] border-[#CBD5E1] rounded-full flex items-center justify-center mb-[6px] shadow-[0_0_0_4px_white]">
                </div>
                <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">Final Status</div>
                <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[1px] leading-tight whitespace-nowrap">-</div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#EEF4FF] rounded-[6px] p-[10px] flex items-start gap-[8px]">
            <Info size={14} className="text-[#2563EB] flex-shrink-0" fill="currentColor" color="white" />
            <p className="text-[9.5px] font-semibold text-[#2563EB] leading-[1.4]">
              HR will now review the application and update the status. Any updates made by HR will be visible in the applications list.<br/>
              You will be notified if there is any change in status.
            </p>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div className="px-[20px] pb-[20px] flex justify-end gap-[8px]">
          <button className="flex items-center gap-[4px] px-[12px] py-[6px] border border-[#D5E6FA] text-[#2563EB] font-bold text-[9.5px] rounded-[4px] hover:bg-[#EEF4FF] transition-colors bg-white">
            View Full Application
            <ArrowRight size={10} strokeWidth={2.5} />
          </button>
          <button onClick={onClose} className="px-[16px] py-[6px] bg-[#2563EB] text-white font-bold text-[9.5px] rounded-[4px] hover:bg-[#1D4ED8] transition-colors shadow-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
