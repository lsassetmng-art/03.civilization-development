# GameOS Builder Foundation Presenter Contract

## 1. Purpose

This contract defines the Phase1 Builder UI presentation boundary.

It describes what the presenter may display.
It does not implement runtime wiring.

## 2. Required Surfaces

The presenter must support display contracts for:

- Builder Home
- Template Gallery
- Project Overview
- Project Create
- Project Open

## 3. Required Display Inputs

The presenter may read:

- owner
- civilizationId
- projectId
- workspaceId
- latestRevisionId
- defaultLocale
- supportedLocales
- currentLocale
- localizedTitle
- localizedDescription
- project status
- validationStatus

## 4. Display Language

The presenter should render labels through GameOS locale resolution.

The presenter must not rely on Portal-hosted GameOS-specific strings.

## 5. Minimum Labels

The presenter should define labels for:

- create project
- open project
- template gallery
- project overview
- latest revision
- autosave
- validation status
- current locale
- supported locales
- return to portal

## 6. Forbidden Behavior

The presenter must not:

- authenticate users
- create sessions
- store secrets
- call API POST
- write DB records
- mutate PersonaOS canonical truth
- activate runtime releases
