import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY が設定されていません。分析APIは失敗します。");
}

export const openai = new OpenAI({ apiKey: apiKey || "sk-dummy" });
export const defaultModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export type OpenAIRequestOptions = {
  model?: string;
  verbose?: boolean;
  progressLabel?: string;
};

function logProgress(message: string, verbose = true) {
  if (!verbose) return;
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${message}`);
}

function extractResponseText(response: OpenAI.Responses.Response) {
  if (response.output_text && response.output_text.trim().length > 0) return response.output_text;

  const fromOutput = (response.output || [])
    .flatMap((item) => (item.type === "message" ? item.content : []))
    .map((content) => {
      if (content.type === "output_text") return content.text;
      return "";
    })
    .join("\n")
    .trim();

  return fromOutput;
}

function toOpenAIErrorMessage(error: unknown) {
  const e = error as {
    status?: number;
    message?: string;
    error?: { message?: string; type?: string; code?: string };
  };
  const raw = e?.error?.message || e?.message || String(error);

  if (!process.env.OPENAI_API_KEY) {
    return "OPENAI_API_KEY が未設定です。.env に有効な API キーを設定してください。";
  }
  if (raw.includes("not a chat model") || raw.includes("v1/chat/completions")) {
    return "モデルとエンドポイントの不一致です。Responses API 対応モデル（例: gpt-4.1-mini）を選択してください。";
  }
  if (e?.status === 401 || raw.includes("Incorrect API key")) {
    return "OpenAI API キーが不正です。キーを確認してください。";
  }
  if (e?.status === 429 || raw.toLowerCase().includes("rate limit")) {
    return "レート制限に達しました。少し待ってから再試行してください。";
  }

  return `OpenAI API 呼び出しに失敗しました: ${raw}`;
}

export async function listUsableChatModels() {
  if (!process.env.OPENAI_API_KEY) return [];
  const res = await openai.models.list();
  const preferred = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini", "gpt-5", "gpt-5-mini"];

  const ids = res.data.map((m) => m.id);
  const usable = ids
    .filter((id) => id.startsWith("gpt-"))
    .filter((id) => !id.includes("instruct"))
    .sort((a, b) => a.localeCompare(b));

  const preferredFirst = [...preferred.filter((id) => usable.includes(id)), ...usable.filter((id) => !preferred.includes(id))];
  return Array.from(new Set(preferredFirst));
}

export async function jsonCompletion(prompt: string, options?: OpenAIRequestOptions) {
  const model = options?.model || defaultModel;
  const verbose = options?.verbose ?? true;
  const label = options?.progressLabel || "OpenAI 呼び出し";

  try {
    logProgress(`${label}: Responses API 呼び出し中 (model=${model})`, verbose);
    const response = await openai.responses.create({
      model,
      input: prompt
    });
    logProgress(`${label}: API レスポンス受信`, verbose);

    const text = extractResponseText(response);
    if (!text) {
      throw new Error("Responses API の応答からテキストを抽出できませんでした。");
    }
    return text;
  } catch (error) {
    const message = toOpenAIErrorMessage(error);
    throw new Error(message);
  }
}
