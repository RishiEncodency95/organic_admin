import React from 'react';
import { 
  X, ChevronLeft, ChevronRight, ChevronDown, Check, Briefcase, Calendar, 
  MapPin, Phone, Mail, FileText, Printer, ArrowRight, Download, UserCircle,
  FileBadge2, Award, Clock, BriefcaseBusiness, Contact, ShieldCheck
} from 'lucide-react';

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateDetailsModal({ isOpen, onClose }: CandidateDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-[2px] pl-[260px]">
      {/* Modal Container */}
      <div className="bg-white rounded-[12px] shadow-2xl w-[1000px] max-w-[95vw] h-auto flex flex-col font-sans relative overflow-hidden">
        
        {/* Header */}
        <div className="px-[20px] py-[10px] flex items-center justify-between border-b border-[#E0E5EB] bg-white z-20">
          <h2 className="text-[16px] font-bold text-[#172762] tracking-[-0.4px]">Candidate Details</h2>
          
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center gap-[4px]">
              <button className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E5EB] flex items-center justify-center text-[#506083] hover:bg-gray-50 transition-colors">
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <button className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E5EB] flex items-center justify-center text-[#506083] hover:bg-gray-50 transition-colors">
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
            
            <button className="flex items-center gap-[6px] px-[12px] h-[28px] rounded-[6px] border border-[#2563EB] text-[#2563EB] font-bold text-[9.5px] hover:bg-[#EEF4FF] transition-colors">
              Actions
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            
            <div className="w-[1px] h-[20px] bg-[#E0E5EB]"></div>
            
            <button onClick={onClose} className="text-[#172762] hover:bg-gray-100 p-[4px] rounded-full transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Content (Scrollbar hidden) */}
        <div className="flex-1 bg-[#F8FAFC]">
          
          {/* Top Section Wrapper (White Background) */}
          <div className="bg-white px-[20px] pt-[12px] pb-[0px]">
            
            {/* Candidate Card */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-[16px]">
                {/* Avatar */}
                <div className="w-[56px] h-[56px] rounded-full overflow-hidden border-2 border-[#E0E5EB] flex-shrink-0 bg-gray-100 mt-[2px]">
                  <img src="https://i.pravatar.cc/150?img=47" alt="Priya Sharma" className="w-full h-full object-cover" />
                </div>
                
                {/* Info */}
                <div className="mt-[2px]">
                  <div className="flex items-center gap-[8px]">
                    <h3 className="text-[16px] font-bold text-[#172762] leading-tight">Priya Sharma</h3>
                    <div className="bg-[#E4F4E7] text-[#1E7139] px-[8px] py-[3px] rounded-[4px] text-[9.5px] font-bold border border-[#CDEBD4] leading-none">
                      Eligible (92%)
                    </div>
                  </div>
                  <p className="text-[10.5px] font-bold text-[#172762] leading-tight">Sales Manager – Domestic Exhibition Sales & Sponsorships</p>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-x-[24px] gap-y-[2px] mt-[4px]">
                    <div className="flex items-center gap-[6px] text-[#506083] text-[9.5px] font-semibold">
                      <Briefcase size={12} className="text-[#344574]" strokeWidth={2.5} />
                      <span className="text-[#344574] font-bold">BOE-SALES-001</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[#506083] text-[9.5px] font-semibold">
                      <Calendar size={12} className="text-[#344574]" strokeWidth={2.5} />
                      <span className="text-[#344574] font-bold">Applied on 17 Oct 2026, 11:24 AM</span>
                    </div>
                    <div className="flex items-center gap-[6px] text-[#506083] text-[9.5px] font-semibold">
                      <Phone size={12} className="text-[#2563EB]" strokeWidth={2.5} />
                      <span className="text-[#2563EB] font-bold">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-[24px]">
                      <div className="flex items-center gap-[6px] text-[#506083] text-[9.5px] font-semibold">
                        <Mail size={12} className="text-[#2563EB]" strokeWidth={2.5} />
                        <span className="text-[#2563EB] font-bold">priya.sharma@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-[6px] text-[#506083] text-[9.5px] font-semibold">
                        <MapPin size={12} className="text-[#344574]" strokeWidth={2.5} />
                        <span className="text-[#344574] font-bold">Delhi NCR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[6px]">
                <button className="flex items-center justify-center gap-[6px] w-[130px] h-[32px] bg-[#00893B] text-white rounded-[6px] text-[9.5px] font-bold hover:bg-[#007030] transition-colors shadow-sm">
                  <ArrowRight size={12} strokeWidth={3} />
                  Forward to HR
                </button>
                <button className="flex items-center justify-center gap-[6px] w-[130px] h-[32px] bg-white border border-[#2563EB] text-[#2563EB] rounded-[6px] text-[9.5px] font-bold hover:bg-[#EEF4FF] transition-colors">
                  <Download size={12} strokeWidth={2.5} />
                  Download CV
                </button>
                <button className="flex items-center justify-center gap-[6px] w-[130px] h-[32px] bg-white border border-[#2563EB] text-[#2563EB] rounded-[6px] text-[9.5px] font-bold hover:bg-[#EEF4FF] transition-colors">
                  <FileText size={12} strokeWidth={2.5} />
                  Add Note
                </button>
                <button className="flex items-center justify-center gap-[6px] w-[130px] h-[32px] bg-white border border-[#2563EB] text-[#2563EB] rounded-[6px] text-[9.5px] font-bold hover:bg-[#EEF4FF] transition-colors">
                  <Printer size={12} strokeWidth={2.5} />
                  Print
                </button>
              </div>
            </div>

            {/* Timeline Box */}
            <div className="mt-[10px] border border-[#E2E8F0] rounded-[8px] py-[8px] bg-[#FAFAFA]">
              {/* Timeline */}
              <div className="relative flex justify-between items-start px-[24px]">
                {/* Connecting Line */}
                <div className="absolute top-[8px] left-[45px] right-[45px] h-[2px] z-0 flex">
                  <div className="h-full bg-[#00893B] flex-1"></div>
                  <div className="h-full bg-[#00893B] flex-1"></div>
                  <div className="h-full bg-[#00893B] flex-1"></div>
                  <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
                  <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
                  <div className="h-full border-t-[2px] border-dashed border-[#CBD5E1] flex-1"></div>
                </div>

                {/* Steps */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">Submitted</div>
                  <div className="text-[8.5px] font-semibold text-[#506083] mt-[2px] leading-tight whitespace-nowrap">17 Oct 11:24 AM</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">AI Analysis</div>
                  <div className="text-[8.5px] font-semibold text-[#506083] mt-[2px] leading-tight whitespace-nowrap">Completed</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-[#00893B] rounded-full flex items-center justify-center text-white mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <div className="text-[9.5px] font-bold text-[#00893B] leading-tight whitespace-nowrap">Eligible</div>
                  <div className="text-[9.5px] font-bold text-[#00893B] mt-[2px] leading-tight whitespace-nowrap">(92%)</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-white border-[2px] border-[#2563EB] rounded-full flex items-center justify-center text-[#2563EB] mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                    <ArrowRight size={8} strokeWidth={3} />
                  </div>
                  <div className="text-[9.5px] font-bold text-[#172762] leading-tight whitespace-nowrap">Forwarded to HR</div>
                  <div className="text-[8.5px] font-semibold text-[#506083] mt-[2px] leading-tight whitespace-nowrap">Not Yet</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-white border-[3px] border-[#94A3B8] rounded-full flex items-center justify-center mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                    <Check size={8} strokeWidth={3} className="text-[#94A3B8] opacity-0" />
                  </div>
                  <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">HR Review</div>
                  <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[2px] leading-tight whitespace-nowrap">Pending</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-white border-[3px] border-[#CBD5E1] rounded-full flex items-center justify-center mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                  </div>
                  <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">Interview</div>
                  <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[2px] leading-tight whitespace-nowrap">-</div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-[16px] h-[16px] bg-white border-[3px] border-[#CBD5E1] rounded-full flex items-center justify-center mb-[4px] shadow-[0_0_0_4px_#FAFAFA]">
                  </div>
                  <div className="text-[9.5px] font-bold text-[#506083] leading-tight whitespace-nowrap">Final Status</div>
                  <div className="text-[8.5px] font-semibold text-[#94A3B8] mt-[2px] leading-tight whitespace-nowrap">-</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-[10px] border-b border-[#E0E5EB] mt-[16px]">
              <button className="text-[10px] font-bold text-[#2563EB] border-b-2 border-[#2563EB] pb-[8px] px-[4px]">
                Overview
              </button>
              <button className="text-[10px] font-bold text-[#506083] pb-[8px] px-[4px] hover:text-[#172762] transition-colors">
                Application Form
              </button>
              <button className="text-[10px] font-bold text-[#506083] pb-[8px] px-[4px] hover:text-[#172762] transition-colors">
                AI Analysis
              </button>
              <button className="text-[10px] font-bold text-[#506083] pb-[8px] px-[4px] hover:text-[#172762] transition-colors">
                CV Preview
              </button>
              <button className="text-[10px] font-bold text-[#506083] pb-[8px] px-[4px] hover:text-[#172762] transition-colors">
                HR Status
              </button>
              <button className="text-[10px] font-bold text-[#506083] pb-[8px] px-[4px] hover:text-[#172762] transition-colors">
                Activity Log
              </button>
            </div>
          </div>

          {/* Grid Content */}
          <div className="px-[20px] pb-[16px] pt-[8px] grid grid-cols-[1fr_1.15fr_0.85fr] gap-[10px]">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-[10px] h-full">
              {/* Application Details */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px]">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Application Details</h4>
                <div className="space-y-[2px]">
                  <div className="grid grid-cols-[130px_1fr] items-start">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Briefcase size={12} />
                      <span className="text-[9.5px] font-bold">Job Position</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">Sales Manager – Domestic Exhibition Sales & Sponsorships</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <FileBadge2 size={12} />
                      <span className="text-[9.5px] font-bold">Job Code</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">BOE-SALES-001</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Calendar size={12} />
                      <span className="text-[9.5px] font-bold">Application Date</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] whitespace-nowrap">17 Oct 2026, 11:24 AM</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Clock size={12} />
                      <span className="text-[9.5px] font-bold">Application Stage</span>
                    </div>
                    <div>
                      <span className="inline-block bg-[#E9F2FF] text-[#2563EB] px-[8px] py-[3px] rounded-[4px] text-[8.5px] font-bold border border-[#D5E6FA]">
                        Submitted
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Award size={12} />
                      <span className="text-[9.5px] font-bold">Source</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">Career Page</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Check size={12} />
                      <span className="text-[9.5px] font-bold">Current Status (AI)</span>
                    </div>
                    <div>
                      <span className="inline-block bg-[#E4F4E7] text-[#1E7139] px-[8px] py-[3px] rounded-[4px] text-[8.5px] font-bold border border-[#CDEBD4]">
                        Eligible (92%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px] flex-1 flex flex-col">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Personal Information</h4>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <UserCircle size={12} />
                      <span className="text-[9.5px] font-bold">Full Name</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">Priya Sharma</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Mail size={12} />
                      <span className="text-[9.5px] font-bold">Email</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">priya.sharma@gmail.com</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Phone size={12} />
                      <span className="text-[9.5px] font-bold">Mobile</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">+91 98765 43210</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <MapPin size={12} />
                      <span className="text-[9.5px] font-bold">Location</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">Delhi NCR</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <MapPin size={12} />
                      <span className="text-[9.5px] font-bold">Current City</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">Delhi, India</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Check size={12} />
                      <span className="text-[9.5px] font-bold">Willing to Relocate</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">Yes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-[10px] h-full">
              {/* AI Analysis Result */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px]">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">AI Analysis Result</h4>
                <div className="flex items-start gap-[10px]">
                  <div className="w-[48px] h-[48px] rounded-full border-[4px] border-[#00893B] flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-extrabold text-[#00893B]">92%</span>
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-bold text-[#00893B]">Eligible Match</h5>
                    <p className="text-[9.5px] font-semibold text-[#506083] mt-[2px] leading-tight">Strong match for the role based on skills, experience and industry background.</p>
                    <button className="mt-[4px] px-[8px] py-[3px] border border-[#2563EB] text-[#2563EB] rounded-[4px] text-[9.5px] font-bold flex items-center gap-[4px] hover:bg-[#EEF4FF] transition-colors">
                      View Detailed Analysis
                      <ArrowRight size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Skills */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px]">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Key Skills (Matched)</h4>
                <div className="flex flex-wrap gap-[4px]">
                  {["B2B Sales", "Exhibition Sales", "Sponsorship Sales", "Lead Generation", "Client Meetings", "Negotiation", "Deal Closure", "CRM"].map((skill) => (
                    <span key={skill} className="bg-[#E6F8ED] text-[#148943] px-[8px] py-[4px] rounded-[4px] text-[9.5px] font-semibold whitespace-nowrap">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px] flex-1">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Work Experience</h4>
                <div className="space-y-[2px]">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px]">
                      <Calendar size={12} className="text-[#2563EB]" />
                      <span className="text-[9.5px] font-semibold text-[#506083]">Total Experience</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">5 Years</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px]">
                      <Briefcase size={12} className="text-[#2563EB]" />
                      <span className="text-[9.5px] font-semibold text-[#506083]">Current Company</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">ABC Exhibitions Pvt. Ltd.</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px]">
                      <BriefcaseBusiness size={12} className="text-[#2563EB]" />
                      <span className="text-[9.5px] font-semibold text-[#506083]">Current Designation</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">Assistant Manager – Exhibitions</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px]">
                      <Contact size={12} className="text-[#2563EB]" />
                      <span className="text-[9.5px] font-semibold text-[#506083]">Previous Company</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">XYZ Events Pvt. Ltd.</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-start">
                    <div className="flex items-center gap-[6px]">
                      <ShieldCheck size={12} className="text-[#2563EB]" />
                      <span className="text-[9.5px] font-semibold text-[#506083]">Key Industries</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] truncate">Exhibitions, Trade Shows, B2B Sales</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-[10px] h-full">
              {/* Candidate Photo */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px]">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Candidate Photo</h4>
                <div className="flex items-center gap-[8px]">
                  <div className="w-[36px] h-[36px] rounded-[6px] overflow-hidden border border-[#E0E5EB]">
                    <img src="https://i.pravatar.cc/150?img=47" alt="Candidate" className="w-full h-full object-cover" />
                  </div>
                  <button className="flex items-center gap-[4px] text-[#2563EB] text-[9.5px] font-bold hover:underline">
                    <Download size={12} />
                    Download Photo
                  </button>
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px]">
                <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Compensation & Availability</h4>
                <div className="space-y-[2px]">
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Calendar size={12} />
                      <span className="text-[9.5px] font-bold">Current CTC</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">₹42,000 / month</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Calendar size={12} />
                      <span className="text-[9.5px] font-bold">Expected CTC</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762] whitespace-nowrap">₹50,000 - ₹55,000 / month</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <Clock size={12} />
                      <span className="text-[9.5px] font-bold">Notice Period</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">30 Days</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] items-center">
                    <div className="flex items-center gap-[6px] text-[#506083]">
                      <UserCircle size={12} />
                      <span className="text-[9.5px] font-bold">Joining Availability</span>
                    </div>
                    <span className="text-[9.5px] font-bold text-[#172762]">After 30 Days</span>
                  </div>
                </div>
              </div>

              {/* Screening Questions */}
              <div className="bg-white border border-[#E0E5EB] rounded-[8px] p-[10px] flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-[6px]">
                  <h4 className="text-[10px] font-bold text-[#172762]">Screening Questions (10)</h4>
                  <button className="text-[9.5px] font-bold text-[#2563EB] flex items-center gap-[2px] hover:underline">
                    View All <ArrowRight size={10} />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-[8px]">
                    <div className="flex gap-[4px] text-[9.5px] text-[#172762] font-semibold">
                      <span>1.</span>
                      <span className="leading-tight">Do you have experience in exhibition...</span>
                    </div>
                    <span className="bg-[#E4F4E7] text-[#1E7139] px-[6px] py-[2px] rounded-[4px] text-[8.5px] font-bold flex-shrink-0 border border-[#CDEBD4]">Yes</span>
                  </div>
                  <div className="flex justify-between items-start gap-[8px]">
                    <div className="flex gap-[4px] text-[9.5px] text-[#172762] font-semibold">
                      <span>2.</span>
                      <span className="leading-tight">Which industry segments have you...</span>
                    </div>
                    <span className="bg-[#E9F2FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[8.5px] font-bold flex-shrink-0 border border-[#D5E6FA]">Organic, AYUSH</span>
                  </div>
                  <div className="flex justify-between items-start gap-[8px]">
                    <div className="flex gap-[4px] text-[9.5px] text-[#172762] font-semibold">
                      <span>3.</span>
                      <span className="leading-tight">Current CTC?</span>
                    </div>
                    <span className="bg-[#E9F2FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[8.5px] font-bold flex-shrink-0 border border-[#D5E6FA]">₹42,000</span>
                  </div>
                  <div className="flex justify-between items-start gap-[8px]">
                    <div className="flex gap-[4px] text-[9.5px] text-[#172762] font-semibold">
                      <span>4.</span>
                      <span className="leading-tight">Expected CTC?</span>
                    </div>
                    <span className="bg-[#E9F2FF] text-[#2563EB] px-[6px] py-[2px] rounded-[4px] text-[8.5px] font-bold flex-shrink-0 border border-[#D5E6FA]">₹50,000 - ₹55,000</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
