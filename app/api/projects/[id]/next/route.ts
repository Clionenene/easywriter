import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completionRate, pickNextElement } from "@/lib/learning-flow";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [elements, stats] = await Promise.all([
    prisma.writingElement.findMany({ where: { projectId: params.id }, orderBy: { orderIndex: "asc" } }),
    prisma.progressStats.findUnique({ where: { projectId: params.id } })
  ]);

  const next = pickNextElement(elements);
  type Element = (typeof elements)[number];
  const completed = elements.filter((e: Element) => e.status === "done").length;

  return NextResponse.json({
    next,
    stats: {
      completed,
      total: elements.length,
      rate: completionRate(elements.length, completed),
      xp: stats?.xp ?? 0,
      level: stats?.level ?? 1,
      streakDays: stats?.streakDays ?? 0
    }
  });
}
