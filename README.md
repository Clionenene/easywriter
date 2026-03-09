# EasyWriter MVP

EasyWriter は、論文・研究計画書・助成金申請書などをアップロードして、
OpenAI API で **30件以上の行動可能タスク** に分解し、Duolingo 風に「今やるべき1問」を進める執筆支援アプリです。

## 設計方針

- **分析器 (`lib/analyzer.ts`)**
  - 3層分析（構造 / 論理 / 執筆行動）
  - documentType ごとに評価軸を分岐
  - 章見出しではなく 3〜10 分で終わる執筆タスクを生成
  - zod で厳密検証（必須フィールド、最小文字数、行動可能性）
  - 30件未満なら再生成（追加入力）
- **学習フロー (`lib/learning-flow.ts`)**
  - 依存関係 DAG を満たすタスクの中から、難易度が低い順で推薦
- **進捗 (`ProgressStats`)**
  - 完了率 / XP / level / streak を追跡

## 画面

1. ホーム
2. 新規アップロード
3. 解析開始
4. 解析結果
5. 学習画面（今やるべき1問）
6. 全体マップ
7. 最終統合（Markdown）

## API

- `POST /api/projects` (multipart: title, documentType, file)
- `GET /api/projects/:id`
- `POST /api/projects/:id/analyze`
- `GET /api/projects/:id/elements`
- `GET /api/projects/:id/next`
- `POST /api/elements/:id/submit`
- `GET /api/projects/:id/draft`

## 技術スタック

- Next.js 14 / TypeScript / Tailwind CSS
- Prisma + SQLite
- OpenAI SDK
- zod
- pdf-parse

## セットアップ

```bash
cp .env.example .env
# OPENAI_API_KEY を設定

npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## 今後の拡張

- DOCX 取り込み
- 査読モード
- 文書比較モード
- 共著モード
