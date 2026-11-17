# R21 — StaticArt / Streaming / Business / Game 4OS メニュー認証前描画防止

状態: ソース修正・テスト用隔離ブランチ。AWS未適用。2026-11-17。

## 1. 実コードで確認した原因箇所
- R20 `work/r20-m5-real-delivery-browser-20261102` の `civilization-os-menu-delivery/server.mjs` は4OSのHTML・JS・CSS・menu-contract.jsonを、認証確認なしにHTTP 200で配信する。
- R19 Portal `app/{business,streaming,staticart,game}-menu/layout.tsx` はPortalの署名セッションを検証してから描画する。ただしGatewayで各OSへ直接振り分ける場合はPortalのlayoutを通らない。
- R20既存ブラウザテストは未認証の200メニュー表示を成功条件としており、認証前描画の回帰検知が欠落していた。
- AWS稼働Gatewayの各 `*_ROUTE_TARGET`、稼働SHA、画面の最初の描画は未確認。よってコード上の欠陥は特定、ユーザーのAWS症状との完全な因果関係は未検証。

## 2. 正本・責任範囲
- `03.business-os/os-menu`、`05.game-os/os-menu`、`06.streaming-os/os-menu`、`10.staticart-os/os-menu` が各メニューのHTML/CSS/JS/contract正本。UIファイルは変更しない。
- CivilizationOSがログイン。Portalの既存R19署名セッションは、認証済み本人の**画面表示だけ**の判定に使用。
- この判定は各OSのAPI権限・契約・利用権限を与えない。各OS APIは独自の認可が必須。
- `civilization-os-menu-delivery` は4OSのメニューHTML/assetを返す前にPortal署名セッションの検証結果を取得する。

## 3. 変更契約
- Portal `GET /api/portal/menu-identity` がHttpOnly署名Cookieをサーバー検証し、成功 `204`、未認証 `401`、設定欠落 `503`。レスポンス本文・本人情報なし、no-store。
- Menu Delivery は環境変数 `OS_MENU_AUTH_VERIFY_ORIGIN=http://127.0.0.1:<PORTAL_UPSTREAM_PORT>` が必須。ループバックHTTPのみ。存在しなければ起動拒否。
- 各メニューアクセスのたびに、Portal検証APIへCookieのみサーバー間転送。204の場合だけOS正本HTML/assetをHTTP 200で配信。最大2.5秒タイムアウト。
- 401ならメニュー本体は `302` → `/api/persona/auth/start?return_to=<approved-root>`。CSS/JS/JSONは401。503・通信エラーは503。未認証HTMLを一切送信しない。
- HTML・asset応答は`Cache-Control: private, no-store, max-age=0` / `Vary: Cookie`。CloudFrontの最小TTLが0か確認必須。
- HTMLにJS認証待ち・CSS隠しは採用せず、サーバー応答前判定とする。
- ユーザーのPortal・CivilizationOS R17/B1、LifeOS、PersonaOS、AIWorkerOSの認証コードは変更しない。R29は不採用。

## 4. 非互換性と適用順
- R21 はR20派生。R40 LifeOS、B1 PersonaOSなど独立ブランチの変更を無条件に上書きしない。mainへ即マージしない。
- 未構成でOS Menu Deliveryを単独起動するとFail Closedで起動失敗する。Portal検証APIとDeliveryを同一リリースとして配備し、loopback設定を注入する。
- GatewayのOSターゲットを`portal`のままにしてPortal側の既存保護を稼働させ、R21新経路を検証してから`os`へ切り替える。
- 実行中のGateway/CloudFrontのCookie転送・キャッシュ設定・EC2待受ポート・稼働SHAが未確認のため、AWS本番切替は禁止。

## 5. AWS UI受入れ（ローカルsmokeで代替不可）
- 各メニュー4OSをAWS CloudFront URLからAndroid Chromeまたは同等モバイルPlaywrightでアクセス。
- シークレット/完全未認証では最初のHTMLがOSメニューでなく、CivilizationOS `/login` に到達する。MutationObserver等で一瞬もOSメニュー描画なし。
- 認証後のみ各OS正本メニューが表示される。再読み込み・戻る操作、期限切れ・Cookie改ざん後の再アクセスを再検証。
- `/business-menu-*`など似たパス、他OSの公開URL、LifeOS/PersonaOS/AIWorkerOSの既存挙動を回帰確認。
- AWS UIテストファイル: `tests/aws-ui-no-flash.mjs`。AWS側の実配信に対する未認証UI検査。認証済UIの目視/自動検証は別ゲート。
- AWS配信のメニューが別のビルド・別の経路と判明した場合は、このブランチを本番に適用せず原因特定から行う。

## 6. ロールバック
- ローカルパッチ/テスト失敗時は隔離worktreeと作業ブランチを削除。既存mainの変更を触らない。
- AWS切替後に異常があれば既知GOODのGateway `BUSINESSOS_ROUTE_TARGET=portal`, `GAMEOS_ROUTE_TARGET=portal`, `STREAMINGOS_ROUTE_TARGET=portal`, `STATICARTOS_ROUTE_TARGET=portal`へ戻し、承認済デプロイ手順で再起動。Portal側R19ガードが残ることを前提にする。
- DB、Supabase、AWSの実設定変更は今回のTermuxパッチに含まれない。

## R3 dependency check revision

- R20のGit固定コミットと正本package-lock blob SHAは継続固定。
- 既存キャッシュ側のpackage-lock完全一致は要求しない。R20固定ロックと実際の主要7パッケージのバージョンを検査。
- その他のtransitive lock差はログに記録し、TypeScriptの実コンパイルを最終ゲートとする。
- npm installなし。型検査・Node契約失敗は隔離worktreeをロールバック、pushしない。
