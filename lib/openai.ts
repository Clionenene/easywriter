import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY が設定されていません。分析APIは失敗します。");
}

export const openai = new OpenAI({ apiKey: apiKey || "sk-dummy" });
export const defaultModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export async function listUsableChatModels() {
  if (!process.env.OPENAI_API_KEY) return [];
  const res = await openai.models.list();
  const preferred = [
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-5",
    "gpt-5-mini"
  ];

  const ids = res.data.map((m) => m.id);
  const usable = ids
    .filter((id) => id.startsWith("gpt-"))
    .filter((id) => !id.includes("instruct"))
    .sort((a, b) => a.localeCompare(b));

  const preferredFirst = [...preferred.filter((id) => usable.includes(id)), ...usable.filter((id) => !preferred.includes(id))];
  return Array.from(new Set(preferredFirst));
}

export async function jsonCompletion(prompt: string, modelOverride?: string) {
  const model = modelOverride || defaultModel;
  const res = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "あなたは研究文書コーチです。必ずJSONのみを返してください。"
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  return res.choices[0]?.message?.content ?? "{}";
}
