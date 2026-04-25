#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
RUNTIME_FILE="${IMPL_ROOT}/domain/runtime-config.js"
ARCHIVE_DIR="${IMPL_ROOT}/docs/archive"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$ARCHIVE_DIR"

echo '============================================================'
echo 'CasualChatWorker Phase O Real Mode Switch'
echo '============================================================'

: "${CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH:?ERROR: set CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH=1}"
: "${CCW_REAL_API_BASE_URL:?ERROR: set CCW_REAL_API_BASE_URL to approved backend URL}"

if [ "$CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH" != "1" ]; then
  echo 'STOP: CCW_APPROVE_PHASE_O_REAL_MODE_SWITCH must be 1'
  exit 1
fi

case "$CCW_REAL_API_BASE_URL" in
  postgres://*|postgresql://*)
    echo 'STOP: CCW_REAL_API_BASE_URL must not be a DB URL'
    exit 1
    ;;
esac

if [ ! -f "$RUNTIME_FILE" ]; then
  echo "STOP: runtime config missing: $RUNTIME_FILE"
  exit 1
fi

for d in "${IMPL_ROOT}/app" "${IMPL_ROOT}/domain" "${IMPL_ROOT}/api-client" "${IMPL_ROOT}/components" "${IMPL_ROOT}/screens"; do
  if [ -d "$d" ]; then
    if grep -RInE 'DATABASE_URL=|PERSONA_DATABASE_URL=|service_role|supabase_key|psql ' "$d" >/tmp/ccw_phase_o_frontend_secret_scan.txt 2>/dev/null; then
      echo 'STOP: frontend forbidden DB/secret term found'
      cat /tmp/ccw_phase_o_frontend_secret_scan.txt
      exit 1
    fi
  fi
done

cp "$RUNTIME_FILE" "${ARCHIVE_DIR}/${RUN_TS}_runtime-config.before-phase-o-real.js"

cat > "$RUNTIME_FILE" <<JS
window.CCW_RUNTIME_CONFIG = {
  apiMode: "real",
  apiBaseUrl: "${CCW_REAL_API_BASE_URL}",
  appCode: "CasualChatWorker",
  serviceCode: "casual_chat_worker",
  allowRealApi: true,

  canUseRealApi() {
    return this.apiMode === "real" && this.allowRealApi === true && Boolean(this.apiBaseUrl);
  }
};
JS

echo '============================================================'
echo 'PHASE O REAL MODE SWITCH DONE'
echo "RUNTIME_FILE=$RUNTIME_FILE"
echo "API_BASE_URL=$CCW_REAL_API_BASE_URL"
echo '============================================================'
sed -n '1,120p' "$RUNTIME_FILE"
echo '============================================================'
