#!/bin/bash
# SessionStart hook: install frontend dependencies when frontend/node_modules is
# missing, which is the case in every fresh git worktree (node_modules is
# gitignored and not copied by .worktreeinclude).
#
# Runs on every session start, so it must stay cheap and idempotent: when
# node_modules exists it exits immediately and prints nothing. Output on stdout
# is added to Claude's context; npm's own output goes to a log file.

root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
frontend="$root/frontend"

[ -f "$frontend/package-lock.json" ] || exit 0
[ -d "$frontend/node_modules" ] && exit 0

log="$(mktemp -t ensure-frontend-deps.XXXXXX)"
if npm ci --prefix "$frontend" --no-audit --no-fund >"$log" 2>&1; then
  echo "frontend/node_modules was missing in $root; ran 'npm ci' (log: $log)."
else
  echo "frontend/node_modules is missing in $root and 'npm ci' failed (log: $log). Run 'npm ci' in frontend/ and check the error before running eslint, tsc or vitest."
fi
exit 0
