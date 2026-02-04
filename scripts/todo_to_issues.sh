#!/usr/bin/env bash
# todo_to_issues.sh — Scan a repository for TODO/FIXME comments and create
# GitHub issues for each unique occurrence.
#
# Usage:
#   ./scripts/todo_to_issues.sh [owner/repo]
#
# If owner/repo is omitted the script derives it from the current git remote.
#
# Requirements: gh (GitHub CLI, authenticated), ripgrep (rg)
#
# Environment variables (all optional):
#   TODO_LABEL        — label applied to created issues  (default: "todo")
#   TODO_DRY_RUN      — set to "1" to skip issue creation (default: "")
#   TODO_CONTEXT      — lines of context around match    (default: 5)
#   TODO_EXTRA_LABELS — comma-separated additional labels (default: "")
#   TODO_EXCLUDE_DIRS — colon-separated dirs to skip     (default: see below)

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
LABEL="${TODO_LABEL:-todo}"
DRY_RUN="${TODO_DRY_RUN:-}"
CONTEXT_LINES="${TODO_CONTEXT:-5}"
EXTRA_LABELS="${TODO_EXTRA_LABELS:-}"
EXCLUDE_DIRS="${TODO_EXCLUDE_DIRS:-node_modules:.git:dist:build:vendor:__pycache__:.next:.vite}"

# Timestamped audit directory
AUDIT_DIR="logs/todo-audit/$(date +%Y%m%dT%H%M%S)"
AUDIT_LOG=""
SUMMARY_LOG=""
CREATED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
info() { printf '  [INFO]  %s\n' "$*"; }
warn() { printf '  [WARN]  %s\n' "$*" >&2; }
log()  { printf '%s  %s\n' "$(date +%H:%M:%S)" "$*" >> "$AUDIT_LOG"; }

# ──────────────────────────────────────────────────────────────────────────────
# Preflight checks
# ──────────────────────────────────────────────────────────────────────────────
check_dependencies() {
    local missing=0
    for cmd in gh rg git; do
        if ! command -v "$cmd" &>/dev/null; then
            warn "Required command not found: $cmd"
            missing=1
        fi
    done
    if [[ $missing -ne 0 ]]; then
        die "Install missing dependencies before continuing.
  gh      — https://cli.github.com
  ripgrep — https://github.com/BurntSushi/ripgrep
  git     — https://git-scm.com"
    fi
}

check_auth() {
    if ! gh auth status &>/dev/null; then
        die "GitHub CLI is not authenticated. Run: gh auth login"
    fi
}

resolve_repo() {
    if [[ -n "${1:-}" ]]; then
        # Strip full URL to owner/repo
        REPO="${1#https://github.com/}"
        REPO="${REPO%.git}"
    else
        REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null) \
            || die "Could not detect repository. Pass owner/repo as an argument."
    fi
    # Validate the repo exists and we can read issues
    if ! gh repo view "$REPO" --json name &>/dev/null; then
        die "Cannot access repository: $REPO"
    fi
    info "Target repository: $REPO"
}

ensure_label() {
    if ! gh label list --repo "$REPO" --json name -q '.[].name' 2>/dev/null | grep -qx "$LABEL"; then
        info "Creating label '$LABEL' on $REPO"
        gh label create "$LABEL" --repo "$REPO" \
        if ! gh label create "$LABEL" --repo "$REPO" \
            --description "Auto-created from TODO/FIXME comments" \
            --color "fbca04" 2>/dev/null; then
            warn "Failed to create label '$LABEL' on $REPO. Please ensure you have appropriate permissions or that the label color/description is valid."
        fi
}

