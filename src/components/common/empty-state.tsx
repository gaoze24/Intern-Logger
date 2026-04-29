import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <Icon className="size-11 text-muted-foreground" />
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="max-w-md text-[15px] text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
