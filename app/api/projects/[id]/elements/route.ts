import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const elements = await prisma.writingElement.findMany({
    where: { projectId: params.id },
    orderBy: { orderIndex: "asc" }
  });
  return NextResponse.json(elements);
}
