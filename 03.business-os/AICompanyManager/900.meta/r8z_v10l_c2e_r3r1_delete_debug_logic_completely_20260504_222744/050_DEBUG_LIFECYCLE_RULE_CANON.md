# AICompanyManager Debug Lifecycle Rule

Temporary debug UI / debug panels / runtime debug instrumentation must be removable.

When adding debug UI or debug logic:

1. Add a unique marker.
2. Add START / END boundaries where possible.
3. Keep debug UI in a removable block.
4. Do not mix temporary debug UI into canonical renderer logic without a deletion path.
5. The same phase that adds debug should define the deletion phase.
6. Before finalizing the feature, remove visible debug labels, debug panels, runtime debug state, console debug instrumentation, and temporary bridge/wrapper/debug helpers.
7. Verify with node --check, source marker count=0, visible debug label count=0, formal UI still present, and browser HTTP 200.

Prohibited:
- Leaving temporary debug UI in production UI.
- Hiding debug panels with CSS instead of deleting when deletion is required.
- Wrapping core renderer functions just to hide debug output.
- Broad source regex deletion that can break function syntax.
