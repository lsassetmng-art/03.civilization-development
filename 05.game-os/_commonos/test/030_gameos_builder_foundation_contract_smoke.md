# GameOS Builder Foundation Contract Smoke Check Design

## Purpose

Define a future smoke-check boundary for the Phase1 Builder Foundation skeleton.

This document is not an executable test.  
This document is not a DB check.  
This document is not an API call.

## Candidate checks

1. Project truth contract exists.
2. Locale mapper contract exists.
3. Presenter contract exists.
4. Login context contract exists.
5. Locale mapper skeleton references localeCode and languageCode.
6. Locale mapper skeleton resolves currentLocale, defaultLocale, and supportedLocales.
7. Presenter skeleton references Builder Home, Template Gallery, and Project Overview.
8. Project truth adapter skeleton references workspaceId, projectId, latestRevisionId, and revisionId.
9. Forbidden secret assignment count is zero.
10. DB write signal count is zero.
11. API POST signal count is zero.
12. PersonaOS canonical mutation actual count is zero.
13. Runtime wiring actual count is zero.

## Expected future result

- TARGET_EXISTS_COUNT=4
- CONTRACT_PRESENT_COUNT=4
- MARKER_PASS_COUNT=4
- SECRET_ASSIGNMENT_SIGNAL_COUNT=0
- DB_WRITE_SIGNAL_COUNT=0
- API_POST_SIGNAL_COUNT=0
- PERSONA_ACTUAL_COUNT=0
- RUNTIME_WIRING_ACTUAL_COUNT=0

## Forbidden behavior

- Do not connect to DB.
- Do not write DB.
- Do not call API POST.
- Do not stage files.
- Do not commit files.
- Do not push.
- Do not mutate PersonaOS canonical truth.
- Do not mutate Portal language settings.
- Do not mutate CivilizationOS session state.
- Do not activate runtime launcher behavior.

## Non-execution statement

The smoke check remains a design artifact in this phase.  
It does not execute shell commands against production data.  
It does not perform DB connection, DB write, DDL, API POST, git add, git commit, or git push.
