import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center bg-white">
      <div className="flex max-w-[360px] flex-col items-center px-[18px] text-center">
        <span className="mb-[14px] grid h-[54px] w-[54px] place-items-center rounded-full bg-[#eef6f1] text-[#23714a]">
          <Icon className="h-[24px] w-[24px]" />
        </span>
        <h1 className="text-[16px] font-bold text-[#23471d]">{title}</h1>
        <p className="mt-[6px] text-[11px] font-medium leading-relaxed text-[#6c7587]">
          {description}
        </p>
        <span className="mt-[14px] rounded-full border border-[#ffcc80] bg-[#fff3e0] px-[12px] py-[4px] text-[9px] font-bold uppercase tracking-wide text-[#b45309]">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
