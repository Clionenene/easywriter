import { jsonCompletion } from "@/lib/openai";
import { submissionFeedbackSchema } from "@/lib/schemas";

export async function reviewSubmission(input: {
  projectSummary: string;
  elementTitle: string;
  completionCriteria: string;
  userText: string;
}) {
  const prompt = `あなたは執筆コーチです。提出文を完了条件で厳密評価し、JSONで返答してください。

プロジェクト要約: ${input.projectSummary}
タスク: ${input.elementTitle}
完了条件: ${input.completionCriteria}
提出文: ${input.userText}

採点方針:
- 具体性・論理性・検証可能性を重視
- passed=true は完了条件を概ね満たした場合のみ
- next_sentence には次の1文を提案`; 

  const raw = await jsonCompletion(prompt);
  return submissionFeedbackSchema.parse(JSON.parse(raw));
}
