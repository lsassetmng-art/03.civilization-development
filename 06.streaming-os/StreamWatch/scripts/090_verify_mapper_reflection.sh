set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/06.streaming-os"
APP_ROOT="$ROOT/StreamWatch"

echo "============================================================"
echo "VERIFY STREAMWATCH MAPPER REFLECTION"
echo "APP_ROOT = $APP_ROOT"
echo "============================================================"

test -f "$ROOT/_commonos/mapper/100_streamwatch_display_model_contract.json"
test -f "$APP_ROOT/web/commonos/display-model-mapper.js"
test -f "$APP_ROOT/android/commonos/DisplayModelMapper.java"
test -f "$APP_ROOT/ios/commonos/DisplayModelMapper.swift"

grep -n 'display-model-mapper.js' "$APP_ROOT/web/index.html"
grep -n 'StreamWatchDisplayModelMapper' "$APP_ROOT/web/app.js"
grep -n 'DisplayModelMapper' "$APP_ROOT/android/StreamWatchAndroid/app/src/main/java/com/lsam/streaming/streamwatch/MainActivity.java"
grep -n 'DisplayModelMapper' "$APP_ROOT/ios/StreamWatchiOS/Sources/ContentView.swift"

echo "============================================================"
echo "DONE"
echo "============================================================"
