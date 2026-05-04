# Overview

Runtime Brain Context Provider は、model_code と use_purpose_code を受け取り、
aiworker.vw_robot_readable_brain_source_registry_v1 から読取可能な頭脳sourceだけを抽出し、
prompt builderへ渡せるJSONを生成する。

## Input
- model_code
- use_purpose_code
- optional domain filter

## Output
- modelCode
- purposeCode
- sourceCount
- domains[]
- safety boundaries
- compact source references

## Boundary
- DB read-only
- AIWorkerOS side only
- no AICM dependency
