/**
 * Stage Templates Job Worker
 *
 * DAG Position: First step after project creation
 * Parent: create_project
 * Next: apply_config
 *
 * Responsibilities:
 * - Fetch and prepare template packs based on project configuration
 * - Stage templates to Supabase storage or KV
 * - Validate template integrity
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

const JOB_TYPE: JobType = "stage_templates";
const REQUIRED_STATE = "credentials_set";
const NEXT_STATE = "staging";

interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  files: string[];
}

// Simulated template fetching - replace with actual implementation
async function fetchTemplates(_projectId: string): Promise<TemplateManifest[]> {
  // In production: fetch from template registry, GitHub, or storage
  return [
    {
      id: "base-worker",
      name: "Base Cloudflare Worker",
      version: "1.0.0",
      files: ["worker.ts", "wrangler.toml"],
    },
    {
      id: "supabase-client",
      name: "Supabase Client Setup",
      version: "1.0.0",
      files: ["supabase.ts", "types.ts"],
    },
  ];
}

// Simulated template staging - replace with actual implementation
async function stageTemplates(
  projectId: string,
  templates: TemplateManifest[]
): Promise<{ stagedCount: number; totalFiles: number }> {
  // In production: write templates to Supabase storage or prepare for deployment
  const totalFiles = templates.reduce((sum, t) => sum + t.files.length, 0);

  // Simulate staging delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    stagedCount: templates.length,
    totalFiles,
  };
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

    // Check idempotency - is this checkpoint already complete?
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

    // Verify project exists and is in correct state
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

    // Update project state to staging
    await updateProjectState(client, project_id, NEXT_STATE);

    // Perform the actual work
    const templates = await fetchTemplates(project_id);
    const stagingResult = await stageTemplates(project_id, templates);

    // Generate next checkpoint token for DAG continuation
    const nextToken = generateNextToken();

    // Record completion
    const executionTime = Date.now() - startTime;

    await createOrUpdateCheckpoint(
      client,
      project_id,
      JOB_TYPE,
      checkpoint_token,
      "completed",
      {
        templates: templates.map((t) => ({ id: t.id, name: t.name, version: t.version })),
        staged_count: stagingResult.stagedCount,
        total_files: stagingResult.totalFiles,
      },
      nextToken
    );

    // Write audit log
    await writeAuditLog(client, {
      project_id,
      event_type: "templates_staged",
      actor_type: "worker",
      previous_state: REQUIRED_STATE,
      new_state: NEXT_STATE,
      checkpoint_token,
      execution_time_ms: executionTime,
      payload: {
        templates_staged: stagingResult.stagedCount,
        files_count: stagingResult.totalFiles,
      },
    });

    console.log(
      `[${JOB_TYPE}] Completed for project ${project_id} in ${executionTime}ms`
    );

    return successResponse(
      [
        `Staged ${stagingResult.stagedCount} templates`,
        `Prepared ${stagingResult.totalFiles} files`,
      ],
      nextToken,
      "stage-complete"
    );
  } catch (error) {
    console.error(`[${JOB_TYPE}] Error:`, error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return errorResponse("internal_error", errorMessage, 500);
  }
});
