# GameOS Button Menu State Mapper Contract

## Purpose

This contract maps GameOS truth and login context into button states.

The top-level menu is GameOS Home.

Game Builder, Marketplace, Creator Store, and Purchases are function groups inside GameOS Home.

## Inputs

- session_exists
- civilization_context_exists
- workspace_exists
- project_exists
- project_permission_level
- current_surface
- current_locale
- implementation_status
- persona_link_available
- marketplace_available
- creator_store_available
- purchases_available
- seller_profile_exists
- entitlement_summary_exists

## Outputs

- menu_id
- button_id
- button_label_key
- button_state
- route_target
- disabled_reason
- required_context
- required_permission

## Button state rules

- enabled
- disabled_missing_context
- disabled_permission_required
- disabled_project_required
- disabled_not_implemented
- error_state

## GameOS Home mapping

Game Builder:

- enabled when session and civilization context exist
- disabled_missing_context when login or civilization context is missing

Marketplace:

- enabled when session and civilization context exist and marketplace is available
- disabled_missing_context when context is missing
- disabled_not_implemented before marketplace implementation

Creator Store:

- enabled when session and civilization context exist and creator store is available
- disabled_permission_required when seller permissions are missing
- disabled_not_implemented before creator store implementation

Purchases:

- enabled when session and civilization context exist
- disabled_not_implemented before purchase entitlement implementation

## Game Builder mapping

Publish to Marketplace:

- enabled when project exists, publish permission exists, and marketplace is available
- disabled_project_required when no project exists
- disabled_permission_required when publish permission is missing
- disabled_not_implemented before publish implementation

## Marketplace product mapping

GameOS marketplace product types:

- game
- skin
- background
- ui_asset_pack
- bgm_pack
- se_pack
- template
- dlc
- additional_scenario
- in_game_item

## BusinessOS boundary

GameOS maps product, ownership, entitlement, and in-game use state.

BusinessOS owns payment, invoice, billing, settlement, seller revenue, and accounting linkage.

## PersonaOS boundary

Persona Link state mapping must never imply GameOS ownership of PersonaOS canonical truth.

GameOS may reference PersonaOS persona identifiers but must not overwrite PersonaOS canonical data.
