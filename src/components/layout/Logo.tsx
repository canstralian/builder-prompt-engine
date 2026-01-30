import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

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
      <img
        src={logoImage}
        alt="PromptCrafting logo"
        className={cn(
          "transition-transform group-hover:scale-105",
          sizeClasses[size]
        )}
      />
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
