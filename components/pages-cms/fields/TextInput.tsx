export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 120,
  hideLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hideLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const maxAllowed = hideLimit ? 5000 : Math.max(currentLength, maxLength);
  const isAtLimit = !hideLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        maxLength={maxAllowed}
        placeholder={placeholder}
        onChange={(event) => {
          if (event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`
          h-[35px]
          w-full
          cursor-default
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          ${hideLimit ? "pr-[10px]" : "pr-[62px]"}
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          placeholder:text-[10.5px]
          placeholder:text-[#9aa0aa]
          focus:border-[#8fa98e]
        `}
      />
      {!hideLimit && (
        <span
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
              : "bg-[#f1f5f9] text-[#64748b]"
            }`}
        >
          {currentLength}/{maxAllowed}
        </span>
      )}
    </div>
  );
}
