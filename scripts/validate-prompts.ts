#!/usr/bin/env tsx
/**
 * Prompt Validator CLI
 *
 * Validates every .json prompt file found under the /prompts directory
 * against the prompt specification schema defined in shared/prompt-schema.ts.
 *
 * Usage:
 *   npx tsx scripts/validate-prompts.ts            # validate all prompts
 *   npx tsx scripts/validate-prompts.ts path/to/p.json  # validate specific file(s)
 *
 * Exit codes:
 *   0  — all prompts valid
 *   1  — one or more validation errors
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { promptSpecSchema } from "../shared/prompt-schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

function validateFile(filePath: string): ValidationResult {
  const result: ValidationResult = { file: filePath, valid: false, errors: [] };

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    result.errors.push(`Could not read file: ${filePath}`);
    return result;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    result.errors.push(
      `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    );
    return result;
  }

  const zodResult = promptSpecSchema.safeParse(parsed);
  if (zodResult.success) {
    result.valid = true;
  } else {
    for (const issue of zodResult.error.issues) {
      const pathStr = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      result.errors.push(`  ${pathStr}: ${issue.message}`);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const rootDir = path.resolve(import.meta.dirname, "..");

  let files: string[];
  if (args.length > 0) {
    // Validate specific files passed as arguments
    files = args.map((f) => path.resolve(f));
  } else {
    // Validate all JSON files under /prompts
    const promptsDir = path.join(rootDir, "prompts");
    files = collectJsonFiles(promptsDir);
    if (files.length === 0) {
      console.log(
        "No prompt files found in /prompts. Nothing to validate.",
      );
      process.exit(0);
    }
  }

  console.log(`Validating ${files.length} prompt file(s)...\n`);

  let hasErrors = false;
  for (const file of files) {
    const rel = path.relative(rootDir, file);
    const result = validateFile(file);
    if (result.valid) {
      console.log(`  PASS  ${rel}`);
    } else {
      hasErrors = true;
      console.log(`  FAIL  ${rel}`);
      for (const err of result.errors) {
        console.log(`        ${err}`);
      }
    }
  }

  console.log("");
  if (hasErrors) {
    console.log("Validation failed. Fix the errors above and try again.");
    process.exit(1);
  } else {
    console.log(`All ${files.length} prompt(s) are valid.`);
  }
}

main();
