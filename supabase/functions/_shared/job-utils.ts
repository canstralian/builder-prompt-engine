/**
 * Shared utilities for Worker Job API functions
 * Provides common patterns for authentication, validation, checkpointing, and responses
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// =============================================================================
// CORS Configuration
// =============================================================================
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// =============================================================================
// Types
// =============================================================================
export interface JobRequest {
  project_id: string;
  checkpoint_token: string;
}

export interface JobResponse {
  success: boolean;
  next_token?: string;
  state?: string;
  messages: string[];
  error?: {
    code: string;
    message: string;
  };
}

export interface AuditLogEntry {
  project_id: string;
  event_type: string;
  actor_type: "user" | "system" | "worker";
  previous_state?: string;
  new_state?: string;
  payload?: Record<string, unknown>;
  checkpoint_token?: string;
  execution_time_ms?: number;
}

export type ProjectState =
  | "created"
  | "credentials_set"
  | "staging"
  | "installing"
  | "validated"
  | "complete"
  | "failed";

export type JobType =
  | "stage_templates"
  | "apply_config"
  | "init_memory"
  | "validate";

export type CheckpointStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped";

// =============================================================================
// UUID Validation
// =============================================================================
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// =============================================================================
// Supabase Client Factory
// =============================================================================
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// =============================================================================
// Request Validation
// =============================================================================
export function validateJobRequest(body: unknown): {
  data: JobRequest
} | {
  error: { code: string; message: string; field?: string }
} {
  if (!body || typeof body !== "object") {
    return {
      error: { code: "invalid_request", message: "Request body must be a JSON object" }
    };
  }

  const req = body as Record<string, unknown>;

  // project_id: required UUID
  if (typeof req.project_id !== "string") {
    return {
      error: { code: "invalid_request", message: "project_id is required", field: "project_id" }
    };
  }
  if (!isValidUUID(req.project_id)) {
    return {
      error: { code: "invalid_request", message: "project_id must be a valid UUID", field: "project_id" }
    };
  }

  // checkpoint_token: required string
  if (typeof req.checkpoint_token !== "string" || req.checkpoint_token.trim().length === 0) {
    return {
      error: { code: "invalid_request", message: "checkpoint_token is required", field: "checkpoint_token" }
    };
  }

  return {
    data: {
      project_id: req.project_id,
      checkpoint_token: req.checkpoint_token.trim(),
    },
  };
}

// =============================================================================
// Checkpoint Management
// =============================================================================
export async function checkCheckpointComplete(
  client: SupabaseClient,
  projectId: string,
  jobType: JobType,
  checkpointToken: string
): Promise<{ complete: boolean; result?: Record<string, unknown> }> {
  const { data, error } = await client
    .from("job_checkpoints")
    .select("status, result_payload, next_checkpoint_token")
    .eq("project_id", projectId)
    .eq("job_type", jobType)
    .eq("checkpoint_token", checkpointToken)
    .maybeSingle();

  if (error) {
    console.error("Checkpoint check error:", error);
    throw new Error("Failed to check checkpoint status");
  }

  if (data && data.status === "completed") {
    return {
      complete: true,
      result: {
        next_token: data.next_checkpoint_token,
        payload: data.result_payload,
      }
    };
  }

  return { complete: false };
}

export async function createOrUpdateCheckpoint(
  client: SupabaseClient,
  projectId: string,
  jobType: JobType,
  checkpointToken: string,
  status: CheckpointStatus,
  resultPayload?: Record<string, unknown>,
  nextToken?: string,
  errorDetails?: Record<string, unknown>
): Promise<void> {
  const { error } = await client
    .from("job_checkpoints")
    .upsert({
      project_id: projectId,
      job_type: jobType,
      checkpoint_token: checkpointToken,
      status,
      result_payload: resultPayload ?? {},
      next_checkpoint_token: nextToken,
      error_details: errorDetails,
      last_attempt_at: new Date().toISOString(),
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }, {
      onConflict: "project_id,job_type,checkpoint_token",
    });

  if (error) {
    console.error("Checkpoint update error:", error);
    throw new Error("Failed to update checkpoint");
  }
}

export async function incrementCheckpointAttempt(
  client: SupabaseClient,
  projectId: string,
  jobType: JobType,
  checkpointToken: string
): Promise<number> {
  const { data, error } = await client
    .rpc("increment_checkpoint_attempt", {
      p_project_id: projectId,
      p_job_type: jobType,
      p_checkpoint_token: checkpointToken,
    });

  if (error) {
    console.error("Checkpoint attempt increment error:", error);
    // Return 1 as fallback
    return 1;
  }

  return data ?? 1;
}

// =============================================================================
// Project State Management
// =============================================================================
export async function getProjectState(
  client: SupabaseClient,
  projectId: string
): Promise<{ state: ProjectState; userId: string } | null> {
  const { data, error } = await client
    .from("projects")
    .select("state, user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    console.error("Project state fetch error:", error);
    throw new Error("Failed to fetch project state");
  }

  if (!data) {
    return null;
  }

  return { state: data.state as ProjectState, userId: data.user_id };
}

export async function updateProjectState(
  client: SupabaseClient,
  projectId: string,
  newState: ProjectState,
  errorMessage?: string
): Promise<void> {
  const updateData: Record<string, unknown> = { state: newState };
  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { error } = await client
    .from("projects")
    .update(updateData)
    .eq("id", projectId);

  if (error) {
    console.error("Project state update error:", error);
    throw new Error("Failed to update project state");
  }
}

// =============================================================================
// Audit Logging
// =============================================================================
export async function writeAuditLog(
  client: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  const { error } = await client
    .from("audit_log")
    .insert({
      project_id: entry.project_id,
      event_type: entry.event_type,
      actor_type: entry.actor_type,
      previous_state: entry.previous_state,
      new_state: entry.new_state,
      payload: entry.payload ?? {},
      checkpoint_token: entry.checkpoint_token,
      execution_time_ms: entry.execution_time_ms,
    });

  if (error) {
    console.error("Audit log write error:", error);
    // Don't throw - audit logging should not fail the operation
  }
}

// =============================================================================
// Response Helpers
// =============================================================================
export function successResponse(
  messages: string[],
  nextToken?: string,
  state?: string
): Response {
  const body: JobResponse = {
    success: true,
    messages,
    next_token: nextToken,
    state,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function alreadyCompleteResponse(
  nextToken?: string,
  payload?: Record<string, unknown>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      state: "already-complete",
      next_token: nextToken,
      messages: ["Job already completed"],
      cached_result: payload,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400
): Response {
  const body: JobResponse = {
    success: false,
    messages: [],
    error: { code, message },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// =============================================================================
// Token Generation
// =============================================================================
export function generateNextToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
