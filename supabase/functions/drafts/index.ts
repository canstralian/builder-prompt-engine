import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cookie",
  "Access-Control-Allow-Credentials": "true",
};

// Valid output formats matching the database enum
const VALID_OUTPUT_FORMATS = ["bullets", "table", "json", "email"] as const;
type OutputFormat = (typeof VALID_OUTPUT_FORMATS)[number];

interface CreateDraftRequest {
  source: string;
  goal: string;
  outputFormat: OutputFormat;
  context?: string;
  exampleId?: string;
  generate?: boolean;
}

interface ValidationError {
  code: "invalid_request";
  message: string;
  field?: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function validateRequest(body: unknown): { data: CreateDraftRequest } | { error: ValidationError } {
  if (!body || typeof body !== "object") {
    return { error: { code: "invalid_request", message: "Request body must be a JSON object" } };
  }

  const req = body as Record<string, unknown>;

  // source: required string
  if (typeof req.source !== "string" || req.source.trim().length === 0) {
    return { error: { code: "invalid_request", message: "source is required", field: "source" } };
  }

  // goal: required, 1-280 chars
  if (typeof req.goal !== "string") {
    return { error: { code: "invalid_request", message: "goal is required", field: "goal" } };
  }
  const goalTrimmed = req.goal.trim();
  if (goalTrimmed.length < 1 || goalTrimmed.length > 280) {
    return { error: { code: "invalid_request", message: "goal must be 1-280 characters", field: "goal" } };
  }

  // outputFormat: required enum
  if (!req.outputFormat || !VALID_OUTPUT_FORMATS.includes(req.outputFormat as OutputFormat)) {
    return {
      error: {
        code: "invalid_request",
        message: `outputFormat must be one of: ${VALID_OUTPUT_FORMATS.join(", ")}`,
        field: "outputFormat",
      },
    };
  }

  // context: optional, 0-2000 chars
  if (req.context !== undefined && req.context !== null) {
    if (typeof req.context !== "string") {
      return { error: { code: "invalid_request", message: "context must be a string", field: "context" } };
    }
    if (req.context.length > 2000) {
      return { error: { code: "invalid_request", message: "context must be at most 2000 characters", field: "context" } };
    }
  }

  // exampleId: optional string
  if (req.exampleId !== undefined && req.exampleId !== null && typeof req.exampleId !== "string") {
    return { error: { code: "invalid_request", message: "exampleId must be a string", field: "exampleId" } };
  }

  // generate: optional boolean
  if (req.generate !== undefined && req.generate !== null && typeof req.generate !== "boolean") {
    return { error: { code: "invalid_request", message: "generate must be a boolean", field: "generate" } };
  }

  return {
    data: {
      source: req.source.trim(),
      goal: goalTrimmed,
      outputFormat: req.outputFormat as OutputFormat,
      context: req.context ? (req.context as string).trim() : undefined,
      exampleId: req.exampleId as string | undefined,
      generate: req.generate as boolean | undefined,
    },
  };
}

function generateSessionId(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith("pc_session=")) {
      return cookie.substring("pc_session=".length);
    }
  }
  return null;
}

