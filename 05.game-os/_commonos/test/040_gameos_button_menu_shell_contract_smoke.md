# GameOS Button Menu Shell Contract Smoke

## Purpose

This smoke contract validates the R25 button-menu shell contracts after the R25_R0C refresh.

It is documentation-level smoke, not executable runtime smoke.

## Required files

- 05.game-os/_commonos/route/040_gameos_portal_entry_route_contract.md
- 05.game-os/_commonos/presenter/040_gameos_button_menu_shell_presenter.md
- 05.game-os/_commonos/mapper/040_gameos_button_menu_state_mapper.md
- 05.game-os/_commonos/marketplace/040_gameos_marketplace_product_contract.md
- 05.game-os/_commonos/test/040_gameos_button_menu_shell_contract_smoke.md

## Required route assertions

PASS when the route contract includes:

- Portal
- CivilizationOS login
- GameOS Home
- Game Builder
- Marketplace
- Creator Store
- Purchases

## Required presenter assertions

PASS when the presenter contract includes:

- GameOS Home
- Game Builder
- Marketplace
- Creator Store
- Purchases
- Continue Project
- New Project
- Open Project
- Template Gallery
- Persona Link
- Preview / Playtest
- Export / Publish
- Publish to Marketplace

## Required mapper assertions

PASS when the mapper contract includes:

- enabled
- disabled_missing_context
- disabled_permission_required
- disabled_project_required
- disabled_not_implemented
- error_state
- marketplace_available
- creator_store_available
- purchases_available
- seller_profile_exists
- entitlement_summary_exists

## Required marketplace assertions

PASS when the marketplace contract includes:

- user-created games
- skins
- backgrounds
- UI asset packs
- BGM packs
- SE packs
- templates
- DLC
- additional scenarios
- GameOS in-game purchase items

## Required boundary assertions

PASS when the contracts state:

- Portal is an entry surface
- GameOS owns product catalog meaning and entitlement state
- BusinessOS owns payment, billing, settlement, and accounting linkage
- PersonaOS canonical data must not be mutated by marketplace purchase
