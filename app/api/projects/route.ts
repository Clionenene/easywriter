import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile } from "@/lib/document-parser";

const documentTypeSchema = z.enum(["paper", "grant_proposal", "research_plan", "essay", "other", "auto"]);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const documentTypeRaw = String(form.get("documentType") || "auto");
    const file = form.get("file") as File | null;

    const parsedDocType = documentTypeSchema.safeParse(documentTypeRaw);
    if (!title) return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
    if (!parsedDocType.success) return NextResponse.json({ error: "documentType が不正です" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "ファイルは必須です" }, { status: 400 });

    const originalText = await extractTextFromFile(file);
    if (!originalText || originalText.trim().length < 50) {
      return NextResponse.json({ error: "テキスト抽出に失敗したか、本文が短すぎます" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        originalText,
        documentType: parsedDocType.data === "auto" ? null : parsedDocType.data
      }
    });

    await prisma.progressStats.create({ data: { projectId: project.id, totalElements: 0 } });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "プロジェクト作成に失敗しました", detail: String(error) }, { status: 400 });
  }
}
