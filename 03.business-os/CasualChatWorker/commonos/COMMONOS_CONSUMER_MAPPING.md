# CasualChatWorker CommonOS Consumer Mapping

status: phase-f-mapping-created

## CommonOS provider

- ~/03.civilization-development/12.common-os

## BusinessOS consumer

- ~/03.civilization-development/03.business-os/_commonos

## CasualChatWorker local bridge

- ~/03.civilization-development/03.business-os/CasualChatWorker/commonos

## Component candidates

- AIWorkerCard
- WorkerTypeBadge
- DurationSelector
- PriceQuotePanel
- FreeTicketPill
- ContractConfirmModal
- RemainingTimer
- ChatBubble
- SafetyRedirectBanner
- UsageHistoryRow

## Boundary

CommonOS owns shared presentation.
CasualChatWorker owns app-specific meaning, pricing, free ticket behavior, and safety copy.
