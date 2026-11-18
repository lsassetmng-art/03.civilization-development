# GameOS Button Menu State Mapper Contract

## Purpose

This contract maps GameOS truth and login context into button states.

The mapper must be deterministic and must not mutate project truth.

## Inputs

- session_exists
- civilization_context_exists
- workspace_exists
- project_exists
- project_permission_level
- current_surface
- current_locale
- implementation_status
- persona_link_available

## Outputs

- menu_id
- button_id
- button_label_key
- button_state
- route_target
- disabled_reason
- required_context
- required_permission

## Button state rules

### enabled

Use when all required context and permission are present.

### disabled_missing_context

Use when login or civilization context is missing.

### disabled_permission_required

Use when the user is logged in but lacks permission.

### disabled_project_required

Use when the action requires an active project but none is selected.

### disabled_not_implemented

Use when the button is intentionally visible but the backing implementation is not ready.

### error_state

Use only when the shell cannot determine a safe state.

## Builder Home mapping

Continue Project:

- enabled when a resumable project exists
- disabled_project_required when no project exists
- disabled_permission_required when project exists but cannot be opened

New Project:

- enabled when session and civilization context exist
- disabled_missing_context when login context is missing

Open Project:

- enabled when workspace exists
- disabled_missing_context when civilization context is missing

Template Gallery:

- enabled when session and civilization context exist
- disabled_missing_context when context is missing

Persona Link:

- enabled when project exists and Persona Link is available
- disabled_project_required when no project exists
- disabled_not_implemented before Persona Link implementation

Settings:

- enabled when session exists
- disabled_missing_context when session is missing

## PersonaOS boundary

Persona Link state mapping must never imply GameOS ownership of PersonaOS canonical truth.

GameOS may reference PersonaOS persona identifiers but must not overwrite PersonaOS canonical data.
