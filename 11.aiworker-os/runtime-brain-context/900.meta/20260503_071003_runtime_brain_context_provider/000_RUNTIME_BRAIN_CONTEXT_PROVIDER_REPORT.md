# AIWorkerOS Runtime Brain Context Provider Report

RUN_TS=20260503_071003
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/900.meta/20260503_071003_runtime_brain_context_provider
DB_ENV=PERSONA_DATABASE_URL
DB_WRITE=NO
FILE_WRITE=YES
AICM_TOUCH=NO
REVIEWER=佐藤(DB担当)

## Files
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/src/aiworker-brain-context-provider.mjs
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/bin/aiworker-brain-context-demo.mjs
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/smoke/smoke-brain-context-provider.mjs
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/000_INDEX.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/001_OVERVIEW.md
- /data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-brain-context/docs/010_RUNTIME_BRAIN_CONTEXT_CONTRACT.md

## Node check
```
```

## Smoke
```
PASS HD-R1C smalltalk only
  sourceCount=3 domainCount=3
  domains=culture_region,food_nutrition,season_calendar
PASS HD-R5 business planning
  sourceCount=5 domainCount=3
  domains=business_operation,education_learning,robot_aiworker
PASS HD-R2 risk check security only
  sourceCount=4 domainCount=3
  domains=city_art_game,robot_aiworker,security_crisis
PASS BYD2-003 review professional/business
  sourceCount=8 domainCount=6
  domains=business_operation,civilization_foundation_history,education_learning,history_worldview,professional_basic,robot_aiworker
============================================================
PASS_COUNT=4
FAIL_COUNT=0
============================================================
```

## Demo JSON
```json
{
  "domains": [
    {
      "roleCode": "Friend",
      "modelCode": "HD-R1C",
      "depthCodes": [
        "basic"
      ],
      "seriesCode": "HD",
      "riskClassCodes": [
        "low"
      ],
      "brainDomainCode": "culture_region",
      "maxDataDepthLevel": 20,
      "brainDomainLabelJa": "文化・地域",
      "safetyBoundariesJa": "文化説明・地域話題に使う。偏見・差別助長には使わない。",
      "compactBrainSources": "cx22073jw.foundation_knowledge_topic:culture_region_light_knowledge",
      "existingSourceCount": 1,
      "readableSourceCount": 1
    },
    {
      "roleCode": "Friend",
      "modelCode": "HD-R1C",
      "depthCodes": [
        "basic"
      ],
      "seriesCode": "HD",
      "riskClassCodes": [
        "low"
      ],
      "brainDomainCode": "food_nutrition",
      "maxDataDepthLevel": 20,
      "brainDomainLabelJa": "食べ物・栄養",
      "safetyBoundariesJa": "軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。",
      "compactBrainSources": "cx22073jw.foundation_knowledge_topic:food_smalltalk_knowledge",
      "existingSourceCount": 1,
      "readableSourceCount": 1
    },
    {
      "roleCode": "Friend",
      "modelCode": "HD-R1C",
      "depthCodes": [
        "basic"
      ],
      "seriesCode": "HD",
      "riskClassCodes": [
        "low"
      ],
      "brainDomainCode": "season_calendar",
      "maxDataDepthLevel": 20,
      "brainDomainLabelJa": "季節・暦",
      "safetyBoundariesJa": "季節話題・軽い案内に限定する。",
      "compactBrainSources": "cx22073jw.foundation_knowledge_topic:season_smalltalk_knowledge",
      "existingSourceCount": 1,
      "readableSourceCount": 1
    }
  ],
  "provider": "aiworker-brain-context-provider",
  "modelCode": "HD-R1C",
  "domainCount": 3,
  "purposeCode": "smalltalk",
  "sourceCount": 3,
  "providerVersion": 1,
  "includeMissingSources": false
}
```

FINAL_STATUS=RUNTIME_BRAIN_CONTEXT_PROVIDER_PASS_REVIEW_REQUIRED
NEXT=Connect provider to actual AIWorker runtime prompt builder entrypoint after existing runtime file inventory
