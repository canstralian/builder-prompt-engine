import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  Library,
  PenTool,
  FlaskConical,
  Users,
  CreditCard,
  Shield,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mainNavItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/library", label: "Prompt Library", icon: Library },
  { href: "/app/prompts/new", label: "Prompt Builder", icon: PenTool },
  { href: "/app/tests", label: "Test Runs", icon: FlaskConical },
];

const settingsNavItems = [
  { href: "/app/workspace", label: "Workspace", icon: Users },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
];

const adminNavItems = [
  { href: "/app/admin", label: "Admin Console", icon: Shield },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = location.pathname === href || location.pathname.startsWith(href + "/");

    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary-foreground")} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Settings
            </p>
          )}
          {settingsNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Admin
            </p>
          )}
          {adminNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/learn"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150"
          )}
        >
          <BookOpen className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Resources</span>}
        </Link>
      </div>
    </aside>
  );
}
