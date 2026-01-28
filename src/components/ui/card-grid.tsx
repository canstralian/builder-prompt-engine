import { ReactNode } from "react";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface CardGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Key extractor function */
  keyExtractor: (item: T, index: number) => string | number;
  /** Grid columns configuration */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Stagger delay between items */
  staggerDelay?: number;
  /** Additional className for the container */
  className?: string;
  /** Empty state to render when items array is empty */
  emptyState?: ReactNode;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function CardGrid<T>({
  items,
  renderItem,
  keyExtractor,
  columns = 3,
  gap = "md",
  staggerDelay = 0.05,
  className,
  emptyState,
}: CardGridProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <StaggerContainer
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
      staggerDelay={staggerDelay}
    >
      {items.map((item, index) => (
        <StaggerItem key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

// Simplified version for when you just want to wrap children
interface CardGridSimpleProps {
  children: ReactNode;
  /** Grid columns configuration */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
  /** Stagger delay between items */
  staggerDelay?: number;
  /** Additional className for the container */
  className?: string;
}

export function CardGridSimple({
  children,
  columns = 3,
  gap = "md",
  staggerDelay = 0.05,
  className,
}: CardGridSimpleProps) {
  return (
    <StaggerContainer
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
      staggerDelay={staggerDelay}
    >
      {children}
    </StaggerContainer>
  );
}

// Export StaggerItem for use with CardGridSimple
export { StaggerItem as CardGridItem } from "@/components/ui/motion";
