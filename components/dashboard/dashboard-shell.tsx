import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full", className)}>
      {children}
    </div>
  );
}