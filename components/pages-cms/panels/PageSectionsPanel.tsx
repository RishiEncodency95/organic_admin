import { ChevronRight } from "lucide-react";
import { SectionFieldsEditor, SectionItemsEditor, SectionTitle } from "../section-editor";
import { Toggle } from "../fields";

export function PageSectionsPanel({
  sectionsDraft,
  setSectionsDraft,
  openSectionIndices,
  setOpenSectionIndices,
  toggleSectionAccordion,
  updateSectionField,
  updateSectionItem,
  addSectionItem,
  removeSectionItem,
  resetToWebsiteDefaults,
}: {
  sectionsDraft: Array<Record<string, any>>;
  setSectionsDraft: React.Dispatch<React.SetStateAction<Array<Record<string, any>>>>;
  openSectionIndices: Set<number>;
  setOpenSectionIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  toggleSectionAccordion: (index: number) => void;
  updateSectionField: (sectionIndex: number, key: string, value: unknown) => void;
  updateSectionItem: (sectionIndex: number, itemIndex: number, key: string, value: unknown) => void;
  addSectionItem: (sectionIndex: number) => void;
  removeSectionItem: (sectionIndex: number, itemIndex: number) => void;
  resetToWebsiteDefaults: () => void;
}) {
  return (
    <section
      className="
        flex
        shrink-0
        flex-col
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        bg-white
        px-[16px]
        py-[9px]
      "
    >
      <div
        className="
          flex
          shrink-0
          items-start
          justify-between
        "
      >
        <SectionTitle
          number={2}
          title="Page Sections"
        />

        <span className="text-[9.5px] font-semibold text-[#4B1426]">
          {sectionsDraft.length} sections
        </span>
      </div>

      {/* EXPAND / COLLAPSE GLOBAL ACTIONS */}
      <div className="mt-[10px] flex items-center justify-between border-b border-[#f1f5f9] pb-[8px] mb-[12px]">
        <span className="text-[10.5px] font-bold text-[#1e293b]">
          Page Landing Sections ({sectionsDraft.length})
        </span>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => setOpenSectionIndices(new Set(sectionsDraft.map((_, i) => i)))}
            className="text-[9.5px] font-semibold text-[#4B1426] hover:underline"
          >
            Expand All
          </button>
          <span className="text-[#cbd5e1]">|</span>
          <button
            type="button"
            onClick={() => setOpenSectionIndices(new Set())}
            className="text-[9.5px] font-semibold text-[#64748b] hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* INDIVIDUAL COLLAPSIBLE SECTION CARDS */}
      {sectionsDraft.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center my-3">
          <p className="text-[12px] font-semibold text-amber-800 mb-2">No sections currently loaded for this page.</p>
          <button
            type="button"
            onClick={resetToWebsiteDefaults}
            className="px-4 py-1.5 bg-[#4B1426] text-white text-[11px] font-bold rounded hover:bg-[#380e1c] transition-colors shadow-sm"
          >
            Load Live Website Defaults
          </button>
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        {sectionsDraft.map((section, sectionIndex) => {
          const isOpen = openSectionIndices.has(sectionIndex);

          return (
            <div
              key={section._id ?? section.key ?? sectionIndex}
              className={`rounded-[6px] border transition ${isOpen ? "border-[#4B1426] bg-[#fbfbfa]" : "border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
                }`}
            >
              {/* SECTION CARD HEADER */}
              <div
                onClick={() => toggleSectionAccordion(sectionIndex)}
                className={`flex cursor-pointer items-center justify-between px-[14px] py-[10px] transition ${isOpen ? "bg-[#fdf2f4] border-b border-[#f5d0d6]" : "bg-[#f8fafc]"
                  }`}
              >
                <div className="flex items-center gap-[8px]">
                  <ChevronRight
                    className={`h-4 w-4 text-[#4B1426] transition-transform ${isOpen ? "rotate-90 text-[#3b0f1e]" : ""
                      }`}
                  />
                  <span className="font-mono text-[10px] font-bold text-[#64748b]">
                    {sectionIndex + 1}.
                  </span>
                  <span className="text-[12px] font-bold text-[#4B1426]">
                    {section.name ?? section.key}
                  </span>
                  {section.enabled === false && (
                    <span className="rounded-[4px] bg-rose-50 border border-rose-200 px-[6px] py-[1px] text-[8px] font-bold text-rose-600">
                      Disabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-[6px]">
                    <span
                      className={`text-[9.5px] font-bold ${section.enabled !== false ? "text-[#16a34a]" : "text-[#dc2626]"
                        }`}
                    >
                      {section.enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                    <Toggle
                      checked={section.enabled !== false}
                      onChange={(value) => updateSectionField(sectionIndex, "enabled", value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION BODY (ONLY RENDERED WHEN OPEN) */}
              {isOpen && (
                <div className="flex flex-col gap-[12px] p-[14px] bg-[#fbfbfa]">
                  <SectionFieldsEditor
                    section={section}
                    onFieldChange={(key, value) => updateSectionField(sectionIndex, key, value)}
                  />

                  {Array.isArray(section.slides) && (
                    <div className="flex flex-col gap-[8px]">
                      <SectionItemsEditor
                        items={section.slides}
                        onChangeItem={(itemIndex, key, value) => {
                          setSectionsDraft((previous) =>
                            previous.map((sec, i) => {
                              if (i !== sectionIndex) return sec;
                              const slides = [...(sec.slides ?? [])];
                              slides[itemIndex] = { ...slides[itemIndex], [key]: value };
                              return { ...sec, slides };
                            }),
                          );
                        }}
                        onAddItem={() => {
                          setSectionsDraft((previous) =>
                            previous.map((sec, i) => {
                              if (i !== sectionIndex) return sec;
                              const slides = [...(sec.slides ?? [])];
                              const blank = {
                                title: "NEW HERO SLIDE",
                                description: "Enter slide description...",
                                image: "",
                                alt: "Hero Banner Slide",
                                buttonLabel: "Book Your Stall",
                                buttonHref: "/registration/book-a-stand",
                                secondaryButtonLabel: "Register as Visitor",
                                secondaryButtonHref: "/registration/visitor-registration",
                              };
                              return { ...sec, slides: [...slides, blank] };
                            }),
                          );
                        }}
                        onRemoveItem={(itemIndex) => {
                          setSectionsDraft((previous) =>
                            previous.map((sec, i) => {
                              if (i !== sectionIndex) return sec;
                              const slides = (sec.slides ?? []).filter((_: unknown, idx: number) => idx !== itemIndex);
                              return { ...sec, slides };
                            }),
                          );
                        }}
                        sectionId={section.key}
                      />
                    </div>
                  )}

                  {Array.isArray(section.items) && section.key !== "hero" && section.key !== "introduction-section" && section.key !== "why-participate" && section.key !== "conference-section" && section.key !== "sponsors-attend" && section.key !== "testimonials-section" && (
                    <SectionItemsEditor
                      items={section.items}
                      onChangeItem={(itemIndex, key, value) => updateSectionItem(sectionIndex, itemIndex, key, value)}
                      onAddItem={() => addSectionItem(sectionIndex)}
                      onRemoveItem={(itemIndex) => removeSectionItem(sectionIndex, itemIndex)}
                      sectionId={section.key}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
