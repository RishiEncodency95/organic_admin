"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, FileText, MessageSquareText, Waypoints, X, type LucideIcon } from "lucide-react";

/*
 * "Publish & Version History" popup of the Chatbot Manager — design preview; publishing
 * only updates page state. It closes only from the ✕, Cancel or after publishing — not on
 * outside clicks or Escape. Rendered into document.body so the page's zoom does not shrink it.
 */

export type Version = { minor: number; date: string; by: string; note: string };

export type PublishTab = "publish" | "history";

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002").replace(/\/$/, "");

/** Sample counts of unpublished edits per area (shown while there is a draft) */
const CHANGES: { label: string; count: number; icon: LucideIcon }[] = [
  { label: "Buttons & Flows", count: 2, icon: Waypoints },
  { label: "Questions & Answers", count: 4, icon: MessageSquareText },
  { label: "Forms & Routing", count: 1, icon: FileText },
];

type Props = {
  /** null keeps the popup closed */
  tab: PublishTab | null;
  onTabChange: (tab: PublishTab) => void;
  onClose: () => void;
  /** Newest first; the first entry is live */
  versions: Version[];
  hasDraft: boolean;
  onPublish: (note: string) => void;
  onRestore: (version: Version) => void;
};

const v = (minor: number) => `v1.${minor}`;

