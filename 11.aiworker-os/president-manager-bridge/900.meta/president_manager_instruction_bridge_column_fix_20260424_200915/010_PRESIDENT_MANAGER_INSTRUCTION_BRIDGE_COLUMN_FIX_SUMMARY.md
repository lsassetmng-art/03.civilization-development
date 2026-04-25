# PRESIDENT MANAGER INSTRUCTION BRIDGE COLUMN FIX SUMMARY

## Fixed

The candidate view now exposes both:

- target_actor_ref
- target_manager_selector_text

## Reason

The previous bridge creation was committed, but the final verify query used target_manager_selector_text while the view exposed target_actor_ref.

## Expected safe result

- President model: HD-R5P
- President authority: PLANNED
- President runtime: DISABLED
- Manager instruction rows: created
- Manager acceptance: blocked
- Expected decision: BLOCKED_PRESIDENT_NOT_ACTIVE
