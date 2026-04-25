#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"

echo "============================================================"
echo "ACCESS LIST CHECKPOINTS"
echo "============================================================"

find "$LOGS_DIR" -maxdepth 1 -type d -name '*_access_checkpoint' 2>/dev/null | sort | tail -n 20 | while IFS= read -r d; do
  [ -n "${d:-}" ] || continue
  summary_md="$(find "$d" -maxdepth 1 -type f -name '070_checkpoint_summary.md' | sort | head -n 1)"
  manifest_md="$(find "$d" -maxdepth 1 -type f -name '000_manifest.md' | sort | head -n 1)"
  printf 'DIR\t%s\n' "$d"
  printf 'MANIFEST\t%s\n' "${manifest_md:-NOT_FOUND}"
  printf 'SUMMARY\t%s\n' "${summary_md:-NOT_FOUND}"
  echo "---"
done

echo "============================================================"
echo "ACCESS LIST CHECKPOINTS DONE"
echo "============================================================"
