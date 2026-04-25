# 11.aiworker-os / _commonos usage rules

status: active
owner: Boss
prepared_by: Zero

purpose:
Standardize how 11.aiworker-os consumes CommonOS without moving 11.aiworker-os business canon into CommonOS.

rules:
- app-specific business logic remains in each app / feature side
- reusable connection layer is placed here
- this folder may depend on CommonOS provider modules
- this folder must not become the canonical home of business truth
- domain write authority remains outside CommonOS and outside this shared connection layer
- queue meaning remains in 11.aiworker-os domain side; only presentation mapping belongs here

standard_parts:
- adapter
- bridge
- mapper
- presenter
- theme
- sync
- test
