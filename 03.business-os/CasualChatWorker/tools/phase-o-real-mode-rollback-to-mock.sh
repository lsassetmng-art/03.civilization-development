#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
RUNTIME_FILE="${IMPL_ROOT}/domain/runtime-config.js"
ARCHIVE_DIR="${IMPL_ROOT}/docs/archive"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$ARCHIVE_DIR"

if [ -f "$RUNTIME_FILE" ]; then
  cp "$RUNTIME_FILE" "${ARCHIVE_DIR}/${RUN_TS}_runtime-config.before-phase-o-rollback.js"
fi

cat > "$RUNTIME_FILE" <<'JS'
window.CCW_RUNTIME_CONFIG = {
  apiMode: "mock",
  apiBaseUrl: "",
  appCode: "CasualChatWorker",
  serviceCode: "casual_chat_worker",
  allowRealApi: false,

  canUseRealApi() {
    return this.apiMode === "real" && this.allowRealApi === true && Boolean(this.apiBaseUrl);
  }
};
JS

echo '============================================================'
echo 'PHASE O ROLLBACK TO MOCK DONE'
echo "RUNTIME_FILE=$RUNTIME_FILE"
echo '============================================================'
sed -n '1,120p' "$RUNTIME_FILE"
echo '============================================================'
