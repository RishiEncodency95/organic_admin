"use client";

import { useState } from "react";
import {
  ChevronRight,
  CircleUserRound,
  Download,
  Filter,
  Info,
  Lightbulb,
  MessageSquareText,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Star,
  Upload,
} from "lucide-react";

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
      className={`relative h-[24px] w-[40px] shrink-0 rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d8dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)] ${className}`}
    >
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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[16px] py-[7px]">
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold leading-[1.3] text-[#213050]">
          {title}
        </p>
        <p className="mt-[3px] text-[9.5px] font-semibold leading-[1.4] text-[#6d7890]">
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
  width = 178,
}: {
  value: string;
  options: string[];
  width?: number;
}) {
  return (
    <select
      defaultValue={value}
      className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#394760] outline-none"
      style={{ width }}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default function TestimonialsSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");

  const [enabled, setEnabled] = useState(true);
  const [allowAnyone, setAllowAnyone] = useState(true);
  const [showRating, setShowRating] = useState(true);
  const [helpfulVotes, setHelpfulVotes] = useState(true);
  const [tags, setTags] = useState(true);
  const [location, setLocation] = useState(true);

  const [featured, setFeatured] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [truncate, setTruncate] = useState(true);
  const [readMore, setReadMore] = useState(true);
  const [quoteIcon, setQuoteIcon] = useState(true);

  const tabs = [
    "General Settings",
    "Display Settings",
    "Submission Settings",
    "Review & Moderation",
    "Notification Settings",
    "SEO & Schema",
    "Advanced Settings",
  ];

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
              Testimonials Settings
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>Testimonials</span>
              <span className="text-[#7b8597]">›</span>
              <span>Testimonials Settings</span>
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

        {/* CONTENT GRID */}
        <section className="mt-[12px] grid items-start gap-[12px] xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)_minmax(320px,0.86fr)]">
          {/* LEFT: GENERAL */}
          <Panel
            title="General Settings"
            subtitle="Configure general settings for testimonials."
          >
            <div className="space-y-[3px]">
              <SettingRow
                title="Enable Testimonials"
                description="Enable or disable testimonials feature."
                right={<Toggle checked={enabled} onChange={() => setEnabled((v) => !v)} />}
              />

              <SettingRow
                title="Default Testimonial Status"
                description="Set default status for new testimonials."
                right={
                  <SelectBox
                    value="Pending Review"
                    options={["Pending Review", "Published", "Draft"]}
                  />
                }
              />

              <div className="grid grid-cols-[minmax(0,1fr)_178px] gap-[18px] py-[7px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    Allow Testimonials
                  </p>
                  <p className="mt-[3px] text-[9.5px] font-semibold text-[#6d7890]">
                    Choose who can submit testimonials.
                  </p>
                </div>

                <div className="space-y-[11px]">
                  {[
                    ["Anyone (Public)", true],
                    ["Registered Users Only", false],
                    ["Invited / Specific Users Only", false],
                  ].map(([label, active]) => (
                    <button
                      key={String(label)}
                      type="button"
                      onClick={() => setAllowAnyone(Boolean(active))}
                      className="flex items-center gap-[8px] text-left"
                    >
                      <span
                        className={`h-[16px] w-[16px] rounded-full border ${allowAnyone === Boolean(active)
                          ? "border-[#0b6a3b] shadow-[inset_0_0_0_4px_#0b6a3b]"
                          : "border-[#cfd6df] bg-white"
                          }`}
                      />
                      <span className="text-[9.5px] font-semibold text-[#43506c]">
                        {String(label)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <SettingRow
                title="Testimonials Per Page (Backend)"
                description="Number of testimonials to display in admin list."
                right={<SelectBox value="10" options={["10", "20", "30", "50"]} />}
              />

              <SettingRow
                title="Default Sort Order"
                description="Select default order for testimonials."
                right={
                  <SelectBox
                    value="Publish Date (Newest First)"
                    options={[
                      "Publish Date (Newest First)",
                      "Publish Date (Oldest First)",
                      "Highest Rating",
                      "Lowest Rating",
                    ]}
                  />
                }
              />

              <SettingRow
                title="Show Rating"
                description="Display star rating with testimonials."
                right={<Toggle checked={showRating} onChange={() => setShowRating((v) => !v)} />}
              />

              <SettingRow
                title="Allow Like / Helpful Votes"
                description="Allow users to like or mark testimonials as helpful."
                right={<Toggle checked={helpfulVotes} onChange={() => setHelpfulVotes((v) => !v)} />}
              />

              <SettingRow
                title="Enable Tags"
                description="Enable tags for testimonials."
                right={<Toggle checked={tags} onChange={() => setTags((v) => !v)} />}
              />

              <SettingRow
                title="Enable Location"
                description="Allow adding location with testimonials."
                right={<Toggle checked={location} onChange={() => setLocation((v) => !v)} />}
              />

              <div className="mt-[12px] flex min-h-[48px] items-center gap-[10px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f4faf6)] px-[14px]">
                <Info className="h-[20px] w-[20px] shrink-0 text-[#0d6b3e]" strokeWidth={2} />
                <p className="text-[9.5px] font-semibold leading-[1.4] text-[#37654a]">
                  These settings control the basic behavior and structure of your testimonials.
                </p>
              </div>
            </div>
          </Panel>

          {/* MIDDLE */}
          <div className="space-y-[12px]">
            <Panel
              title="Featured & Highlight Settings"
              subtitle="Control how featured testimonials behave."
            >
              <div className="space-y-[5px]">
                <SettingRow
                  title="Enable Featured Testimonials"
                  description="Show featured testimonials on homepage."
                  right={<Toggle checked={featured} onChange={() => setFeatured((v) => !v)} />}
                />

                <div className="py-[7px]">
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    Number of Featured Testimonials
                  </p>
                  <p className="mt-[3px] text-[9.5px] font-semibold text-[#6d7890]">
                    How many featured testimonials to display.
                  </p>
                  <input
                    defaultValue="3"
                    className="mt-[8px] h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#394760] outline-none"
                  />
                </div>

                <SettingRow
                  title="Auto Rotate Featured Testimonials"
                  description="Enable auto rotation on homepage slider."
                  right={<Toggle checked={autoRotate} onChange={() => setAutoRotate((v) => !v)} />}
                />

                <div className="py-[7px]">
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    Rotation Interval
                  </p>
                  <p className="mt-[3px] text-[9.5px] font-semibold text-[#6d7890]">
                    Time interval for auto rotation (in seconds).
                  </p>
                  <input
                    defaultValue="5"
                    className="mt-[8px] h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#394760] outline-none"
                  />
                </div>
              </div>
            </Panel>

            <Panel
              title="Content & Appearance"
              subtitle="Manage content length and formatting."
            >
              <div className="space-y-[5px]">
                <div className="py-[7px]">
                  <p className="text-[10.5px] font-semibold text-[#213050]">
                    Excerpt Length (Characters)
                  </p>
                  <p className="mt-[3px] text-[9.5px] font-semibold text-[#6d7890]">
                    Number of characters to show in testimonial excerpts.
                  </p>
                  <input
                    defaultValue="150"
                    className="mt-[8px] h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#394760] outline-none"
                  />
                </div>

                <SettingRow
                  title="Truncate Long Messages"
                  description="Automatically trim long testimonial messages."
                  right={<Toggle checked={truncate} onChange={() => setTruncate((v) => !v)} />}
                />

                <SettingRow
                  title="Show “Read More” Button"
                  description="Allow users to expand long testimonials."
                  right={<Toggle checked={readMore} onChange={() => setReadMore((v) => !v)} />}
                />

                <SettingRow
                  title="Quote Icon"
                  description="Display quote icon in testimonial cards."
                  right={<Toggle checked={quoteIcon} onChange={() => setQuoteIcon((v) => !v)} />}
                />
              </div>
            </Panel>
          </div>

          {/* RIGHT */}
          <div className="space-y-[12px]">
            <Panel
              title="Preview"
              subtitle="See how testimonials will appear on the website."
            >
              <div className="rounded-[8px] border border-[#e4e7ea] bg-white px-[22px] py-[20px] text-center">
                <Quote className="mx-auto h-[32px] w-[32px] fill-[#0b6a3b] text-[#0b6a3b]" />

                <p className="mx-auto mt-[10px] max-w-[280px] text-[11px] font-semibold leading-[1.85] text-[#252d39]">
                  Moksha Sewa stands as a beacon of compassion and dignity. Their support during our difficult time was truly commendable. Thank you for bringing humanity back to life.
                </p>

                <div className="mx-auto mt-[18px] h-px w-[80px] bg-[#d7dce2]" />

                <div className="mt-[16px] flex items-center justify-center gap-[12px]">
                  <div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-[#f1f3f6] text-[#b5becd]">
                    <CircleUserRound className="h-[38px] w-[38px]" />
                  </div>

                  <div className="text-left">
                    <p className="text-[11.5px] font-semibold text-[#1a2646]">
                      Ramesh Kumar
                    </p>
                    <p className="mt-[4px] text-[9.5px] font-semibold text-[#178248]">
                      Volunteer
                    </p>
                    <p className="mt-[4px] text-[9.5px] font-semibold text-[#6a768c]">
                      Delhi, India
                    </p>

                    <div className="mt-[6px] flex gap-[2px]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-[14px] w-[14px] fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[14px] flex justify-center gap-[8px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#0b6a3b]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#d9dee6]" />
                <span className="h-[7px] w-[7px] rounded-full bg-[#d9dee6]" />
              </div>
            </Panel>

            <Panel title="Quick Actions">
              <div className="space-y-[7px]">
                {[
                  [MessageSquareText, "Manage Testimonials"],
                  [Plus, "Add New Testimonial"],
                  [Upload, "Import Testimonials"],
                  [Download, "Export Testimonials"],
                  [Filter, "Clear All Testimonials Cache"],
                ].map(([Icon, label]) => {
                  const ActionIcon = Icon as typeof Plus;

                  return (
                    <button
                      type="button"
                      key={String(label)}
                      className="flex h-[38px] w-full items-center justify-between rounded-[6px] border border-[#e2e6ea] bg-white px-[12px] text-[9.5px] font-semibold text-[#293854]"
                    >
                      <span className="flex items-center gap-[9px]">
                        <ActionIcon className="h-[14px] w-[14px]" />
                        {String(label)}
                      </span>
                      <ChevronRight className="h-[13px] w-[13px]" />
                    </button>
                  );
                })}
              </div>
            </Panel>

            <div className="flex min-h-[66px] items-start gap-[10px] rounded-[8px] border border-[#f1e3bb] bg-[linear-gradient(90deg,#fff9e9,#fffdf4)] px-[14px] py-[12px]">
              <Lightbulb className="mt-[1px] h-[20px] w-[20px] shrink-0 text-[#f0aa1c]" />
              <p className="text-[9.5px] font-semibold leading-[1.5] text-[#6b5738]">
                <span className="font-semibold text-[#236342]">Tip:</span>{" "}
                Don&apos;t forget to click “Save Changes” after updating the settings.
              </p>
            </div>
          </div>
        </section>

        {/* FOOT NOTE */}
        <section className="mt-[12px] flex min-h-[48px] items-center rounded-[8px] border border-[#dbe7f4] bg-[linear-gradient(90deg,#f1f7ff,#f8fbff)] px-[18px]">
          <ShieldCheck className="mr-[10px] h-[20px] w-[20px] shrink-0 text-[#4c95df]" />
          <p className="text-[9.5px] font-semibold text-[#4d5f79]">
            <span className="text-[#24345e]">Note:</span>{" "}
            These settings only affect the display and management of testimonials. Existing testimonials will not be deleted.
          </p>
        </section>
      </div>
    </main>
  );
}
