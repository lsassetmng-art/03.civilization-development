# BusinessOS AIWorker Module OVERVIEW

## Current phase
BusinessOS AIWorker foundation.

## Design decision
Business-side robot pool is not one row per physical/AI unit by default.

Business-side robot pool is:
- one row per AIWorkerOS model / offer / scope
- quantity-based for available supply or contract-facing capacity
- placement-based when a robot is assigned to a company, department, section, or role

## Data layers
1. business.robot_pool
   - Business-side available model pool.
   - Example: HD-R3 available_quantity = 50.

2. business.company_robot_entitlement
   - Company-specific usable robot rights.
   - Example: Company A can use HD-R3 x 5.

3. business.company_robot_placement
   - Actual placement into AICompanyManager or other Business apps.
   - Example: "ゼウス@社長", "佐藤@部門長", "山田@Worker".

## Unit instance rule
Do not create one unit row for every available robot by default.
Create a future robot_unit_instance only if physical serial number, maintenance, individual growth, or per-unit state becomes necessary.
