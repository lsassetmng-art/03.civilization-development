#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker"

node "${BASE}/tests/node_smoke_business_aiworker_pool_core.js"

echo "VERIFY_SCRIPT_PASS=true"
