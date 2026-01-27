-- Create test_runs table for storing prompt test results
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES public.drafts(id) ON DELETE SET NULL,
  
  -- Input data
  prompt_title TEXT NOT NULL,
  system_prompt TEXT,
  user_prompt TEXT NOT NULL,
  input_variables JSONB DEFAULT '{}'::jsonb,
  
  -- Output data (3 variants)
  outputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Evaluation ratings (1-5 scale)
  rating_clarity INTEGER CHECK (rating_clarity >= 1 AND rating_clarity <= 5),
  rating_completeness INTEGER CHECK (rating_completeness >= 1 AND rating_completeness <= 5),
  rating_correctness INTEGER CHECK (rating_correctness >= 1 AND rating_correctness <= 5),
  rating_style_match INTEGER CHECK (rating_style_match >= 1 AND rating_style_match <= 5),
  
  -- Computed overall score
  overall_score NUMERIC(3,2) GENERATED ALWAYS AS (
    CASE 
      WHEN rating_clarity IS NOT NULL AND rating_completeness IS NOT NULL 
           AND rating_correctness IS NOT NULL AND rating_style_match IS NOT NULL
      THEN (rating_clarity + rating_completeness + rating_correctness + rating_style_match)::NUMERIC / 4
      ELSE NULL
    END
  ) STORED,
  
  -- Status based on score
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN rating_clarity IS NULL THEN 'pending'
      WHEN (rating_clarity + rating_completeness + rating_correctness + rating_style_match)::NUMERIC / 4 >= 4 THEN 'passed'
      WHEN (rating_clarity + rating_completeness + rating_correctness + rating_style_match)::NUMERIC / 4 >= 3 THEN 'warning'
      ELSE 'failed'
    END
  ) STORED,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own test runs
CREATE POLICY "Users can view their own test runs"
  ON public.test_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test runs"
  ON public.test_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test runs"
  ON public.test_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test runs"
  ON public.test_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_test_runs_user_id ON public.test_runs(user_id);
CREATE INDEX idx_test_runs_created_at ON public.test_runs(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_test_runs_updated_at
  BEFORE UPDATE ON public.test_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();