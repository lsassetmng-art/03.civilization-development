# GameOS Builder Foundation Presenter Skeleton

## Purpose

Provide a storage-neutral presenter boundary for Builder Home, Template Gallery, and Project Overview.

This skeleton is not production UI wiring and does not activate runtime releases.

## Required surfaces

- Builder Home
- Template Gallery
- Project Overview
- Project Create
- Project Open

## Required display inputs

- owner
- civilizationId
- workspaceId
- projectId
- latestRevisionId
- projectStatus
- validationStatus
- currentLocale
- defaultLocale
- supportedLocales
- localizedTitle
- localizedDescription

## Conceptual functions

- buildBuilderHomeViewModel(input)
- buildTemplateGalleryViewModel(input)
- buildProjectOverviewViewModel(input)
- resolveBuilderFoundationLabels(currentLocale)

## Minimum label groups

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

## Ownership

GameOS owns Builder UI text and project display resolution. Portal, CivilizationOS, and PersonaOS do not own GameOS-specific Builder copy.

## Forbidden behavior

- Do not perform authentication.
- Do not store secrets.
- Do not perform DB write.
- Do not call API POST.
- Do not mutate PersonaOS canonical truth.
- Do not activate runtime launcher behavior.
