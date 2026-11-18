# GameOS Portal Entry Route Contract

## Purpose

This contract defines the route boundary from Portal to GameOS.

GameOS must be entered through CivilizationOS login and context handoff. Portal is an entry surface, not the owner of GameOS project truth.

## Route chain

Portal
  -> CivilizationOS login
  -> CivilizationOS login context handoff
  -> GameOS Builder Home

## Portal input

Portal may pass:

- language_code
- after_login_path
- return_to
- requested_os
- requested_surface

## CivilizationOS responsibility

CivilizationOS owns:

- login state
- session context
- civilization context
- authentication completion
- safe after-login redirect

## GameOS responsibility

GameOS owns the Builder Home landing and game project workspace lookup after context handoff is complete.

GameOS must not treat Portal language as project truth after a project exists.

## Required landing surface

The default landing surface is:

GameOS Builder Home

Builder Home must be able to show:

- Continue Project
- New Project
- Open Project
- Template Gallery
- Recent Projects
- Persona Link
- Settings

## Success state

The route is valid when:

- the user reaches GameOS Builder Home after login
- civilization context is available
- user-facing locale can be displayed
- GameOS project locale truth remains GameOS-owned
- no PersonaOS canonical data is mutated
