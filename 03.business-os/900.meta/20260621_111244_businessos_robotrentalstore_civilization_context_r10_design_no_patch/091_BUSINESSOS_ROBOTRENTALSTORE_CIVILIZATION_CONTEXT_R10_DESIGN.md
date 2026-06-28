# BusinessOS RobotRentalStore Civilization Context R10 Design

## Result

R10 is design-only. No patch.

## Current inventory summary

- RobotRentalStore target candidates: 3 static HTML pages
- Existing helper import signals: 0
- Existing context signals: 0
- Existing storage/url context signals: 0
- Existing fetch-like static HTML signals: 7
- Existing form-like static HTML signals: 0
- Existing href/navigation signals: 0
- Existing API endpoint candidate lines from R9_R1: 24

## Target pages

- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html

## First wiring mode

UI_CONTEXT_READ_PLUS_REQUEST_CONTEXT_DESIGN_REQUIRED

R11 should not enforce login.

R11 should not verify CivilizationOS sessionRef.

R11 should not send DB writes or API POST.

R11 should not modify AICompanyManager.

R11 should not modify AIWorkerOS.

R11 should not modify Portal or CivilizationOS.

## Shared adapter treatment

Existing shared adapter:

- 03.business-os/shared/login-context/businessos-login-context.mjs

This remains the BusinessOS server/Node-side consumer adapter for CivilizationOS login context.

Static RobotRentalStore HTML should not import it directly from outside the static root.

Reason:

- RobotRentalStore target pages are under ui/static.
- shared/login-context is outside static serving root.
- direct static import would depend on server exposure/path assumptions.
- R11 should avoid coupling static HTML to repository-internal paths.

## Recommended R11 patch

Create a browser-side static bridge:

- 03.business-os/RobotRentalStore/ui/static/civilization-context-bridge.js

Patch the three static HTML pages to load it:

- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html

## Browser bridge responsibility

The bridge should read CivilizationOS context in this priority:

1. URL search params
2. window.CivilizationLoginContext
3. localStorage civilization.loginContext
4. window.BusinessOSLoginContext as compatibility-only
5. localStorage businessos.loginContext as compatibility-only
6. locale fallback from portal.locale / portal.language / civilization.portal.locale
7. empty fallback ja-jp / ja

## Bridge output

The bridge should expose a small read-only browser object:

- window.BusinessOSCivilizationContext

Suggested fields:

- context
- source
- trustStatus
- warnings
- getContext()
- getHeaders()

## DOM side effect allowed

R11 may set only safe client-side metadata:

- document.documentElement.lang
- document.documentElement.dataset.localeCode
- document.documentElement.dataset.languageCode
- document.documentElement.dataset.civilizationContextSource
- document.documentElement.dataset.civilizationContextTrust

Do not display raw civilizationId or sessionRef in the UI.

## Request headers for future use

The bridge may provide headers for later fetch usage, but R11 should not wrap or intercept fetch globally.

Allowed future headers:

- x-civilization-id
- x-owner
- x-civilization-session-ref
- x-locale-code
- x-language-code
- x-requested-os-code
- x-return-to
- x-after-login-path

## Trust rule

All parsed context must remain:

trustStatus = parsed_only_not_authenticated

This means:

- parsed only
- not authenticated by BusinessOS
- not session-verified
- not authorization-checked

## R11 patch targets

Allowed patch files:

- 03.business-os/RobotRentalStore/ui/static/civilization-context-bridge.js
- 03.business-os/RobotRentalStore/ui/static/index.html
- 03.business-os/RobotRentalStore/ui/static/contracts.html
- 03.business-os/RobotRentalStore/ui/static/application-contracts.html
- 03.business-os/900.meta/*businessos_robotrentalstore_civilization_context_r11*

No other files.

## R11 validation requirements

R11 must verify:

- no syntax-breaking script
- bridge reads URL first
- bridge reads window.CivilizationLoginContext before BusinessOS compatibility surface
- bridge reads localStorage civilization.loginContext before businessos.loginContext
- bridge marks BusinessOS-named surfaces as compatibility-only
- bridge does not store passwords/tokens/secrets
- bridge does not call fetch
- bridge does not call API POST
- bridge does not enforce login
- bridge does not expose raw sessionRef in visible UI
- all three HTML pages include the bridge exactly once
- AICompanyManager remains untouched
