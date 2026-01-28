import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  /** Main value to display */
  value: string | number;
  /** Label describing the stat */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional trend/subtitle text */
  trend?: string;
  /** Color variant for the icon */
  variant?: "default" | "accent" | "primary" | "success" | "destructive";
  /** Additional className */
  className?: string;
}

const variantStyles = {
  default: {
    container: "bg-secondary",
    icon: "text-secondary-foreground",
    border: "border-secondary",
  },
  accent: {
    container: "bg-accent/10",
    icon: "text-accent",
    border: "border-accent/20",
  },
  primary: {
    container: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/20",
  },
  success: {
    container: "bg-success/10",
    icon: "text-success",
    border: "border-success/20",
  },
  destructive: {
    container: "bg-destructive/10",
    icon: "text-destructive",
    border: "border-destructive/20",
  },
};

export function StatCard({
  value,
  label,
  icon: Icon,
  trend,
  variant = "accent",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "p-4 md:p-6 border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              "h-10 w-10 md:h-12 md:w-12 flex items-center justify-center border",
              styles.container,
              styles.border
            )}
          >
            <Icon className={cn("h-5 w-5 md:h-6 md:w-6", styles.icon)} />
          </div>
        )}
        <div>
          <p className="text-xl md:text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
      {trend && (
        <p className="mt-3 md:mt-4 text-xs text-muted-foreground">{trend}</p>
      )}
    </div>
  );
}
