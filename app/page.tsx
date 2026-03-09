import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, include: { progressStats: true } });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <h1 className="text-2xl font-bold">EasyWriter</h1>
        <p className="mt-2 text-slate-600">論文・申請書を小さなステップで書き上げる学習型エディタ</p>
        <Link href="/projects/new/upload">
          <Button className="mt-4">新規文書を作成</Button>
        </Link>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">既存プロジェクト</h2>
        {projects.length === 0 && <Card>まだプロジェクトがありません。</Card>}
        {projects.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-slate-500">タイプ: {p.documentType || "未解析"}</div>
            </div>
            <div className="space-x-2">
              <Link href={`/projects/${p.id}/analysis`}>
                <Button>解析結果</Button>
              </Link>
              <Link href={`/projects/${p.id}/learn`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">学習を再開</Button>
              </Link>
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
