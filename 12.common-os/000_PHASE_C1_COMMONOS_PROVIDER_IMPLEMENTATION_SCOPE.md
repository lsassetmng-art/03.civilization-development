# PHASE C1 COMMONOS PROVIDER IMPLEMENTATION SCOPE

status: active
phase: C1_PROVIDER_MINIMUM_REUSABLE_IMPLEMENTATION
owner: Boss
prepared_by: Zero

purpose:
Implement the first buildable CommonOS provider-side bundle under 12.common-os.

scope_in:
- CommonTokenSet
- CommonUIRuntime
- CommonShell
- CommonSyncPresentation
- AppCommonStarter
- CommonOSPlayground
- build / verify scripts

minimum_reusable_component_set:
- Button
- IconButton
- TextField
- TextArea
- Select
- Checkbox
- Radio
- Switch
- Card
- Table
- List
- Dialog
- Toast
- Status Chip
- App Shell

queue_ui_required_surfaces:
- offline status indicator
- pending indicator
- processing indicator
- retry_wait indicator
- sent indicator
- failed indicator
- conflict indicator
- retry action entry point

mandatory_accessibility_items:
- keyboard operability
- focus visibility
- semantic labels
- readable contrast
- state announcement support
- touch-friendly interaction targets where relevant

explicit_boundary:
- business canon stays outside CommonOS
- pricing canon stays outside CommonOS
- entitlement decision core stays outside CommonOS
- approval/accounting/inventory canon stays outside CommonOS
- API payload canon stays outside CommonOS
- secrets stay outside CommonOS
