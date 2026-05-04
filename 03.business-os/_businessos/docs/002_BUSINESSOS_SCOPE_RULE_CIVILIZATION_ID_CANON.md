# BusinessOS Scope Rule / civilization_id Canon

## Status
- status: canonical-correction
- owner: Boss
- prepared_by: Zero

## Core rule
BusinessOS is primarily user-scoped.

Canonical owner scope:
- civilization_id

BusinessOS is not primarily company-scoped.

## Correct meaning
civilization_id:
- user / Civilization account owner
- primary access boundary
- primary RLS boundary for BusinessOS app data
- owner of subscriptions, rentals, tickets, usage, app settings, app-local records

company_id:
- optional target company
- ERP integration target
- AICompanyManager company object target
- BusinessOS data may attach company_id when sending real data to ERP
- company_id must not replace civilization_id as the primary owner boundary

## Table design rule
Global catalog/reference tables:
- may have no civilization_id
- example: robot_pool, role catalog, public model catalog
- read-only or catalog RLS

User-owned transactional tables:
- must have civilization_id or owner_civilization_id
- examples: rental contracts, quotes, tickets, usage logs, user settings, app entitlements

Company-targeted user data:
- must have civilization_id / owner_civilization_id
- may also have company_id
- RLS must check civilization_id first
- company_id is a target object, not sole owner

ERP-side data:
- ERP is company-scoped
- when BusinessOS sends data to ERP, it attaches company info
- ERP DATABASE_URL is separate from PERSONA_DATABASE_URL
