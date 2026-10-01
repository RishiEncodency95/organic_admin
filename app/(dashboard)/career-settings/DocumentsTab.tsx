import React from "react";
import { 
  FileText, Settings, Eye, Check, Info, GripVertical, Image as ImageIcon, 
  GraduationCap, Briefcase, IdCard, Link as LinkIcon, Paperclip, ChevronDown, 
  CloudUpload, Lightbulb 
} from "lucide-react";

const Toggle2 = ({ checked }: { checked: boolean }) => (
  <div className={`w-[22px] h-[12px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[8px] h-[8px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

const CheckboxSquare = ({ checked }: { checked: boolean }) => (
  <div className={`w-[12px] h-[12px] rounded-[3px] flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#2563EB]' : 'border border-[#E0E5EB] bg-white'}`}>
    {checked && <Check size={8} className="text-white" strokeWidth={3} />}
  </div>
);

export default function DocumentsTab() {
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
                <FileText size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Documents & Application Form Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure required documents, application form fields and validation rules for candidates.</p>
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
            <li>Enable only essential fields to keep the form simple.</li>
            <li>Set clear file size and format rules.</li>
            <li>You can preview how the form looks to candidates.</li>
            <li>Changes will apply to all job postings.</li>
          </ul>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-[6px]">
        
        {/* Column 1 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Required Documents */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Required Documents</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select which documents candidates must upload.</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[12px_minmax(120px,2fr)_minmax(60px,1fr)_minmax(80px,1.5fr)_minmax(50px,1fr)] gap-[12px] items-center mb-[8px] px-[8px] pb-[8px] border-b border-[#E1E6EC]">
              <div className="w-[12px]"></div>
              <div className="text-[10px] font-bold text-[#172762]">Document</div>
              <div className="text-[10px] font-bold text-[#172762] text-center">Required</div>
              <div className="text-[10px] font-bold text-[#172762]">File Format</div>
              <div className="text-[10px] font-bold text-[#172762]">Max Size</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-[1px]">
              {[
                { icon: FileText, color: "text-[#2563EB]", bg: "bg-[#EFF6FF]", name: "Resume / CV", req: true, fmt: "PDF, DOC, DOCX", size: "5 MB" },
                { icon: ImageIcon, color: "text-[#10B981]", bg: "bg-[#ECFDF5]", name: "Passport Size Photo", req: true, fmt: "JPG, PNG", size: "2 MB" },
                { icon: GraduationCap, color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]", name: "Educational Certificates", req: false, fmt: "PDF, JPG, PNG", size: "5 MB" },
                { icon: Briefcase, color: "text-[#F59E0B]", bg: "bg-[#FFFBEB]", name: "Experience Certificates", req: false, fmt: "PDF, JPG, PNG", size: "5 MB" },
                { icon: IdCard, color: "text-[#EC4899]", bg: "bg-[#FDF2F8]", name: "ID Proof (Aadhaar / PAN)", req: false, fmt: "PDF, JPG, PNG", size: "2 MB" },
                { icon: LinkIcon, color: "text-[#9333EA]", bg: "bg-[#FAF5FF]", name: "Portfolio / Work Samples", req: false, fmt: "PDF, JPG, PNG", size: "10 MB" },
                { icon: Paperclip, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]", name: "Other Documents", req: false, fmt: "PDF, DOC, DOCX", size: "5 MB" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[12px_minmax(120px,2fr)_minmax(60px,1fr)_minmax(80px,1.5fr)_minmax(50px,1fr)] gap-[12px] items-center py-[4px] px-[8px] hover:bg-[#F8FAFC] rounded-[6px] transition-colors group cursor-pointer border-b border-[#F1F5F9] last:border-0">
                  <div className="w-[12px] text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors flex justify-center">
                    <GripVertical size={12} />
                  </div>
                  <div className="flex items-center gap-[8px] overflow-hidden">
                    <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${row.bg} ${row.color}`}>
                      <row.icon size={12} />
                    </div>
                    <span className="text-[10px] font-semibold text-[#2C3E5D] truncate">{row.name}</span>
                  </div>
                  <div className="flex justify-center">
                    <CheckboxSquare checked={row.req} />
                  </div>
                  <div className="text-[9.5px] font-semibold text-[#506083] truncate">{row.fmt}</div>
                  <div className="text-[10px] font-semibold text-[#506083] truncate">{row.size}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Validation Rules */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Field Validation Rules</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set validation rules to ensure correct data is submitted.</p>
              </div>
            </div>

            <div className="space-y-[4px]">
              {[
                { label: "Mobile Number", val: "10 digits (India)", eg: "e.g. 9876543210" },
                { label: "Email Address", val: "Valid email format", eg: "e.g. user@domain.com" },
                { label: "CTC Fields", val: "Numeric value only", eg: "e.g. 500000" },
                { label: "Experience", val: "Numeric (in years)", eg: "e.g. 5" },
                { label: "Notice Period", val: "Dropdown (Predefined)", eg: "Configure Options", isLink: true },
                { label: "LinkedIn URL", val: "Valid URL format", eg: "e.g. https://linkedin.com/..." },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-[8px]">
                  <span className="text-[9px] font-semibold text-[#172762] w-[95px] truncate">{item.label}</span>
                  <div className="relative flex-1">
                    <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-semibold text-[#506083] appearance-none outline-none">
                      <option>{item.val}</option>
                    </select>
                    <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#506083]" />
                  </div>
                  <span className={`text-[8.5px] font-semibold w-[80px] truncate ${item.isLink ? 'text-[#2563EB] cursor-pointer hover:underline' : 'text-[#94A3B8]'}`}>
                    {item.eg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Application Form Fields */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Application Form Fields</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure fields in the candidate application form.</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[12px_minmax(120px,1.5fr)_60px_50px_1fr] gap-[12px] items-end mb-[8px] px-[2px]">
              <div className="w-[12px]"></div>
              <div className="text-[10px] font-bold text-[#172762] pb-[2px]">Field Name</div>
              <div className="text-[10px] font-bold text-[#172762] text-center leading-[1.2]">Show in<br/>Form</div>
              <div className="text-[10px] font-bold text-[#172762] text-center pb-[2px]">Required</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-[1px]">
              {[
                { name: "Full Name", show: true, req: true },
                { name: "Email Address", show: true, req: true },
                { name: "Mobile Number", show: true, req: true },
                { name: "Current Location", show: true, req: true },
                { name: "Current CTC", show: true, req: false },
                { name: "Expected CTC", show: true, req: false },
                { name: "Total Experience", show: true, req: true },
                { name: "Current Company", show: true, req: false },
                { name: "Notice Period", show: true, req: false },
                { name: "Willing to Relocate", show: true, req: false },
                { name: "LinkedIn Profile", show: true, req: false },
                { name: "Portfolio / Website", show: true, req: false },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[12px_minmax(120px,1.5fr)_60px_50px_1fr] gap-[12px] items-center py-[3px] px-[2px] hover:bg-[#F8FAFC] rounded-[4px] transition-colors group cursor-pointer border-b border-[#F1F5F9] last:border-0">
                  <div className="w-[12px] text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors flex justify-center">
                    <GripVertical size={12} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#172762] truncate">{row.name}</span>
                  <div className="flex justify-center">
                    <CheckboxSquare checked={row.show} />
                  </div>
                  <div className="flex justify-center">
                    <CheckboxSquare checked={row.req} />
                  </div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Form Settings */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Additional Form Settings</h3>
              </div>
            </div>

            <div className="space-y-[4px]">
              {[
                { label: "Enable multi-step application form", active: true },
                { label: "Show progress bar", active: true },
                { label: "Enable draft save (candidate can resume later)", active: true },
                { label: "Enable terms & conditions checkbox", active: true },
                { label: "Enable reCAPTCHA (Bot protection)", active: true },
                { label: "Allow multiple applications per candidate", active: false },
                { label: "Show expected time to complete form", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-[#172762]">{item.label}</span>
                  <Toggle2 checked={item.active} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Form Preview (Candidate View) */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Eye size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Form Preview (Candidate View)</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">This is how the form will look to candidates on the website.</p>
              </div>
            </div>

            {/* Preview Box */}
            <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-[8px] shadow-sm">
              <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Apply for This Position</h4>
              
              <div className="space-y-[4px]">
                <div className="grid grid-cols-2 gap-[6px]">
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Full Name <span className="text-red-500">*</span></label>
                    <input disabled type="text" placeholder="Enter your full name" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Email Address <span className="text-red-500">*</span></label>
                    <input disabled type="text" placeholder="Enter your email address" className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <div className="border border-[#E1E6EC] border-r-0 rounded-l-[4px] px-[4px] py-[4px] text-[8px] font-semibold text-[#506083] bg-[#F8FAFC] flex items-center gap-[2px]">
                      +91 <ChevronDown size={8} />
                    </div>
                    <input disabled type="text" placeholder="Enter mobile number" className="flex-1 border border-[#E1E6EC] rounded-r-[4px] px-[6px] py-[4px] text-[8px] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Current Location</label>
                  <div className="relative">
                    <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                      <option>Select location</option>
                    </select>
                    <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[6px]">
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Current CTC</label>
                    <div className="relative">
                      <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                        <option>Select</option>
                      </select>
                      <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Expected CTC</label>
                    <div className="relative">
                      <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                        <option>Select</option>
                      </select>
                      <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[8px]">
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Total Experience <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                        <option>Select</option>
                      </select>
                      <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Notice Period <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                        <option>Select</option>
                      </select>
                      <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Upload Resume / CV <span className="text-red-500">*</span></label>
                  <div className="border border-dashed border-[#CBD5E1] rounded-[4px] bg-[#F8FAFC] py-[8px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                    <CloudUpload size={14} className="text-[#2563EB] mb-[2px]" />
                    <p className="text-[8.5px] font-semibold text-[#172762]">Click to upload <span className="font-medium text-[#506083]">or drag & drop</span></p>
                    <p className="text-[7.5px] font-medium text-[#94A3B8]">PDF, DOC, DOCX (Max 5 MB)</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Confirmation Screen */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Check size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Confirmation Screen</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Message shown after successful submission.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] p-[10px] flex flex-col items-center text-center">
              <div className="w-[24px] h-[24px] bg-[#148943] rounded-full flex items-center justify-center text-white mb-[8px] shadow-sm">
                <Check size={14} strokeWidth={3} />
              </div>
              <h4 className="text-[10px] font-bold text-[#148943] mb-[4px]">Application Submitted Successfully!</h4>
              <p className="text-[8px] font-semibold text-[#506083] leading-tight mb-[10px] max-w-[85%] mx-auto">
                Thank you for applying. We have received your application and our team will review it. You will be notified about the next steps.
              </p>
              <button className="bg-white border border-[#D5E6FA] text-[#2563EB] px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors">
                Edit Confirmation Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
