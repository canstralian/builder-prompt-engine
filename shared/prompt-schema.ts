/**
 * Prompt Specification — TypeScript types and Zod validators.
 *
 * These mirror schemas/prompt.schema.json and are the single source of truth
 * used by both the UI and the validator CLI.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const promptInputSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      "Input name must be a valid identifier (letters, digits, underscores; cannot start with a digit)",
    ),
  type: z.enum(["string", "number", "boolean", "array", "object"]),
  description: z.string().optional(),
  required: z.boolean().default(true),
  default: z.unknown().optional(),
  enum: z.array(z.unknown()).optional(),
});

export const messageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1, "Message content must not be empty"),
});

export const assertionSchema = z.object({
  type: z.enum([
    "contains",
    "not_contains",
    "matches_regex",
    "json_path",
    "equals",
  ]),
  value: z.string(),
  message: z.string().optional(),
});

export const exampleSchema = z.object({
  name: z.string().optional(),
  inputs: z.record(z.unknown()),
  expected_output: z.string(),
  assertions: z.array(assertionSchema).optional(),
});

export const outputFormatSchema = z.object({
  type: z.enum(["text", "json", "markdown", "code", "csv"]),
  schema: z.record(z.unknown()).optional(),
  description: z.string().optional(),
});

export const safetySchema = z.object({
  constraints: z.array(z.string()).optional(),
  blocked_topics: z.array(z.string()).optional(),
  max_tokens: z.number().int().min(1).optional(),
  pii_redaction: z.boolean().default(false),
});

export const scorerConfigSchema = z.object({
  name: z.string(),
  weight: z.number().min(0).max(1).default(1),
  config: z.record(z.unknown()).optional(),
});

export const evalSchema = z.object({
  scorers: z.array(scorerConfigSchema).optional(),
  threshold: z.number().min(0).max(1).optional(),
});

export const modelConfigSchema = z.object({
  provider: z.string().optional(),
  name: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Root prompt specification schema
// ---------------------------------------------------------------------------

export const promptSpecSchema = z.object({
  id: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Prompt id must be lowercase kebab-case",
    ),
  name: z.string().min(1).max(200),
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
      "Version must follow semver (e.g. 1.0.0)",
    ),
  description: z.string().min(1),
  author: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  inputs: z.array(promptInputSchema).optional(),
  messages: z
    .array(messageSchema)
    .min(1, "At least one message is required"),
  examples: z.array(exampleSchema).optional(),
  output_format: outputFormatSchema.optional(),
  safety: safetySchema.optional(),
  eval: evalSchema.optional(),
  model: modelConfigSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// Exported TypeScript types (inferred from Zod)
// ---------------------------------------------------------------------------

export type PromptInput = z.infer<typeof promptInputSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Assertion = z.infer<typeof assertionSchema>;
export type Example = z.infer<typeof exampleSchema>;
export type OutputFormat = z.infer<typeof outputFormatSchema>;
export type Safety = z.infer<typeof safetySchema>;
export type ScorerConfig = z.infer<typeof scorerConfigSchema>;
export type Eval = z.infer<typeof evalSchema>;
export type ModelConfig = z.infer<typeof modelConfigSchema>;
export type PromptSpec = z.infer<typeof promptSpecSchema>;
