# SERIES TENDENCY AXIS UPDATE SUMMARY

## Completed

Added generic series tendency axis data and updated HD / LoVerS series tendency.

## DB objects

Tables:

- aiworker.series_tendency_axis_catalog
- aiworker.series_tendency_value_catalog
- aiworker.series_tendency_profile

Views:

- aiworker.vw_series_tendency_profile_v1
- aiworker.vw_series_tendency_summary_v1
- aiworker.vw_hd_lovers_series_tendency_compare_v1

## HD Series

- 積極性: 中
- ユーザー影響度: 変化しない
- 行動制限: 指定規約厳守

## LoVerS Series

- 積極性: 各個体による
- ユーザー影響度: やや変化
- 行動制限: 指定規約厳守

## Design append

AIWorkerOS:

- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/030.model/030_AIWORKER_SERIES_TENDENCY_AXIS_AND_PROFILE_APPEND.md
- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/060.integration/060_AIWORKER_SERIES_TENDENCY_REFERENCE_SURFACE_APPEND.md
- /data/data/com.termux/files/home/01.civilization-system/11.aiworker-os/080.policy/080_AIWORKER_SERIES_TENDENCY_POLICY_APPEND.md

CasualChatWorker:

- /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/CasualChatWorker/110.aiworker-reference/110200_CASUAL_CHAT_WORKER_SERIES_TENDENCY_REFERENCE.md

## Next step

Add model-level feature data for LoVerS 12 styles without changing the existing personality family names.
