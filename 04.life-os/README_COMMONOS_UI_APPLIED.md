# ============================================================
# LIFE OS COMMONOS UI APPLIED
# ============================================================

status: applied
scope: 04.life-os web runtime
mode: consumer-only

rule:
- 12.common-os itself is not modified in this chat
- 04.life-os consumes CommonOS-aligned UI through _shared-web
- business canon remains in LifeOS
- UI/tokens/shell/components are aligned to CommonOS direction

applied_targets:
- portal-web
- BodyMetrics
- MealPlanner
- TrainingCoach
- MoneyPlanner
- CareerLaunch
- LifePlanner
- EndOfLifePlanner
- InheritanceSupport
- LegalSupport
- BusinessLegalSupport
