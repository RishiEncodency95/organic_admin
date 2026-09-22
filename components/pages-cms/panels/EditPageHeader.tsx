import { ArrowLeft, Edit3, Eye, MoreVertical, Save, Sparkles } from "lucide-react";

export function EditPageHeader({
  onBack,
  onPreview,
  onSyncReset,
  onSave,
  saving,
}: {
  onBack: () => void;
  onPreview: () => void;
  onSyncReset: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div
      className="
        mb-[20px]
        flex
        shrink-0
        items-start
        justify-between
        border-b-[2px]
        border-[#293681]
        pb-[8px]
      "
    >
      <div
        className="
          flex
          items-center
          gap-[11px]
        "
      >
        <div
          className="
            mt-[1px]
            grid
            h-[28px]
            w-[28px]
            place-items-center
            rounded-full
            bg-[#e8f4e9]
            text-[#23714a]
          "
        >
          <Edit3
            className="h-[14px] w-[14px]"
            strokeWidth={1.65}
          />
        </div>

        <div>
          <h1
            className="
              mt-[2px]
              text-[19px]
              font-bold
              leading-[1.15]
              tracking-[-0.018em]
              text-[#18233b]
            "
          >
            Edit Page
          </h1>

        </div>
      </div>

      <div
        className="
          flex
          items-center
          gap-[10px]
        "
      >
        <button
          type="button"
          onClick={onBack}
          className="
            flex
            h-[30px]
            items-center
            gap-[7px]
            rounded-[4px]
            border
            border-red-200
            bg-red-50
            px-[12px]
            text-[8.5px]
            font-semibold
            text-red-600
          "
        >
          <ArrowLeft className="h-[13px] w-[13px]" />

          Back to Pages
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="
            flex
            h-[30px]
            items-center
            gap-[7px]
            rounded-[4px]
            border
            border-orange-200
            bg-orange-50
            px-[12px]
            text-[8.5px]
            font-semibold
            text-orange-600
          "
        >
          <Eye className="h-[13px] w-[13px]" />

          Preview Page
        </button>

        <button
          type="button"
          onClick={onSyncReset}
          className="
            flex
            h-[30px]
            items-center
            gap-[7px]
            rounded-[4px]
            border
            border-[#0f766e]
            bg-[#f0fdf4]
            px-[12px]
            text-[8.5px]
            font-semibold
            text-[#0f766e]
            hover:bg-[#dcfce7]
          "
        >
          <Sparkles className="h-[13px] w-[13px]" />

          Sync / Reset Website Data
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="
            flex
            h-[30px]
            items-center
            gap-[7px]
            rounded-[4px]
            bg-[#218DAE]
            px-[12px]
            text-[8.5px]
            font-semibold
            text-white
            shadow-sm
          "
        >
          <Save className="h-[13px] w-[13px]" />

          {saving ? "Updating..." : "Update Page"}
        </button>

        <button
          type="button"
          className="
            grid
            h-[30px]
            w-[30px]
            place-items-center
            rounded-[4px]
            border
            border-[#dedfdb]
            bg-white
            text-[#445065]
          "
        >
          <MoreVertical className="h-[16px] w-[16px]" />
        </button>
      </div>
    </div>
  );
}
