# EasyWriter MVP

EasyWriter は、論文・研究計画書・助成金申請書などをアップロードし、
OpenAI API で 30 件以上の行動可能タスクへ分解して、Duolingo 風に「今やるべき1問」を進める執筆支援アプリです。

## 原因の要約（環境エラー）

このプロジェクトで起きていた失敗の第一原因は、**Node.js v12 で Next.js 14 / Prisma 5 系を動かそうとしていたこと**です。

主な依存の要件:

- `next@14.x`: Node `>=18.17.0`
- `prisma@5.x`: Node `>=16.13`
- `@prisma/client@5.x`: Node `>=16.13`
- `typescript@5.x`: Node `>=14.17`
- `@typescript-eslint/*`（lint 系）: Node 18 以上を要求するものがある

そのため Node 12 では `npm install` 時点で Prisma preinstall に失敗し、
結果として `next` などの実行バイナリも入らず `npm run dev` が `next: not found` になります。

## 推奨実行環境

- Node.js: **20 LTS**（本リポジトリは `20.19.0` を推奨）
- npm: **10 以上**

このリポジトリには以下を設定済みです:

- `.nvmrc`（`20.19.0`）
- `package.json#engines`（`node>=20`, `npm>=10`）
- `.npmrc`（`engine-strict=true`）
- `preinstall` で Node バージョンチェック

## セットアップ（正しい順序）

> 重要: `npm install` 成功前に `npx prisma migrate dev` / `npx prisma generate` を実行しないでください。
> 先に実行すると、`npx` がローカル未導入の `prisma` を都度取得しにいって混乱の原因になります。

```bash
# 1) Node を合わせる
nvm install
nvm use
node -v
npm -v

# 2) 依存導入
npm install

# 3) DB 準備（ローカル prisma を利用）
npx prisma migrate dev --name init
npx prisma generate

# 4) 起動
npm run dev
```

## 技術スタック

- Next.js 14.2.35
- React 18
- TypeScript
- Tailwind CSS
- Prisma 5.22.0 + SQLite
- OpenAI SDK
- zod

## 開発用コマンド

```bash
npm run dev
npm run build
npm run lint
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run setup:dev
```

## API

- `POST /api/projects` (multipart: title, documentType, file)
- `GET /api/projects/:id`
- `POST /api/projects/:id/analyze`
- `GET /api/projects/:id/elements`
- `GET /api/projects/:id/next`
- `POST /api/elements/:id/submit`
- `GET /api/projects/:id/draft`

## 今後の拡張

- DOCX 取り込み
- 査読モード
- 文書比較モード
- 共著モード
