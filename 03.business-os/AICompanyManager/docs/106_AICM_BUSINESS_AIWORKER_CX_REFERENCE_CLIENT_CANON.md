# AICompanyManager BusinessOS AIWorker CX Reference Client Canon

## Purpose
Provide a browser client for role/personality/public-profile reference lookup.

## Client
- assets/js/aicm-business-aiworker-reference-client.js

## Methods
- listRoles(params)
- listPersonalities(params)
- listPublicProfiles(params)
- listModelFull(params)

## API config dependency
Uses AICMBusinessAIWorkerApiConfigClient when available.

## Safety
This client reads reference data only.
It does not place robots, update roles, or change DB state.
