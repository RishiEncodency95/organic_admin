import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const FIELD_CLASSES =
  "w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 disabled:bg-surface-sunken disabled:text-text-muted";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
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
