import type { ReactNode } from "react";

export function ToolbarButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        grid
        h-[30px]
        min-w-[30px]
        place-items-center
        rounded-[4px]
        px-[5px]
        transition

        ${active
          ? "bg-[#edf5ec] text-[#166b40]"
          : "text-[#435065] hover:bg-[#f5f6f3]"
        }
      `}
    >
      {children}
    </button>
  );
}
