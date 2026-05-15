# B6R96R1H4_R4A FK-target brain domain seed decision

## 1. FK target
- source: aiworker.robot_brain_model_domain_policy.brain_domain_code
- referenced: cx22073jw.brain_data_domain_catalog.brain_domain_code

## 2. Why R4 failed
- R4 assumed `aiworker.brain_data_domain_catalog`.
- Actual FK target must be read from pg_constraint, not hard-coded.

## 3. Generated
- generated inserts: 6
- manual blocks: 0
- status_value: none

## 4. Existing six rows
```json
[]
```

## 5. Required columns
```json
[
  {
    "udt_name": "text",
    "data_type": "text",
    "column_name": "brain_domain_code",
    "is_nullable": "NO",
    "column_default": null,
    "ordinal_position": 1
  },
  {
    "udt_name": "text",
    "data_type": "text",
    "column_name": "brain_domain_label_ja",
    "is_nullable": "NO",
    "column_default": null,
    "ordinal_position": 2
  },
  {
    "udt_name": "text",
    "data_type": "text",
    "column_name": "default_depth_code",
    "is_nullable": "NO",
    "column_default": null,
    "ordinal_position": 3
  },
  {
    "udt_name": "text",
    "data_type": "text",
    "column_name": "default_risk_class_code",
    "is_nullable": "NO",
    "column_default": null,
    "ordinal_position": 4
  },
  {
    "udt_name": "text",
    "data_type": "text",
    "column_name": "description_ja",
    "is_nullable": "NO",
    "column_default": null,
    "ordinal_position": 5
  }
]
```

## 6. Next
- Apply this seed SQL only after explicit GO.
- Then retry HD-R2 policy overlay apply.
