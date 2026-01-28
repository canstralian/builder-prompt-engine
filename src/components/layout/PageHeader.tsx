import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Badge text displayed above the title */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "secondary" | "accent" | "muted" | "premium" | "success" | "destructive" | "outline";
  /** Main page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional actions (buttons) aligned to the right on desktop */
  actions?: ReactNode;
  /** Center align the header (default: false) */
  centered?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Animation delay in seconds */
  delay?: number;
}

export function PageHeader({
  badge,
  badgeVariant = "secondary",
  title,
  description,
  actions,
  centered = false,
  className,
  delay = 0,
}: PageHeaderProps) {
  return (
    <FadeIn
      delay={delay}
      className={cn(
        "mb-8",
        centered ? "text-center" : "flex flex-col md:flex-row md:items-center justify-between gap-4",
        className
      )}
    >
      <div className={centered ? "mx-auto max-w-2xl" : undefined}>
        {badge && (
          <Badge variant={badgeVariant} className="mb-4">
            {badge}
          </Badge>
        )}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className={cn("flex gap-2", centered ? "justify-center mt-6" : "shrink-0")}>
          {actions}
        </div>
      )}
    </FadeIn>
  );
}
