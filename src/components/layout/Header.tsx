import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/library", label: "Library" },
  { href: "/learn", label: "Learn" },
];

// Subtle neural network node indicator for active state
function ActiveIndicator() {
  return (
    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
      <span className="w-1 h-1 rounded-full bg-primary" />
      <span className="w-3 h-px bg-primary/60" />
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span className="w-3 h-px bg-primary/60" />
      <span className="w-1 h-1 rounded-full bg-primary" />
    </span>
  );
}

// Network texture overlay for nav background
function NetworkTexture() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="network-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1" fill="currentColor" />
            <circle cx="0" cy="0" r="0.5" fill="currentColor" />
            <circle cx="60" cy="0" r="0.5" fill="currentColor" />
            <circle cx="0" cy="60" r="0.5" fill="currentColor" />
            <circle cx="60" cy="60" r="0.5" fill="currentColor" />
            <line x1="0" y1="0" x2="30" y2="30" stroke="currentColor" strokeWidth="0.3" />
            <line x1="60" y1="0" x2="30" y2="30" stroke="currentColor" strokeWidth="0.3" />
            <line x1="0" y1="60" x2="30" y2="30" stroke="currentColor" strokeWidth="0.3" />
            <line x1="60" y1="60" x2="30" y2="30" stroke="currentColor" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-pattern)" />
      </svg>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Track scroll for subtle header elevation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <NetworkTexture />
      <div className="container relative flex h-16 items-center justify-between">
        {/* Logo & Nav */}
        <div className="flex items-center gap-12">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-150",
                  "rounded-lg",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {link.label}
                {isActive(link.href) && <ActiveIndicator />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg font-medium tracking-wide transition-all duration-150"
          >
            <Link to="/auth">Log in</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className={cn(
              "bg-accent hover:bg-accent/90 text-accent-foreground",
              "rounded-lg font-medium tracking-wide",
              "shadow-sm hover:shadow-md",
              "transition-all duration-150",
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "group"
            )}
          >
            <Link to="/auth?mode=signup" className="flex items-center gap-1.5">
              Start crafting
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className={cn(
            "md:hidden p-2.5 -mr-2 rounded-lg transition-all duration-150",
            "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <div className="relative h-5 w-5">
            <Menu
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
              )}
            />
            <X
              className={cn(
                "absolute inset-0 h-5 w-5 transition-all duration-200",
                mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out",
          "bg-background border-t border-border/50",
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <NetworkTexture />
        <nav className="container relative py-6 flex flex-col gap-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              to={link.href}
              style={{ transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms" }}
              className={cn(
                "relative px-4 py-3 text-base font-medium tracking-wide rounded-lg transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive(link.href)
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3">
                {link.label}
                {isActive(link.href) && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    <span className="w-2 h-px bg-primary/60" />
                    <span className="w-1 h-1 rounded-full bg-primary" />
                  </span>
                )}
              </span>
            </Link>
          ))}

          {/* Divider */}
          <div className="my-4 h-px bg-border/60" />

          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground tracking-wide">Theme</span>
            <ThemeToggle />
          </div>

          {/* Auth buttons */}
          <div className="flex flex-col gap-3 mt-2 px-1">
            <Button
              variant="ghost"
              asChild
              className="justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg font-medium tracking-wide"
            >
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                Log in
              </Link>
            </Button>
            <Button
              asChild
              className={cn(
                "bg-accent hover:bg-accent/90 text-accent-foreground",
                "rounded-lg font-medium tracking-wide",
                "shadow-sm hover:shadow-md",
                "transition-all duration-150",
                "group"
              )}
            >
              <Link
                to="/auth?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                Start crafting
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
