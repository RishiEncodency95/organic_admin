"use client";

import React, { useState } from "react";
import { 
  Settings, Brain, FileText, MessageSquare, Users, Bell, Mail, Eye,
  RefreshCcw, Save
} from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import AIEligibilityTab from "./AIEligibilityTab";
import DocumentsTab from "./DocumentsTab";
import EmailTemplatesTab from "./EmailTemplatesTab";
import NotificationsTab from "./NotificationsTab";
import HRWorkflowTab from "./HRWorkflowTab";
import ResultMessagesTab from "./ResultMessagesTab";

export default function CareerSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");

  const tabs = [
    { id: "General Settings", icon: Settings },
    { id: "AI Eligibility & Screening", icon: Brain },
    { id: "Documents & Application Form", icon: FileText },
    { id: "Result Messages", icon: MessageSquare },
    { id: "HR & Workflow", icon: Users },
    { id: "Notifications", icon: Bell },
    { id: "Email Templates", icon: Mail },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F4F7FB]">
      {/* Header Section */}
      <div className="px-[16px] pt-[12px] bg-white border-b border-[#E1E6EC]">
        <div className="flex items-center justify-between mb-[10px]">
          <div>
            <h1 className="text-[16px] font-bold text-[#172762]">Career Settings</h1>
            <p className="mt-[2px] text-[9px] font-semibold text-[#506083]">Configure application settings, AI eligibility, documents, HR workflow and notifications for career module.</p>
          </div>
          <button className="flex items-center gap-[6px] rounded-[6px] border border-[#D5E6FA] bg-white px-[10px] py-[4px] text-[9px] font-bold text-[#2563EB] shadow-sm">
            <Eye size={10} />
            Preview Career Page
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[20px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-[4px] pb-[6px] text-[9.5px] font-bold transition-colors relative ${
                  isActive 
                    ? 'text-[#148943]' 
                    : 'text-[#172762] hover:text-[#2563EB]'
                }`}
              >
                <Icon size={12} className={isActive ? 'text-[#148943]' : 'text-[#172762]'} />
                {tab.id}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#148943] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-[16px] pb-[6px] pt-[8px] overflow-y-auto">
        {activeTab === "General Settings" && <GeneralSettings />}
        {activeTab === "AI Eligibility & Screening" && <AIEligibilityTab />}
        {activeTab === "Documents & Application Form" && <DocumentsTab />}
        {activeTab === "Result Messages" && <ResultMessagesTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
        {activeTab === "Email Templates" && <EmailTemplatesTab />}
        {activeTab === "HR & Workflow" && <HRWorkflowTab />}
        
        {/* Placeholder for other tabs */}
        {activeTab !== "General Settings" && activeTab !== "AI Eligibility & Screening" && activeTab !== "Documents & Application Form" && activeTab !== "Email Templates" && activeTab !== "Notifications" && activeTab !== "HR & Workflow" && activeTab !== "Result Messages" && (
          <div className="flex items-center justify-center h-[200px] text-[#506083] text-[12px] font-semibold bg-white border border-[#E1E6EC] rounded-[8px] mt-[10px]">
            Content for {activeTab} will go here.
          </div>
        )}
      </div>
      
      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-[10px] p-[10px] bg-white border-t border-[#E1E6EC]">
        <button className="flex items-center gap-[4px] px-[12px] py-[6px] border border-[#E1E6EC] rounded-[6px] text-[#506083] text-[9px] font-bold hover:bg-gray-50 transition-colors">
          <RefreshCcw size={10} />
          Reset to Default
        </button>
        <button className="flex items-center gap-[4px] px-[12px] py-[6px] bg-[#148943] text-white rounded-[6px] text-[9px] font-bold hover:bg-[#117639] transition-colors shadow-sm">
          <Save size={10} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
