import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const FIELD_CLASSES =
  "w-full border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all hover:border-[#FF9D50] hover:[box-shadow:rgba(255,157,80,0.15)_0px_1px_3px_0px,rgba(255,157,80,0.35)_0px_0px_0px_1px] focus:border-[#FF9D50] focus:outline-none focus:ring-2 focus:ring-[#FF9D50]/20 disabled:bg-surface-sunken disabled:text-text-muted [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">
    {children}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className = "", id, ...props }, ref) => (
    <div>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      <input ref={ref} id={id} className={`${FIELD_CLASSES} ${className}`} {...props} />
      {hint && !error && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapperProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className = "", ...props }, ref) => (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea ref={ref} className={`${FIELD_CLASSES} resize-none ${className}`} {...props} />
      {hint && !error && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldWrapperProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, className = "", children, ...props }, ref) => (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props}>
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-[11px] text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
