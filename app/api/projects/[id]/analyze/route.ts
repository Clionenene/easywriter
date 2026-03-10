import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeDocument } from "@/lib/analyzer";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const analyzed = await analyzeDocument(project.originalText, body.documentType || project.documentType || "auto");

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
            logicalFeedback: analyzed.logical_feedback
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
    return NextResponse.json({ error: "解析に失敗しました", detail: String(error) }, { status: 500 });
  }
}
