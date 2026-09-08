import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-surface-border py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-sunken text-text-muted">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-text-primary">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
