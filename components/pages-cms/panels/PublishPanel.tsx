import { CalendarDays, Check, ChevronDown, Clock3, UserRound } from "lucide-react";
import Swal from "sweetalert2";
import { formatPublishDate } from "@/lib/cmsPages";
import type { FormState, Status, Visibility } from "../types";

export function PublishPanel({
  form,
  updateField,
  isEditingPublishDate,
  setIsEditingPublishDate,
  currentAdminName,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  isEditingPublishDate: boolean;
  setIsEditingPublishDate: (value: boolean) => void;
  currentAdminName?: string;
}) {
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
          Publish
        </h2>

        <ChevronDown className="h-[13px] w-[13px] rotate-180 text-[#596579]" />
      </div>

      <div className="px-[16px] pt-[11px] pb-[16px] space-y-[6px]">
        <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
          <p className="text-[10.5px] font-semibold text-[#5d6677]">
            Status
          </p>

          <select
            value={form.status}
            onChange={(e) => {
              const value = e.target.value as Status;
              updateField("status", value);
              Swal.fire({
                title: "Status Updated",
                text: `Page status changed to ${value}`,
                icon: "success",
                confirmButtonColor: "#218DAE",
                timer: 1500,
                showConfirmButton: false,
              });
            }}
            className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.status === "Published"
              ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
              : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
              }`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
          <p className="text-[10.5px] font-semibold text-[#5d6677]">
            Visibility
          </p>

          <select
            value={form.visibility}
            onChange={(e) => {
              const value = e.target.value as Visibility;
              updateField("visibility", value);
              Swal.fire({
                title: "Visibility Updated",
                text: `Page visibility changed to ${value}`,
                icon: "success",
                confirmButtonColor: "#218DAE",
                timer: 1500,
                showConfirmButton: false,
              });
            }}
            className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.visibility === "Public"
              ? "bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9]"
              : "bg-[#f3e5f5] text-[#7b1fa2] border border-[#ce93d8]"
              }`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
          <p className="text-[10.5px] font-semibold text-[#5d6677]">
            Published On
          </p>

          <div className="flex items-center justify-between gap-2">
            {isEditingPublishDate ? (
              <div className="flex items-center gap-1">
                <input
                  type="datetime-local"
                  value={
                    form.publishedAt
                      ? new Date(new Date(form.publishedAt).getTime() - new Date().getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const dt = new Date(e.target.value).toISOString();
                      updateField("publishedAt", dt);
                    }
                  }}
                  className="h-[24px] px-1 text-[10px] border border-gray-300 rounded bg-white text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingPublishDate(false)}
                  className="px-1.5 py-0.5 text-[9px] font-bold bg-[#134698] text-white rounded cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <span suppressHydrationWarning className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#293681]">
                  <CalendarDays className="h-[12px] w-[12px]" />
                  {formatPublishDate(form.publishedAt)}
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditingPublishDate(true)}
                  className="text-[9.5px] font-semibold text-[#278650] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
          <p className="text-[10.5px] font-semibold text-[#5d6677]">
            Last Updated
          </p>

          <span suppressHydrationWarning className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#4b1426]">
            <Clock3 className="h-[12px] w-[12px]" />
            {formatPublishDate(form.lastUpdated)}
          </span>
        </div>

        <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
          <p className="text-[10.5px] font-semibold text-[#5d6677]">
            Updated By
          </p>

          <span suppressHydrationWarning className="flex items-center gap-[7px] text-[10px] font-medium text-orange-500">
            <UserRound className="h-[12px] w-[12px]" />
            {form.updatedBy || currentAdminName || "Admin User"}
          </span>
        </div>
      </div>

      <div
        className="
          mx-[16px]
          mb-[11px]
          mt-[7px]
          flex
          h-[35px]
          items-center
          gap-[8px]
          rounded-[5px]
          bg-[#edf6ef]
          px-[12px]
          text-[9.5px]
          font-semibold
          text-[#32784e]
        "
      >
        <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#65a17b]">
          <Check className="h-[9px] w-[9px]" />
        </span>

        This page is currently
        published.
      </div>
    </section>
  );
}
