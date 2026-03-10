export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AnalysisMeta = {
  missingSections: string[];
  redundantSections: string[];
  structuralFeedback: string;
  logicalFeedback: string;
};

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  const elements = await prisma.writingElement.findMany({ where: { projectId: params.id }, orderBy: { orderIndex: "asc" } });
  const meta: AnalysisMeta | null = project.analysisMeta ? JSON.parse(project.analysisMeta) : null;

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <Card className="space-y-2">
        <h1 className="text-2xl font-bold">3. 解析結果</h1>
        <p className="text-slate-700">要約: {project.summary || "未解析"}</p>
        <p className="text-slate-700">推定タイプ: {project.documentType || "未判定"}</p>
        {meta && (
          <>
            <p><strong>構造フィードバック:</strong> {meta.structuralFeedback}</p>
            <p><strong>論理フィードバック:</strong> {meta.logicalFeedback}</p>
            <p><strong>不足要素:</strong> {meta.missingSections.join(" / ")}</p>
            {meta.redundantSections.length > 0 && <p><strong>冗長要素:</strong> {meta.redundantSections.join(" / ")}</p>}
          </>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">分解タスク ({elements.length})</h2>
        <div className="grid gap-2">
          {elements.slice(0, 80).map((e) => (
            <div key={e.id} className="rounded border p-3 text-sm">
              <div className="font-semibold">{e.title}</div>
              <div>{e.description}</div>
              <div className="text-slate-600">{e.category} / 難易度{e.difficulty} / {e.estimatedMinutes}分</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/projects/${params.id}/learn`}><Button>学習パス開始</Button></Link>
          <Link href={`/projects/${params.id}/map`}><Button className="bg-slate-700 hover:bg-slate-800">全体マップ</Button></Link>
        </div>
      </Card>
    </main>
  );
}
