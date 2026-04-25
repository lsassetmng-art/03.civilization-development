#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"
DESIGN_BASE="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
IMPL_BASE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"

: "${AICM_GIT_PUSH_GO:?ERROR: set AICM_GIT_PUSH_GO=YES only after Boss explicitly says PUSH OK}"
: "${AICM_COMMIT_MESSAGE:=Add AICompanyManager design and implementation package}"

if [ "$AICM_GIT_PUSH_GO" != "YES" ]; then
  printf '%s\n' 'ERROR: AICM_GIT_PUSH_GO is not YES'
  exit 1
fi

REPO_ROOT=""
if git -C "$DESIGN_BASE" rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_ROOT="$(git -C "$DESIGN_BASE" rev-parse --show-toplevel)"
elif git -C "$IMPL_BASE" rev-parse --show-toplevel >/dev/null 2>&1; then
  REPO_ROOT="$(git -C "$IMPL_BASE" rev-parse --show-toplevel)"
elif [ -d "/data/data/com.termux/files/home/life/.git" ]; then
  REPO_ROOT="/data/data/com.termux/files/home/life"
elif [ -d "/data/data/com.termux/files/home/.git" ]; then
  REPO_ROOT="/data/data/com.termux/files/home"
else
  printf '%s\n' 'ERROR: git repository root not detected'
  exit 1
fi

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager guarded git push START'
printf '%s\n' '============================================================'
printf 'REPO_ROOT: %s\n' "$REPO_ROOT"
printf 'MESSAGE  : %s\n' "$AICM_COMMIT_MESSAGE"
printf '%s\n' '------------------------------------------------------------'

git -C "$REPO_ROOT" status --short

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[git add]'
git -C "$REPO_ROOT" add "$DESIGN_BASE" "$IMPL_BASE"

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[staged diff stat]'
git -C "$REPO_ROOT" diff --cached --stat

if git -C "$REPO_ROOT" diff --cached --quiet; then
  printf '%s\n' 'NO STAGED CHANGES. Commit/push skipped.'
  exit 0
fi

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[git commit]'
git -C "$REPO_ROOT" commit -m "$AICM_COMMIT_MESSAGE"

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[git push]'
git -C "$REPO_ROOT" push

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager guarded git push DONE'
printf '%s\n' '============================================================'
