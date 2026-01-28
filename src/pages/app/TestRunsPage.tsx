import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  MotionCard,
} from "@/components/ui/motion";
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
  Download,
} from "lucide-react";
import { useTestRuns } from "@/hooks/useTestRuns";
import { NewTestRunDialog } from "@/components/test-runs/NewTestRunDialog";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "all" | "passed" | "failed" | "warning" | "pending";
type SortOption = "date-desc" | "date-asc" | "score-desc" | "score-asc";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "passed":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-accent" />;
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

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Status",
      "Overall Score",
      "Clarity",
      "Completeness",
      "Correctness",
      "Style Match",
      "User Prompt",
      "System Prompt",
      "Notes",
      "Created At",
    ];

    const escapeCSV = (value: string | null | undefined) => {
      if (value == null) return "";
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredAndSortedRuns.map((run) => [
      escapeCSV(run.promptTitle),
      escapeCSV(run.status),
      run.overallScore ?? "",
      run.ratingClarity ?? "",
      run.ratingCompleteness ?? "",
      run.ratingCorrectness ?? "",
      run.ratingStyleMatch ?? "",
      escapeCSV(run.userPrompt),
      escapeCSV(run.systemPrompt),
      escapeCSV(run.notes),
      new Date(run.createdAt).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-runs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Test Runs"
        description="Test your prompts and evaluate their quality"
        actions={
          <>
            {testRuns.length > 0 && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Test
            </Button>
          </>
        }
      />

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
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
            <SelectContent className="bg-popover">
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
      </FadeIn>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" staggerDelay={0.05}>
        <StaggerItem>
          <div className="p-4 border border-border bg-card shadow-xs">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total runs</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="p-4 border border-border bg-card shadow-xs">
            <p className="text-2xl font-bold text-success">
              {stats.total > 0 ? `${stats.passRate}%` : "—"}
            </p>
            <p className="text-sm text-muted-foreground">Pass rate</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="p-4 border border-border bg-card shadow-xs">
            <p className="text-2xl font-bold">{stats.avgScore}</p>
            <p className="text-sm text-muted-foreground">Avg. score</p>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="p-4 border border-border bg-card shadow-xs">
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
            <p className="text-sm text-muted-foreground">This week</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Test Runs List */}
      {!isLoading && filteredAndSortedRuns.length > 0 && (
        <StaggerContainer className="space-y-3" staggerDelay={0.03}>
          {filteredAndSortedRuns.map((run) => (
            <StaggerItem key={run.id}>
              <MotionCard
                onClick={() => navigate(`/app/tests/${run.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-secondary flex items-center justify-center shrink-0">
                      <FlaskConical className="h-5 w-5 text-secondary-foreground" />
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
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Empty State - No runs at all */}
      {!isLoading && testRuns.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="No test runs yet"
          description="Run tests on your prompts to evaluate their performance and track improvements."
          action={{
            label: "Create First Test",
            onClick: () => setDialogOpen(true),
            icon: Plus,
          }}
        />
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
