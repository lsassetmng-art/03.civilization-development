# ============================================================
# LIFE OS IMPLEMENTATION ROOT CANONICAL
# ============================================================

status: canonical
owner: Boss
prepared_by: Zero

rule:
- 実装物とは、ビルド・実行するものを指す
- 実装物は 03.civilization-development 配下に生成する
- まず本OSフォルダを作成し、その下に各アプリフォルダを作成する
- 設計書は 01.civilization-system 側に置き、実装物と分離する

implementation_root:
- ~/03.civilization-development/04.life-os

child_rule:
- ~/03.civilization-development/04.life-os/<AppName>

examples:
- ~/03.civilization-development/04.life-os/LifePlanner
- ~/03.civilization-development/04.life-os/MoneyPlanner
- ~/03.civilization-development/04.life-os/MealPlanner
