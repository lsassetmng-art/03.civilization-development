# GameOS Button Menu Shell Contract Smoke

## Purpose

This smoke contract validates the R25 button-menu shell contracts.

It is documentation-level smoke, not executable runtime smoke.

## Required files

- 05.game-os/_commonos/route/040_gameos_portal_entry_route_contract.md
- 05.game-os/_commonos/presenter/040_gameos_button_menu_shell_presenter.md
- 05.game-os/_commonos/mapper/040_gameos_button_menu_state_mapper.md
- 05.game-os/_commonos/test/040_gameos_button_menu_shell_contract_smoke.md

## Required route assertions

PASS when the route contract includes:

- Portal
- CivilizationOS login
- GameOS Builder Home
- language_code
- after_login_path
- return_to

## Required presenter assertions

PASS when the presenter contract includes:

- Continue Project
- New Project
- Open Project
- Template Gallery
- Persona Link
- Preview / Playtest
- Export / Publish

## Required mapper assertions

PASS when the mapper contract includes:

- enabled
- disabled_missing_context
- disabled_permission_required
- disabled_project_required
- disabled_not_implemented
- error_state

## Required genre assertions

PASS when the menu shell includes:

- Visual Novel
- Dating Simulation
- RPG
- Puzzle
- Strategy
- Action Game
- Adventure Game
- 2D Fighting Game

## Required boundary assertions

PASS when the contracts state:

- Portal does not own GameOS project truth
- GameOS owns project locale truth after project creation
- PersonaOS remains canonical owner of Persona truth
- GameOS must not mutate PersonaOS canonical data
