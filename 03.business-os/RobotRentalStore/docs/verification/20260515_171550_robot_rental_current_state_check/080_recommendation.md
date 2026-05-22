# RobotRentalStore Current State Recommendation

## Multilingual
- HOLD: CivilizationOS側の基本形を待つ。
- RobotRentalStore側では先行i18n実装しない。

## API
- API syntax: OK
- rental start endpoint: present

## HTML
- HTML appears closed.
- UI start button: present

## Next safest action
1. If API/HTML are clean: proceed to rental start implementation only if still missing.
2. If HTML is broken: repair HTML only, no API patch.
3. If API syntax is broken: restore from latest known good backup before any new patch.
4. Do not touch multilingual until CivilizationOS canon is ready.
