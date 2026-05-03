# Actual UI company list source ranking

generated_at: 2026-04-30 06:34:25 +0900

## DB observed

business.aicm_company row-like hits in DB output:
- 2

business.ai_company_manager_company row-like hits in DB output:
- 5

## Code observed

Wolf/ウルフ hits in JS:
- 4

localStorage/storage key hits in JS:
- 645

aicm_company source code hits:
- 13

ai_company_manager_company source code hits:
- 2

## Interpretation

### If UI shows only 1 company

Then UI likely matches business.aicm_company and DB正本全件取得 is OK.

### If UI shows ウルフ or multiple user-created companies

Then UI is not coming from business.aicm_company directly, because business.aicm_company has only 1 active row in the latest check.

Most likely source:
1. localStorage key AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE / phase-de-dh local state
2. phase-de-dh baseData/demo company list
3. active company binding JS
4. legacy table business.ai_company_manager_company

## Recommended decision

Before further UI fixes, decide canonical company source:

A. Use business.aicm_company as company master
   - Then UI should show exactly rows from business.aicm_company.
   - ウルフ must be inserted/migrated into business.aicm_company if it is a real company.

B. Use business.ai_company_manager_company as current company master
   - Then company_name is currently empty for its 4 rows and must be repaired/mapped.
   - But this table looks older/parallel.

C. Use localStorage only for current prototype
   - Then DB全件取得 is not the current UI source.
   - Later DB integration still needed.
