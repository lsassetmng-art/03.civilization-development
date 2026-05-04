# BusinessOS AIWorker Pool Selector Canon

## Purpose
This phase makes the Business-side robot pool selectable by Business apps such as AICompanyManager.

## Canonical source split
- AIWorkerOS owns robot model canon.
- BusinessOS owns Business availability, company entitlement, and placement.

## Selector rule
AICompanyManager must not free-text robot model assignment.
It must select from Business-side robot pool / company entitlement.

## Pool seed rule
Initial Business pool rows are one row per model / offer / scope / quantity.
Do not create one row per robot unit.

## Company entitlement rule
Company entitlement grants a company the right to use a model.
The entitlement row is quantity-based.

## Placement rule
Placement creates one row per actual role placement:
- President
- Manager
- Leader
- Worker
- Helper
- Friend
- Specialist

The display format is:
internal_nickname@role_code

## Quantity and unlimited assignment
The current AICompanyManager design allows unlimited allocation from the Business-side pool.
Therefore:
- contract/inventory counts are quantity rows
- placement records are per assignment
- quantity enforcement can be tightened later by assignment_mode_code
