# Trading Bot Swarm: GitHub Copilot + Codex Configuration Guide

## Purpose and scope
This guide defines how to configure GitHub Copilot and Codex in the Trading Bot Swarm ecosystem to ensure consistent quality, secure automation, and repeatable delivery. Copilot is treated as a *pair programmer* that follows strict behavioral rules: obey repository standards, run tests/linters for code changes, and avoid unsafe or speculative changes. Codex follows the same expectations with additional automation and change-management rigor.

## Configuration overview
### Testing and linting
- **Mandatory for code changes**: run unit tests and linting for any change that affects runtime behavior.
- **Documentation-only changes**: skip tests and linting unless the docs reference code that must be validated.
- **Local-first validation**: validate in local/dev environments before pushing.

### Code style
- Enforce consistent formatting via Prettier/ESLint (or equivalent for each language).
- Prefer explicit types and interfaces for shared domain models.
- Favor small, composable functions with single-responsibility boundaries.

### Async patterns
- Prefer async/await; avoid mixed callback/promise styles.
- Use explicit timeouts and abort signals for external I/O.
- Apply backoff and retry policies only to idempotent operations.

### Security defaults
- Never hardcode secrets; use environment variables and secrets managers.
- Validate all external inputs (API payloads, webhooks, user data).
- Ensure least-privilege access for tokens and service accounts.

### Logging and observability
- Use structured logs (JSON) with correlation IDs.
- Emit metrics for trade execution latency, error rates, and strategy health.
- Centralize tracing across bot components and exchanges.

### CI/CD integration
- Define quality gates: lint, unit tests, security scans, and type checks.
- Block merges on quality gate failures.
- Maintain a consistent build pipeline across repositories.

### Version control
- Use conventional commits and semantic versioning.
- Require PR review and automated checks before merge.
- Tag releases via CI for traceability.

## Custom instruction behavior for Codex and Copilot
### Example rules
- Do not bypass lint/test failures.
- Avoid speculative dependencies or framework changes.
- Ask for clarification when requirements are ambiguous.
- Provide diff-focused change summaries.

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
  security:
    - no_hardcoded_secrets: true
    - validate_external_inputs: true
    - least_privilege_tokens: true
  quality:
    - lint_on_change: true
    - format_on_save: true
    - prefer_small_commits: true
  async_patterns:
    - use_async_await: true
    - set_timeouts: true
    - idempotent_retries_only: true
  logging:
    - structured_logs: true
    - include_correlation_id: true
    - emit_metrics: true
```

## GitHub Actions workflow example (lint + test)
**Trigger conditions**
- Run on pull requests targeting `main`.
- Run on pushes to `main`.

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
  push:
    branches: [main]
  pull_request:
    branches: [main]

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
- Tag releases only after quality gate passes.

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
- Include test updates for behavioral changes.

### Review criteria
- Correctness and adherence to trading rules.
- Security posture (input validation, secret handling).
- Observability coverage (logs, metrics, traces).
- Test coverage and stability.

### Validation process
- CI quality gate must pass.
- At least one approving reviewer.
- Evidence of local testing for risky changes.

## Troubleshooting and optimization tips
- **Flaky tests**: isolate external dependencies and use deterministic fixtures.
- **Slow CI**: use caching and split lint/test jobs.
- **Lint errors**: run formatter locally before committing.
- **API throttling**: add backoff and rate-limit handling with metrics.

## Maintenance schedule
- Review this guide quarterly.
- Update for new tooling or version upgrades.
- Retire deprecated workflows and add new best practices as needed.

---
**Goal**: Standardize excellence and strengthen the reliability, performance, and safety of the Trading Bot Swarm ecosystem.
