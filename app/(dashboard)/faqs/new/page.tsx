"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bold,
  Bookmark,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Underline,
  Undo2,
  X,
} from "lucide-react";

type VisibilityType = "Public" | "Members Only" | "Internal";

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
      {required ? <span className="ml-[2px] text-[#df3e3e]">*</span> : null}
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
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d8dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

export default function AddNewFAQPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");

  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("0");

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("Public");

  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const questionCount = useMemo(() => question.length, [question]);
  const answerCount = useMemo(() => answer.length, [answer]);
  const shortCount = useMemo(() => shortAnswer.length, [shortAnswer]);
  const metaTitleCount = useMemo(() => metaTitle.length, [metaTitle]);
  const metaDescriptionCount = useMemo(
    () => metaDescription.length,
    [metaDescription],
  );

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
              Add New FAQ
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>FAQs</span>
              <span className="text-[#7b8597]">›</span>
              <span>Add New FAQ</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655]"
            >
              <ArrowLeft className="h-[15px] w-[15px]" />
              Back to FAQs
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)]"
            >
              <Save className="h-[15px] w-[15px]" />
              Save FAQ
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1.7fr)_minmax(350px,0.98fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-[12px]">
            {/* FAQ INFORMATION */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                FAQ Information
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Add question and answer details.
              </p>

              <div className="mt-[16px] space-y-[16px]">
                {/* QUESTION */}
                <div>
                  <FieldLabel required>Question</FieldLabel>

                  <input
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value.slice(0, 200))
                    }
                    placeholder="Enter the frequently asked question"
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <div className="mt-[7px] flex justify-end">
                    <span className="text-[9px] font-semibold text-[#6d7890]">
                      {questionCount}/200
                    </span>
                  </div>
                </div>

                {/* ANSWER */}
                <div>
                  <FieldLabel required>Answer</FieldLabel>

                  <div className="overflow-hidden rounded-[6px] border border-[#dfe4e8] bg-white">
                    <div className="flex min-h-[42px] flex-wrap items-center gap-[12px] border-b border-[#e7e9ec] px-[12px] text-[#2f3c56]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-[10px] text-[10.5px] font-semibold"
                      >
                        Paragraph
                        <ChevronDown className="h-[13px] w-[13px]" />
                      </button>

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Bold className="h-[15px] w-[15px]" />
                      <Italic className="h-[15px] w-[15px]" />
                      <Underline className="h-[15px] w-[15px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <List className="h-[15px] w-[15px]" />
                      <ListOrdered className="h-[15px] w-[15px]" />
                      <ChevronDown className="h-[12px] w-[12px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Link2 className="h-[15px] w-[15px]" />
                      <ImageIcon className="h-[15px] w-[15px]" />
                      <Quote className="h-[15px] w-[15px]" />

                      <span className="h-[20px] w-px bg-[#e4e7eb]" />

                      <Undo2 className="h-[15px] w-[15px]" />
                      <Redo2 className="h-[15px] w-[15px] text-slate-400" />
                    </div>

                    <textarea
                      value={answer}
                      onChange={(event) =>
                        setAnswer(event.target.value.slice(0, 2000))
                      }
                      placeholder="Provide a clear and helpful answer..."
                      className="h-[175px] w-full resize-none bg-white px-[14px] py-[12px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />
                  </div>

                  <div className="mt-[7px] flex justify-end">
                    <span className="text-[9px] font-semibold text-[#6d7890]">
                      {answerCount}/2000
                    </span>
                  </div>
                </div>

                {/* SHORT ANSWER */}
                <div>
                  <FieldLabel optional>Short Answer</FieldLabel>

                  <p className="mb-[7px] text-[9px] font-semibold text-[#6d7890]">
                    A brief answer summary to display in FAQ listing (max 160
                    characters).
                  </p>

                  <input
                    value={shortAnswer}
                    onChange={(event) =>
                      setShortAnswer(event.target.value.slice(0, 160))
                    }
                    placeholder="Enter short summary..."
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[11px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <div className="mt-[7px] flex justify-end">
                    <span className="text-[9px] font-semibold text-[#6d7890]">
                      {shortCount}/160
                    </span>
                  </div>
                </div>

                {/* ACTIVE */}
                <div className="flex items-center gap-[10px] border-t border-[#edf0f2] pt-[14px]">
                  <Toggle checked={active} onChange={() => setActive((v) => !v)} />

                  <div>
                    <p className="text-[10.5px] font-semibold text-[#213050]">
                      Active
                    </p>
                    <p className="mt-[2px] text-[9.5px] font-semibold text-[#6d7890]">
                      Make this FAQ visible on the website.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ADDITIONAL OPTIONS */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Additional Options
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Configure extra settings for this FAQ.
              </p>

              <div className="mt-[16px] grid grid-cols-2 gap-[28px]">
                <div>
                  <FieldLabel>Display Order</FieldLabel>

                  <input
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                    className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2d3b58] outline-none"
                  />

                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    Set display order (0 will be last)
                  </p>
                </div>

                <div>
                  <FieldLabel>Featured FAQ</FieldLabel>

                  <div className="flex items-center gap-[10px]">
                    <Toggle
                      checked={featured}
                      onChange={() => setFeatured((v) => !v)}
                    />

                    <span className="text-[9.5px] font-semibold text-[#66738b]">
                      Mark as featured to highlight this FAQ.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-[12px]">
            {/* CATEGORY */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                Category &amp; Visibility
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Choose where this FAQ will appear.
              </p>

              <div className="mt-[16px] space-y-[16px]">
                <div>
                  <FieldLabel required>Category</FieldLabel>

                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  >
                    <option value="">Select Category</option>
                    <option>General</option>
                    <option>Services</option>
                    <option>Donation</option>
                    <option>Volunteer</option>
                    <option>Support</option>
                  </select>
                </div>

                <div>
                  <FieldLabel optional>Sub Category</FieldLabel>

                  <select
                    value={subCategory}
                    onChange={(event) => setSubCategory(event.target.value)}
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                  >
                    <option value="">Select Sub Category</option>
                    <option>Getting Started</option>
                    <option>Process</option>
                    <option>Eligibility</option>
                    <option>Payments</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Visibility</FieldLabel>

                  <div className="space-y-[13px]">
                    {[
                      {
                        title: "Public" as VisibilityType,
                        subtitle: "Visible to all website visitors",
                      },
                      {
                        title: "Members Only" as VisibilityType,
                        subtitle: "Visible to registered users only",
                      },
                      {
                        title: "Internal" as VisibilityType,
                        subtitle: "Visible to admins and staff only",
                      },
                    ].map((item) => {
                      const selected = visibility === item.title;

                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => setVisibility(item.title)}
                          className="flex w-full items-start gap-[10px] text-left"
                        >
                          <span
                            className={`mt-[1px] h-[17px] w-[17px] shrink-0 rounded-full border ${selected
                              ? "border-[#0b6a3b] shadow-[inset_0_0_0_4px_#0b6a3b]"
                              : "border-[#cfd6df] bg-white"
                              }`}
                          />

                          <div>
                            <p className="text-[10.5px] font-semibold text-[#213050]">
                              {item.title}
                            </p>
                            <p className="mt-[3px] text-[9.5px] font-semibold text-[#6d7890]">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* SEO */}
            <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[18px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">
                SEO &amp; Display Settings
              </h2>
              <p className="mt-[4px] text-[10.5px] font-semibold text-[#66738b]">
                Optimize how this FAQ appears in search and listings.
              </p>

              <div className="mt-[16px] space-y-[16px]">
                <div>
                  <FieldLabel required>FAQ Slug / URL</FieldLabel>

                  <input
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="Enter URL slug (e.g., what-is-moksha-sewa)"
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <p className="mt-[6px] text-[9px] font-semibold text-[#738097]">
                    Use lowercase letters, numbers and hyphens only.
                  </p>
                </div>

                <div>
                  <FieldLabel optional>Meta Title</FieldLabel>

                  <input
                    value={metaTitle}
                    onChange={(event) =>
                      setMetaTitle(event.target.value.slice(0, 60))
                    }
                    placeholder="Enter meta title for this FAQ"
                    className="h-[42px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <div className="mt-[7px] flex justify-end">
                    <span className="text-[9px] font-semibold text-[#6d7890]">
                      {metaTitleCount}/60
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel optional>Meta Description</FieldLabel>

                  <textarea
                    value={metaDescription}
                    onChange={(event) =>
                      setMetaDescription(event.target.value.slice(0, 160))
                    }
                    placeholder="Enter meta description for this FAQ"
                    className="h-[72px] w-full resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] py-[10px] text-[10.5px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                  />

                  <div className="mt-[7px] flex justify-end">
                    <span className="text-[9px] font-semibold text-[#6d7890]">
                      {metaDescriptionCount}/160
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* BOTTOM BAR */}
        <section className="sticky bottom-0 z-20 mt-[12px] flex min-h-[58px] items-center justify-between gap-[16px] border-t border-[#edf1f3] bg-[#fffefb]/95 px-[2px] py-[9px] backdrop-blur-sm">
          <div className="flex min-h-[44px] flex-1 items-center gap-[10px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1,#f4faf6)] px-[14px]">
            <div className="grid h-[25px] w-[25px] place-items-center rounded-full border border-[#cfe1d4] bg-white text-[#0d6b3e]">
              <Info className="h-[15px] w-[15px]" />
            </div>

            <p className="text-[9.5px] font-semibold text-[#38654b]">
              <span className="font-semibold">Tip:</span>{" "}
              After saving, you can add more FAQs or go back to manage existing FAQs.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655]"
            >
              <X className="h-[14px] w-[14px]" />
              Cancel
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10px] font-semibold text-[#273655]"
            >
              <Bookmark className="h-[14px] w-[14px]" />
              Save as Draft
            </button>

            <button
              type="button"
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)]"
            >
              <Save className="h-[14px] w-[14px]" />
              Save FAQ
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
