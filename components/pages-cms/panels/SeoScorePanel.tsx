import { ChevronRight } from "lucide-react";
import { SeoRow, SeoScoreCircle } from "../seo";

export function SeoScorePanel() {
  return (
    <section
      className="
        shrink-0
        rounded-none
        border
        border-[#e7e7e3]
        bg-white
        overflow-hidden
      "
    >
      <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
        <h2 className="text-[14px] font-bold text-[#263148]">
          SEO Score
        </h2>

        <button
          type="button"
          className="flex items-center gap-[4px] text-[10px] font-bold text-[#293681] hover:underline"
        >
          View Full SEO Analysis
          <ChevronRight className="h-[10px] w-[10px]" />
        </button>
      </div>

      <div className="px-[16px] py-[11px]">
        <div
          className="
            grid
            grid-cols-[132px_1fr]
            items-center
            gap-[11px]
          "
        >
          <div className="flex justify-center">
            <SeoScoreCircle />
          </div>

          <div className="space-y-[1px] border-l border-[#eeeeea] pl-[14px]">
            <SeoRow label="Meta Title" />
            <SeoRow label="Meta Description" />
            <SeoRow label="Headings" />
            <SeoRow label="Content Quality" />
            <SeoRow label="Internal Linking" />
            <SeoRow label="Images (ALT Text)" />
            <SeoRow label="Schema Markup" />
          </div>
        </div>
      </div>
    </section>
  );
}
