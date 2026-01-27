import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TestRunInput {
  promptTitle: string;
  systemPrompt?: string;
  userPrompt: string;
  inputVariables?: Record<string, string>;
  draftId?: string;
}

interface TestRunOutput {
  id: string;
  outputs: string[];
  status: string;
  overallScore: number | null;
}

export function usePromptTesting() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const runTest = async (input: TestRunInput): Promise<string[] | null> => {
    if (!user) {
      toast.error("You must be logged in to run tests");
      return null;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("run-prompt-test", {
        body: {
          systemPrompt: input.systemPrompt,
          userPrompt: input.userPrompt,
          variantCount: 3,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data.outputs as string[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate outputs";
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTestRun = async (
    input: TestRunInput,
    outputs: string[],
    ratings?: {
      clarity?: number;
      completeness?: number;
      correctness?: number;
      styleMatch?: number;
    },
    notes?: string
  ): Promise<TestRunOutput | null> => {
    if (!user) {
      toast.error("You must be logged in to save test runs");
      return null;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("test_runs")
        .insert({
          user_id: user.id,
          draft_id: input.draftId || null,
          prompt_title: input.promptTitle,
          system_prompt: input.systemPrompt || null,
          user_prompt: input.userPrompt,
          input_variables: input.inputVariables || {},
          outputs,
          rating_clarity: ratings?.clarity || null,
          rating_completeness: ratings?.completeness || null,
          rating_correctness: ratings?.correctness || null,
          rating_style_match: ratings?.styleMatch || null,
          notes: notes || null,
        })
        .select("id, outputs, status, overall_score")
        .single();

      if (error) {
        throw error;
      }

      toast.success("Test run saved successfully");

      return {
        id: data.id,
        outputs: data.outputs as string[],
        status: data.status,
        overallScore: data.overall_score,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save test run";
      toast.error(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateRatings = async (
    testRunId: string,
    ratings: {
      clarity: number;
      completeness: number;
      correctness: number;
      styleMatch: number;
    },
    notes?: string
  ): Promise<boolean> => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("test_runs")
        .update({
          rating_clarity: ratings.clarity,
          rating_completeness: ratings.completeness,
          rating_correctness: ratings.correctness,
          rating_style_match: ratings.styleMatch,
          notes: notes || null,
        })
        .eq("id", testRunId);

      if (error) {
        throw error;
      }

      toast.success("Ratings saved");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save ratings";
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    runTest,
    saveTestRun,
    updateRatings,
    isGenerating,
    isSaving,
  };
}
