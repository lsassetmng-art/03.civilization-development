# APP_COMMON STARTER NOTES

status: active
owner: Boss
prepared_by: Zero

purpose:
Provide a safe starter SQL file for app_common metadata structures used by CommonOS implementation.

important_boundary:
- app_common is for shared mutable metadata
- app_common is not the home of ERP voucher truth
- app_common is not the home of pricing logic
- app_common is not the home of entitlement logic
- app_common is not the home of access decision core
- app_common is not the home of secrets

review_rule:
- execute only after review by Sato (DB担当)
- additive only
- do not treat this starter as domain source of truth migration for business systems
