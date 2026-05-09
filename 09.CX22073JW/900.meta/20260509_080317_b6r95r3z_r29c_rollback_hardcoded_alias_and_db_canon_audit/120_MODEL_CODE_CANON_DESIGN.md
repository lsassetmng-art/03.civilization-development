# Model Code Canon Design / R29C

## Problem

同じ `model_code` という名前で、少なくとも2種類の意味が混在している。

- `BYD2-003`
  - 公開型番 / public model code
  - CX22073JW runtime material view 側で使われている
- `byd2_003_asic_leader3`
  - runtime / app / internal normalized model code
  - runtime request payload や実行制御側で使われることがある

この状態で `server.js` に個別aliasを書くと、機種が増えるたびに決め打ちが増える。

## Canonical direction

DB側に識別子対応の正本を持つ。

### 推奨カラム意味

- `public_model_code`
  - BYD2-003 / HD-R5P / MG-NORN-001 など
  - カタログ、公開表示、CX参照素材、外部説明に使う

- `runtime_model_code`
  - byd2_003_asic_leader3 など
  - アプリ内部、runtime execution、control profile、正規化キーに使う

- `series_code`
  - Beyond / HD / MEGAMI / LoVerS など

- `model_identifier_kind`
  - public_model_code
  - runtime_model_code
  - legacy_model_code
  - alias

## Recommended implementation

1. 既存テーブルで対応表を持てるか確認
2. 既存に正本候補がなければ、add-onlyで `aiworker.model_code_alias_resolver` のような中立テーブルを追加
3. `server.js` は決め打ちaliasを持たず、DB resolver view/functionを読む
4. CX material fetchは、入力された `model_code` を resolver で public_model_code へ解決してから view を引く

## Do not

- server.js に `byd2_003_asic_leader3 -> BYD2-003` のような個別決め打ちを残さない
- 既存DB値を破壊的にUPDATEしない
- AICompanyManager側で補正しない
