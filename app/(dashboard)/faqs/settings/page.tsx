"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Info,
  MoreVertical,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
} from "lucide-react";

type CategoryItem = {
  name: string;
  count: number;
  color: string;
  enabled: boolean;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d7dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
      <h2 className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[#17234a]">
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
          {subtitle}
        </p>
      ) : null}

      <div className="mt-[14px]">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[14px] py-[6px]">
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold leading-[1.25] text-[#213050]">
          {title}
        </p>
        <p className="mt-[3px] text-[9px] font-semibold leading-[1.35] text-[#6d7890]">
          {description}
        </p>
      </div>

      {right}
    </div>
  );
}

function SelectBox({
  value,
  options,
  width = 180,
}: {
  value: string;
  options: string[];
  width?: number;
}) {
  return (
    <select
      defaultValue={value}
      className="h-[36px] rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] text-[9.5px] font-semibold text-[#394760] outline-none"
      style={{ width }}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default function FAQSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");

  const [faqEnabled, setFaqEnabled] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);
  const [guestVoting, setGuestVoting] = useState(true);
  const [showViewCount, setShowViewCount] = useState(true);
  const [showLastUpdated, setShowLastUpdated] = useState(true);
  const [schemaMarkup, setSchemaMarkup] = useState(true);

  const [printOption, setPrintOption] = useState(false);
  const [shareOption, setShareOption] = useState(true);
  const [accordionView, setAccordionView] = useState(true);
  const [autoExpandFirst, setAutoExpandFirst] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(true);

  const [categories, setCategories] = useState<CategoryItem[]>([
    { name: "General", count: 15, color: "#0f766e", enabled: true },
    { name: "Request Process", count: 12, color: "#3b82f6", enabled: true },
    { name: "Services", count: 18, color: "#7c3aed", enabled: true },
    { name: "Volunteer", count: 8, color: "#f97316", enabled: true },
    { name: "Support", count: 8, color: "#f59e0b", enabled: true },
    { name: "Donations", count: 7, color: "#fb7185", enabled: true },
    { name: "Others", count: 7, color: "#64748b", enabled: true },
  ]);

  const tabs = [
    "General Settings",
    "Display Settings",
    "Submission Settings",
    "SEO Settings",
    "Email Notifications",
    "Advanced Settings",
  ];

  const toggleCategory = (index: number) => {
    setCategories((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[12px] text-[#16233f] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              FAQ Settings
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>FAQs</span>
              <span className="text-[#7b8597]">›</span>
              <span>FAQ Settings</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)]"
            >
              <Save className="h-[15px] w-[15px]" />
              Save Changes
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"
            >
              <RotateCcw className="h-[15px] w-[15px]" />
              Reset to Default
            </button>
          </div>
        </header>

        {/* TABS */}
        <div className="mt-[18px] flex items-end gap-[10px] overflow-x-auto border-b border-[#e5e8e6]">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-[40px] shrink-0 px-[14px] text-[10px] font-semibold transition ${activeTab === tab ? "text-[#0d6037]" : "text-[#29365d]"
                }`}
            >
              {tab}

              {activeTab === tab ? (
                <span className="absolute inset-x-[4px] bottom-0 h-[2px] bg-[#0b6a3b]" />
              ) : null}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <section className="mt-[12px] grid items-start gap-[12px] xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.94fr)_minmax(330px,0.9fr)]">
          {/* LEFT: GENERAL SETTINGS */}
          <Panel
            title="General Settings"
            subtitle="Configure the basic settings for your FAQ section."
          >
            <div className="space-y-[2px]">
              <SettingRow
                title="Enable FAQ Section"
                description="Enable or disable the FAQ section on the website."
                right={
                  <Toggle
                    checked={faqEnabled}
                    onChange={() => setFaqEnabled((v) => !v)}
                  />
                }
              />

              <div className="grid grid-cols-[minmax(0,1fr)_180px] items-start gap-[14px] py-[6px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    FAQ Page Title
                  </p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                    Title shown on the FAQ page.
                  </p>
                </div>

                <input
                  defaultValue="Frequently Asked Questions"
                  className="h-[36px] rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] text-[9.5px] font-semibold text-[#394760] outline-none"
                />
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_180px] items-start gap-[14px] py-[6px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    FAQ Page Subtitle
                  </p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                    Subtitle/description shown below the title.
                  </p>
                </div>

                <textarea
                  defaultValue={"Find answers to common questions\nabout Moksha Sewa\nservices and how we help."}
                  className="h-[66px] resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] py-[9px] text-[9px] font-semibold leading-[1.45] text-[#394760] outline-none"
                />
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_180px] items-start gap-[14px] py-[6px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    FAQ Slug / URL
                  </p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                    URL slug for the FAQ page.
                  </p>
                </div>

                <input
                  defaultValue="faqs"
                  className="h-[36px] rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] text-[9.5px] font-semibold text-[#394760] outline-none"
                />
              </div>

              <SettingRow
                title="Items Per Page"
                description="Number of FAQs to display per page."
                right={<SelectBox value="10" options={["10", "20", "30", "50"]} />}
              />

              <SettingRow
                title="Default Sort Order"
                description="Choose the default order of FAQs."
                right={
                  <SelectBox
                    value="Publish Date (Newest First)"
                    options={[
                      "Publish Date (Newest First)",
                      "Publish Date (Oldest First)",
                      "Most Viewed",
                      "Most Helpful",
                    ]}
                  />
                }
              />

              <SettingRow
                title="Show Search Box"
                description="Display search box on the FAQ page."
                right={
                  <Toggle
                    checked={showSearch}
                    onChange={() => setShowSearch((v) => !v)}
                  />
                }
              />

              <SettingRow
                title="Show Category Filter"
                description="Display category filter on the FAQ page."
                right={
                  <Toggle
                    checked={showCategoryFilter}
                    onChange={() => setShowCategoryFilter((v) => !v)}
                  />
                }
              />

              <SettingRow
                title="Allow Guest Voting"
                description="Allow visitors to vote on helpful FAQs."
                right={
                  <Toggle
                    checked={guestVoting}
                    onChange={() => setGuestVoting((v) => !v)}
                  />
                }
              />

              <SettingRow
                title="Show View Count"
                description="Display view count for each FAQ."
                right={
                  <Toggle
                    checked={showViewCount}
                    onChange={() => setShowViewCount((v) => !v)}
                  />
                }
              />

              <SettingRow
                title="Show Last Updated"
                description="Display last updated date for FAQs."
                right={
                  <Toggle
                    checked={showLastUpdated}
                    onChange={() => setShowLastUpdated((v) => !v)}
                  />
                }
              />

              <SettingRow
                title="FAQ Schema Markup"
                description="Enable FAQ schema for better SEO."
                right={
                  <Toggle
                    checked={schemaMarkup}
                    onChange={() => setSchemaMarkup((v) => !v)}
                  />
                }
              />

              <div className="mt-[12px] flex min-h-[50px] items-center gap-[10px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f4faf6)] px-[14px]">
                <Info
                  className="h-[20px] w-[20px] shrink-0 text-[#0d6b3e]"
                  strokeWidth={2}
                />
                <p className="text-[9.5px] font-semibold leading-[1.4] text-[#37654a]">
                  These settings control the general behavior and visibility of
                  your FAQ section.
                </p>
              </div>
            </div>
          </Panel>

          {/* MIDDLE: CATEGORIES */}
          <Panel
            title="Categories & Visibility"
            subtitle="Manage FAQ categories and their visibility."
          >
            <div>
              <p className="mb-[9px] text-[10.5px] font-semibold text-[#213050]">
                Manage Categories
              </p>

              <div className="overflow-hidden rounded-[7px] border border-[#e5e8eb]">
                {categories.map((item, index) => (
                  <div
                    key={item.name}
                    className="grid min-h-[47px] grid-cols-[24px_12px_minmax(0,1fr)_34px_44px_22px] items-center gap-[8px] border-b border-[#edf0f2] px-[10px] last:border-b-0"
                  >
                    <GripVertical className="h-[13px] w-[13px] text-[#9aa4b4]" />

                    <span
                      className="h-[8px] w-[8px] rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="truncate text-[9.5px] font-semibold text-[#2d3b58]">
                      {item.name}
                    </span>

                    <span className="grid h-[24px] min-w-[28px] place-items-center rounded-[4px] bg-[#f3f5f7] px-[5px] text-[8.5px] font-semibold text-[#5d687d]">
                      {item.count}
                    </span>

                    <Toggle
                      checked={item.enabled}
                      onChange={() => toggleCategory(index)}
                    />

                    <MoreVertical className="h-[13px] w-[13px] text-[#55627a]" />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-[8px] flex h-[36px] w-full items-center justify-center gap-[8px] rounded-[6px] border border-[#e3e7ea] bg-white text-[9.5px] font-semibold text-[#3c4a63]"
              >
                <Plus className="h-[13px] w-[13px]" />
                Add New Category
              </button>

              <div className="mt-[18px] space-y-[11px]">
                <p className="text-[10.5px] font-semibold text-[#213050]">
                  Category Settings
                </p>

                <div>
                  <p className="mb-[6px] text-[9.5px] font-semibold text-[#33415e]">
                    Default Category
                  </p>
                  <select
                    defaultValue="General"
                    className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] text-[9.5px] font-semibold text-[#394760] outline-none"
                  >
                    {categories.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-[6px] text-[9.5px] font-semibold text-[#33415e]">
                    Empty Category Behavior
                  </p>
                  <select
                    defaultValue="Show empty categories"
                    className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] text-[9.5px] font-semibold text-[#394760] outline-none"
                  >
                    <option>Show empty categories</option>
                    <option>Hide empty categories</option>
                  </select>
                </div>

                <div>
                  <p className="mb-[6px] text-[9.5px] font-semibold text-[#33415e]">
                    Category Description
                  </p>
                  <textarea
                    placeholder="Display category description below category name."
                    className="h-[72px] w-full resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] py-[9px] text-[9px] font-semibold text-[#394760] outline-none placeholder:text-[#8b95a7]"
                  />
                  <p className="mt-[6px] text-[9px] font-semibold text-[#6d7890]">
                    Category descriptions will appear on the FAQ page.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          {/* RIGHT */}
          <div className="space-y-[12px]">
            {/* PREVIEW */}
            <Panel
              title="FAQ Page Preview"
              subtitle="This is how your FAQ section will appear on the website."
            >
              <div className="rounded-[8px] border border-[#e2e6ea] bg-white px-[16px] py-[16px]">
                <div className="text-center">
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#18234a]">
                    Frequently Asked Questions
                  </h3>
                  <p className="mx-auto mt-[7px] max-w-[270px] text-[9px] font-semibold leading-[1.5] text-[#66738b]">
                    Find answers to common questions about Moksha Sewa services
                    and how we help.
                  </p>
                </div>

                <div className="relative mt-[18px]">
                  <Search className="absolute left-[11px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#7f8a9d]" />
                  <input
                    placeholder="Search questions..."
                    className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[34px] pr-[11px] text-[9.5px] font-semibold outline-none placeholder:text-[#8b95a7]"
                  />
                </div>

                <div className="mt-[12px] flex items-center gap-[6px] overflow-x-auto">
                  {["All", "General", "Request Process", "Services", "Volunteer"].map(
                    (item, index) => (
                      <button
                        key={item}
                        type="button"
                        className={`h-[28px] shrink-0 rounded-[5px] px-[10px] text-[8px] font-semibold ${index === 0
                          ? "bg-[#075b33] text-white"
                          : "bg-[#f2f4f6] text-[#536078]"
                          }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border border-[#e1e5e8] bg-white"
                  >
                    <ChevronRight className="h-[12px] w-[12px]" />
                  </button>
                </div>

                <div className="mt-[12px] overflow-hidden rounded-[7px] border border-[#e5e8eb]">
                  {[
                    "What is Moksha Sewa?",
                    "Who can request Sewa help?",
                    "How does Moksha Sewa verify a request?",
                    "Is Moksha Sewa completely free?",
                  ].map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="flex h-[40px] w-full items-center justify-between border-b border-[#edf0f2] px-[10px] text-left last:border-b-0"
                    >
                      <span className="text-[9.5px] font-semibold text-[#293854]">
                        {question}
                      </span>
                      <ChevronDown className="h-[12px] w-[12px] text-[#536078]" />
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            {/* ADDITIONAL SETTINGS */}
            <Panel title="Additional Settings">
              <div className="space-y-[2px]">
                <SettingRow
                  title="Enable FAQ Print Option"
                  description="Allow users to print FAQs."
                  right={
                    <Toggle
                      checked={printOption}
                      onChange={() => setPrintOption((v) => !v)}
                    />
                  }
                />

                <SettingRow
                  title="Enable FAQ Share Option"
                  description="Allow users to share FAQs."
                  right={
                    <Toggle
                      checked={shareOption}
                      onChange={() => setShareOption((v) => !v)}
                    />
                  }
                />

                <SettingRow
                  title="Enable Accordion View"
                  description="Open one FAQ at a time."
                  right={
                    <Toggle
                      checked={accordionView}
                      onChange={() => setAccordionView((v) => !v)}
                    />
                  }
                />

                <SettingRow
                  title="Auto Expand First FAQ"
                  description="Automatically expand the first FAQ."
                  right={
                    <Toggle
                      checked={autoExpandFirst}
                      onChange={() => setAutoExpandFirst((v) => !v)}
                    />
                  }
                />

                <SettingRow
                  title="FAQ Feedback Form"
                  description="Show feedback form at the bottom."
                  right={
                    <Toggle
                      checked={feedbackForm}
                      onChange={() => setFeedbackForm((v) => !v)}
                    />
                  }
                />
              </div>
            </Panel>
          </div>
        </section>

        {/* BOTTOM NOTE */}
        <section className="mt-[12px] flex min-h-[50px] items-center rounded-[8px] border border-[#dce8df] bg-[linear-gradient(90deg,#eef7f1,#f7fbf8)] px-[16px]">
          <div className="mr-[10px] grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[6px] bg-[#0b6a3b] text-white">
            <ShieldCheck className="h-[14px] w-[14px]" />
          </div>

          <p className="text-[9.5px] font-semibold text-[#486251]">
            <span className="text-[#24345e]">Note:</span>{" "}
            Don&apos;t forget to click “Save Changes” after updating the
            settings.
          </p>
        </section>
      </div>
    </main>
  );
}
