import { analysisSchema } from "@/lib/schemas";
import { jsonCompletion, OpenAIRequestOptions } from "@/lib/openai";
import { AnalysisResult, DocumentType, WritingElementLLM } from "@/types/domain";

const typePerspectiveMap: Record<DocumentType | "auto", string> = {
  auto: "文書タイプを推定し、最適な評価軸を採用してください。",
  paper: "論文評価軸: 問題設定,関連研究,ギャップ,仮説,手法,実験設定,評価指標,結果,考察,限界,結論。",
  grant_proposal: "申請書評価軸: 背景,課題設定,社会的意義,学術的意義,新規性,目的,方法,体制,実現可能性,予算妥当性,成果,リスク対策。",
  research_plan: "研究計画評価軸: 背景,目的,研究方法,実施計画,マイルストーン,体制,予算,期待成果,リスク対策。",
  essay: "エッセイ評価軸: 主張,根拠,具体例,反論処理,結論回収。",
  other: "一般長文評価軸: 主張,読者価値,論理一貫性,具体性,構成の流れ。"
};

function progress(message: string, verbose = true) {
  if (!verbose) return;
  const ts = new Date().toISOString();
  console.log(`[${ts}] [analyze] ${message}`);
}

function buildPrompt(input: { text: string; hintType?: DocumentType | "auto"; minimumElements: number; existing?: WritingElementLLM[] }) {
  const regenerationHint =
    input.existing && input.existing.length > 0
      ? `既存要素は ${input.existing.length} 件あります。重複なしで不足分のみ追加してください。既存ID: ${input.existing.map((e) => e.id).join(",")}`
      : "初回生成です。";

  return `あなたは研究文書の執筆コーチです。以下の文書を3層分析し、ユーザーが3〜10分で完了できる執筆タスクに分解してください。

[必須]
- document_type を推定またはヒントに従って設定
- elements は最低 ${input.minimumElements} 件
- 各タスクは「実際に書ける作業」にする（章見出し禁止）
- estimated_minutes は 3〜10
- userが100〜300文字で出力できる粒度
- 各タスクに completion_criteria, example_output, bad_example, hint, why_needed を必ず含める
- JSONのみ返す

[documentType別観点]
${typePerspectiveMap[input.hintType || "auto"]}

[再生成ヒント]
${regenerationHint}

[本文]
${input.text.slice(0, 22000)}`;
}

function normalizeDependencies(elements: WritingElementLLM[]) {
  const ids = new Set(elements.map((e) => e.id));
  return elements.map((e) => ({
    ...e,
    dependencies: Array.from(new Set(e.dependencies)).filter((d) => d !== e.id && ids.has(d))
  }));
}

function mergeElements(base: WritingElementLLM[], extra: WritingElementLLM[]) {
  const seen = new Set(base.map((e) => e.id));
  const merged = [...base];
  for (const item of extra) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

export async function analyzeDocument(
  text: string,
  hintType?: DocumentType | "auto",
  options?: OpenAIRequestOptions
): Promise<AnalysisResult> {
  const verbose = options?.verbose ?? true;
  progress("解析開始", verbose);
  progress("入力テキスト整形中", verbose);

  let best: AnalysisResult | null = null;
  let elements: WritingElementLLM[] = [];
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const minimumElements = attempt < 2 ? 30 : 40;
    try {
      progress(`プロンプト生成中 (attempt=${attempt + 1}, minimum=${minimumElements})`, verbose);
      const raw = await jsonCompletion(buildPrompt({ text, hintType, minimumElements, existing: elements }), {
        model: options?.model,
        verbose,
        progressLabel: `analyze attempt ${attempt + 1}`
      });
      progress("APIレスポンス整形中", verbose);
      const parsed = analysisSchema.parse(JSON.parse(raw));
      best = parsed;
      elements = mergeElements(elements, parsed.elements);

      if (elements.length >= 30) {
        progress(`スライドごとの解析完了（要素数=${elements.length}）`, verbose);
        progress("全体解析完了", verbose);
        return {
          ...parsed,
          elements: normalizeDependencies(elements).slice(0, 80)
        };
      }
    } catch (error) {
      lastError = error;
      progress(`失敗（attempt=${attempt + 1}）: ${error instanceof Error ? error.message : String(error)}`, verbose);
    }
  }

  if (best && elements.length >= 30) {
    progress("全体解析完了（フォールバック結果を返却）", verbose);
    return {
      ...best,
      elements: normalizeDependencies(elements)
    };
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`解析に失敗しました: ${detail}`);
}
