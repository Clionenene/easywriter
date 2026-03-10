import { NextResponse } from "next/server";
import { defaultModel, listUsableChatModels } from "@/lib/openai";

export async function GET() {
  try {
    const models = await listUsableChatModels();
    if (models.length === 0) {
      return NextResponse.json({
        models: [defaultModel, "gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini"],
        warning: "OPENAI_API_KEY 未設定のため推奨モデル候補を表示しています。"
      });
    }
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json(
      {
        models: [defaultModel, "gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini"],
        warning: `モデル一覧の取得に失敗したため候補を表示しています: ${String(error)}`
      },
      { status: 200 }
    );
  }
}
