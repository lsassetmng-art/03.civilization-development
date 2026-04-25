#!/data/data/com.termux/files/usr/bin/sh
set -eu
HTML_PATH="/data/data/com.termux/files/home/03.civilization-development/04.life-os/LifePlanner/app-web/index.html"
if command -v termux-open >/dev/null 2>&1; then
  termux-open "$HTML_PATH"
else
  echo "$HTML_PATH"
fi
