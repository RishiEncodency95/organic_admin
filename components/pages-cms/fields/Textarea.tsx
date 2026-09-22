export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
  maxLength = 450,
  noLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
  noLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const maxAllowed = noLimit ? 10000 : Math.max(currentLength, maxLength);
  const isAtLimit = !noLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        maxLength={noLimit ? undefined : maxAllowed}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => {
          if (noLimit || event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`w-full cursor-text resize-y bg-white rounded-none shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)] px-[10px] py-[8px] text-[11px] font-medium text-[#414b5e] outline-none placeholder:text-[10.5px] placeholder:text-[#9aa0aa] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(143,169,142,1)] ${mono ? "font-mono text-[10px]" : ""}`}
      />
      {!noLimit && (
        <span
          className={`absolute right-2 bottom-2.5 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
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
