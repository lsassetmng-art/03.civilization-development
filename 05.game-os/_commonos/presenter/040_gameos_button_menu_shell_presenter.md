# GameOS Button Menu Shell Presenter Contract

## Purpose

This contract defines the button-menu shell used by GameOS Builder surfaces.

The shell must follow the same basic interaction style as PersonaOS: visible buttons, safe disabled states, and no silent failures.

## Top-level Builder Home buttons

- Continue Project
- New Project
- Open Project
- Template Gallery
- Recent Projects
- Persona Link
- Settings

## Project Overview buttons

- World
- Scenario
- Characters
- Persona Link
- Scenes
- Dialogue / Choices
- Variables / Flags
- Assets
- Preview / Playtest
- Save / Revision History
- Export / Publish

## New Project buttons

- Select Genre
- Select Template
- Set Title
- Set Default Locale
- Select Supported Locales
- Create Project

## Official genre buttons

- Visual Novel
- Dating Simulation
- RPG
- Puzzle
- Strategy
- Action Game
- Adventure Game
- 2D Fighting Game

## Presenter input

The presenter may receive:

- civilization context
- session context
- workspace summary
- project summary
- locale summary
- permission summary
- implementation status summary

## Presenter output

The presenter must output:

- visible title
- visible description
- ordered button groups
- each button state
- next route target
- disabled reason when disabled
- safe empty state when no project exists

## Button state

Every button must expose one of:

- enabled
- disabled_missing_context
- disabled_permission_required
- disabled_project_required
- disabled_not_implemented
- error_state

## Empty state

When no project exists, Builder Home must still show:

- New Project
- Template Gallery
- Settings

Continue Project may be disabled_project_required.

Open Project may be enabled if the user can browse existing projects.
