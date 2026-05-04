# BusinessOS AIWorker Canon

## Scope
This document fixes the BusinessOS-side AIWorker responsibility.

## Canonical rule
BusinessOS does not own AIWorkerOS robot identity canon.
BusinessOS only owns:
- Business-side robot pool
- company robot entitlement
- Business app placement
- contract-facing quantity
- assignment metadata

## AIWorkerOS owns
- manufacturer
- series
- model code
- model profile
- worker personality
- safety boundary
- model release state

## BusinessOS owns
- whether a released model is available in Business apps
- how many units are offered or contracted
- which company can use which model
- where a robot is placed
- internal company nickname
- app-specific placement role

## Pool rule
Use one row per model / offer / scope / quantity.

Example:
HD-R3 available_quantity = 50
This is one row, not fifty rows.

## Placement rule
Use one row per placement.

Example:
- President placement
- Department Manager placement
- Section Leader placement
- Worker placement

## AICompanyManager rule
AICompanyManager selects robots from Business-side available pool or company entitlement.
The selected robot creates a placement row.
Inventory/contract quantities are managed as quantity rows.
Placement records are managed per role / organization / placement unit.

## Terminology
Use:
- robot_pool
- company_robot_entitlement
- company_robot_placement

Do not use:
- aiemployee table naming
- one-row-per-unit pool by default
