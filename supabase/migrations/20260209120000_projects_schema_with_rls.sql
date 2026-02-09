-- =============================================================================
-- Projects Schema with Comprehensive Row-Level Security (RLS)
-- =============================================================================
-- This migration creates the core tables for the job-state-machine workflow:
-- - projects: Main entity with workflow state tracking
-- - project_credentials: Encrypted credential storage per project
-- - audit_log: Immutable event trail for all project actions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PROJECTS TABLE
-- -----------------------------------------------------------------------------
-- Central table for project metadata and workflow state management
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL DEFAULT 'created'
        CHECK (state IN ('created', 'credentials_set', 'staging', 'installing', 'validated', 'complete', 'failed')),
    error_message TEXT, -- Stores failure reason when state = 'failed'
    metadata JSONB DEFAULT '{}', -- Extensible project metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient user project lookups
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_state ON public.projects(state);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
-- Policy: Users can only view their own projects
CREATE POLICY "projects_select_own"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert projects for themselves
CREATE POLICY "projects_insert_own"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own projects
CREATE POLICY "projects_update_own"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own projects
CREATE POLICY "projects_delete_own"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Service role can access all projects (for worker jobs)
CREATE POLICY "projects_service_role_all"
ON public.projects
FOR ALL
USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- PROJECT CREDENTIALS TABLE
-- -----------------------------------------------------------------------------
-- Stores encrypted credentials with provider identification
CREATE TABLE public.project_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- e.g., 'github', 'cloudflare', 'supabase'
    credential_type TEXT NOT NULL DEFAULT 'api_key', -- 'api_key', 'oauth_token', 'service_account'
    ciphertext TEXT NOT NULL, -- Encrypted credential data
    key_id TEXT, -- Reference to encryption key version for rotation
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verifying', 'verified', 'invalid', 'expired')),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- For credentials with expiration
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    -- Ensure unique provider per project
    UNIQUE(project_id, provider)
);

-- Index for credential lookups
CREATE INDEX idx_project_credentials_project_id ON public.project_credentials(project_id);
CREATE INDEX idx_project_credentials_verification_status ON public.project_credentials(verification_status);

-- Enable RLS
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_credentials
-- Policy: Users can view credentials for their own projects
CREATE POLICY "credentials_select_own_project"
ON public.project_credentials
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_credentials.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Users can insert credentials for their own projects
CREATE POLICY "credentials_insert_own_project"
ON public.project_credentials
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_credentials.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Users can update credentials for their own projects
CREATE POLICY "credentials_update_own_project"
ON public.project_credentials
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_credentials.project_id
        AND projects.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_credentials.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Users can delete credentials for their own projects
CREATE POLICY "credentials_delete_own_project"
ON public.project_credentials
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_credentials.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Service role can access all credentials (for worker jobs)
CREATE POLICY "credentials_service_role_all"
ON public.project_credentials
FOR ALL
USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- AUDIT LOG TABLE
-- -----------------------------------------------------------------------------
-- Immutable event log for all project actions (append-only by design)
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'project_created', 'credential_added', 'template_staged', etc.
    actor_id UUID, -- User or service that triggered the event
    actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'worker')),
    previous_state TEXT, -- State before the event (for state transitions)
    new_state TEXT, -- State after the event
    payload JSONB DEFAULT '{}', -- Event-specific data
    checkpoint_token TEXT, -- For idempotency and retry handling
    execution_time_ms INTEGER, -- How long the operation took
    ip_address INET, -- For security auditing
    user_agent TEXT, -- Client identification
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for efficient audit log queries
CREATE INDEX idx_audit_log_project_id ON public.audit_log(project_id);
CREATE INDEX idx_audit_log_event_type ON public.audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX idx_audit_log_checkpoint_token ON public.audit_log(checkpoint_token);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log
-- Policy: Users can view audit logs for their own projects
CREATE POLICY "audit_log_select_own_project"
ON public.audit_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = audit_log.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Only service role can insert audit logs (workers write logs, not users)
CREATE POLICY "audit_log_insert_service_only"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy: Audit logs are immutable - no updates allowed
-- (No UPDATE policy means updates are denied by default with RLS enabled)

