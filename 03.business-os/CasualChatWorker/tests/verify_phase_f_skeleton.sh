#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_ROOT="${1:-$HOME/03.civilization-development/03.business-os/CasualChatWorker}"

fail() {
  echo "FAIL: $1"
  exit 1
}

check_file() {
  [ -f "$APP_ROOT/$1" ] || fail "missing file: $1"
}

check_dir() {
  [ -d "$APP_ROOT/$1" ] || fail "missing dir: $1"
}

for d in app components screens state api-client domain pricing ticket safety aiworker-reference cx-reference commonos tests docs 900.meta; do
  check_dir "$d"
done

check_file "docs/000_IMPLEMENTATION_ENTRYPOINT.md"
check_file "domain/casualChatWorkerDomain.js"
check_file "pricing/casualChatWorkerPricing.js"
check_file "ticket/freeTicketPolicy.js"
check_file "api-client/casualChatWorkerApiClient.js"
check_file "safety/casualChatWorkerSafetyPolicy.js"
check_file "commonos/COMMONOS_CONSUMER_MAPPING.md"

grep -q "monthlyFreeTicketCount: 2" "$APP_ROOT/pricing/casualChatWorkerPricing.js" || fail "pricing free ticket count mismatch"
grep -q "freeMinutesPerTicket: 30" "$APP_ROOT/pricing/casualChatWorkerPricing.js" || fail "pricing free minutes mismatch"
grep -q "maxContractMinutes: 120" "$APP_ROOT/domain/casualChatWorkerDomain.js" || fail "max contract minutes mismatch"
grep -q "Friend" "$APP_ROOT/domain/casualChatWorkerDomain.js" || fail "Friend missing"
grep -q "Lover" "$APP_ROOT/domain/casualChatWorkerDomain.js" || fail "Lover missing"
grep -q "real surveillance" "$APP_ROOT/safety/casualChatWorkerSafetyPolicy.js" || fail "Lover safety boundary missing"
grep -q "DB apply" "$APP_ROOT/docs/000_IMPLEMENTATION_ENTRYPOINT.md" || fail "DB apply prohibition missing"

echo "PASS: CasualChatWorker Phase F implementation skeleton verified"
