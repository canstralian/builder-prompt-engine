import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// TODO: CODE-AUDIT - Consider using React Query instead of manual state management
// for better caching, refetching, and consistency with other hooks in the project

interface TestRun {
  id: string;
  promptTitle: string;
  draftId: string | null;
  systemPrompt: string | null;
  userPrompt: string;
  outputs: string[];
  status: string;
  overallScore: number | null;
  ratingClarity: number | null;
  ratingCompleteness: number | null;
  ratingCorrectness: number | null;
  ratingStyleMatch: number | null;
  notes: string | null;
  createdAt: string;
}

export function useTestRuns() {
  const { user } = useAuth();
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: CODE-AUDIT - Wrap in useCallback to fix exhaustive-deps ESLint warning
  // and prevent unnecessary re-renders
  const fetchTestRuns = useCallback(async () => {
    if (!user) {
      setTestRuns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("test_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const mapped = (data || []).map((row) => ({
        id: row.id,
        promptTitle: row.prompt_title,
        draftId: row.draft_id,
        systemPrompt: row.system_prompt,
        userPrompt: row.user_prompt,
        outputs: row.outputs as string[],
        status: row.status,
        overallScore: row.overall_score,
        ratingClarity: row.rating_clarity,
        ratingCompleteness: row.rating_completeness,
        ratingCorrectness: row.rating_correctness,
        ratingStyleMatch: row.rating_style_match,
        notes: row.notes,
        createdAt: row.created_at,
      }));

      setTestRuns(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch test runs");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTestRuns();
  }, [fetchTestRuns]);

  // TODO: CODE-AUDIT - BUG: Potential division by zero if all test runs have null overallScore
  // The filtered array for avgScore calculation could be empty, causing NaN
  const runsWithScores = testRuns.filter((r) => r.overallScore !== null);
  const stats = {
    total: testRuns.length,
    passRate: testRuns.length > 0
      ? Math.round(
          (testRuns.filter((r) => r.status === "passed").length / testRuns.length) * 100
        )
      : 0,
    avgScore: runsWithScores.length > 0
      ? (
          runsWithScores.reduce((sum, r) => sum + (r.overallScore || 0), 0) /
          runsWithScores.length
        ).toFixed(1)
      : "—",
    thisWeek: testRuns.filter((r) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(r.createdAt) > weekAgo;
    }).length,
  };

  return {
    testRuns,
    isLoading,
    error,
    stats,
    refetch: fetchTestRuns,
  };
}
