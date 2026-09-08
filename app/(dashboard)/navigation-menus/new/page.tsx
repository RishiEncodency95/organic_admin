"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  Lightbulb,
  ListTree,
  Plus,
  Save,
  Search,
  X,
} from "lucide-react";

type SourceTab = "Pages" | "Custom Links" | "Categories";

type PageItem = {
  id: number;
  label: string;
  meta?: string;
};

const PAGE_ITEMS: PageItem[] = [
  { id: 1, label: "Home", meta: "Front Page" },
  { id: 2, label: "About Us" },
  { id: 3, label: "Our Services" },
  { id: 4, label: "Who We Help" },
  { id: 5, label: "How It Works" },
  { id: 6, label: "Get Involved" },
  { id: 7, label: "Contact Us" },
  { id: 8, label: "Sewa Help" },
];

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="mb-[6px] block text-[11px] font-semibold text-[#24345e]">
      {children}
      {required ? <span className="ml-[2px] text-[#dc3c3c]">*</span> : null}
      {optional ? (
        <span className="font-semibold text-[#66738b]"> (Optional)</span>
      ) : null}
    </label>
  );
}

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
      aria-pressed={checked}
      onClick={onChange}
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
      <h2 className="text-[14px] font-semibold text-[#17234a]">{title}</h2>

      {subtitle ? (
        <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
          {subtitle}
        </p>
      ) : null}

      <div className="mt-[14px]">{children}</div>
    </section>
  );
}