# ──────────────────────────────────────────────────────────────────────────────
# Scanning
# ──────────────────────────────────────────────────────────────────────────────
build_rg_args() {
    local -a args=(
        --line-number
        --no-heading
        --color never
        -C "$CONTEXT_LINES"
    )
    # Exclude directories
    IFS=':' read -ra dirs <<< "$EXCLUDE_DIRS"
    for d in "${dirs[@]}"; do
        args+=( --glob "!${d}/" )
    done
    # Exclude this script and log output
    args+=( --glob '!logs/' --glob '!scripts/todo_to_issues.sh' )
    printf '%s\n' "${args[@]}"
}

scan_todos() {
    info "Scanning for TODO/FIXME comments (±${CONTEXT_LINES} lines context) …"
    local -a rg_args
    mapfile -t rg_args < <(build_rg_args)

    # Use a temp file so we can process even if rg exits 1 (no matches)
    local tmpfile
    tmpfile=$(mktemp)

    rg "${rg_args[@]}" -e 'TODO\b' -e 'FIXME\b' . > "$tmpfile" 2>/dev/null || true

    if [[ ! -s "$tmpfile" ]]; then
        info "No TODO/FIXME comments found."
        rm -f "$tmpfile"
        return 1
    fi

    cat "$tmpfile"
    rm -f "$tmpfile"
    return 0
}

# ──────────────────────────────────────────────────────────────────────────────
# De-duplication against existing issues
# ──────────────────────────────────────────────────────────────────────────────
fetch_existing_issues() {
    info "Fetching open issues with label '$LABEL' …"
    gh issue list --repo "$REPO" \
        --label "$LABEL" \
        --state open \
        --limit 500 \
        --json title,number \
        -q '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true
}

issue_exists() {
    local needle="$1"
    # Match on the file:line fingerprint embedded in every title
    grep -qF "$needle" <<< "$EXISTING_ISSUES"
}

