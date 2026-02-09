# Trading Bot Swarm: GitHub Copilot + Codex Configuration Guide

## Purpose and scope
This guide defines how GitHub Copilot and Codex operate inside the Trading Bot Swarm ecosystem to deliver **consistent, secure, and high-quality automation** across strategy engines, execution services, risk controls, and data pipelines. Copilot is treated as a **pair programmer** with strict behavioral rules: follow repository conventions, avoid risky modifications, and always provide verifiable validation evidence. Codex follows the same expectations with even tighter automation discipline, focusing on scoped changes and explicit testing proof.

## Configuration overview
### Testing and linting
- **Mandatory for code changes**: run unit/integration tests and linting for any change that affects runtime behavior.
- **Documentation-only changes**: skip tests/linters unless the docs reference code that must be validated.
- **Local-first validation**: validate in local/dev environments before pushing.
- **Quality gate alignment**: mirror CI quality gates locally to minimize pipeline failures.

### Code style
- Enforce consistent formatting through Prettier/ESLint (or language-specific equivalents).
- Prefer explicit types and interfaces for shared domain models.
- Keep functions small and composable with clear, single-responsibility boundaries.
- Align naming with trading domain terms (orders, fills, strategies, risk limits).

### Async patterns and reliability
- Prefer `async/await` over mixed callback/promise styles.
- Always use timeouts and abort signals for external I/O.
- Apply retries only to idempotent operations with exponential backoff and jitter.
- Guard critical trade flows with circuit breakers and rate-limit awareness.

### Security defaults
- Never hardcode secrets; use environment variables and managed secrets.
- Validate all external inputs (API payloads, webhooks, user data).
- Enforce least-privilege access for tokens and service accounts.
- Log securely: avoid emitting secrets or PII in logs.

### Logging and observability
- Emit structured logs (JSON) with correlation/trace IDs.
- Track metrics for trade latency, fill success rate, and strategy health.
- Use distributed tracing across exchange adapters and risk engines.
- Standardize alert thresholds for critical failures and latency spikes.

### CI/CD integration
- Define quality gates: lint, tests, type checks, and security scans.
- Block merges when quality gates fail.
- Use a consistent build pipeline across all repos.
- Rotate secrets on a fixed cadence and scope CI permissions minimally.

### Version control
- Use conventional commits and semantic versioning.
- Require PR review and automated checks prior to merge.
- Tag releases via CI for traceability.
- Prefer protected branches, signed commits, and linear history when possible.

## Custom instruction behavior for Codex and Copilot
### Example rules
- Do not bypass lint/test failures.
- Avoid unreviewed dependencies or framework changes.
- Ask for clarification when requirements are ambiguous.
- Provide diff-focused change summaries with validation notes.

### Full custom instructions (conceptual YAML)
```yaml
assistant:
  name: trading-bot-swarm
  role: pair-programmer
  behavior:
    - obey_repo_conventions: true
    - run_tests_for_code_changes: true
    - skip_tests_for_docs_only: true
    - avoid_unreviewed_dependencies: true
    - request_clarification_on_ambiguity: true
    - limit_changes_to_scope: true
    - provide_validation_evidence: true
  quality:
    - lint_on_change: true
    - format_on_save: true
    - prefer_small_commits: true
    - maintain_backward_compatibility: true
  async_patterns:
    - use_async_await: true
    - set_timeouts: true
    - idempotent_retries_only: true
    - enforce_circuit_breakers: true
  security:
    - no_hardcoded_secrets: true
    - validate_external_inputs: true
    - least_privilege_tokens: true
    - redact_sensitive_logs: true
    - require_dependency_review: true
  observability:
    - structured_logs: true
    - include_correlation_id: true
    - emit_metrics: true
    - trace_external_calls: true
```

## GitHub Actions workflow example (lint + test)
**Trigger conditions**
- Run on pull requests targeting `main`.
- Run on pushes to `main`.
- Skip the workflow when only documentation changes are present.

**Quality gate steps**
- Checkout repository
- Set up Node.js
- Install dependencies
- Lint
- Type check (if applicable)
- Run tests

```yaml
name: quality-gate
on:
  push: &trigger_config
    branches: [main]
    paths-ignore:
      - "**/*.md"
      - "docs/**"
  pull_request: *trigger_config

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npm run typecheck
      - name: Tests
        run: npm test
```

## Semantic release and version tagging
**Best practices**
- Use conventional commits.
- Generate changelogs and version tags automatically.
- Tag releases only after quality gates pass.

```yaml
name: release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Security and dependency scanning
- Enable Dependabot (or Renovate) for dependency updates.
- Run static analysis and vulnerability scans in CI.
- Fail builds on critical vulnerabilities with defined SLAs.

```yaml
name: security-scan
on:
  schedule:
    - cron: "0 3 * * 1"
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm audit --audit-level=high
      - run: npx eslint .
```

## Contributor guidelines
### Proposing changes
- Create a feature branch from `main`.
- Use conventional commit messages.
- Include tests for behavioral changes and update fixtures if needed.

### Review criteria
- Correctness and adherence to trading rules.
- Security posture (input validation, secret handling, RBAC).
- Observability coverage (logs, metrics, traces).
- Test coverage and stability.

### Validation process
- CI quality gates must pass.
- At least one approving reviewer.
- Evidence of local testing for risky changes.

## Troubleshooting and optimization tips
- **Flaky tests**: isolate external dependencies and use deterministic fixtures.
- **Slow CI**: enable caching and split lint/test jobs.
- **Lint errors**: run formatter locally before committing.
- **API throttling**: add backoff and rate-limit handling with metrics.
- **Dependency drift**: regenerate lockfiles with approved tool versions.

## Maintenance schedule
- Review this guide quarterly.
- Update for new tooling or version upgrades.
- Retire deprecated workflows and add new best practices as needed.

---
**Goal**: Standardize excellence and strengthen the reliability, performance, and safety of the Trading Bot Swarm ecosystem.
