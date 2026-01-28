import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ variant = "default", size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div
        className={cn(
          "flex items-center justify-center bg-primary shadow-sm transition-transform group-hover:scale-105",
          sizeClasses[size]
        )}
      >
        <Sparkles className={cn("text-primary-foreground", size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight transition-colors",
            textSizeClasses[size],
            variant === "light" ? "text-primary-foreground" : "text-foreground"
          )}
        >
          PromptCrafting
        </span>
      )}
    </Link>
  );
}
