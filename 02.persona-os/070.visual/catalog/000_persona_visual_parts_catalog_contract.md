# Persona Visual Parts Catalog Contract

status: initial-v1-contract
system: PersonaOS
domain: 070.visual
catalog: persona_visual_parts_catalog
schema_version: 1

## 1. Purpose

Persona Visual Parts Catalog is a PersonaOS-governed reference surface
for visual part assets that may be offered as selectable candidates
during Persona creation and editing.

The catalog is not Persona truth by itself.

The catalog is not release truth by itself.

The catalog does not perform rendering.

## 2. Ownership

Catalog truth owner:

- PersonaOS
- 070.visual domain

Direct catalog readers:

- PersonaOS-side components
- PersonaBuilder-side components operating under PersonaOS boundaries

Portal direct catalog read:

- prohibited

Portal filesystem import from PersonaOS:

- prohibited

Portal ownership of this catalog:

- prohibited

The Civilization Portal may launch or host navigation into PersonaOS,
but it must not become the truth owner or direct filesystem consumer
of the Persona Visual Parts Catalog.

A future PersonaOS / PersonaBuilder interface may provide only
authorized selection candidates to a UI surface.

That transport contract is outside this file.

## 3. Canonical lineage boundary

PersonaOS visual/asset family distinguishes work-state,
candidate, approval/publish progression, and released artifacts.

Therefore:

- catalog presence does not mean released
- enabled=true does not mean released
- enabled=true does not mean approved
- enabled=true does not mean published
- uploaded candidate does not mean released artifact
- generated candidate does not mean released artifact
- release requires explicit release lineage
- governance-required release must follow approval/publish boundaries

The catalog must never manufacture release state.

## 4. Catalog envelope v1

Machine-readable data contract:

    PersonaVisualPartsCatalogV1 {
      schemaVersion: 1
      catalogVersion: string
      entries: PersonaVisualPartCatalogEntryV1[]
    }

schemaVersion identifies structural schema compatibility.

catalogVersion identifies the governed catalog dataset version.

Any future selection draft must preserve the catalog version from which
the selection candidates were obtained.

## 5. Catalog entry v1

Future catalog entries use this minimum contract:

    PersonaVisualPartCatalogEntryV1 {
      schemaVersion: 1
      catalogVersion: string
      slotRef: string
      partType: string
      assetReference: string
      labelByLocale: {
        "ja-jp": string
        "en-us": string
      }
      enabled: boolean
      sortOrder: number
    }

R3 does not create any entry.

## 6. Field semantics

### schemaVersion

Structural version of the entry contract.

### catalogVersion

Governed version of the catalog dataset containing the entry.

### slotRef

Stable governed reference identifying the selection slot to which
an asset candidate may be bound.

R3 does not define production slotRef values.

### partType

Governed visual part classification.

It must remain compatible with the PersonaOS visual/asset family
part_type concept.

R3 does not define production partType values.

### assetReference

Explicit PersonaOS visual asset reference.

It must correspond to a real governed visual asset or candidate lineage.

It must not be generated from a label.

It must not be fabricated by a UI.

R3 does not create production assetReference values.

### labelByLocale

Presentation label only.

Required v1 locales:

- ja-jp
- en-us

Labels are not identifiers.

Changing a label must not silently change asset identity.

### enabled

Selection availability inside the governed catalog.

enabled=true does not imply approval, publish, or release.

### sortOrder

Stable presentation ordering metadata.

It has no truth or release semantics.

## 7. Entry identity

A selectable catalog entry is traced by:

    catalogVersion
    + slotRef
    + assetReference

Display labels are excluded from identity.

## 8. Portal and UI boundary

The Portal must not directly read this JSON file.

The Portal must not import this JSON file.

The Portal must not infer catalog truth.

A future PersonaOS-owned creation surface or PersonaBuilder interface
may expose authorized selection candidates to the user interface.

The UI may retain the user's selected references in a local precursor
draft, but that draft is not canonical Persona truth.

## 9. Future parts selection draft

The previously designed local precursor shape is:

    PersonaPartsSelectDraftV1 {
      schemaVersion: 1
      method: "parts_select"
      route: "/persona-menu/persona-create/parts-select"
      updatedAt: string
      catalogVersion: string
      selections: [
        {
          slotRef: string
          assetReference: string
        }
      ]
    }

This draft stores references only.

It does not duplicate visual asset binaries.

It does not create a canonical Persona ID.

It does not imply Validation, Approval, Publish, Canonical Apply,
Snapshot, or released status.

The current Portal route is transitional and does not establish
Portal ownership of PersonaOS functionality.

Migration of the Persona home/menu and Persona creation surface
into a PersonaOS-owned web surface is a separate implementation track.

## 10. Taxonomy boundary

R3 intentionally defines no production taxonomy.

The following are not frozen by this implementation:

- hair
- face
- eyes
- clothing
- accessory
- body attributes
- other visual categories

No production slotRef values are created.

No production partType values are created.

No production assetReference values are created.

## 11. Binary storage boundary

This catalog stores references only.

Image/model/layer binary storage is outside R3.

No filesystem asset location, object-storage bucket,
signed URL policy, or delivery URL is invented here.

## 12. R3 implementation state

R3 materializes only:

- this contract document
- the empty machine-readable v1 catalog envelope

R3 does not materialize:

- catalog rows
- taxonomy codes
- visual binaries
- asset IDs
- asset references
- Portal catalog readers
- PersonaBuilder API
- database tables
- publish actions
- release actions

The initial JSON catalog must contain an empty entries array.
