set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/06.streaming-os"
APP_ROOT="$ROOT/StreamWatch"

echo "============================================================"
echo "VERIFY STREAMWATCH OS-LEVEL _COMMONOS ENTRY"
echo "APP_ROOT = $APP_ROOT"
echo "============================================================"

test -f "$APP_ROOT/web/commonos/os-commonos-consumer.js"
test -f "$APP_ROOT/shared/_commonos_consumer_ref.json"
test -f "$APP_ROOT/android/commonos/OsCommonConsumerRef.java"
test -f "$APP_ROOT/ios/commonos/OsCommonConsumerRef.swift"

grep -n 'os-commonos-consumer.js' "$APP_ROOT/web/index.html"
grep -n 'StreamingOsCommonConsumerRef' "$APP_ROOT/web/app.js"
grep -n 'OsCommonConsumerRef' "$APP_ROOT/android/StreamWatchAndroid/app/src/main/java/com/lsam/streaming/streamwatch/MainActivity.java"
grep -n 'OsCommonConsumerRef' "$APP_ROOT/ios/StreamWatchiOS/Sources/ContentView.swift"

echo "============================================================"
echo "DONE"
echo "============================================================"
