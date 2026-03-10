import { z } from "zod";

const taskTitleSchema = z.string().min(8).max(120).refine((value) => !/^第?[0-9一二三四五六七八九十]+章/.test(value), {
  message: "章タイトルのみは禁止"
});

const writingElementSchema = z.object({
  id: z.string().min(2),
  title: taskTitleSchema,
  description: z.string().min(20),
  category: z.string().min(2),
  difficulty: z.number().int().min(1).max(5),
  estimated_minutes: z.number().int().min(3).max(10),
  dependencies: z.array(z.string()),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  completion_criteria: z.string().min(20),
  example_output: z.string().min(30),
  bad_example: z.string().min(15),
  hint: z.string().min(10),
  why_needed: z.string().min(15)
});

export const analysisSchema = z
  .object({
    summary: z.string().min(40),
    document_type: z.enum(["paper", "grant_proposal", "research_plan", "essay", "other"]),
    missing_sections: z.array(z.string().min(2)).min(1),
    redundant_sections: z.array(z.string().min(2)),
    structural_feedback: z.string().min(20),
    logical_feedback: z.string().min(20),
    elements: z.array(writingElementSchema).min(30)
  })
  .superRefine((value, ctx) => {
    const uniqueIds = new Set(value.elements.map((e) => e.id));
    if (uniqueIds.size !== value.elements.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "要素IDが重複しています" });
    }

    const actionLikeCount = value.elements.filter((e) => /する|書く|定義|列挙|説明|比較|検証/.test(e.title + e.description)).length;
    if (actionLikeCount < Math.floor(value.elements.length * 0.8)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "行動可能タスクの割合が不足しています" });
    }
  });

export const submissionFeedbackSchema = z.object({
  strengths: z.array(z.string().min(5)).min(1),
  gaps: z.array(z.string().min(5)).min(1),
  suggestions: z.array(z.string().min(5)).min(1),
  next_sentence: z.string().min(10),
  passed: z.boolean(),
  score: z.number().int().min(0).max(100),
  summary: z.string().min(10)
});
