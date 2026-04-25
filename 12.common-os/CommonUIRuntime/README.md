# CommonOS implementation bundle

status: implementation-starter
system: CommonOS
owner: Boss
prepared_by: Zero

## Scope
This bundle implements the CommonOS phase-1 shared foundation as a dependency-free HTML UI runtime.

Included:
- shared tokens and variants
- shared app shell
- base input and feedback controls
- offline / queue / sync presentation
- additive `app_common` SQL starter
- Termux one-block installer

Not included:
- domain business logic
- pricing / entitlement / access decision engines
- secrets
- authoritative queue meaning

## Folder structure
- `src/commonos.js` : dependency-free web component runtime
- `demo/index.html` : runnable demo surface
- `sql/001_app_common_bootstrap.sql` : additive shared metadata starter
- `scripts/build.mjs` : copies runtime into `dist/`
- `scripts/verify.mjs` : lightweight verification
- `termux_install_commonos_oneblock.sh` : one-block installer for Termux

## Local usage
```bash
cd /data/data/com.termux/files/home/03.civilization-development/12.common-os/CommonUIRuntime
node scripts/build.mjs
```

Then open `demo/index.html` in a browser or embed `dist/commonos.js` into an app.

## SQL note
`app_common` is implemented only as a safe additive starter here. Apply to the correct target DB after review.