export default function AddNewMenuPage() {
  const router = useRouter();
  const [menuName, setMenuName] = useState("");
  const [menuLocation, setMenuLocation] = useState("");
  const [menuType, setMenuType] = useState("");
  const [description, setDescription] = useState("");

  const [megaMenu, setMegaMenu] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [newTab, setNewTab] = useState(true);

  const [sourceTab, setSourceTab] = useState<SourceTab>("Pages");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [menuItems, setMenuItems] = useState<PageItem[]>([]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return PAGE_ITEMS;
    return PAGE_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const toggleSelected = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const addItem = (item: PageItem) => {
    setMenuItems((current) => {
      if (current.some((existing) => existing.id === item.id)) return current;
      return [...current, item];
    });
  };

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header>
          <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#075b33]">
            Add New Menu
          </h1>

          <nav className="mt-[10px] flex items-center gap-[8px] text-[11px] font-semibold text-[#1d2b58]">
            <span
              onClick={() => router.push("/")}
              className="cursor-pointer transition hover:text-[#075b33]"
            >
              Dashboard
            </span>
            <span className="text-[#7b8597]">›</span>
            <span
              onClick={() => router.push("/navigation-menus")}
              className="cursor-pointer transition hover:text-[#075b33]"
            >
              Navigation Menus
            </span>
            <span className="text-[#7b8597]">›</span>
            <span className="text-[#075b33]">Add New Menu</span>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <section className="mt-[18px] grid items-start gap-[18px] xl:grid-cols-[minmax(0,1.72fr)_minmax(360px,0.88fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-[12px]">
            {/* 1. MENU INFORMATION */}
            <Panel title="1. Menu Information">
              <div className="grid grid-cols-2 gap-x-[26px] gap-y-[14px]">
                <div>
                  <FieldLabel required>Menu Name</FieldLabel>

                  <div className="relative">
                    <input
                      value={menuName}
                      onChange={(event) =>
                        setMenuName(event.target.value.slice(0, 100))
                      }
                      placeholder="Enter menu name (e.g., Primary Menu)"
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] pr-[54px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />

                    <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[8.5px] font-semibold text-[#6d7890]">
                      {menuName.length}/100
                    </span>
                  </div>
                </div>

                <div />

                <div>
                  <FieldLabel required>Menu Location</FieldLabel>

                  <select
                    value={menuLocation}
                    onChange={(event) => setMenuLocation(event.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  >
                    <option value="">Select menu location</option>
                    <option>Header</option>
                    <option>Footer</option>
                    <option>Mobile</option>
                    <option>Top Bar</option>
                  </select>

                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    Choose where this menu will appear on your website.
                  </p>
                </div>

                <div className="row-span-2">
                  <FieldLabel optional>Menu Description</FieldLabel>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value.slice(0, 200))
                    }
                    placeholder="Enter a short description for this menu..."
                    className="h-[134px] w-full resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] py-[11px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <div className="mt-[6px] flex justify-end">
                    <span className="text-[8.5px] font-semibold text-[#6d7890]">
                      {description.length}/200
                    </span>
                  </div>

                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    This is only for your reference and won&apos;t be displayed
                    on the website.
                  </p>
                </div>

                <div>
                  <FieldLabel required>Menu Type</FieldLabel>

                  <select
                    value={menuType}
                    onChange={(event) => setMenuType(event.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  >
                    <option value="">Select menu type</option>
                    <option>Standard Menu</option>
                    <option>Mega Menu</option>
                    <option>Utility Menu</option>
                  </select>

                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    Choose the type of menu you want to create.
                  </p>
                </div>
              </div>
            </Panel>

            {/* 2. MENU ITEMS */}
            <Panel
              title="2. Menu Items"
              subtitle="Add menu items to build your navigation structure."
            >
              <div className="flex min-h-[145px] items-center justify-center rounded-[7px] border border-[#e5e8eb] bg-[#fcfcfc]">
                {menuItems.length === 0 ? (
                  <div className="text-center">
                    <ListTree className="mx-auto h-[30px] w-[30px] text-[#1f2937]" />

                    <p className="mt-[8px] text-[10.5px] font-semibold text-[#1e2b4d]">
                      No menu items added yet
                    </p>

                    <p className="mt-[6px] text-[9.5px] font-semibold text-[#68758d]">
                      Start building your menu by adding items from the right
                      panel.
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-[8px] p-[12px]">
                    {menuItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex min-h-[40px] items-center justify-between rounded-[6px] border border-[#e3e7ea] bg-white px-[12px]"
                      >
                        <div className="flex items-center gap-[10px]">
                          <span className="text-[9px] font-semibold text-[#7b879a]">
                            {index + 1}
                          </span>
                          <span className="text-[9.5px] font-semibold text-[#2e3c58]">
                            {item.label}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setMenuItems((current) =>
                              current.filter(
                                (menuItem) => menuItem.id !== item.id,
                              ),
                            )
                          }
                          className="text-[#d74a40]"
                        >
                          <X className="h-[13px] w-[13px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* 3. MENU SETTINGS */}
            <Panel title="3. Menu Settings">
              <div className="space-y-[10px]">
                <div className="flex items-center justify-between gap-[16px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#213050]">
                      Enable Mega Menu
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Allow dropdown items to display in mega menu layout.
                    </p>
                  </div>

                  <Toggle
                    checked={megaMenu}
                    onChange={() => setMegaMenu((value) => !value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-[16px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#213050]">
                      Show Menu Icons
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Display icons next to menu items.
                    </p>
                  </div>

                  <Toggle
                    checked={showIcons}
                    onChange={() => setShowIcons((value) => !value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-[16px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#213050]">
                      Open Links in New Tab
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Open all external links in a new browser tab.
                    </p>
                  </div>

                  <Toggle
                    checked={newTab}
                    onChange={() => setNewTab((value) => !value)}
                  />
                </div>
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-[12px]">
            {/* ADD MENU ITEMS */}
            <Panel title="Add Menu Items">
              <div className="flex items-end gap-[4px] border-b border-[#e5e8eb]">
                {(["Pages", "Custom Links", "Categories"] as SourceTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSourceTab(tab)}
                      className={`relative h-[38px] flex-1 text-[9.5px] font-semibold ${sourceTab === tab
                          ? "text-[#075b33]"
                          : "text-[#5f6b82]"
                        }`}
                    >
                      {tab}

                      {sourceTab === tab ? (
                        <span className="absolute inset-x-[8px] bottom-0 h-[2px] bg-[#075b33]" />
                      ) : null}
                    </button>
                  ),
                )}
              </div>

              {sourceTab === "Pages" ? (
                <>
                  <label className="relative mt-[14px] block">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search pages..."
                      className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] pr-[40px] text-[9.5px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                    />

                    <Search className="absolute right-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#5d6b84]" />
                  </label>

                  <div className="mt-[10px]">
                    {filteredPages.map((item) => {
                      const selected = selectedIds.includes(item.id);
                      const alreadyAdded = menuItems.some(
                        (menuItem) => menuItem.id === item.id,
                      );

                      return (
                        <div
                          key={item.id}
                          className="grid min-h-[36px] grid-cols-[22px_minmax(0,1fr)_auto_66px] items-center gap-[8px] border-b border-[#edf0f2] last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSelected(item.id)}
                            className={`grid h-[17px] w-[17px] place-items-center rounded-[4px] border ${selected
                                ? "border-[#0b6a3b] bg-[#0b6a3b] text-white"
                                : "border-[#ccd4df] bg-white text-transparent"
                              }`}
                          >
                            <Check className="h-[11px] w-[11px]" />
                          </button>

                          <span className="truncate text-[9.5px] font-semibold text-[#44516a]">
                            {item.label}
                          </span>

                          <span className="text-[8px] font-semibold text-[#7a8598]">
                            {item.meta ?? ""}
                          </span>

                          <button
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => addItem(item)}
                            className={`inline-flex h-[28px] items-center justify-center gap-[5px] rounded-[5px] border px-[8px] text-[8.5px] font-semibold ${alreadyAdded
                                ? "cursor-default border-[#e3e6e9] bg-[#f5f6f7] text-[#9aa4b3]"
                                : "border-[#dfe4e8] bg-white text-[#35445f]"
                              }`}
                          >
                            <Plus className="h-[11px] w-[11px]" />
                            {alreadyAdded ? "Added" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="mt-[12px] flex w-full items-center justify-center gap-[8px] text-[8.8px] font-semibold text-[#56637a]"
                  >
                    View all pages
                    <ArrowRight className="h-[12px] w-[12px]" />
                  </button>
                </>
              ) : (
                <div className="mt-[14px] flex min-h-[270px] items-center justify-center rounded-[7px] border border-dashed border-[#e1e5e8] bg-[#fcfcfc] text-center">
                  <div>
                    <p className="text-[10px] font-semibold text-[#26344f]">
                      {sourceTab}
                    </p>
                    <p className="mt-[5px] text-[9px] font-semibold text-[#728096]">
                      Add menu items from this source.
                    </p>
                  </div>
                </div>
              )}
            </Panel>

            {/* PREVIEW */}
            <Panel title="Menu Structure Preview">
              <div className="rounded-[7px] border border-[#e2e9ef] bg-[linear-gradient(90deg,#f2f8ff,#f8fbff)] px-[16px] py-[14px]">
                <div className="flex items-start gap-[10px]">
                  <Info className="mt-[1px] h-[16px] w-[16px] shrink-0 text-[#2e7a53]" />

                  <div>
                    <p className="text-[10px] font-semibold text-[#2e3c58]">
                      Your menu structure will appear here
                    </p>
                    <p className="mt-[5px] text-[9px] font-semibold text-[#66738b]">
                      Add items from the panel above to see the preview.
                    </p>
                  </div>
                </div>

                {menuItems.length ? (
                  <div className="mt-[12px] space-y-[6px]">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex h-[34px] items-center justify-between rounded-[5px] border border-[#dfe7ee] bg-white px-[10px]"
                      >
                        <span className="text-[8.8px] font-semibold text-[#34425e]">
                          {item.label}
                        </span>
                        <ChevronRight className="h-[11px] w-[11px] text-[#7a8598]" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Panel>

            {/* QUICK TIPS */}
            <section className="rounded-[9px] border border-[#dfe9e2] bg-[linear-gradient(90deg,#f1f8f4_0%,#f7fbf8_100%)] px-[18px] py-[16px]">
              <div className="flex items-start gap-[12px]">
                <Lightbulb className="mt-[1px] h-[22px] w-[22px] shrink-0 text-[#286c49]" />

                <div>
                  <h2 className="text-[13px] font-semibold text-[#285039]">
                    Quick Tips
                  </h2>

                  <div className="mt-[10px] space-y-[8px]">
                    {[
                      "Drag and drop items to reorder them.",
                      "Use mega menu for better organization.",
                      "Keep menu items short and user-friendly.",
                      "Save as draft to continue later.",
                    ].map((tip) => (
                      <div key={tip} className="flex items-start gap-[8px]">
                        <span className="mt-[1px] grid h-[13px] w-[13px] shrink-0 place-items-center rounded-full border border-[#4e9a70] text-[#2d8054]">
                          <Check className="h-[8px] w-[8px]" />
                        </span>

                        <span className="text-[9px] font-semibold leading-[1.4] text-[#53627a]">
                          {tip}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="sticky bottom-0 z-20 mt-[14px] flex min-h-[64px] items-center justify-between border-t border-[#edf0f2] bg-[#fffefb]/95 px-[10px] py-[9px] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => router.push("/navigation-menus")}
            className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[20px] text-[10px] font-semibold text-[#273655] transition hover:bg-slate-50"
          >
            <X className="h-[14px] w-[14px]" />
            Cancel
          </button>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => router.push("/navigation-menus")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[20px] text-[10px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <Save className="h-[14px] w-[14px]" />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => router.push("/navigation-menus")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[22px] text-[10px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <ArrowRight className="h-[14px] w-[14px]" />
              Create Menu
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
