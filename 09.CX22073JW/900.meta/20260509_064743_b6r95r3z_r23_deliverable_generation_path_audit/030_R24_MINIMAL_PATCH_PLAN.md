# B6R95R3Z-R24 Minimal Patch Plan

## Target
- AIWorkerOS runtime-execution-http-api/server.js only
- AICM touchなし
- CX DB schema変更なし
- selector v2 / brain-context-bridge.js を新規設計し直さない

## Problem
- R20/R21でinstruction-to-zip契約はPASS
- R22で成果物品質FAIL
- main deliverable body is close to task_instruction_ja echo
- CX source-backed material is not expanded into bodyMarkdown

## Minimal fix direction
1. Keep existing request route and zip contract.
2. Before building deliverable body, call the existing brain context provider/bridge for:
   - model_code
   - purpose_code/use_purpose_code
   - task_domain_code/domain list
   - instruction text
3. Extract top readable materials/chunks from selector v2 response.
4. Build bodyMarkdown from:
   - task title
   - generated summary
   - selected CX material excerpts
   - required sections: overview, timeline, persons, concepts, source_caution, misconception_guard
5. Keep safety flags unchanged.
6. Keep deliverable zip contract unchanged.

## Do not
- Do not patch AICM.
- Do not create new DB tables.
- Do not bypass selector v2.
- Do not use old selector v1 for low-budget/Friend/Lover; v2 with lightweight policy remains canonical.
- Do not push without explicit request.

## R24 verification
- syntax check server.js
- restart server
- POST same R20-style request
- verify zip contract
- verify R22 quality gate passes

## Source audit diagnosis
- BODY_GENERATION_USES_INSTRUCTION_NOT_CX_MATERIAL
