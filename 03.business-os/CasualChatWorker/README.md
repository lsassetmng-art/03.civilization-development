# CasualChatWorker / 雑談ワーカー Implementation Skeleton

status: generated
phase: Phase G
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Purpose

This implementation skeleton provides a local HTML/CSS/JavaScript prototype for CasualChatWorker.

## 2. Included

- Friend / Lover AI worker selection
- monthly free ticket balance
- 30 / 60 / 90 / 120 minute duration selection
- quote calculation
- contract confirmation mock
- chat session mock
- remaining timer
- safety redirect mock
- usage history mock
- localStorage persistence

## 3. Canon

- 30 minutes 500 JPY
- monthly free tickets: 2
- 1 ticket grants 30 minutes free
- Friend / Lover common
- Lover is pseudo-romantic rental boyfriend/girlfriend style AI worker
- Lover is not a real relationship

## 4. Boundary

This skeleton does not execute DB apply.
This skeleton does not connect to ERP.
This skeleton does not mutate aiworker canon.
This skeleton does not mutate cx22073jw canon.
This skeleton stores prototype state in browser localStorage only.

## 5. Run

Open this file in a browser:

app/index.html

In Termux, if available:

termux-open app/index.html

## 6. Next

After this skeleton, the next step is implementation verification and then API/client replacement with real endpoints.
