# Trading Bot Swarm: GitHub Copilot + Codex Configuration Guide

## Purpose and scope
This guide defines how to configure GitHub Copilot and Codex in the Trading Bot Swarm ecosystem to ensure consistent quality, secure automation, and repeatable delivery. Copilot is treated as a *pair programmer* that follows strict behavioral rules: obey repository standards, run tests/linters for code changes, and avoid unsafe or speculative changes. Codex follows the same expectations with additional automation and change-management rigor, acting as a workflow agent that must preserve correctness, reliability, and compliance.

## Configuration overview
### Testing and linting
- **Mandatory for code changes**: run unit tests and linting for any change that affects runtime behavior, API contracts, or deployments.
- **Documentation-only changes**: skip tests and linting unless docs reference code that must be validated or include executable snippets.
- **Local-first validation**: validate in local/dev environments before pushing; CI is the final gate, not the first check.
- **Incremental scope**: prefer running targeted test suites (by package or domain) plus the primary “smoke” path.

### Code style
- Enforce consistent formatting via Prettier/ESLint (or equivalent for each language).
- Prefer explicit types and interfaces for shared domain models and trading strategy inputs/outputs.
- Favor small, composable functions with single-responsibility boundaries and clear error handling.
- Align naming with domain terms (strategy, exchange, risk, execution, signal, state).

### Async patterns
- Prefer async/await; avoid mixed callback/promise styles.
- Use explicit timeouts and abort signals for external I/O and market data calls.
- Apply backoff and retry policies only to idempotent operations, with jitter to avoid thundering herds.
- Ensure concurrency controls (queues, rate limiters) for exchange-specific constraints.

### Security defaults
- Never hardcode secrets; use environment variables and secrets managers.
- Validate all external inputs (API payloads, webhooks, user data), including schema validation and normalization.
- Ensure least-privilege access for tokens and service accounts.
- Treat generated code as untrusted until reviewed, especially around trading execution or wallet management.

### Logging and observability
- Use structured logs (JSON) with correlation IDs and strategy/run identifiers.
- Emit metrics for trade execution latency, error rates, risk violations, and strategy health.
- Centralize tracing across bot components and exchanges to track multi-step workflows.
- Use alerting rules for abnormal slippage, repeated failures, or degraded connectivity.

### CI/CD integration
- Define quality gates: lint, unit tests, security scans, type checks, and optional integration tests.
- Block merges on quality gate failures; allow “docs-only” fast paths with explicit labeling.
- Maintain consistent pipelines across repositories and modules (same versions, same baseline rules).

### Version control
- Use conventional commits and semantic versioning.
- Require PR review and automated checks before merge.
- Tag releases via CI for traceability and release audits.
- Enforce protected branches and mandatory status checks.

## Custom instruction behavior for Codex and Copilot
### Example rules
- Do not bypass lint/test failures for code changes.
- Avoid speculative dependencies, frameworks, or architectural shifts without explicit approval.
- Ask for clarification when requirements are ambiguous or missing acceptance criteria.
- Provide diff-focused change summaries and call out risks or follow-up tasks.
- Ignore tests/linters for documentation-only changes unless docs include runnable snippets.

### Full custom instructions (conceptual YAML)
```yaml
assistant:
  name: trading-bot-swarm
  role: pair-programmer
  behavior:
    - obey_repo_conventions: true
    - run_tests_for_code_changes: true
    - skip_tests_for_docs_only: true
    - skip_lint_for_docs_only: true
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
  version_control:
    - use_conventional_commits: true
    - require_pr_reviews: true
    - require_ci_green: true
```

## GitHub Actions workflow example (lint + test)
**Trigger conditions**
- Run on pull requests targeting `main`.
- Run on pushes to `main`.
- Allow manual workflow dispatch for hotfix validation or dependency bumps.

**Quality gate steps**
- Checkout repository
- Set up Node.js with caching
- Install dependencies
- Lint
- Type check (if applicable)
- Run tests
- Upload coverage artifacts (optional)

```yaml
name: quality-gate
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

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
      - name: Upload Coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage
```

## Semantic release and version tagging
**Best practices**
- Use conventional commits.
- Generate changelogs and version tags automatically.
- Tag releases only after quality gate passes.
- Verify provenance and match release notes to deployment artifacts.

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
- Enforce minimum severity thresholds for blocking merges.
- Track third-party risk with SBOM generation where possible.

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
      - run: npx cyclonedx-npm --output-file sbom.xml
      - uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.xml
```

## Contributor guidelines
### Proposing changes
- Create a feature branch from `main`.
- Use conventional commit messages.
- Include test updates for behavioral changes.
- Update docs when behavior, configs, or APIs change.

### Review criteria
- Correctness and adherence to trading rules.
- Security posture (input validation, secret handling).
- Observability coverage (logs, metrics, traces).
- Test coverage and stability.
- Performance implications and risk controls (rate limits, slippage, safeguards).

### Validation process
- CI quality gate must pass.
- At least one approving reviewer.
- Evidence of local testing for risky changes.
- Documented rollback or remediation plan for high-impact changes.

## Troubleshooting and optimization tips
- **Flaky tests**: isolate external dependencies and use deterministic fixtures.
- **Slow CI**: use caching and split lint/test jobs.
- **Lint errors**: run formatter locally before committing.
- **API throttling**: add backoff and rate-limit handling with metrics.
- **Inconsistent Codex/Copilot output**: tighten custom instructions and add explicit acceptance criteria.
- **Release failures**: verify tags, commit format, and required environment secrets.

## Maintenance schedule
- Review this guide quarterly.
- Update for new tooling or version upgrades.
- Retire deprecated workflows and add new best practices as needed.
- Run an annual security audit of automation scopes, tokens, and CI permissions.

---
**Goal**: Standardize excellence and strengthen the reliability, performance, and safety of the Trading Bot Swarm ecosystem.
