export function Toggle({
  checked,
  onChange,
  className = "",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative
        h-[24px]
        w-[46px]
        shrink-0
        rounded-full
        transition-all
        duration-200
        ease-in-out
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-emerald-400/50
        focus:ring-offset-1
        ${
          checked
            ? "bg-[#00c853] shadow-[0_2px_8px_rgba(0,200,83,0.35)]"
            : "bg-[#cbd5e1] hover:bg-[#94a3b8]"
        }
        ${className}
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          flex
          h-[18px]
          w-[18px]
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-md
          transition-all
          duration-200
          ease-in-out
          ${checked ? "left-[25px]" : "left-[3px]"}
        `}
      >
        {checked ? (
          <svg
            viewBox="0 0 12 12"
            className="h-[11px] w-[11px] text-[#00c853]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2.5 6.2 4.8 8.5 9.5 3.5" />
          </svg>
        ) : (
          <span className="h-[2px] w-[7px] rounded-full bg-slate-300" />
        )}
      </span>
    </button>
  );
}