# ──────────────────────────────────────────────────────────────────────────────
# Issue creation
# ──────────────────────────────────────────────────────────────────────────────
create_issue() {
    local file="$1" line="$2" tag="$3" comment="$4" context="$5"
    local fingerprint="${file}:${line}"
    local title="${tag}: ${comment} (${fingerprint})"

    # Truncate title to 256 chars (GitHub limit)
    title="${title:0:256}"

    if issue_exists "$fingerprint"; then
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        log "SKIP  $fingerprint — issue already exists"
        info "Skip (duplicate): $fingerprint"
        return
    fi

    # Build issue body
    local body
    body=$(cat <<BODY
## ${tag} Comment

**File:** \`${file}\`
**Line:** ${line}
**Comment:** ${comment}

### Source Context

\`\`\`
${context}
\`\`\`

---
*Auto-generated by \`todo_to_issues.sh\` on $(date -u +%Y-%m-%dT%H:%M:%SZ)*
BODY
    )

    local -a label_args=( --label "$LABEL" )
    if [[ -n "$EXTRA_LABELS" ]]; then
        IFS=',' read -ra extras <<< "$EXTRA_LABELS"
        for l in "${extras[@]}"; do
            label_args+=( --label "$l" )
        done
    fi

    if [[ -n "$DRY_RUN" ]]; then
        info "[DRY RUN] Would create: $title"
        log "DRY   $title"
        CREATED_COUNT=$((CREATED_COUNT + 1))
        return
    fi

    local issue_url
    if issue_url=$(gh issue create --repo "$REPO" \
            --title "$title" \
            --body "$body" \
            "${label_args[@]}" 2>&1); then
        CREATED_COUNT=$((CREATED_COUNT + 1))
        local issue_num
        issue_num=$(basename "$issue_url")
        log "CREATE #${issue_num}  $title"
        info "Created issue #${issue_num}: $title"
        echo "#${issue_num}  ${title}" >> "$SUMMARY_LOG"
    else
        ERROR_COUNT=$((ERROR_COUNT + 1))
        log "ERROR  $title — $issue_url"
        warn "Failed to create issue for $fingerprint: $issue_url"
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# Parse rg output and drive issue creation
# ──────────────────────────────────────────────────────────────────────────────
process_matches() {
    local raw_output="$1"

    # Extract unique match lines (rg context uses -- separators)
    # Match lines look like: ./path/to/file.ts:42:  // TODO: do something
    local match_lines
    match_lines=$(grep -E '(TODO|FIXME)\b' <<< "$raw_output" \
        | grep -E '^[^-]' \
        | sort -u)

    if [[ -z "$match_lines" ]]; then
        info "No actionable TODO/FIXME lines after filtering."
        return
    fi

    local total
    total=$(wc -l <<< "$match_lines")
    info "Found $total unique TODO/FIXME occurrence(s)."
    log "TOTAL  $total unique matches"

    while IFS= read -r match; do
        # Parse  ./file:line: content
        local file line content tag comment context

        # Remove leading ./ if present
        match="${match#./}"

        file=$(cut -d: -f1 <<< "$match")
        line=$(cut -d: -f2 <<< "$match")
        content=$(cut -d: -f3- <<< "$match")

        # Determine tag (TODO or FIXME)
        if [[ "$content" =~ FIXME ]]; then
            tag="FIXME"
        else
            tag="TODO"
        fi

        # Extract the comment text after the tag
        comment=$(sed -E 's/.*\b(TODO|FIXME)\b[[:space:]]*:?[[:space:]]*//' <<< "$content")
        comment=$(echo "$comment" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

        # If comment is empty, use a generic description
        if [[ -z "$comment" || ${#comment} -lt 3 ]]; then
            comment="Resolve ${tag} at ${file}:${line}"
        fi

        # Grab context from rg output (lines belonging to this file block)
        context=$(awk -v file="$file" -v line="$line" '
            BEGIN { capture=0; buf="" }
            /^--$/ { if (capture) { print buf; exit } buf=""; capture=0; next }
            {
                if (index($0, file":"line":") || capture) {
                    capture=1
                }
                if (capture) {
                    buf = buf (buf ? "\n" : "") $0
                }
            }
            END { if (capture) print buf }
        ' <<< "$raw_output")

        # Fallback: use just the match line as context
        if [[ -z "$context" ]]; then
            context="$file:$line: $content"
        fi

        create_issue "$file" "$line" "$tag" "$comment" "$context"

    done <<< "$match_lines"
}

# ──────────────────────────────────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "  TODO/FIXME → GitHub Issues — Run Summary"
    echo "═══════════════════════════════════════════════════════════"
    echo "  Repository : $REPO"
    echo "  Created    : $CREATED_COUNT issue(s)"
    echo "  Skipped    : $SKIPPED_COUNT duplicate(s)"
    echo "  Errors     : $ERROR_COUNT"
    echo "  Audit log  : $AUDIT_LOG"
    echo "  Summary    : $SUMMARY_LOG"
    if [[ -n "$DRY_RUN" ]]; then
        echo "  Mode       : DRY RUN (no issues were created)"
    fi
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    log "DONE  created=$CREATED_COUNT skipped=$SKIPPED_COUNT errors=$ERROR_COUNT"
}

# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────
main() {
    echo ""
    echo "  todo_to_issues.sh — GitHub TODO/FIXME Automation"
    echo ""

    check_dependencies
    check_auth
    resolve_repo "${1:-}"

    # Prepare audit directory
    mkdir -p "$AUDIT_DIR"
    AUDIT_LOG="${AUDIT_DIR}/audit.log"
    SUMMARY_LOG="${AUDIT_DIR}/created_issues.txt"
    touch "$AUDIT_LOG" "$SUMMARY_LOG"
    log "START  repo=$REPO"

    ensure_label

    # Scan
    local raw_output
    raw_output=$(scan_todos) || {
        log "DONE  No TODO/FIXME found."
        print_summary
        exit 0
    }

    # Cache existing issues for de-duplication
    EXISTING_ISSUES=$(fetch_existing_issues)

    # Process and create issues
    process_matches "$raw_output"

    print_summary
}

main "$@"
