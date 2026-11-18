# GameOS Portal Entry Route Contract

## Purpose

This contract defines the route boundary from Portal to GameOS.

GameOS must be entered through CivilizationOS login and context handoff. Portal is an entry surface, not the owner of GameOS project truth.

The landing surface is GameOS Home, not Builder Home.

Game Builder is one function inside GameOS Home.

Marketplace, Creator Store, and Purchases are also GameOS Home functions.

## Route chain

Portal
  -> CivilizationOS login
  -> CivilizationOS login context handoff
  -> GameOS Home

## Portal input

Portal may pass:

- language_code
- after_login_path
- return_to
- requested_os
- requested_surface

## GameOS Home

GameOS Home must show:

- Game Builder
- Marketplace
- Creator Store
- Purchases
- Recent Projects
- Settings

## Game Builder

Game Builder owns:

- Continue Project
- New Project
- Open Project
- Template Gallery
- Project Overview
- World Builder
- Scenario Builder
- Character Builder
- Persona Link
- Scene Builder
- Dialogue / Choices
- Variables / Flags
- Assets
- Preview / Playtest
- Export / Publish

## Marketplace

Marketplace owns discovery and purchase entry for:

- user-created games
- skins
- backgrounds
- UI asset packs
- BGM and SE packs
- templates
- DLC and additional scenarios
- GameOS in-game purchase items

## Success state

The route is valid when:

- the user reaches GameOS Home after login
- civilization context is available
- Game Builder can be opened from GameOS Home
- Marketplace can be opened from GameOS Home
- Creator Store can be opened from GameOS Home
- Purchases can be opened from GameOS Home
- GameOS project locale truth remains GameOS-owned
- no PersonaOS canonical data is mutated
