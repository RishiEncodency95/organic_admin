"use client";

import { useState } from "react";
import {
  Archive,
  CircleGauge,
  FileImage,
  FileText,
  Folder,
  FolderCog,
  HardDrive,
  Image as ImageIcon,
  Info,
  Link2,
  ListFilter,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";

type ToggleProps = {
  checked: boolean;
  onChange: () => void;
};

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[24px] w-[40px] shrink-0 rounded-full transition ${checked ? "bg-[#0a6a3b]" : "bg-[#d7dde5]"
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
      className={`min-h-0 overflow-visible rounded-[8px] border border-[#e7e9e8] bg-white px-[16px] py-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.025)] ${className}`}
    >
      <h2 className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-[#17234a]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
          {subtitle}
        </p>
      ) : null}

      <div className="mt-[12px]">{children}</div>
    </section>
  );
}

function SettingRow({
  icon,
  title,
  description,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-[10px] py-[6px]">
      <div className="grid h-[28px] w-[28px] place-items-center rounded-[7px] bg-[#edf7f0] text-[#28764b]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold leading-[1.25] text-[#213050]">
          {title}
        </p>
        <p className="mt-[2px] text-[9px] font-semibold leading-[1.35] text-[#6d7890]">
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
  width = 156,
}: {
  value: string;
  options: string[];
  width?: number;
}) {
  return (
    <select
      defaultValue={value}
      className="h-[30px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#394760] outline-none"
      style={{ width }}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default function MediaSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");

  const [enableMedia, setEnableMedia] = useState(true);
  const [restrictAccess, setRestrictAccess] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [bulkActions, setBulkActions] = useState(true);

  const [enableFolders, setEnableFolders] = useState(true);
  const [allowNewFolder, setAllowNewFolder] = useState(true);
  const [allowMoveCopy, setAllowMoveCopy] = useState(true);
  const [autoFolderThumb, setAutoFolderThumb] = useState(true);

  const [autoOptimize, setAutoOptimize] = useState(true);
  const [generateWebp, setGenerateWebp] = useState(true);

  const [autoDelete, setAutoDelete] = useState(false);
  const [cleanTrash, setCleanTrash] = useState(false);

  const tabs = [
    "General Settings",
    "Upload Settings",
    "Image Settings",
    "Video Settings",
    "File & Type Settings",
    "Storage & Cleanup",
    "Watermark Settings",
    "Access & Permissions",
  ];

  return (
    <main className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[12px] text-[#16233f] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <div className="grid min-h-full grid-rows-[60px_42px_auto_42px] gap-[8px]">
        {/* HEADER */}
        <header className="flex min-h-0 items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              Media Settings
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7a8497]">›</span>
              <span>Media Library</span>
              <span className="text-[#7a8497]">›</span>
              <span>Media Settings</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px] pt-[1px]">
            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-bold text-[#273655]"
            >
              <RotateCcw className="h-[15px] w-[15px]" strokeWidth={2} />
              Reset to Default
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-bold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)]"
            >
              <Save className="h-[15px] w-[15px]" strokeWidth={2} />
              Save Changes
            </button>
          </div>
        </header>

        {/* TABS */}
        <div className="flex items-end gap-[8px] border-b border-[#e5e8e6]">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-[38px] px-[14px] text-[10px] font-bold transition ${activeTab === tab ? "text-[#0d6037]" : "text-[#29365d]"
                }`}
            >
              {tab}
              {activeTab === tab ? (
                <span className="absolute inset-x-[4px] bottom-0 h-[2px] bg-[#0b6a3b]" />
              ) : null}
            </button>
          ))}
        </div>

        {/* PANELS */}
        <section className="grid min-h-0 grid-cols-3 auto-rows-max items-start gap-[10px]">
          {/* GENERAL SETTINGS */}
          <Panel
            title="General Settings"
            subtitle="Configure general media library behaviour and default preferences."
          >
            <div className="space-y-[1px]">
              <SettingRow
                icon={<ImageIcon className="h-[14px] w-[14px]" />}
                title="Enable Media Library"
                description="Enable or disable the media library module across the website."
                right={<Toggle checked={enableMedia} onChange={() => setEnableMedia((v) => !v)} />}
              />

              <SettingRow
                icon={<Link2 className="h-[14px] w-[14px]" />}
                title="Restrict Media Access"
                description="Restrict direct access to media files. Only accessible via the website."
                right={<Toggle checked={restrictAccess} onChange={() => setRestrictAccess((v) => !v)} />}
              />

              <SettingRow
                icon={<ListFilter className="h-[14px] w-[14px]" />}
                title="Default Sort Order"
                description="Choose the default order for media files in library."
                right={
                  <SelectBox
                    value="Upload Date (Newest First)"
                    options={[
                      "Upload Date (Newest First)",
                      "Upload Date (Oldest First)",
                      "Name (A-Z)",
                      "Name (Z-A)",
                    ]}
                  />
                }
              />

              <SettingRow
                icon={<Settings2 className="h-[14px] w-[14px]" />}
                title="Items Per Page"
                description="Number of media items to show per page in library."
                right={<SelectBox value="25" options={["10", "25", "50", "100"]} />}
              />

              <SettingRow
                icon={<FileText className="h-[14px] w-[14px]" />}
                title="Show File Details"
                description="Display file size, dimensions and other details in media list."
                right={<Toggle checked={showDetails} onChange={() => setShowDetails((v) => !v)} />}
              />

              <SettingRow
                icon={<FileImage className="h-[14px] w-[14px]" />}
                title="Show Media Preview"
                description="Show thumbnail/preview of media files in list view."
                right={<Toggle checked={showPreview} onChange={() => setShowPreview((v) => !v)} />}
              />

              <SettingRow
                icon={<SlidersHorizontal className="h-[14px] w-[14px]" />}
                title="Enable Bulk Actions"
                description="Allow bulk select and actions (delete, move, download)."
                right={<Toggle checked={bulkActions} onChange={() => setBulkActions((v) => !v)} />}
              />

              <SettingRow
                icon={<Folder className="h-[14px] w-[14px]" />}
                title="Default Folder for Upload"
                description="Select the default folder where new media will be uploaded."
                right={
                  <SelectBox
                    value="Root (Media Library)"
                    options={["Root (Media Library)", "Blog Images", "Gallery", "Events"]}
                  />
                }
              />

              <SettingRow
                icon={<CircleGauge className="h-[14px] w-[14px]" />}
                title="Recently Uploaded Limit"
                description="Number of recent items to show in dashboard widget."
                right={
                  <input
                    defaultValue="10"
                    className="h-[30px] w-[126px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#394760] outline-none"
                  />
                }
              />
            </div>
          </Panel>

          {/* FOLDERS */}
          <Panel
            title="Folders & Organization"
            subtitle="Manage folder structure and organization preferences."
          >
            <div className="space-y-[4px]">
              <SettingRow
                icon={<Folder className="h-[14px] w-[14px]" />}
                title="Enable Folders"
                description="Organize media into folders."
                right={<Toggle checked={enableFolders} onChange={() => setEnableFolders((v) => !v)} />}
              />

              <SettingRow
                icon={<FolderCog className="h-[14px] w-[14px]" />}
                title="Allow Create New Folder"
                description="Allow users to create new folders."
                right={<Toggle checked={allowNewFolder} onChange={() => setAllowNewFolder((v) => !v)} />}
              />

              <SettingRow
                icon={<Archive className="h-[14px] w-[14px]" />}
                title="Allow Move / Copy"
                description="Allow moving or copying media between folders."
                right={<Toggle checked={allowMoveCopy} onChange={() => setAllowMoveCopy((v) => !v)} />}
              />

              <SettingRow
                icon={<Folder className="h-[14px] w-[14px]" />}
                title="Max Folder Depth"
                description="Maximum folder nesting level allowed."
                right={
                  <input
                    defaultValue="5"
                    className="h-[30px] w-[136px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#394760] outline-none"
                  />
                }
              />

              <SettingRow
                icon={<Folder className="h-[14px] w-[14px]" />}
                title="Default New Folder Location"
                description="Choose where new folders will be created."
                right={
                  <SelectBox
                    value="Root (Media Library)"
                    options={["Root (Media Library)", "Current Folder"]}
                    width={145}
                  />
                }
              />

              <SettingRow
                icon={<ImageIcon className="h-[14px] w-[14px]" />}
                title="Auto Generate Folder Thumbnails"
                description="Automatically generate thumbnails for folders."
                right={<Toggle checked={autoFolderThumb} onChange={() => setAutoFolderThumb((v) => !v)} />}
              />

              <div className="mt-[12px] flex min-h-[58px] items-center gap-[12px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f4faf6)] px-[14px]">
                <Info className="h-[22px] w-[22px] shrink-0 text-[#0d6b3e]" strokeWidth={2} />
                <p className="text-[10px] font-semibold leading-[1.45] text-[#38654b]">
                  Organize your media files in a structured way for better management and faster access.
                </p>
              </div>
            </div>
          </Panel>

          {/* UPLOAD & IMAGE */}
          <Panel
            title="Upload & Image Settings"
            subtitle="Configure upload limits and image handling options."
          >
            <div className="space-y-[12px]">
              <div className="grid grid-cols-[1fr_136px] items-center gap-[14px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Max File Size (Per File)</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Allowed maximum size for each file.</p>
                </div>
                <SelectBox value="10 MB" options={["5 MB", "10 MB", "20 MB", "50 MB"]} width={136} />
              </div>

              <div className="grid grid-cols-[1fr_136px] items-center gap-[14px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Max Upload Files (Per Request)</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Maximum number of files allowed in one upload.</p>
                </div>
                <SelectBox value="20" options={["10", "20", "30", "50"]} width={136} />
              </div>

              <div>
                <p className="text-[10.5px] font-semibold text-[#213050]">Allowed File Extensions</p>
                <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Specify allowed file extensions.</p>
                <input
                  defaultValue="jpg, jpeg, png, gif, webp, pdf, doc, docx, mp4, mp3"
                  className="mt-[7px] h-[32px] w-full rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#394760] outline-none"
                />
              </div>

              <div className="flex items-start justify-between gap-[12px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Auto Optimize Images</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Automatically compress and optimize images.</p>
                </div>
                <Toggle checked={autoOptimize} onChange={() => setAutoOptimize((v) => !v)} />
              </div>

              <div className="flex items-start justify-between gap-[12px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Generate WebP Images</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Generate WebP format for better performance.</p>
                </div>
                <Toggle checked={generateWebp} onChange={() => setGenerateWebp((v) => !v)} />
              </div>
            </div>
          </Panel>

          {/* STORAGE OVERVIEW */}
          <Panel
            title="Storage Overview"
            subtitle="Overview of your media storage and usage."
          >
            <div className="grid grid-cols-[126px_1fr] items-center gap-[14px]">
              <div className="relative mx-auto grid h-[112px] w-[112px] place-items-center rounded-full bg-[conic-gradient(#0b6a3b_0deg_116deg,#dfe4ea_116deg_360deg)]">
                <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-white text-center">
                  <div>
                    <p className="text-[16px] font-semibold leading-none text-[#1c2950]">3.24 GB</p>
                    <p className="mt-[4px] text-[8px] font-bold text-[#53617a]">Used</p>
                  </div>
                </div>
              </div>

              <div className="space-y-[7px]">
                {[
                  ["Total Storage", "10 GB", "#6aa5e7"],
                  ["Used Storage", "3.24 GB (32%)", "#f7ad11"],
                  ["Remaining Storage", "6.76 GB (68%)", "#7b52c7"],
                  ["Unattached Files", "18 Files", "#ef6d77"],
                ].map(([label, value, color]) => (
                  <div key={label} className="grid grid-cols-[9px_1fr_auto] items-center gap-[8px]">
                    <span className="h-[9px] w-[9px] rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[9px] font-bold text-[#30405d]">{label}</span>
                    <span className="text-[9px] font-semibold text-[#24345e]">{value}</span>
                  </div>
                ))}

                <button
                  type="button"
                  className="mt-[4px] inline-flex h-[34px] items-center gap-[8px] rounded-[6px] border border-[#b9d8c6] bg-white px-[14px] text-[9.5px] font-bold text-[#14683d]"
                >
                  <HardDrive className="h-[14px] w-[14px]" />
                  View Storage Details
                </button>
              </div>
            </div>
          </Panel>

          {/* MAINTENANCE */}
          <Panel
            title="Maintenance & Cleanup"
            subtitle="Keep your media library clean and optimized."
          >
            <div className="space-y-[8px]">
              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Auto Delete Unattached Files</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Delete files not attached to any content.</p>
                </div>
                <Toggle checked={autoDelete} onChange={() => setAutoDelete((v) => !v)} />
              </div>

              <div className="grid grid-cols-[1fr_110px] items-center gap-[12px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Unattached Files Older Than</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Automatically delete files older than.</p>
                </div>
                <SelectBox value="30 Days" options={["7 Days", "30 Days", "60 Days", "90 Days"]} width={110} />
              </div>

              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <p className="text-[10.5px] font-semibold text-[#213050]">Clean Trash Automatically</p>
                  <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">Automatically clear trash after retention period.</p>
                </div>
                <Toggle checked={cleanTrash} onChange={() => setCleanTrash((v) => !v)} />
              </div>
            </div>
          </Panel>

          {/* INFO */}
          <Panel
            title="Information"
            subtitle="Important notes about media settings."
          >
            <div className="rounded-[7px] border border-[#dbe7f3] bg-[#f5f9ff] px-[14px] py-[10px]">
              <div className="flex gap-[10px]">
                <Info className="mt-[1px] h-[18px] w-[18px] shrink-0 text-[#4f96df]" />

                <ul className="space-y-[8px] text-[9.5px] font-semibold leading-[1.4] text-[#52627c]">
                  <li>• Changes will apply to all media library operations.</li>
                  <li>• File size limit applies to each individual file.</li>
                  <li>• Recommended image formats: JPG, PNG, WebP.</li>
                  <li>• Keep your media library clean for better performance.</li>
                  <li>• Regular cleanup helps in saving storage space.</li>
                </ul>
              </div>
            </div>
          </Panel>
        </section>

        {/* NOTE */}
        <section className="flex min-h-0 items-center rounded-[7px] border border-[#dbe7f4] bg-[linear-gradient(90deg,#f1f7ff,#f8fbff)] px-[18px]">
          <ShieldCheck className="mr-[10px] h-[20px] w-[20px] shrink-0 text-[#4c95df]" strokeWidth={2} />
          <p className="text-[9.5px] font-semibold text-[#4d5f79]">
            <strong className="text-[#24345e]">Note:</strong>{" "}
            These settings affect the entire media library. Please review and save your changes carefully.
          </p>
        </section>
      </div>
    </main>
  );
}
