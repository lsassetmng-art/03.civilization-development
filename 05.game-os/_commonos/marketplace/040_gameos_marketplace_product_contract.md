# GameOS Marketplace Product Contract

## Purpose

GameOS Marketplace allows users to sell and buy GameOS-native products.

This marketplace is similar in concept to BusinessOS app sales, but GameOS has a wider product scope because users can sell games, game assets, and in-game items.

## Top-level marketplace surfaces

- Marketplace
- Creator Store
- Purchases
- Product Detail
- Product Library
- Entitlements

## Product categories

GameOS Marketplace may sell:

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

## Product type codes

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

## Entitlement

GameOS owns game-use entitlement state.

Entitlement examples:

- purchased_game
- purchased_skin
- purchased_background
- purchased_asset_pack
- purchased_template
- purchased_dlc
- purchased_in_game_item

Entitlement state must support:

- granted
- revoked
- refunded
- expired
- consumed

## Creator Store

Creator Store allows a creator to manage product drafts, listings, pricing display data, visibility, review status, release notes, and compatibility notes.

## Purchases

Purchases shows the user's owned products and entitlements.

## BusinessOS boundary

GameOS owns:

- product catalog meaning
- marketplace listing surface
- game/project linkage
- entitlement state
- in-game use authorization
- creator-facing product management surface

BusinessOS owns:

- payment execution
- billing
- invoice
- settlement
- sales ledger
- tax/accounting linkage
- seller business profile

GameOS must not become the accounting source of truth.

BusinessOS must not become the gameplay entitlement source of truth.

## Review boundary

Marketplace products should have review status before public sale.

Minimum statuses:

- draft
- submitted_for_review
- approved
- rejected
- suspended
- unpublished

## Safety rule

A marketplace purchase must never directly mutate PersonaOS canonical data.

A marketplace purchase may grant a GameOS entitlement only.
