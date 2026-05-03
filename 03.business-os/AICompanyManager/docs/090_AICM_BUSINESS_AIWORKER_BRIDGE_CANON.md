# AICompanyManager BusinessOS AIWorker Bridge Canon

## Purpose
Connect AICompanyManager UI to BusinessOS _aiworker without breaking the existing AICompanyManager implementation.

## Current phase
Thin bridge only.

## Scope
This bridge adds a local robot setting panel and payload builder for:
- President
- Manager
- Leader
- Worker
- Helper
- Friend
- Specialist

## Boundary
AICompanyManager must not own AIWorker model canon.

AIWorkerOS owns:
- robot model
- series
- manufacturer
- personality
- safety boundary
- release state

BusinessOS _aiworker owns:
- Business-side robot pool
- company entitlement
- company robot placement
- selector options
- placement payload

AICompanyManager owns:
- user-facing company / department / section setting screen
- selection UX
- app-local bridge
- display of assigned robot labels

## UI rule
Do not use arbitrary free text for robot model code.
Robot model selection should come from BusinessOS _aiworker selector options.

## Display rule
Assigned robot display label:
internal_nickname@role_code

## Safety
This phase does not persist DB writes from browser UI.
It only prepares payloads and local preview.
