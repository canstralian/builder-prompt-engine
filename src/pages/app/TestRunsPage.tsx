import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { useTestRuns } from "@/hooks/useTestRuns";
import { NewTestRunDialog } from "@/components/test-runs/NewTestRunDialog";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "all" | "passed" | "failed" | "warning" | "pending";
type SortOption = "date-desc" | "date-asc" | "score-desc" | "score-asc";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const navigate = useNavigate();

  const filteredAndSortedRuns = useMemo(() => {
    let result = [...testRuns];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((run) => run.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "score-desc":
          return (b.overallScore ?? -1) - (a.overallScore ?? -1);
        case "score-asc":
          return (a.overallScore ?? 6) - (b.overallScore ?? 6);
        default:
          return 0;
      }
    });

    return result;
  }, [testRuns, statusFilter, sortOption]);

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
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Test
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="score-desc">Highest Score</SelectItem>
            <SelectItem value="score-asc">Lowest Score</SelectItem>
          </SelectContent>
        </Select>

        {statusFilter !== "all" && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}>
            Clear filter
          </Button>
        )}
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
      {!isLoading && filteredAndSortedRuns.length > 0 && (
        <div className="space-y-3">
          {filteredAndSortedRuns.map((run) => (
            <div
              key={run.id}
              onClick={() => navigate(`/app/tests/${run.id}`)}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all group cursor-pointer"
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

      {/* Empty State - No runs at all */}
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

      {/* Empty State - Filtered results */}
      {!isLoading && testRuns.length > 0 && filteredAndSortedRuns.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground">
            No test runs match the current filter.
          </p>
          <Button variant="link" onClick={() => setStatusFilter("all")} className="mt-2">
            Clear filter
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
