import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import { useTestRuns } from "@/hooks/useTestRuns";
import { NewTestRunDialog } from "@/components/test-runs/NewTestRunDialog";
import { formatDistanceToNow } from "date-fns";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "passed":
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "success" | "destructive" | "accent" | "muted" | "secondary"> = {
    passed: "success",
    failed: "destructive",
    warning: "accent",
    pending: "secondary",
  };

  return (
    <Badge variant={variants[status] || "muted"} className="capitalize">
      {status}
    </Badge>
  );
};

export default function TestRunsPage() {
  const { testRuns, isLoading, stats, refetch } = useTestRuns();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Test Runs</h1>
          <p className="text-muted-foreground">
            Test your prompts and evaluate their quality
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Test
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total runs</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold text-emerald-500">
            {stats.total > 0 ? `${stats.passRate}%` : "—"}
          </p>
          <p className="text-sm text-muted-foreground">Pass rate</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">{stats.avgScore}</p>
          <p className="text-sm text-muted-foreground">Avg. score</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-muted-foreground">This week</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Test Runs List */}
      {!isLoading && testRuns.length > 0 && (
        <div className="space-y-3">
          {testRuns.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FlaskConical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{run.promptTitle}</p>
                    <StatusIcon status={run.status} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {run.userPrompt.slice(0, 80)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold">
                    {run.overallScore !== null ? `${run.overallScore}/5` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && testRuns.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
            <FlaskConical className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No test runs yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Run tests on your prompts to evaluate their performance and track improvements.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Test
          </Button>
        </div>
      )}

      {/* New Test Dialog */}
      <NewTestRunDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onComplete={refetch}
      />
    </div>
  );
}
