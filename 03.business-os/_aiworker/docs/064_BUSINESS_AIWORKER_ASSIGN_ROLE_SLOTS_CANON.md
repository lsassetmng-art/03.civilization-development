# BusinessOS AIWorker Assign Role Slots Canon

## Purpose
Assign Boss-approved placement roles to BusinessOS robot_pool.

## Scope
This step updates only:
- business.robot_pool.placement_role_code_1
- business.robot_pool.placement_role_code_2
- business.robot_pool.placement_role_code_3
- business.robot_pool.placement_role_config_status_code
- business.robot_pool.placement_role_config_note
- business.robot_pool.placement_role_config_updated_at

It does not:
- change selector views
- change functions
- delete rows
- change robot model identity

## Canonical distinction
Model identity:
- aiworker_model_code
- display_name
- aiworker_series_code
- manufacturer_code

Placement role slots:
- placement_role_code_1
- placement_role_code_2
- placement_role_code_3

Actual placement:
- business.company_robot_placement.role_code

## Confirmed mapping

### HD
- HD-R5P: President
- HD-R5: ExecutiveManager / Manager
- HD-R4: Leader
- HD-R3: Worker
- HD-R1: Helper
- HD-R2: Battler / Security
- HD-R1C: Friend
- HD-R1A: Lover
- HD-R2S: Specialist
- HD-R2G: Manager / Leader / Battler
- HD-R2T-0: President / ExecutiveManager / Battler

### Beyond
- BYD1-001: Worker
- BYD1-002: Worker / Helper
- BYD1-003: Worker / Specialist
- BYD2-001: Leader
- BYD2-002: Leader / Manager
- BYD2-003: President / Manager / ExecutiveManager

### MEGAMI
- MG-NORN-001: Advisor / Worker / Lover
- MG-NORN-002: Advisor / Worker / Lover
- MG-NORN-003: Advisor / Worker / Lover

### LoVerS
- all LVS-* models: Lover

## Note
Butler means 執事.
Battler means 戦闘員.
For the combat-type HD roles, use Battler.
