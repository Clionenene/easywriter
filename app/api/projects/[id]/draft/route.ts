import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });

  const elements = await prisma.writingElement.findMany({ where: { projectId: params.id }, orderBy: { orderIndex: "asc" } });
  const grouped = new Map<string, typeof elements>();
  elements.forEach((e) => {
    const arr = grouped.get(e.category) || [];
    arr.push(e);
    grouped.set(e.category, arr);
  });

  const markdown = [`# ${project.title}`, "", project.summary || ""].concat(
    Array.from(grouped.entries()).flatMap(([category, els]) => [
      `\n## ${category}`,
      ...els.map((e) => `\n### ${e.title}\n${e.userOutput || "(未記入)"}\n\n> 元タスクID: ${e.id}`)
    ])
  );

  return NextResponse.json({ markdown: markdown.join("\n") });
}
