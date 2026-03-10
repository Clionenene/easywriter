import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { analyzeDocument } from "@/lib/analyzer";
import { defaultModel } from "@/lib/openai";

function toErrorResponse(error: unknown) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "解析に失敗しました",
        detail: "OPENAI_API_KEY が未設定です。.env に OPENAI_API_KEY を設定してください。"
      },
      { status: 400 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "解析に失敗しました",
        detail: `LLM の出力形式が不正です（schema validation error）。${error.issues[0]?.message || ""}`
      },
      { status: 502 }
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  const friendly = message.includes("not a chat model")
    ? "選択したモデルは chat/completions 非対応です。モデル一覧から gpt-4.1 / gpt-4o 系を選択してください。"
    : message;

  return NextResponse.json({ error: "解析に失敗しました", detail: friendly }, { status: 500 });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const analyzed = await analyzeDocument(project.originalText, body.documentType || project.documentType || "auto", {
      model: body.model || defaultModel,
      verbose: body.verbose ?? true
    });

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.writingElement.deleteMany({ where: { projectId: params.id } });
      await tx.project.update({
        where: { id: params.id },
        data: {
          summary: analyzed.summary,
          documentType: analyzed.document_type,
          analysisMeta: JSON.stringify({
            missingSections: analyzed.missing_sections,
            redundantSections: analyzed.redundant_sections,
            structuralFeedback: analyzed.structural_feedback,
            logicalFeedback: analyzed.logical_feedback,
            model: body.model || defaultModel
          })
        }
      });
      await tx.writingElement.createMany({
        data: analyzed.elements.map((e, idx) => ({
          projectId: params.id,
          title: e.title,
          description: e.description,
          category: e.category,
          difficulty: e.difficulty,
          estimatedMinutes: e.estimated_minutes,
          dependencies: JSON.stringify(e.dependencies),
          status: e.status,
          completionCriteria: e.completion_criteria,
          exampleOutput: e.example_output,
          badExample: e.bad_example,
          hint: e.hint,
          whyNeeded: e.why_needed,
          orderIndex: idx
        }))
      });
      await tx.progressStats.update({
        where: { projectId: params.id },
        data: { totalElements: analyzed.elements.length, completedElements: 0 }
      });
    });

    return NextResponse.json(analyzed);
  } catch (error) {
    return toErrorResponse(error);
  }
}
