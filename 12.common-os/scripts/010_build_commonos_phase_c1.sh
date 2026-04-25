#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/12.common-os"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_DIR="$ROOT/.reports/${STAMP}_build_commonos_phase_c1"

mkdir -p "$REPORT_DIR"
mkdir -p "$ROOT/CommonTokenSet/dist"
mkdir -p "$ROOT/CommonUIRuntime/dist"
mkdir -p "$ROOT/CommonShell/dist"
mkdir -p "$ROOT/CommonSyncPresentation/dist"
mkdir -p "$ROOT/CommonOSPlayground/dist"

cp "$ROOT/CommonTokenSet/src/commonos.tokens.css" "$ROOT/CommonTokenSet/dist/commonos.tokens.css"
cp "$ROOT/CommonTokenSet/src/commonos.variants.css" "$ROOT/CommonTokenSet/dist/commonos.variants.css"
cp "$ROOT/CommonUIRuntime/src/commonos.components.css" "$ROOT/CommonUIRuntime/dist/commonos.components.css"
cp "$ROOT/CommonUIRuntime/src/commonos.runtime.js" "$ROOT/CommonUIRuntime/dist/commonos.runtime.js"
cp "$ROOT/CommonShell/src/commonos.shell.css" "$ROOT/CommonShell/dist/commonos.shell.css"
cp "$ROOT/CommonShell/src/commonos.shell.js" "$ROOT/CommonShell/dist/commonos.shell.js"
cp "$ROOT/CommonSyncPresentation/src/commonos.sync.css" "$ROOT/CommonSyncPresentation/dist/commonos.sync.css"
cp "$ROOT/CommonSyncPresentation/src/commonos.sync.js" "$ROOT/CommonSyncPresentation/dist/commonos.sync.js"
cp "$ROOT/CommonOSPlayground/src/index.html" "$ROOT/CommonOSPlayground/dist/index.html"

{
  printf '%s\n' '============================================================'
  printf '%s\n' 'COMMONOS PHASE C1 BUILD REPORT'
  printf '%s\n' '============================================================'
  printf 'ROOT=%s\n' "$ROOT"
  printf 'REPORT_DIR=%s\n' "$REPORT_DIR"
  printf '%s\n' '------------------------------------------------------------'
  printf '%s\n' '[DIST FILES]'
  find "$ROOT/CommonTokenSet/dist" -maxdepth 1 -type f | sort
  find "$ROOT/CommonUIRuntime/dist" -maxdepth 1 -type f | sort
  find "$ROOT/CommonShell/dist" -maxdepth 1 -type f | sort
  find "$ROOT/CommonSyncPresentation/dist" -maxdepth 1 -type f | sort
  find "$ROOT/CommonOSPlayground/dist" -maxdepth 1 -type f | sort
  printf '%s\n' '------------------------------------------------------------'
  printf '%s\n' 'FINAL_RESULT=PASS'
} | tee "$REPORT_DIR/000_build_report.txt"
