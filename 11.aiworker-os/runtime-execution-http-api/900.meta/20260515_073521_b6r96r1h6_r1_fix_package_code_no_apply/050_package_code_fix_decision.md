# B6R96R1H6_R1 package_code fix decision

## Cause
- H6 failed because `business_support_role_domain_capability.package_code = aiworker_runtime` was not present in `business_support_control_package`.

## Chosen package_code
- chosen_package_code: BUSINESS_SUPPORT_WLM_V0

## Remaining bad package_code
- none

## Candidate values
```json
[
  {
    "value": "BUSINESS_SUPPORT_WLM_V0",
    "score": 55,
    "row": {
      "created_at": "2026-04-24T09:02:27.550593+00:00",
      "package_id": "77000000-0000-0000-0000-000000000001",
      "updated_at": "2026-04-24T09:02:27.550593+00:00",
      "status_code": "active",
      "package_code": "BUSINESS_SUPPORT_WLM_V0",
      "package_name": "Business Support Worker Leader Manager Control v0",
      "control_summary": "HD-R3 Worker、HD-R4 Leader、HD-R5 Managerを汎用業務支援に使うための制御パッケージ。PG開発はその中の1ドメインとして扱う。",
      "package_name_ja": "汎用業務支援 Worker/Leader/Manager 制御 v0",
      "service_scope_code": "business_support"
    }
  }
]
```

## Status
- SQL is NOT APPLIED.
- Apply requires explicit GO.
