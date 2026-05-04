# Recommended Patch Plan

## Goal
AIWorker runtime / prompt builder が、既存の応答生成前に runtime-brain-context provider を呼び出せるようにする。

## Safe order
1. Existing runtime entrypoint を特定する。
2. 既存ファイルを直接大改造しない。
3. まず wrapper / bridge を追加する。
4. 既存runtimeから呼ぶ場合は、1箇所だけ import する。
5. AICMは触らない。

## Preferred integration pattern
- Add: runtime-brain-context bridge module
- Input:
  - model_code
  - use_purpose_code
  - optional domain codes
- Output:
  - prompt-safe compact text
  - structured JSON context
- Existing runtime uses:
  - renderPromptContext(context)
  - prompt assembly に append/prepend

## Guardrails
- DB read-only
- No direct CX table query from runtime
- Use AIWorker effective/readable views only
- Do not bypass safety_boundary_ja
- Do not turn readable data into execution permission
