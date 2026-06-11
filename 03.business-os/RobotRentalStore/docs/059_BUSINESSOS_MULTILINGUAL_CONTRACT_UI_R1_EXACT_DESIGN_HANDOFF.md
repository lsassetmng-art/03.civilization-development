# BusinessOS Multilingual Contract UI R1 Exact Design Handoff

## Status
- FINAL_STATUS: PASS_BUSINESSOS_MULTILINGUAL_CONTRACT_UI_R1_EXACT_DESIGN_NO_PATCH_READY_FOR_R2
- REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260611_090803_businessos_multilingual_contract_ui_r1_r1_exact_design_repair_no_patch/000_BUSINESSOS_MULTILINGUAL_CONTRACT_UI_R1_R1_EXACT_DESIGN_REPAIR_REPORT.md

## Scope
- BusinessOS only
- RobotRentalStore only
- multilingual UI only

## Fixed decisions
- localeCode is canonical: ja-jp | en-us
- languageCode is compatibility: ja | en
- inline i18n helper per target HTML
- API machine fields remain untranslated
- UI labels are translated meaning-first
- R2 patches HTML only

## Target files for R2
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/index.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/contracts.html
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/ui/static/application-contracts.html

## Generated
- DESIGN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/060_BUSINESSOS_MULTILINGUAL_CONTRACT_UI_R1_EXACT_DESIGN.md
- R2_GATE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/063_BUSINESSOS_MULTILINGUAL_R2_PATCH_GATE.md

## Next
BUSINESSOS_MULTILINGUAL_CONTRACT_UI_R2_I18N_CORE_PATCH
