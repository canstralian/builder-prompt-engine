/**
 * Apply Config Job Worker
 *
 * DAG Position: Second step after template staging
 * Parent: stage_templates
 * Next: init_memory
 *
 * Responsibilities:
 * - Fetch project credentials
 * - Configure templates with project-specific parameters
 * - Apply provider-specific configurations
 */

import {
  corsHeaders,
  handleCors,
  validateJobRequest,
  createServiceClient,
  checkCheckpointComplete,
  createOrUpdateCheckpoint,
  getProjectState,
  updateProjectState,
  writeAuditLog,
  successResponse,
  alreadyCompleteResponse,
  errorResponse,
  generateNextToken,
  type JobType,
} from "../_shared/job-utils.ts";

const JOB_TYPE: JobType = "apply_config";
const REQUIRED_STATE = "staging";
const NEXT_STATE = "installing";

interface CredentialInfo {
  provider: string;
  verification_status: string;
  has_credential: boolean;
}

interface ConfigResult {
  provider: string;
  configured: boolean;
  message: string;
}

// Fetch project credentials (metadata only, not the actual secrets)
async function fetchCredentialMetadata(
  client: ReturnType<typeof createServiceClient>,
  projectId: string
): Promise<CredentialInfo[]> {
  const { data, error } = await client
    .from("project_credentials")
    .select("provider, verification_status")
    .eq("project_id", projectId);

  if (error) {
    console.error("Credential fetch error:", error);
    throw new Error("Failed to fetch credentials");
  }

  return (data ?? []).map((cred) => ({
    provider: cred.provider,
    verification_status: cred.verification_status,
    has_credential: true,
  }));
}

// Apply configuration for each provider
async function applyProviderConfigs(
  _projectId: string,
  credentials: CredentialInfo[]
): Promise<ConfigResult[]> {
  const results: ConfigResult[] = [];

  for (const cred of credentials) {
    // Simulate configuration delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (cred.verification_status !== "verified") {
      results.push({
        provider: cred.provider,
        configured: false,
        message: `Credential not verified (status: ${cred.verification_status})`,
      });
      continue;
    }

    // In production: actually configure the provider
    // - For GitHub: set up webhooks, deploy keys
    // - For Cloudflare: configure worker bindings
    // - For Supabase: set up RLS policies, functions

    results.push({
      provider: cred.provider,
      configured: true,
      message: `Configuration applied for ${cred.provider}`,
    });
  }

  return results;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only accept POST
  if (req.method !== "POST") {
    return errorResponse("method_not_allowed", "Only POST is allowed", 405);
  }

  const startTime = Date.now();
  const client = createServiceClient();

  try {
    // Parse and validate request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("invalid_request", "Invalid JSON body");
    }

    const validation = validateJobRequest(body);
    if ("error" in validation) {
      return errorResponse(validation.error.code, validation.error.message);
    }

    const { project_id, checkpoint_token } = validation.data;

    // Check idempotency
    const checkpointStatus = await checkCheckpointComplete(
      client,
      project_id,
      JOB_TYPE,
      checkpoint_token
    );

    if (checkpointStatus.complete) {
      console.log(`[${JOB_TYPE}] Already complete for project ${project_id}`);
      return alreadyCompleteResponse(
        checkpointStatus.result?.next_token as string,
        checkpointStatus.result?.payload as Record<string, unknown>
      );
    }

    // Verify project state
    const projectInfo = await getProjectState(client, project_id);
    if (!projectInfo) {
      return errorResponse("not_found", "Project not found", 404);
    }

    if (projectInfo.state !== REQUIRED_STATE) {
      return errorResponse(
        "invalid_state",
        `Project must be in '${REQUIRED_STATE}' state, currently '${projectInfo.state}'`
      );
    }

    // Mark checkpoint as in progress
    await createOrUpdateCheckpoint(
      client,
      project_id,
      JOB_TYPE,
      checkpoint_token,
      "in_progress"
    );

    // Fetch credentials
    const credentials = await fetchCredentialMetadata(client, project_id);

    if (credentials.length === 0) {
      // No credentials to configure - this might be an error or intentional
      await createOrUpdateCheckpoint(
        client,
        project_id,
        JOB_TYPE,
        checkpoint_token,
        "skipped",
        { reason: "No credentials found" }
      );

      return successResponse(
        ["No credentials found - skipping configuration"],
        generateNextToken(),
        "config-skipped"
      );
    }

    // Update project state
    await updateProjectState(client, project_id, NEXT_STATE);

    // Apply configurations
    const configResults = await applyProviderConfigs(project_id, credentials);

    const successCount = configResults.filter((r) => r.configured).length;
    const failureCount = configResults.filter((r) => !r.configured).length;

    // Generate next checkpoint token
    const nextToken = generateNextToken();
    const executionTime = Date.now() - startTime;

    // Check if any critical failures
    if (successCount === 0 && failureCount > 0) {
      await updateProjectState(
        client,
        project_id,
        "failed",
        "All provider configurations failed"
      );

      await createOrUpdateCheckpoint(
        client,
        project_id,
        JOB_TYPE,
        checkpoint_token,
        "failed",
        { results: configResults },
        undefined,
        { message: "All configurations failed", results: configResults }
      );

      return errorResponse(
        "configuration_failed",
        "All provider configurations failed"
      );
    }

    // Record completion
    await createOrUpdateCheckpoint(
      client,
      project_id,
      JOB_TYPE,
      checkpoint_token,
      "completed",
      {
        results: configResults,
        success_count: successCount,
        failure_count: failureCount,
      },
      nextToken
    );

    // Write audit log
    await writeAuditLog(client, {
      project_id,
      event_type: "config_applied",
      actor_type: "worker",
      previous_state: REQUIRED_STATE,
      new_state: NEXT_STATE,
      checkpoint_token,
      execution_time_ms: executionTime,
      payload: {
        providers_configured: successCount,
        providers_failed: failureCount,
        results: configResults,
      },
    });

    console.log(
      `[${JOB_TYPE}] Completed for project ${project_id} in ${executionTime}ms`
    );

    const messages = configResults.map((r) => r.message);
    if (failureCount > 0) {
      messages.push(`Warning: ${failureCount} provider(s) failed to configure`);
    }

    return successResponse(messages, nextToken, "config-complete");
  } catch (error) {
    console.error(`[${JOB_TYPE}] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("internal_error", errorMessage, 500);
  }
});
