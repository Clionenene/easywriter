export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { completionRate } from "@/lib/learning-flow";
import { ProjectActions } from "@/components/project-actions";

export default async function MapPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      progressStats: true,
      writingElements: { orderBy: { orderIndex: "asc" } },
      submissions: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  });
  if (!project) notFound();

  const total = project.writingElements.length;
  const done = project.writingElements.filter((e: (typeof project.writingElements)[number]) => e.status === "done").length;
  const rate = completionRate(total, done);

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <ProjectActions projectId={params.id} />
      <Card className="space-y-2">
        <h1 className="text-xl font-bold">5. 全体マップ</h1>
        <p>完了率 {done}/{total} ({rate}%)</p>
        <Progress value={rate} />
        <p className="text-sm">XP: {project.progressStats?.xp || 0} / Level: {project.progressStats?.level || 1} / Streak: {project.progressStats?.streakDays || 0}日</p>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">直近の完了/提出タスク</h2>
        {project.submissions.length === 0 ? <p className="text-sm text-slate-500">まだ提出履歴がありません。</p> : (
          <ul className="space-y-2 text-sm">
            {project.submissions.map((s: (typeof project.submissions)[number]) => (
              <li key={s.id} className="rounded border p-2">{new Date(s.createdAt).toLocaleString()} / score: {s.completionScore} / {s.isPassed ? "passed" : "retry"}</li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-2 md:grid-cols-2">
        {project.writingElements.map((e: (typeof project.writingElements)[number]) => (
          <Card key={e.id} className={e.status === "done" ? "border-emerald-500" : e.status === "in_progress" ? "border-amber-500" : ""}>
            <div className="text-xs text-slate-500">{e.category}</div>
            <div className="font-semibold">{e.title}</div>
            <div className="text-sm">状態: {e.status}</div>
          </Card>
        ))}
      </div>

      <Link className="text-blue-600" href={`/projects/${params.id}/learn`}>学習画面に戻る</Link>
    </main>
  );
}
