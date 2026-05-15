# B6R96R1H4_R1 policy_code fix decision

## 1. Cause
- H4 apply failed because `policy_code` used generated value like `b6r96r1h3_hd_r2_security_crisis_response`.
- `robot_brain_model_domain_policy_policy_code_check` rejected that value.

## 2. Fix
- chosen_policy_code: allow
- All generated `b6r96r1h3_* as policy_code` expressions were replaced.

## 3. Inference data
```json
[
  {
    "tableRef": "aiworker.robot_brain_model_domain_policy",
    "chosen": "allow",
    "existing": [
      "allow",
      "deny",
      "conditional"
    ],
    "allowed": [
      "allow",
      "deny",
      "conditional"
    ]
  },
  {
    "tableRef": "aiworker.robot_brain_role_policy",
    "chosen": "allow",
    "existing": [
      "allow",
      "deny",
      "conditional"
    ],
    "allowed": [
      "allow",
      "deny",
      "conditional"
    ]
  },
  {
    "tableRef": "aiworker.business_support_role_domain_capability",
    "chosen": null,
    "existing": [],
    "allowed": []
  }
]
```

## 4. Remaining bad policy_code lines
- none

## 5. Status
- SQL is NOT APPLIED.
- Apply requires explicit GO.
