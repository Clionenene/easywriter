export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  try {
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
          {projects.map((p: (typeof projects)[number]) => (
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card className="space-y-3 border-red-300">
          <h1 className="text-xl font-bold text-red-700">起動設定エラー</h1>
          <p className="text-sm text-slate-700">
            DATABASE_URL が未設定のため DB に接続できません。プロジェクトルートに <code>.env</code> を作成してください。
          </p>
          <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs">{'DATABASE_URL="file:./dev.db"'}</pre>
          <p className="text-xs text-slate-600">詳細: {message}</p>
        </Card>
      </main>
    );
  }
}
