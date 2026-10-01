# WEB WORKSPACE

status: active
phase: GameOS R26 / M01 Builder Foundation

responsibilities:
- Builder Home
- Template Gallery
- Project Overview
- create-project UI
- recent-project reopen UI
- API client
- same-origin API proxy
- UI-focused interaction tests

non_responsibilities:
- canonical database truth
- M02 revision editing
- preview
- validation
- publish
- runtime gameplay

commands:
- npm run check
- npm run test:ui
- npm test
- npm run build
- npm run start

environment for live API proxy:
- GAMEOS_BUILDER_FUNCTION_URL
- GAMEOS_SUPABASE_ANON_KEY
- PORT (optional)

No dependency install is required for the R26 validation suite.
