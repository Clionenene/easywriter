import { differenceInCalendarDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { levelFromXp } from "@/lib/utils";
import { reviewSubmission } from "@/lib/feedback";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const element = await prisma.writingElement.findUnique({ where: { id: params.id }, include: { project: true } });

    if (!element) return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    if (!body.content || body.content.length < 20) return NextResponse.json({ error: "提出文が短すぎます" }, { status: 400 });

    const feedback = await reviewSubmission({
      projectSummary: element.project.summary || "",
      elementTitle: element.title,
      completionCriteria: element.completionCriteria,
      userText: body.content
    });

    const xpGain = feedback.passed ? 20 + Math.max(0, element.difficulty - 1) * 5 : 5;

    await prisma.$transaction(async (tx) => {
      await tx.userSubmission.create({
        data: {
          projectId: element.projectId,
          elementId: element.id,
          content: body.content,
          aiFeedback: JSON.stringify(feedback),
          completionScore: feedback.score,
          isPassed: feedback.passed
        }
      });

      await tx.writingElement.update({
        where: { id: element.id },
        data: {
          status: feedback.passed ? "done" : "in_progress",
          userOutput: body.content,
          feedback: feedback.summary
        }
      });

      const stats = await tx.progressStats.findUnique({ where: { projectId: element.projectId } });
      if (!stats) return;

      const completedElements = await tx.writingElement.count({ where: { projectId: element.projectId, status: "done" } });
      const xp = stats.xp + xpGain;
      const now = new Date();
      const prev = stats.lastWorkedAt;
      const diff = prev ? differenceInCalendarDays(now, prev) : 0;
      const streakDays = prev ? (diff === 0 ? stats.streakDays : diff === 1 ? stats.streakDays + 1 : 1) : 1;

      await tx.progressStats.update({
        where: { projectId: element.projectId },
        data: { completedElements, xp, level: levelFromXp(xp), lastWorkedAt: now, streakDays }
      });
    });

    return NextResponse.json({ feedback, xpGain });
  } catch (error) {
    return NextResponse.json({ error: "フィードバック生成に失敗しました", detail: String(error) }, { status: 500 });
  }
}
