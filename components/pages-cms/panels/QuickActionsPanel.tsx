import { Copy, ExternalLink, Link2, Trash2 } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/cmsPages";
import type { FormState } from "../types";

export function QuickActionsPanel({
  form,
  onViewPage,
}: {
  form: FormState;
  onViewPage: () => void;
}) {
  return (
    <section
      className="
        shrink-0
        rounded-none
        border
        border-[#e7e7e3]
        bg-white
        px-[16px]
        py-[10px]
      "
    >
      <h2 className="text-[14px] font-bold text-[#263148]">
        Quick Actions
      </h2>

      <div
        className="
          mt-[8px]
          grid
          grid-cols-2
          gap-[7px]
        "
      >
        <button
          type="button"
          className="
            flex
            h-[36px]
            items-center
            justify-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#dedfdb]
            bg-white
            text-[10px]
            font-semibold
            text-[#475367]
          "
        >
          <Copy className="h-[13px] w-[13px]" />

          Duplicate Page
        </button>

        <button
          type="button"
          onClick={() =>
            navigator
              .clipboard
              ?.writeText(
                `${PUBLIC_SITE_URL}/${form.slug}`,
              )
          }
          className="
            flex
            h-[36px]
            items-center
            justify-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#dedfdb]
            bg-white
            text-[10px]
            font-semibold
            text-[#475367]
          "
        >
          <Link2 className="h-[13px] w-[13px]" />

          Copy URL
        </button>

        <button
          type="button"
          className="
            flex
            h-[36px]
            items-center
            justify-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#efcfca]
            bg-white
            text-[10px]
            font-semibold
            text-[#d44f48]
          "
        >
          <Trash2 className="h-[13px] w-[13px]" />

          Move to Trash
        </button>

        <button
          type="button"
          onClick={onViewPage}
          className="
            flex
            h-[36px]
            items-center
            justify-center
            gap-[7px]
            rounded-[5px]
            border
            border-[#dedfdb]
            bg-white
            text-[10px]
            font-semibold
            text-[#475367]
          "
        >
          <ExternalLink className="h-[13px] w-[13px]" />

          View Page
        </button>
      </div>
    </section>
  );
}
