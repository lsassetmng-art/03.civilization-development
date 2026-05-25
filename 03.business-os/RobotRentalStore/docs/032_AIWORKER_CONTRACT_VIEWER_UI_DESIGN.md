# AI Worker契約閲覧 UI Design

## Route
/aiworker-menu/aiworker-contracts

## Page title
AI Worker契約閲覧

## User flow
1. Page opens from AIWorker menu node.
2. UI loads current civilization contracts.
3. List cards show contract status and key summary.
4. User taps a card.
5. Detail panel opens.
6. User can return to list.

## List card fields
- status badge
- model code / role
- rental unit / count
- price
- payment status
- period status
- created_at
- updated_at

## Detail fields
- contract core information
- contract lines
- period information
- payment intent
- status history
- end summary
- usage logs if any
- safety events if any

## Status labels
- quoted: 見積保存済み
- confirmed: 申込確定済み
- active: 利用中
- ended: 利用終了
- canceled: キャンセル済み

## UI prohibitions
Do not display:
- API base input
- civilization_id input
- rollback button
- debug button
- raw JSON by default
- no_persist
- persist_allowed
- dry_run

## Static UI target
RobotRentalStore/ui/static/contracts.html

## API base
http://127.0.0.1:9020

Do not expose API base as user-editable field.