function createSessionCookie(sessionId: string): string {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  return `pc_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

// Generate initial sections scaffold based on output format
function generateSectionsScaffold(goal: string, outputFormat: OutputFormat, context?: string): Record<string, unknown> {
  return {
    role: {
      title: "Role",
      content: "",
      placeholder: "Define the AI's role or persona...",
    },
    objective: {
      title: "Objective",
      content: goal,
      placeholder: "What should the AI accomplish?",
    },
    context: {
      title: "Context",
      content: context || "",
      placeholder: "Provide relevant background information...",
    },
    constraints: {
      title: "Constraints",
      content: "",
      placeholder: "List any limitations or requirements...",
    },
    output_format: {
      title: "Output Format",
      content: outputFormat,
      placeholder: "Specify the desired output structure...",
    },
  };
}

// Simple prompt compilation (can be enhanced later)
function compilePrompt(sections: Record<string, unknown>, outputFormat: OutputFormat): string {
  const parts: string[] = [];

  const sectionData = sections as Record<string, { content?: string }>;

  if (sectionData.role?.content) {
    parts.push(`You are ${sectionData.role.content}.`);
  }

  if (sectionData.objective?.content) {
    parts.push(`Your task: ${sectionData.objective.content}`);
  }

  if (sectionData.context?.content) {
    parts.push(`Context: ${sectionData.context.content}`);
  }

  if (sectionData.constraints?.content) {
    parts.push(`Constraints: ${sectionData.constraints.content}`);
  }

  // Add output format instructions
  const formatInstructions: Record<OutputFormat, string> = {
    bullets: "Format your response as a bulleted list.",
    table: "Format your response as a markdown table.",
    json: "Respond with valid JSON only. No prose or explanation.",
    email: "Format your response as an email with a subject line and body.",
  };

  parts.push(formatInstructions[outputFormat]);

  return parts.join("\n\n");
}

// Extract draft ID from URL path (e.g., /drafts/uuid or /drafts/uuid/)
function extractDraftId(url: URL): string | null {
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Expected: ["drafts", "<uuid>"]
  if (pathParts.length >= 2 && pathParts[0] === "drafts") {
    return pathParts[1];
  }
  return null;
}

// Get authenticated user ID from auth header
async function getAuthenticatedUserId(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();

  if (userError || !user?.id) {
    return null;
  }

  return user.id;
}

// Handle GET /drafts/:id
async function handleGetDraft(
  req: Request,
  draftId: string
): Promise<Response> {
  // Validate UUID format
  if (!isValidUUID(draftId)) {
    return new Response(
      JSON.stringify({ error: { code: "invalid_request", message: "Invalid draft ID format" } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Get authenticated user (if any)
  const authHeader = req.headers.get("Authorization");
  const userId = await getAuthenticatedUserId(authHeader, supabaseUrl, supabaseAnonKey);

  // Get session ID from cookie (for anonymous users)
  const cookieHeader = req.headers.get("Cookie");
  const sessionId = parseSessionCookie(cookieHeader);

  // Fetch draft using service role (bypasses RLS)
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: draft, error: fetchError } = await serviceClient
    .from("drafts")
    .select("*")
    .eq("id", draftId)
    .maybeSingle();

  if (fetchError) {
    console.error("Draft fetch error:", fetchError);
    return new Response(
      JSON.stringify({ error: { code: "internal_error", message: "Failed to fetch draft" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Draft not found
  if (!draft) {
    return new Response(
      JSON.stringify({ error: { code: "not_found", message: "Draft not found" } }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check expiration
  if (draft.expires_at && new Date(draft.expires_at) < new Date()) {
    return new Response(
      JSON.stringify({ error: { code: "not_found", message: "Draft has expired" } }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Ownership validation
  const isOwner = 
    (userId && draft.owner_user_id === userId) ||
    (sessionId && draft.owner_session_id === sessionId);

  if (!isOwner) {
    console.log(`Access denied: userId=${userId}, sessionId=${sessionId}, draftOwnerUserId=${draft.owner_user_id}, draftOwnerSessionId=${draft.owner_session_id}`);
    return new Response(
      JSON.stringify({ error: { code: "forbidden", message: "You do not have access to this draft" } }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`Draft fetched: ${draftId} by ${userId ? `user ${userId}` : `session ${sessionId}`}`);

  // Return draft data
  return new Response(
    JSON.stringify({
      id: draft.id,
      source: draft.source,
      goal: draft.goal,
      outputFormat: draft.output_format,
      context: draft.context,
      sectionsJson: draft.sections_json,
      compiledPrompt: draft.compiled_prompt,
      metaJson: draft.meta_json,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      expiresAt: draft.expires_at,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Handle POST /drafts (create new draft)
async function handleCreateDraft(req: Request): Promise<Response> {
  // Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { code: "invalid_request", message: "Invalid JSON body" } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate input
  const validation = validateRequest(body);
  if ("error" in validation) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { source, goal, outputFormat, context, generate } = validation.data;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Get authenticated user (if any)
  const authHeader = req.headers.get("Authorization");
  const userId = await getAuthenticatedUserId(authHeader, supabaseUrl, supabaseAnonKey);

  // Handle session for anonymous users
  const cookieHeader = req.headers.get("Cookie");
  let sessionId = parseSessionCookie(cookieHeader);
  let newSessionCookie: string | null = null;

  if (!userId) {
    // Anonymous user - create or use existing session
    if (!sessionId) {
      sessionId = generateSessionId();
      newSessionCookie = createSessionCookie(sessionId);
    }
  }

  // Generate sections scaffold
  const sectionsJson = generateSectionsScaffold(goal, outputFormat, context);

  // Compile prompt if generate flag is true
  const compiledPrompt = generate ? compilePrompt(sectionsJson, outputFormat) : null;

  // Calculate expiration (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Create draft using service role client
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

  const { data: draft, error: insertError } = await serviceClient
    .from("drafts")
    .insert({
      source,
      goal,
      output_format: outputFormat,
      context: context || null,
      owner_user_id: userId,
      owner_session_id: userId ? null : sessionId,
      sections_json: sectionsJson,
      compiled_prompt: compiledPrompt,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("Draft insert error:", insertError);
    return new Response(
      JSON.stringify({ error: { code: "internal_error", message: "Failed to create draft" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log(`Draft created: ${draft.id} for ${userId ? `user ${userId}` : `session ${sessionId}`}`);

  // Build response headers
  const responseHeaders: Record<string, string> = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (newSessionCookie) {
    responseHeaders["Set-Cookie"] = newSessionCookie;
  }

  return new Response(
    JSON.stringify({
      draftId: draft.id,
      createdAt: draft.created_at,
      generated: !!generate,
    }),
    { status: 201, headers: responseHeaders }
  );
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const draftId = extractDraftId(url);

  try {
    // GET /drafts/:id - Fetch a draft
    if (req.method === "GET" && draftId) {
      return await handleGetDraft(req, draftId);
    }

    // POST /drafts - Create a draft
    if (req.method === "POST" && !draftId) {
      return await handleCreateDraft(req);
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: { code: "method_not_allowed", message: "Method not allowed" } }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: { code: "internal_error", message: "An unexpected error occurred" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