export default function PublishModal({ tab, onTabChange, onClose, versions, hasDraft, onPublish, onRestore }: Props) {
  const [note, setNote] = useState("Updated stall options and visitor answers.");
  const [restored, setRestored] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = tab !== null;

  // Closes only from the ✕ or Cancel — no outside-click or Escape handlers on purpose
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!tab || typeof document === "undefined") return null;

  const live = versions[0];
  const draftMinor = live.minor + 1;
  const list = tab === "publish" ? versions.slice(0, 2) : versions;

  const versionRows = (
    <div className="flex flex-col">
      {list.map((ver, i) => (
        <div key={ver.minor} className={`flex items-center gap-[20px] py-[7px] ${i > 0 ? "border-t border-[#eef0f2]" : ""}`}>
          <span className="w-[34px] text-[16.5px] font-bold text-[#0f172a]">{v(ver.minor)}</span>
          <span className={`w-[76px] rounded-full py-[2px] text-center text-[12.5px] ${i === 0 ? "bg-[#dcf3e1] text-[#15803d]" : "bg-[#eef1f4] text-[#475569]"}`}>{i === 0 ? "Live" : "Previous"}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] text-[#334155]">
              {ver.date} • {ver.by}
            </span>
            {tab === "history" && ver.note && <span className="block truncate text-[12px] text-[#64748b]">{ver.note}</span>}
          </span>
          {i === 0 ? (
            <button
              type="button"
              onClick={() => onTabChange("history")}
              className="h-[32px] w-[112px] rounded-[7px] border border-[#cbd5e1] bg-white text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50"
            >
              View
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onRestore(ver);
                setRestored(v(ver.minor));
              }}
              className="h-[32px] w-[112px] rounded-[7px] border border-[#2f8a4c] bg-white text-[13px] font-semibold text-[#14532d] transition hover:bg-[#f1f7ee]"
            >
              Restore to Draft
            </button>
          )}
        </div>
      ))}
      <p className="mt-[2px] text-[12px] text-[#475569]">
        {restored ? `${restored} restored as the draft. Review and publish to make it live.` : "Restore creates a draft. Review and publish to make it live."}
      </p>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="relative flex max-h-[calc(100vh-32px)] w-[660px] max-w-full flex-col rounded-[14px] bg-white text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="min-h-0 overflow-y-auto px-[22px] pb-[14px] pt-[14px]">
          {/* Header: title + chips on one line, subtitle underneath */}
          <div className="flex items-center gap-[12px]">
            <h2 id="publish-title" className="mr-auto whitespace-nowrap text-[21px] font-bold leading-tight text-[#0f2a1c]">
              Publish &amp; Version History
            </h2>
            <div className="flex shrink-0 items-center gap-[8px]">
              <span className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#e8f6ec] px-[9px] py-[3px] text-[12px] text-[#15803d]">
                <span className="h-[8px] w-[8px] rounded-full bg-[#16a34a]" /> Live: {v(live.minor)}
              </span>
              {hasDraft && (
                <span className="inline-flex items-center gap-[6px] rounded-[6px] bg-[#fdf3e1] px-[9px] py-[3px] text-[12px] text-[#b45309]">
                  <span className="h-[8px] w-[8px] rounded-full bg-[#f59e0b]" /> Draft: {v(draftMinor)}
                </span>
              )}
              <span title="Versions here are sample data" className="rounded-[6px] border border-[#e5e7eb] px-[7px] py-[3px] text-[11px] text-[#475569]">
                Demo data
              </span>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-[6px] grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full text-[#0f172a] transition hover:bg-slate-100">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <p className="mt-[2px] text-[13.5px] text-[#475569]">Review changes before updating Organic Mitra.</p>

          {/* Tabs */}
          <div className="mt-[8px] flex border-b border-[#e5e7eb]">
            {(
              [
                ["publish", "Publish Changes"],
                ["history", "Version History"],
              ] as const
            ).map(([key, name]) => (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`-mb-px border-b-[3px] px-[16px] pb-[7px] text-[14px] transition ${
                  tab === key ? "border-[#15633a] font-semibold text-[#15633a]" : "border-transparent text-[#334155] hover:text-[#15633a]"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="mt-[10px] rounded-[10px] border border-[#eef0f2] px-[16px] pb-[10px] pt-[10px]">
            {tab === "publish" ? (
              <>
                <p className="text-[16.5px] font-bold text-[#0f2a1c]">Changes ready to publish</p>
                {hasDraft ? (
                  <div className="mt-[4px] flex flex-col">
                    {CHANGES.map(({ label, count, icon: Icon }, i) => (
                      <div key={label} className={`flex items-center gap-[14px] py-[7px] ${i > 0 ? "border-t border-[#eef0f2]" : ""}`}>
                        <Icon className="h-[20px] w-[20px] text-[#0f172a]" />
                        <span className="flex-1 text-[13.5px] text-[#0f172a]">{label}</span>
                        <span className="text-[13.5px] text-[#334155]">{count} updated</span>
                        <ChevronRight className="h-[16px] w-[16px] text-[#0f172a]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-[6px] text-[13px] text-[#64748b]">No unpublished changes — {v(live.minor)} is live.</p>
                )}

                {hasDraft && (
                  <div className="mt-[6px] flex items-center gap-[12px] rounded-[8px] bg-[#eef8f1] px-[12px] py-[7px]">
                    <span className="grid h-[24px] w-[24px] place-items-center rounded-full bg-[#15803d] text-white">
                      <Check className="h-[14px] w-[14px]" strokeWidth={3} />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-semibold text-[#14532d]">Validation passed</span>
                      <span className="block text-[12px] text-[#334155]">Required fields and flow links checked.</span>
                    </span>
                  </div>
                )}

                <p className="mt-[10px] text-[13.5px] font-semibold text-[#0f172a]">
                  Release note <span className="font-normal text-[#475569]">(optional)</span>
                </p>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={150}
                  disabled={!hasDraft}
                  className="mt-[4px] h-[33px] w-full rounded-[7px] border border-[#cbd5e1] bg-white px-[12px] text-[13.5px] text-[#0f172a] outline-none transition focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15 disabled:bg-slate-50"
                />
                <p className="mt-[4px] text-[12px] text-[#475569]">Publishing applies to new chats. Active chats continue on their current version.</p>

                <div className="mt-[8px] border-t border-[#eef0f2] pt-[8px]">
                  <p className="text-[16.5px] font-bold text-[#0f2a1c]">Recent versions</p>
                  {versionRows}
                </div>
              </>
            ) : (
              <>
                <p className="text-[16.5px] font-bold text-[#0f2a1c]">All versions</p>
                {versionRows}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-[12px] flex items-center gap-[12px]">
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[30px] items-center rounded-[8px] border border-[#cbd5e1] bg-white px-[18px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50"
            >
              Preview Draft
            </a>
            <button type="button" onClick={onClose} className="ml-auto h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[22px] text-[13.5px] font-semibold text-[#0f172a] transition hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onPublish(note.trim())}
              disabled={!hasDraft}
              className="h-[30px] rounded-[8px] bg-[#15633a] px-[22px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#124f2f] disabled:opacity-50"
            >
              Publish {v(draftMinor)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
