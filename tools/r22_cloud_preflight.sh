#!/usr/bin/env bash
# R22: read-only cloud source preflight. No npm install, no database, no AWS changes.
set -Eeuo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
EXPECT_REPO='03.civilization-development'
if [ "$(basename "$ROOT")" != "$EXPECT_REPO" ]; then
  echo 'R22_CLOUD=WRONG_REPOSITORY'; exit 1
fi
printf 'R22_CLOUD=START\n'
printf 'R22_BRANCH=%s\n' "$(git branch --show-current)"
printf 'R22_COMMIT=%s\n' "$(git rev-parse --short=12 HEAD)"
node --version | sed 's/^/R22_NODE=/'
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo 'R22_TRACKED_WORKTREE=DIRTY'; exit 1
fi
printf 'R22_TRACKED_WORKTREE=CLEAN\n'
SERVER='00.civilization-deployment/civilization-os-menu-delivery'
node --check "$SERVER/server.mjs"
node --check "$SERVER/auth-gate.mjs"
node --test "$SERVER/tests/preauth-guard.test.mjs" "$SERVER/tests/delivery.test.mjs"
printf 'R22_NODE_CONTRACT=PASS\n'
PORTAL='08.civilization-portal-site/civilization-portal-site-web'
if [ -x "$PORTAL/node_modules/.bin/tsc" ]; then
  (cd "$PORTAL" && ./node_modules/.bin/tsc --noEmit)
  printf 'R22_PORTAL_TYPESCRIPT=PASS\n'
else
  printf 'R22_PORTAL_TYPESCRIPT=NOT_RUN_NO_DEPENDENCIES\n'
fi
printf 'R22_DB_MUTATION=NONE\nR22_AWS_MUTATION=NONE\nR22_CLOUD=COMPLETE\n'
