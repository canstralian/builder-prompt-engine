import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Library,
  FlaskConical,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

// Sample data
const recentPrompts = [
  { id: "1", title: "Marketing Email Generator", category: "Marketing", updatedAt: "2 hours ago" },
  { id: "2", title: "Code Review Assistant", category: "Coding", updatedAt: "5 hours ago" },
  { id: "3", title: "Product Description Writer", category: "Product", updatedAt: "1 day ago" },
];

const quickStats = [
  { label: "Total Prompts", value: "24", icon: Library, trend: "+3 this week" },
  { label: "Test Runs", value: "156", icon: FlaskConical, trend: "12 today" },
  { label: "Versions Created", value: "89", icon: TrendingUp, trend: "+8 this week" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/app/library">
              <Library className="mr-2 h-4 w-4" />
              Browse Library
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/prompts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-accent/10 flex items-center justify-center border border-accent/20">
                <stat.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Prompts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Prompts</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/library">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                to={`/app/prompts/${prompt.id}`}
                className="flex items-center justify-between p-4 border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{prompt.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {prompt.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    <Clock className="inline mr-1 h-3 w-3" />
                    {prompt.updatedAt}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <Link
              to="/app/prompts/new"
              className="p-6 border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors border border-accent/20">
                  <Plus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Create New Prompt</p>
                  <p className="text-sm text-muted-foreground">
                    Use the guided builder
                  </p>
                </div>
              </div>
            </Link>
            <Link
              to="/app/tests"
              className="p-6 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                  <FlaskConical className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Run Tests</p>
                  <p className="text-sm text-muted-foreground">
                    Evaluate your prompts
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage */}
          <div className="p-6 border border-border bg-card shadow-sm">
            <h3 className="font-semibold mb-4 tracking-tight">Usage this month</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Prompts</span>
                  <span className="font-medium">24 / 25</span>
                </div>
                <div className="h-2 bg-muted overflow-hidden">
                  <div className="h-full w-[96%] bg-accent" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Test Runs</span>
                  <span className="font-medium">3 / 5</span>
                </div>
                <div className="h-2 bg-muted overflow-hidden">
                  <div className="h-full w-[60%] bg-primary" />
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link to="/app/billing">Upgrade to Pro</Link>
            </Button>
          </div>

          {/* Featured Templates */}
          <div className="p-6 border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold tracking-tight">Featured Templates</h3>
              <Badge variant="accent">New</Badge>
            </div>
            <div className="space-y-3">
              {[
                { title: "RACE Framework", category: "Framework" },
                { title: "Chain of Thought", category: "Technique" },
                { title: "Few-Shot Learning", category: "Technique" },
              ].map((template) => (
                <div
                  key={template.title}
                  className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <Star className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="text-xs text-muted-foreground">{template.category}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
              <Link to="/library">
                Browse all templates
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
