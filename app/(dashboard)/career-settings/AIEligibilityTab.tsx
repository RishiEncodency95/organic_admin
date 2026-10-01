import React from "react";
import { Brain, FileText, Users, Clock, CheckCircle2, ShieldCheck, Award, Briefcase, MessageSquare, AlertTriangle, UserCircle, Check, Settings, Info, ChevronDown } from "lucide-react";

const Toggle2 = ({ checked }: { checked: boolean }) => (
  <div className={`w-[22px] h-[12px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}>
    <div className={`bg-white w-[8px] h-[8px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </div>
);

const ToggleRow = ({ icon: Icon, iconColor, label, active }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-[6px]">
      <Icon size={10} className={iconColor} />
      <span className="text-[9px] font-bold text-[#172762]">{label}</span>
    </div>
    <Toggle2 checked={active} />
  </div>
);

const SimpleToggleRow = ({ label, active }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-[6px]">
      <Toggle2 checked={active} />
      <span className="text-[9px] font-bold text-[#172762]">{label}</span>
    </div>
  </div>
);

const CheckboxRow = ({ icon: Icon, iconColor, iconBg, title, desc, active }: any) => (
  <div className="flex items-start gap-[6px]">
    <div className={`w-[12px] h-[12px] mt-[2px] rounded-[3px] flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#2563EB]' : 'border border-[#E0E5EB] bg-white'}`}>
      {active && <Check size={8} className="text-white" strokeWidth={3} />}
    </div>
    <div className="flex items-start gap-[6px]">
      <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={10} className={iconColor} />
      </div>
      <div>
        <h4 className="text-[9px] font-bold text-[#172762]">{title}</h4>
        <p className="text-[8px] font-semibold text-[#506083] leading-tight mt-[1px]">{desc}</p>
      </div>
    </div>
  </div>
);

const SliderRow = ({ icon: Icon, iconColor, iconBg, label, percent, color, active }: any) => (
  <div className="flex items-center justify-between gap-[8px]">
    <div className="flex items-center gap-[6px] w-[110px]">
      <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={10} className={iconColor} />
      </div>
      <span className="text-[9px] font-bold text-[#172762] truncate">{label}</span>
    </div>
    <div className="flex-1 relative flex items-center h-[4px] bg-[#E1E6EC] rounded-full">
      <div className={`absolute left-0 top-0 bottom-0 rounded-full ${color}`} style={{ width: percent }}></div>
      <div className={`absolute w-[10px] h-[10px] bg-white border-[2.5px] border-[#2563EB] rounded-full shadow-sm`} style={{ left: `calc(${percent} - 5px)` }}></div>
    </div>
    <div className={`w-[22px] text-right text-[9px] font-bold ${active ? 'text-[#148943]' : 'text-[#506083]'}`}>
      {percent}
    </div>
  </div>
);

const RadioRow = ({ label, active }: any) => (
  <div className="flex items-start gap-[6px]">
    <div className={`w-[12px] h-[12px] rounded-full mt-[1px] border-[3px] flex-shrink-0 ${active ? 'border-[#2563EB] bg-white' : 'border-[#E1E6EC] bg-white'}`}></div>
    <span className="text-[9px] font-bold text-[#172762]">{label}</span>
  </div>
);

export default function AIEligibilityTab() {
  return (
    <>
      {/* Top Section: Banner & How it works */}
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
              <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="36" height="36" rx="10" fill="#E6F5EA" />
                <rect x="14" y="9" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="23" y="9" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="14" y="28" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="23" y="28" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="9" y="14" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="9" y="23" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="28" y="14" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="28" y="23" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="13" y="13" width="14" height="14" rx="3" fill="#00893B" />
                <text x="20" y="22.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AI</text>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">AI Eligibility & Screening Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure AI-based candidate screening criteria, minimum eligibility, and screening parameters.</p>
            </div>
          </div>
        </div>
        
        {/* How it works sidebar */}
        <div className="w-[280px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Info size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">How it works?</h3>
          </div>
          <ol className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-decimal list-inside">
            <li>Candidates fill the application form.</li>
            <li>AI checks eligibility based on your settings.</li>
            <li>Eligible candidates can proceed to complete the form.</li>
            <li>Ineligible candidates see a customized message.</li>
          </ol>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-3 gap-[6px]">
          
          {/* Col 1 */}
          <div className="flex flex-col gap-[6px] h-full">
            {/* Minimum Eligibility Criteria */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">Minimum Eligibility Criteria</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set basic eligibility criteria to apply for any job position.</p>
                </div>
              </div>
              
              <div className="space-y-[8px]">
                <div>
                  <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum Academic Percentage (%) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" defaultValue="40" className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-bold text-[#172762] outline-none" />
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
                  </div>
                  <p className="mt-[4px] text-[8px] font-semibold text-[#2563EB] bg-[#E8F1FF] px-[6px] py-[4px] rounded-[3px]">Candidates with 40% or above can proceed to apply.</p>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum Work Experience (Optional)</label>
                  <div className="relative">
                    <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#506083] appearance-none outline-none">
                      <option>No Minimum</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
                  </div>
                  <p className="mt-[2px] text-[8px] font-semibold text-[#506083]">Leave blank if experience is not mandatory.</p>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Age Limit (Optional)</label>
                  <div className="grid grid-cols-2 gap-[6px]">
                    <div className="relative">
                      <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#506083] appearance-none outline-none">
                        <option>Minimum Age</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
                    </div>
                    <div className="relative">
                      <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#506083] appearance-none outline-none">
                        <option>Maximum Age</option>
                      </select>
                      <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Location Preference (Optional)</label>
                  <div className="relative">
                    <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#506083] appearance-none outline-none">
                      <option>Any Location</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083]" />
                  </div>
                </div>
              </div>
            </div>

            {/* CV Analysis Settings */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">CV Analysis Settings</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure resume analysis options.</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <ToggleRow icon={FileText} iconColor="text-[#E29515]" label="Analyse Uploaded CV (Resume)" active={true} />
                <ToggleRow icon={Award} iconColor="text-[#2563EB]" label="Extract Key Skills" active={true} />
                <ToggleRow icon={Briefcase} iconColor="text-[#148943]" label="Identify Work Experience" active={true} />
                <ToggleRow icon={CheckCircle2} iconColor="text-[#E29515]" label="Check Education Details" active={true} />
                <ToggleRow icon={AlertTriangle} iconColor="text-[#E29515]" label="Detect Career Gaps" active={false} />
                <ToggleRow icon={MessageSquare} iconColor="text-[#7550EF]" label="Generate AI Summary" active={true} />
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-[6px] h-full">
            {/* AI Screening Parameters */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">AI Screening Parameters</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select key areas to be analysed in AI screening.</p>
                </div>
              </div>
              <div className="space-y-[8px]">
                <CheckboxRow icon={Award} iconColor="text-[#148943]" iconBg="bg-[#E4F4E7]" title="Skills Match" desc="Match candidate skills with job requirements" active={true} />
                <CheckboxRow icon={Briefcase} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" title="Experience Match" desc="Analyse relevant work experience" active={true} />
                <CheckboxRow icon={FileText} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" title="Education Match" desc="Verify educational qualifications" active={true} />
                <CheckboxRow icon={Users} iconColor="text-[#2563EB]" iconBg="bg-[#E8F1FF]" title="Role Relevance" desc="Assess overall profile relevance for the role" active={true} />
                <CheckboxRow icon={CheckCircle2} iconColor="text-[#2563EB]" iconBg="bg-[#E8F1FF]" title="Industry Fit" desc="Check industry experience and domain knowledge" active={true} />
                <CheckboxRow icon={MessageSquare} iconColor="text-[#159B88]" iconBg="bg-[#E1F6F0]" title="Communication Skills (CV Text)" desc="Analyse written communication from CV" active={true} />
                <CheckboxRow icon={Clock} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" title="Career Continuity" desc="Check career gaps and job stability" active={true} />
              </div>
            </div>
            
            {/* Photo & Document Verification */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <UserCircle size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">Photo & Document Verification</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Enable AI-based verification for uploaded documents.</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <SimpleToggleRow label="Verify Photo (Face Detection)" active={true} />
                <SimpleToggleRow label="Validate Resume Format" active={true} />
                <SimpleToggleRow label="Check File Type (PDF, DOC, DOCX)" active={true} />
                <SimpleToggleRow label="Detect Fake / Blurry Documents" active={true} />
                <SimpleToggleRow label="Scan for Relevant Keywords" active={true} />
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-[6px] h-full">
            {/* AI Score Weightage */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <Check size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">AI Score Weightage (Optional)</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set weightage for each parameter (Total 100%).</p>
                </div>
              </div>
              <div className="space-y-[10px]">
                <SliderRow icon={Award} iconColor="text-[#148943]" iconBg="bg-[#E4F4E7]" label="Skills Match" percent="25%" color="bg-[#148943]" active={true} />
                <SliderRow icon={Briefcase} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" label="Experience Match" percent="20%" color="bg-[#E29515]" active={true} />
                <SliderRow icon={FileText} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" label="Education Match" percent="15%" color="bg-[#7550EF]" active={true} />
                <SliderRow icon={Users} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" label="Role Relevance" percent="15%" color="bg-[#E29515]" active={true} />
                <SliderRow icon={ShieldCheck} iconColor="text-[#D946EF]" iconBg="bg-[#FDF4FF]" label="Industry Fit" percent="10%" color="bg-[#D946EF]" active={true} />
                <SliderRow icon={MessageSquare} iconColor="text-[#0D9488]" iconBg="bg-[#F0FDFA]" label="Communication Skills" percent="10%" color="bg-[#0D9488]" active={true} />
                <SliderRow icon={Clock} iconColor="text-[#64748B]" iconBg="bg-[#F1F5F9]" label="Career Continuity" percent="5%" color="bg-[#64748B]" active={false} />
              </div>
              <div className="mt-[16px] flex items-center justify-between p-[8px] bg-[#E6F8ED] border border-[#CDEBD4] rounded-[4px]">
                <span className="text-[9px] font-bold text-[#172762]">Total Weightage</span>
                <span className="text-[9px] font-bold text-[#148943]">100%</span>
              </div>
            </div>

            {/* Auto Screening Action */}
            <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
              <div className="flex items-center gap-[6px] mb-[10px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">Auto Screening Action</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">What should happen after AI screening?</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between mb-[10px]">
                <RadioRow label="Show result and allow eligible candidates to proceed" active={true} />
                <RadioRow label="Auto-forward eligible candidates to HR" active={false} />
                <RadioRow label="Manually review all candidates (No auto screening)" active={false} />
              </div>
              <div className="bg-[#E8F1FF] border border-[#D5E6FA] rounded-[4px] p-[8px] flex gap-[6px] items-start">
                <div className="w-[12px] h-[12px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                  <Info size={8} />
                </div>
                <p className="text-[8px] font-semibold text-[#2563EB] leading-tight">AI screening helps identify suitable candidates. Final selection is always done by HR.</p>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}
