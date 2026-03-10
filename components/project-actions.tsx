"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProjectActions({ projectId }: { projectId: string }) {
  const router = useRouter();

  async function deleteProject() {
    const ok = window.confirm("このプロジェクトを削除しますか？この操作は取り消せません。");
    if (!ok) return;

    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(`削除に失敗しました: ${json.error || res.statusText}`);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button className="bg-slate-600 hover:bg-slate-700" onClick={() => router.push("/")}>トップに戻る</Button>
      <Button className="bg-red-600 hover:bg-red-700" onClick={deleteProject}>プロジェクトを削除</Button>
    </div>
  );
}
