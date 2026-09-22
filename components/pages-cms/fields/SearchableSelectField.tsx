"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export function SearchableSelectField({
  value,
  options,
  onChange,
  placeholder = "Select template...",
  searchPlaceholder = "Search page or template...",
}: {
  value: string;
  options: { label: string; value: string }[] | string[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || value || placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          h-[35px]
          w-full
          cursor-pointer
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          pr-[10px]
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          text-left
          flex
          items-center
          justify-between
          hover:bg-[#fafbfc]
          focus:border-[#8fa98e]
          transition-colors
        "
      >
        <span className="truncate pr-2">{displayLabel}</span>
        <ChevronDown
          className={`h-[12px] w-[12px] text-[#64748b] shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="
            absolute
            left-0
            right-0
            top-[37px]
            z-[999]
            bg-white
            border
            border-[#d0d7de]
            rounded-none
            shadow-xl
            overflow-hidden
          "
        >
          <div className="p-1.5 border-b border-[#e1e4e8] bg-[#f6f8fa] flex items-center gap-1.5">
            <Search className="h-[12px] w-[12px] text-[#656d76] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="
                w-full
                bg-transparent
                text-[11px]
                text-[#24292f]
                outline-none
                placeholder:text-[#8c959f]
              "
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="text-[#8c959f] hover:text-[#24292f] p-0.5"
                title="Clear search"
              >
                <X className="h-[11px] w-[11px]" />
              </button>
            )}
          </div>

          <div className="max-h-[240px] overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full
                      text-left
                      px-2.5
                      py-1.5
                      text-[11px]
                      cursor-pointer
                      flex
                      items-center
                      justify-between
                      transition-colors
                      ${
                        isSelected
                          ? "bg-[#eaf5ea] text-[#1b5e20] font-semibold"
                          : "text-[#414b5e] hover:bg-[#f6f8fa] hover:text-[#1b5e20]"
                      }
                    `}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="h-[12px] w-[12px] text-[#1b5e20] shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-[11px] text-[#8c959f]">
                No template found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
