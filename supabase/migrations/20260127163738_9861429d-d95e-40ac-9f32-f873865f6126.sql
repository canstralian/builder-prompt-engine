-- Create enum for output formats
CREATE TYPE public.draft_output_format AS ENUM ('bullets', 'table', 'json', 'email');

-- Create drafts table
CREATE TABLE public.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_session_id text,
  source text NOT NULL,
  goal text NOT NULL,
  context text DEFAULT '',
  output_format draft_output_format NOT NULL,
  sections_json jsonb DEFAULT '[]'::jsonb,
  compiled_prompt text,
  meta_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  
  -- At least one owner must be set
  CONSTRAINT drafts_has_owner CHECK (owner_user_id IS NOT NULL OR owner_session_id IS NOT NULL)
);

-- Add indexes for ownership queries
CREATE INDEX idx_drafts_owner_user_id ON public.drafts(owner_user_id, updated_at DESC) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_drafts_owner_session_id ON public.drafts(owner_session_id, updated_at DESC) WHERE owner_session_id IS NOT NULL;
CREATE INDEX idx_drafts_expires_at ON public.drafts(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can read their own drafts
CREATE POLICY "Users can view their own drafts"
ON public.drafts
FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

-- RLS: Authenticated users can insert drafts for themselves
CREATE POLICY "Users can create their own drafts"
ON public.drafts
FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

-- RLS: Authenticated users can update their own drafts
CREATE POLICY "Users can update their own drafts"
ON public.drafts
FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid());

-- RLS: Authenticated users can delete their own drafts
CREATE POLICY "Users can delete their own drafts"
ON public.drafts
FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid());

-- RLS: Anonymous users access via service role in edge functions
-- Session-based ownership is validated in edge functions, not RLS
CREATE POLICY "Service role full access"
ON public.drafts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON public.drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.drafts IS 'Prompt drafts with dual ownership model: user_id for authenticated, session_id for anonymous users';