# Stop loading old script stack plan

## Goal

Production index should stop loading the patch-stacked script group.

## Stop loading

The switch replaces index.html with a clean version that loads only:
- assets/js/aicm-production-core.js

This stops:
- old phase-de-dh workflow JS
- company legacy DOM compatibility
- broad AIWorker bridge/save clients
- duplicate guards
- save reload bridges
- payload preview panels
- company binding debug surfaces
- exact sync patches
- rescue overlays
- current-company patch bridges

## Why full replacement

Disabling scripts one by one is risky because the current stack has:
- 36 script tags
- hundreds of click/change/touch handlers
- old localStorage state owners
- v2 patch bridges still competing

Full index replacement is cleaner and rollback-safe.

## What remains

CSS remains:
- assets/css/phase-de-dh-workflow-final-local-ui.css

Root remains:
- div#aicm-root

Production JS:
- assets/js/aicm-production-core.js
