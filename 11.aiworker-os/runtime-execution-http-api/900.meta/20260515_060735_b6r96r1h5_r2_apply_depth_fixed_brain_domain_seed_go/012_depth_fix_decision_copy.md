# B6R96R1H5_R1 default depth FK fix decision

## Cause
- H5 apply failed because generated `default_depth_code` was not present in `brain_data_depth_catalog`.

## Chosen values
- default_depth_code: standard
- default_access_tier_code: NOT_FOUND
- default_reference_tier_code: NOT_FOUND
- status_code: NOT_FOUND

## Remaining generated FK placeholders
- none

## Referenced values evidence
```json
[
  {
    "values": [
      {
        "value": "advanced",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "advanced",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 40,
          "depth_label_ja": "高度",
          "description_ja": "計画・レビュー・専門寄り整理に使う高度頭脳データ。"
        }
      },
      {
        "value": "basic",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "basic",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 20,
          "depth_label_ja": "基本",
          "description_ja": "一般的な説明・雑談・基礎参照に使う頭脳データ。"
        }
      },
      {
        "value": "executive",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "executive",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 60,
          "depth_label_ja": "経営/統括",
          "description_ja": "統括判断・方針・高位レビューに使う頭脳データ。"
        }
      },
      {
        "value": "minimal",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "minimal",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 10,
          "depth_label_ja": "最小",
          "description_ja": "軽い案内・雑談補助に使う最小限の頭脳データ。"
        }
      },
      {
        "value": "specialist",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "specialist",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 50,
          "depth_label_ja": "専門",
          "description_ja": "特定領域の専門補助・危機レビュー等に使う専門頭脳データ。"
        }
      },
      {
        "value": "standard",
        "row_json": {
          "created_at": "2026-05-02T21:35:05.595709+00:00",
          "depth_code": "standard",
          "updated_at": "2026-05-02T21:35:05.595709+00:00",
          "active_flag": true,
          "depth_level": 30,
          "depth_label_ja": "標準",
          "description_ja": "通常業務・学習・設計参照に使う標準頭脳データ。"
        }
      }
    ],
    "record_type": "referenced_values",
    "source_column": "default_depth_code",
    "referenced_table": "brain_data_depth_catalog",
    "referenced_column": "depth_code",
    "referenced_schema": "cx22073jw"
  }
]
```

## Status
- SQL is NOT APPLIED.
- Apply requires explicit GO.
