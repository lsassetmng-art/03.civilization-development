# Runtime Status Panel Reuse Note

status: active
scope: AICompanyManager current implementation / AIOperationDesk future reuse
owner: Boss
prepared_by: Zero

## Purpose

Runtime Status Panel displays AIWorkerOS Runtime Execution status through an app-local server proxy.

The browser must not receive AIWorkerOS tokens.

## Current AICompanyManager rule

Display only runtime requests that belong to AICompanyManager normal use.

Default filter rules:

- include app_surface_code = ai_company_manager
- include source_app_ref = AICompanyManager
- exclude test-like rows such as smoke / persistent smoke / runtime execution http api fix

## Future AIOperationDesk reuse

AIOperationDesk can reuse the same pattern with different app-local rules:

- app_surface_code = ai_operation_desk or equivalent canonical surface
- source_app_ref = AIOperationDesk
- display queue / pipeline / gate / delivery state
- keep token server-side only
- keep app-specific labels in the app, not in AIWorkerOS

## Boundary

This is a display/polling panel.

It does not:

- create runtime requests
- approve gates
- submit worker output
- bypass human GO
- expose AIWorkerOS auth token
