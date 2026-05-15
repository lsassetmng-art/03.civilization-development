# B6R96R1H4_R4 brain_data_domain_catalog seed decision

## 1. Decision
- H4_R3 failed because no existing brain domain mapping was available.
- H4_R4 proposes adding six brain_data_domain_catalog rows.
- After these rows exist, H4_R1 policy-code-fixed overlay SQL can use the same six codes as `brain_domain_code`.

## 2. Generated
- generated inserts: 0
- manual blocks: 6
- status_value: active
- code_column: code

## 3. Existing target rows
```json
[]
```

## 4. Required columns
```json
[]
```

## 5. Next
- Review this seed SQL.
- Apply only after explicit GO.
- Then re-apply HD-R2 policy overlay SQL.
