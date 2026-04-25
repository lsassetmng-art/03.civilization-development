set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/06.streaming-os"
APP_ROOT="$ROOT/StreamStudio"

echo "============================================================"
echo "VERIFY STREAMSTUDIO MAPPER REFLECTION"
echo "APP_ROOT = $APP_ROOT"
echo "============================================================"

test -f "$ROOT/_commonos/mapper/101_streamstudio_display_model_contract.json"
test -f "$APP_ROOT/web/commonos/display-model-mapper.js"
test -f "$APP_ROOT/android/commonos/DisplayModelMapper.java"
test -f "$APP_ROOT/ios/commonos/DisplayModelMapper.swift"

grep -n 'display-model-mapper.js' "$APP_ROOT/web/index.html"
grep -n 'StreamStudioDisplayModelMapper' "$APP_ROOT/web/app.js"
grep -n 'DisplayModelMapper' "$APP_ROOT/android/StreamStudioAndroid/app/src/main/java/com/lsam/streaming/streamstudio/MainActivity.java"
grep -n 'DisplayModelMapper' "$APP_ROOT/ios/StreamStudioiOS/Sources/ContentView.swift"

echo "============================================================"
echo "DONE"
echo "============================================================"
