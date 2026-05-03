# AICompanyManager stop patching rules

## Immediate stop

Do not add any more:
- bridge JS
- guard JS
- rescue JS
- hydrator JS
- broad click listener
- broad touchend listener
- MutationObserver based company sync
- debug card
- DB status card
- overlay fix
- text-based DOM removal

## Required direction

Move to a maintainable rebuild.

The UI must have one state owner, one API client, one renderer, and one action dispatcher.

## Production rule

Production UI must not expose:
- database connection strings
- raw psql command output
- server_mark debug strings
- smoke/debug/test panels
- BusinessOS DB diagnostic cards
- payload preview cards unless explicitly in dev mode

## Patch policy

Existing patch files may remain physically for now, but production index must eventually stop loading them.

No delete in this phase.
