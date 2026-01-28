import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Secondary action (rendered as ghost button) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional content below the actions */
  children?: ReactNode;
  /** Container className */
  className?: string;
  /** Compact variant for inline/card use */
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <FadeIn
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        className
      )}
    >
      {/* Icon container with accent background */}
      <div
        className={cn(
          "flex items-center justify-center bg-accent/10 border border-accent/20",
          compact ? "h-12 w-12 mb-3" : "h-16 w-16 mb-4"
        )}
      >
        <Icon
          className={cn(
            "text-accent",
            compact ? "h-6 w-6" : "h-8 w-8"
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-base mb-1" : "text-lg mb-2"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm",
            compact ? "text-sm mb-3" : "text-base mb-6"
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className={cn("flex gap-3", compact ? "mt-2" : "mt-2")}>
          {action && (
            <Button onClick={action.onClick} size={compact ? "sm" : "default"}>
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={compact ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Additional content */}
      {children && <div className={compact ? "mt-3" : "mt-6"}>{children}</div>}
    </FadeIn>
  );
}
