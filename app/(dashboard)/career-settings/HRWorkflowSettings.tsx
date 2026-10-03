import React from 'react';
import { Users, Info, X, ChevronDown, ArrowRight } from 'lucide-react';

const Toggle = ({ checked, disabled }: { checked?: boolean, disabled?: boolean }) => (
  <div className={`w-[32px] h-[18px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[14px] h-[14px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[14px]' : 'translate-x-0'}`} />
  </div>
);

export default function HRWorkflowSettings() {
  return (
    <div className="flex flex-col gap-[16px] py-[8px]">
      
      {/* 1. HR & Workflow */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm">
        <div className="flex items-start justify-between mb-[12px]">
          <div className="flex items-center gap-[16px]">
            <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#172762]">HR & Workflow</h2>
              <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Manage how applications are forwarded to HR team for review.</p>
            </div>
          </div>
          <div className="bg-[#E8F5E9] rounded-[6px] p-[12px] flex items-start gap-[10px] max-w-[360px]">
            <div className="mt-[2px] text-[#148943]">
              <Info size={16} className="fill-[#148943] text-white" />
            </div>
            <p className="text-[10px] font-medium text-[#148943] leading-[1.4]">
              These settings control how applications are shared with HR and how HR status is managed and displayed on the system.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[32px] pt-[16px] border-t border-[#E1E6EC]">
          {/* HR Recipient(s) */}
          <div>
            <label className="block text-[11px] font-bold text-[#172762] mb-[10px]">
              HR Recipient(s) <span className="text-red-500">*</span>
            </label>
            <div className="border border-[#E1E6EC] rounded-[6px] p-[6px] flex flex-wrap gap-[6px] items-center bg-white min-h-[40px] relative">
              <div className="flex items-center gap-[6px] bg-[#F4F7FB] border border-[#E1E6EC] rounded-[4px] px-[10px] py-[5px]">
                <span className="text-[10px] font-semibold text-[#172762]">hr@namogangewellness.com</span>
                <X size={12} className="text-[#506083] cursor-pointer hover:text-red-500" />
              </div>
              <div className="flex items-center gap-[6px] bg-[#F4F7FB] border border-[#E1E6EC] rounded-[4px] px-[10px] py-[5px]">
                <span className="text-[10px] font-semibold text-[#172762]">recruitment@namogangewellness.com</span>
                <X size={12} className="text-[#506083] cursor-pointer hover:text-red-500" />
              </div>
              <ChevronDown size={14} className="text-[#506083] absolute right-[10px] top-[14px]" />
            </div>
            <p className="text-[9.5px] font-medium text-[#506083] mt-[8px]">
              Selected members will receive an email notification when an application is forwarded.
            </p>
          </div>

          {/* Forward to HR */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Forward to HR</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <div className="text-[11px] font-bold text-[#172762]">Manual Forward by Website Team</div>
                <p className="text-[9.5px] font-medium text-[#506083] mt-[4px] leading-[1.3]">
                  Website team can manually forward selected applications to HR.
                </p>
              </div>
            </div>
          </div>

          {/* Notify HR */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Notify HR</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <div className="text-[11px] font-bold text-[#172762]">Send email notification</div>
                <p className="text-[9.5px] font-medium text-[#506083] mt-[4px] leading-[1.3]">
                  HR will receive email with candidate details when forwarded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HR Status Tracking */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm">
        <div className="flex items-center gap-[16px] mb-[20px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center font-bold text-[20px]">
            2
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#172762]">HR Status Tracking</h2>
            <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Manage application status flow and default settings for HR review.</p>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-[#172762] mb-[14px]">Status Flow (Read Only for Website Team)</h3>
          
          <div className="flex items-center flex-wrap gap-[6px]">
            <div className="bg-[#EBF3FF] text-[#2563EB] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Sent to HR</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#EBF3FF] text-[#2563EB] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[100px] text-center">Under Review</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#FFF3E0] text-[#D97706] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Shortlisted</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#F3E8FF] text-[#9333EA] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Interview</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#E8F5E9] text-[#148943] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Selected</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#FEE2E2] text-[#DC2626] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Rejected</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#F1F5F9] text-[#475569] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">On Hold</div>
            <ArrowRight size={14} className="text-[#94A3B8]" />
            <div className="bg-[#E8F5E9] text-[#148943] px-[16px] py-[8px] rounded-[6px] text-[10px] font-bold min-w-[90px] text-center">Joined</div>
          </div>

          <div className="mt-[20px] bg-[#F4F7FB] rounded-[6px] p-[12px] flex items-center gap-[10px]">
            <div className="text-[#2563EB]">
              <Info size={16} className="fill-[#2563EB] text-white" />
            </div>
            <p className="text-[10px] font-medium text-[#506083]">
              HR team will update the status. Website team cannot change HR status.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Status Sync & Visibility */}
      <div className="bg-white rounded-[8px] border border-[#E1E6EC] p-[20px] shadow-sm mb-[20px]">
        <div className="flex items-center gap-[16px] mb-[20px]">
          <div className="w-[48px] h-[48px] rounded-full bg-[#E8F5E9] text-[#148943] flex items-center justify-center font-bold text-[20px]">
            3
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#172762]">Status Sync & Visibility</h2>
            <p className="text-[11px] font-medium text-[#506083] mt-[4px]">Choose what HR information to show in the applications list and candidate details page.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[32px] pt-[8px]">
          {/* Show HR Status */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show HR Status</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display latest HR status in applications list and candidate details page.
                </p>
              </div>
            </div>
          </div>

          {/* Show Latest HR Remark */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show Latest HR Remark</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display latest remark / comment from HR.
                </p>
              </div>
            </div>
          </div>

          {/* Show Updated By & Date/Time */}
          <div>
            <h3 className="text-[11px] font-bold text-[#172762] mb-[10px]">Show Updated By & Date/Time</h3>
            <div className="flex gap-[12px]">
              <div className="mt-[2px]"><Toggle checked={true} /></div>
              <div>
                <p className="text-[9.5px] font-medium text-[#506083] leading-[1.3]">
                  Display name of HR member and last updated date & time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
