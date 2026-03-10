import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY が設定されていません。分析APIは失敗します。");
}

export const openai = new OpenAI({ apiKey: apiKey || "sk-dummy" });
export const model = process.env.OPENAI_MODEL || "gpt-5.4-pro";

export async function jsonCompletion(prompt: string) {
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
