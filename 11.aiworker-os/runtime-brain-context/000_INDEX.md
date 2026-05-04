# AIWorkerOS Runtime Brain Context

## Purpose
AIWorker runtime / prompt builder が、AIWorkerOS側の読取制御済み compact brain context を取得するための standalone 実装。

## Important
- AICMは触らない。
- DB書込はしない。
- CX22073JW側のbrain registryとAIWorkerOS側のeffective access viewを読む。
- 「読める」は「実行できる」ではない。