-- Policy: Audit logs are immutable - no deletes allowed except by service role for data retention
CREATE POLICY "audit_log_delete_service_only"
ON public.audit_log
FOR DELETE
USING (auth.role() = 'service_role');

-- Policy: Service role has full access for system operations
CREATE POLICY "audit_log_service_role_all"
ON public.audit_log
FOR ALL
USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- JOB CHECKPOINTS TABLE
-- -----------------------------------------------------------------------------
-- Tracks job execution checkpoints for idempotency and resumption
CREATE TABLE public.job_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'stage_templates', 'apply_config', 'init_memory', 'validate'
    checkpoint_token TEXT NOT NULL, -- Unique token for idempotency
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
    attempt_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    result_payload JSONB DEFAULT '{}', -- Job output/result data
    error_details JSONB, -- Error information if failed
    next_checkpoint_token TEXT, -- Token for the next step in DAG
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    -- Ensure unique checkpoint per project and job
    UNIQUE(project_id, job_type, checkpoint_token)
);

-- Indexes for checkpoint lookups
CREATE INDEX idx_job_checkpoints_project_id ON public.job_checkpoints(project_id);
CREATE INDEX idx_job_checkpoints_status ON public.job_checkpoints(status);
CREATE INDEX idx_job_checkpoints_token ON public.job_checkpoints(checkpoint_token);

-- Enable RLS
ALTER TABLE public.job_checkpoints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_checkpoints
-- Policy: Users can view checkpoints for their own projects
CREATE POLICY "checkpoints_select_own_project"
ON public.job_checkpoints
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = job_checkpoints.project_id
        AND projects.user_id = auth.uid()
    )
);

-- Policy: Only service role can modify checkpoints (workers manage checkpoints)
CREATE POLICY "checkpoints_modify_service_only"
ON public.job_checkpoints
FOR ALL
USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_credentials_updated_at
    BEFORE UPDATE ON public.project_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_checkpoints_updated_at
    BEFORE UPDATE ON public.job_checkpoints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log state transitions automatically
CREATE OR REPLACE FUNCTION public.log_project_state_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.state IS DISTINCT FROM NEW.state THEN
        INSERT INTO public.audit_log (
            project_id,
            event_type,
            actor_type,
            previous_state,
            new_state,
            payload
        ) VALUES (
            NEW.id,
            'state_transition',
            'system',
            OLD.state,
            NEW.state,
            jsonb_build_object(
                'triggered_by', 'state_change_trigger',
                'error_message', NEW.error_message
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_project_state_changes
    AFTER UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.log_project_state_change();

-- Function to check if a checkpoint exists and is complete (for idempotency)
CREATE OR REPLACE FUNCTION public.is_checkpoint_complete(
    p_project_id UUID,
    p_job_type TEXT,
    p_checkpoint_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.job_checkpoints
        WHERE project_id = p_project_id
        AND job_type = p_job_type
        AND checkpoint_token = p_checkpoint_token
        AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to validate state transition
CREATE OR REPLACE FUNCTION public.validate_state_transition()
RETURNS TRIGGER AS $$
DECLARE
    valid_transitions JSONB := '{
        "created": ["credentials_set", "failed"],
        "credentials_set": ["staging", "failed"],
        "staging": ["installing", "failed"],
        "installing": ["validated", "failed"],
        "validated": ["complete", "failed"],
        "complete": [],
        "failed": ["created"]
    }'::JSONB;
    allowed_states JSONB;
BEGIN
    -- Allow if state hasn't changed
    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;

    -- Get allowed transitions for current state
    allowed_states := valid_transitions->OLD.state;

    -- Check if new state is in allowed transitions
    IF NOT (allowed_states ? NEW.state) THEN
        RAISE EXCEPTION 'Invalid state transition from % to %', OLD.state, NEW.state;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_project_state_transition
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_state_transition();

-- -----------------------------------------------------------------------------
-- GRANTS
-- -----------------------------------------------------------------------------
-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_credentials TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT SELECT ON public.job_checkpoints TO authenticated;

-- Grant service role full access
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.project_credentials TO service_role;
GRANT ALL ON public.audit_log TO service_role;
GRANT ALL ON public.job_checkpoints TO service_role;
