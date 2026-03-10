# EasyWriter MVP

EasyWriter は、論文・研究計画書・助成金申請書などをアップロードし、
OpenAI API で 30 件以上の行動可能タスクへ分解して、Duolingo 風に「今やるべき1問」を進める執筆支援アプリです。

## 原因の要約（今回の起動失敗）

今回のエラーの直接原因は **`DATABASE_URL` が未設定** なことです。

- Prisma は `prisma/schema.prisma` で `url = env("DATABASE_URL")` を参照しています。
- そのため SQLite 自体が問題ではなく、**接続文字列を .env から読む設計なのに .env が未整備** な点が原因です。
- その状態で `app/page.tsx` が `prisma.project.findMany()` を実行すると起動時に例外で落ちます。

## ローカル開発の推奨環境

- Node.js: 20 LTS（推奨: 20.19.0）
- npm: 10 以上

## 必要な環境変数

プロジェクトルート（`package.json` と同じ階層）に `.env` を置いてください。

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-pro"
```

`.env.example` も同内容で用意してあります。

## 初回セットアップ手順（迷わない順序）

```bash
# 0) Node を合わせる
nvm install
nvm use

# 1) 失敗履歴を消して依存を再導入
rm -rf node_modules package-lock.json
npm install

# 2) Prisma クライアント生成
npx prisma generate

# 3) DB 初期化（初回）
npx prisma migrate dev --name init

# 4) 起動
npm run dev
```

## トラブルシュート

- `DATABASE_URL が未設定です` / `Environment variable not found: DATABASE_URL`
  - `.env` がないか、配置場所が違います。**プロジェクトルート**に配置してください。

- `sh: 1: next: not found`
  - 依存導入失敗の二次障害です。Node バージョンを合わせたうえで `npm install` をやり直してください。

- `Prisma only supports Node.js >= 16.13`
  - Node が古すぎます。`nvm install 20 && nvm use 20` を実行してください。


- `解析に失敗しました`
  - API の `detail` を確認してください。
  - `OPENAI_API_KEY が未設定` と出る場合は `.env` に有効なキーを設定してください。
  - `schema validation error` と出る場合は LLM 応答がスキーマ不一致です。再実行または入力文書を短くして再試行してください。

## API

- `POST /api/projects` (multipart: title, documentType, file)
- `GET /api/projects/:id`
- `POST /api/projects/:id/analyze`
- `GET /api/projects/:id/elements`
- `GET /api/projects/:id/next`
- `POST /api/elements/:id/submit`
- `GET /api/projects/:id/draft`
