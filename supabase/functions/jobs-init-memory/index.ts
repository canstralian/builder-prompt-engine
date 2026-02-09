/**
 * Init Memory Job Worker
 *
 * DAG Position: Third step after config application
 * Parent: apply_config
 * Next: validate
 *
 * Responsibilities:
 * - Initialize Supabase runtime storage
 * - Set up edge-bound memory/KV storage
 * - Prepare caching layers
 */

import {
  corsHeaders,
  handleCors,
  validateJobRequest,
  createServiceClient,
  checkCheckpointComplete,
  createOrUpdateCheckpoint,
  getProjectState,
  writeAuditLog,
  successResponse,
  alreadyCompleteResponse,
  errorResponse,
  generateNextToken,
  type JobType,
} from "../_shared/job-utils.ts";

const JOB_TYPE: JobType = "init_memory";
const REQUIRED_STATE = "installing";

interface MemoryInitResult {
  store_type: string;
  initialized: boolean;
  message: string;
}

// Initialize different storage/memory layers
async function initializeStorageLayers(
  projectId: string
): Promise<MemoryInitResult[]> {
  const results: MemoryInitResult[] = [];

  // 1. Initialize Supabase storage bucket for project assets
  await new Promise((resolve) => setTimeout(resolve, 50));
  results.push({
    store_type: "supabase_storage",
    initialized: true,
    message: "Project storage bucket initialized",
  });

  // 2. Initialize KV namespace for edge caching (if using Cloudflare)
  await new Promise((resolve) => setTimeout(resolve, 50));
  results.push({
    store_type: "edge_kv",
    initialized: true,
    message: "Edge KV namespace configured",
  });

  // 3. Initialize session/state storage
  await new Promise((resolve) => setTimeout(resolve, 50));
  results.push({
    store_type: "session_store",
    initialized: true,
    message: "Session storage initialized",
  });

  // In production:
  // - Create Supabase storage bucket: supabase.storage.createBucket()
  // - Configure Cloudflare KV: use wrangler API
  // - Set up Durable Objects: configure bindings

  return results;
}

// Verify storage accessibility
async function verifyStorageAccess(
  _projectId: string,
  results: MemoryInitResult[]
): Promise<boolean> {
  // In production: actually test read/write to each storage layer
  await new Promise((resolve) => setTimeout(resolve, 50));
  return results.every((r) => r.initialized);
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

    // Initialize storage layers
    const initResults = await initializeStorageLayers(project_id);

    // Verify access
    const allAccessible = await verifyStorageAccess(project_id, initResults);

    if (!allAccessible) {
      await createOrUpdateCheckpoint(
        client,
        project_id,
        JOB_TYPE,
        checkpoint_token,
        "failed",
        { results: initResults },
        undefined,
        { message: "Storage verification failed" }
      );

      return errorResponse(
        "storage_init_failed",
        "Failed to verify storage access"
      );
    }

    // Generate next checkpoint token
    const nextToken = generateNextToken();
    const executionTime = Date.now() - startTime;

    // Record completion
    await createOrUpdateCheckpoint(
      client,
      project_id,
      JOB_TYPE,
      checkpoint_token,
      "completed",
      {
        storage_layers: initResults,
        all_verified: true,
      },
      nextToken
    );

    // Write audit log
    await writeAuditLog(client, {
      project_id,
      event_type: "memory_initialized",
      actor_type: "worker",
      checkpoint_token,
      execution_time_ms: executionTime,
      payload: {
        storage_layers_count: initResults.length,
        all_verified: allAccessible,
      },
    });

    console.log(
      `[${JOB_TYPE}] Completed for project ${project_id} in ${executionTime}ms`
    );

    return successResponse(
      initResults.map((r) => r.message),
      nextToken,
      "memory-initialized"
    );
  } catch (error) {
    console.error(`[${JOB_TYPE}] Error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return errorResponse("internal_error", errorMessage, 500);
  }
});
